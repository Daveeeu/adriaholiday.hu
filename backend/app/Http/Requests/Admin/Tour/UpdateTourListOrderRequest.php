<?php

namespace App\Http\Requests\Admin\Tour;

use App\Services\Tour\TourListOrder;
use App\Support\Tour\TourList;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateTourListOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'distinct'],
        ];
    }

    /**
     * Only tours the list shows can be placed on it.
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $listTourIds = app(TourListOrder::class)->query($this->tourList())->pluck('tours.id')->all();
                $foreignIds = array_diff(array_map('intval', $this->input('ids', [])), $listTourIds);

                if ($foreignIds !== []) {
                    $validator->errors()->add('ids', 'Csak a lista útjai rendezhetők.');
                }
            },
        ];
    }

    public function tourList(): TourList
    {
        return TourList::make((string) $this->route('type'), (string) $this->route('key'));
    }

    /**
     * @return array<int, int>
     */
    public function tourIds(): array
    {
        return array_map('intval', $this->validated('ids'));
    }
}
