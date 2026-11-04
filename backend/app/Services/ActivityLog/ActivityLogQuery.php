<?php

namespace App\Services\ActivityLog;

use App\Models\User;
use App\Support\ActivityLog\ActivityEvents;
use App\Support\ActivityLog\ActivitySubjectTypes;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Collection;
use Spatie\Activitylog\Models\Activity;

/**
 * The filtered, paginated admin activity log. Dates are calendar days in the
 * office's timezone; the log itself is stored in UTC.
 */
class ActivityLogQuery
{
    public const DEFAULT_PER_PAGE = 25;

    private const OFFICE_TIMEZONE = 'Europe/Budapest';

    /**
     * @param  array{userId?: int|string|null, event?: string|null, subjectType?: string|null, subjectId?: int|string|null, dateFrom?: string|null, dateTo?: string|null, perPage?: int|string|null}  $filters
     */
    public function paginate(array $filters): LengthAwarePaginator
    {
        $paginator = Activity::query()
            ->with('causer')
            ->when($filters['userId'] ?? null, fn (Builder $query, $userId) => $this->whereUser($query, (int) $userId))
            ->when($filters['event'] ?? null, fn (Builder $query, string $event) => $query->where('event', $event))
            ->when($filters['subjectType'] ?? null, fn (Builder $query, string $type) => $query->where('subject_type', ActivitySubjectTypes::classFor($type)))
            ->when($filters['subjectId'] ?? null, fn (Builder $query, $subjectId) => $query->where('subject_id', (int) $subjectId))
            ->when($filters['dateFrom'] ?? null, fn (Builder $query, string $date) => $query->where('created_at', '>=', $this->dayStart($date)))
            ->when($filters['dateTo'] ?? null, fn (Builder $query, string $date) => $query->where('created_at', '<', $this->dayStart($date)->addDay()))
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate((int) ($filters['perPage'] ?? self::DEFAULT_PER_PAGE));

        $this->loadSubjects($paginator->getCollection());

        return $paginator;
    }

    /**
     * The choices for the admin log's filters.
     *
     * @return array{users: array<int, array{id: string, name: string, email: string, isActive: bool}>, subjectTypes: array<int, array{key: string, label: string}>, events: array<int, string>}
     */
    public function filterOptions(): array
    {
        return [
            'users' => User::query()
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'is_active'])
                ->map(fn (User $user): array => [
                    'id' => (string) $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'isActive' => (bool) $user->is_active,
                ])
                ->all(),
            'subjectTypes' => ActivitySubjectTypes::options(),
            'events' => ActivityEvents::all(),
        ];
    }

    /**
     * What the user did, plus the sign-in attempts made against their account.
     */
    private function whereUser(Builder $query, int $userId): Builder
    {
        return $query->where(function (Builder $builder) use ($userId): void {
            $builder
                ->where(fn (Builder $caused) => $caused->where('causer_type', (new User)->getMorphClass())->where('causer_id', $userId))
                ->orWhere(fn (Builder $auth) => $auth
                    ->where('log_name', ActivityEvents::AUTH_LOG_NAME)
                    ->where('subject_type', (new User)->getMorphClass())
                    ->where('subject_id', $userId));
        });
    }

    private function dayStart(string $date): CarbonImmutable
    {
        return CarbonImmutable::createFromFormat('Y-m-d', $date, self::OFFICE_TIMEZONE)
            ->startOfDay()
            ->utc();
    }

    /**
     * Loads each page's subjects per type, including soft-deleted ones, and
     * skips types whose model class no longer exists instead of failing the
     * whole page the way an eager-loaded morphTo would.
     *
     * @param  Collection<int, Activity>  $activities
     */
    private function loadSubjects(Collection $activities): void
    {
        $activities
            ->filter(fn (Activity $activity): bool => $activity->subject_type !== null && $activity->subject_id !== null)
            ->groupBy('subject_type')
            ->each(function (Collection $group, string $class): void {
                if (! class_exists($class) || ! is_subclass_of($class, Model::class)) {
                    return;
                }

                $query = $class::query();

                if (in_array(SoftDeletes::class, class_uses_recursive($class), true)) {
                    $query->withTrashed();
                }

                $subjects = $query->whereKey($group->pluck('subject_id')->unique()->all())->get()->keyBy(fn (Model $model) => (string) $model->getKey());

                $group->each(fn (Activity $activity) => $activity->setRelation('subject', $subjects->get((string) $activity->subject_id)));
            });

        $activities
            ->reject(fn (Activity $activity): bool => $activity->relationLoaded('subject'))
            ->each(fn (Activity $activity) => $activity->setRelation('subject', null));
    }
}
