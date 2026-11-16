<?php

namespace App\Http\Requests\Admin\Tour\Concerns;

use App\Models\TourDate;
use Illuminate\Validation\Validator;

/**
 * A stored date's maximum passengers cannot go below the passengers its live
 * bookings already hold, so its free seats never turn negative.
 */
trait ValidatesDateCapacity
{
    /**
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [function (Validator $validator): void {
            $tourId = $this->route('tour')?->id ?? $this->route('tour');
            $dates = collect($this->input('dates', []));
            $storedIds = $dates->pluck('id')->filter(fn (mixed $id): bool => is_numeric($id))->all();

            if ($tourId === null || $storedIds === []) {
                return;
            }

            $stored = TourDate::query()->where('tour_id', $tourId)->whereKey($storedIds)->withSeatsHeld()->get()->keyBy('id');

            foreach ($dates as $index => $date) {
                $key = "dates.{$index}.capacity";
                $tourDate = $stored->get($date['id'] ?? null);

                if ($tourDate === null || ! is_numeric($date['capacity'] ?? null) || $validator->errors()->has($key)) {
                    continue;
                }

                if ((int) $date['capacity'] < $tourDate->seatsHeld()) {
                    $validator->errors()->add($key, sprintf(
                        'A(z) %s időpontra már %d utas foglalt, a maximum létszám ennél nem lehet kevesebb.',
                        $tourDate->start_date?->format('Y.m.d.') ?? '',
                        $tourDate->seatsHeld(),
                    ));
                }
            }
        }];
    }
}
