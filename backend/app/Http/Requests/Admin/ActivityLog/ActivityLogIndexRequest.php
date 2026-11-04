<?php

namespace App\Http\Requests\Admin\ActivityLog;

use App\Support\ActivityLog\ActivityEvents;
use App\Support\ActivityLog\ActivitySubjectTypes;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Spatie\Activitylog\Models\Activity;

class ActivityLogIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('viewAny', Activity::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'page' => ['nullable', 'integer', 'min:1'],
            'perPage' => ['nullable', 'integer', 'min:1', 'max:100'],
            'userId' => ['nullable', 'integer', Rule::exists('users', 'id')],
            'event' => ['nullable', 'string', Rule::in(ActivityEvents::all())],
            'subjectType' => ['nullable', 'string', 'required_with:subjectId', Rule::in(ActivitySubjectTypes::keys())],
            'subjectId' => ['nullable', 'integer', 'min:1'],
            'dateFrom' => ['nullable', 'date_format:Y-m-d'],
            'dateTo' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:dateFrom'],
        ];
    }
}
