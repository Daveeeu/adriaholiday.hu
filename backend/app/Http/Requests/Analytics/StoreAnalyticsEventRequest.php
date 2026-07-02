<?php

namespace App\Http\Requests\Analytics;

use App\Support\Analytics\AnalyticsEventName;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAnalyticsEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'event_id' => ['required', 'uuid'],
            'session_id' => ['required', 'string', 'max:64'],
            'visitor_id' => ['required', 'string', 'max:64'],
            'event_name' => ['required', 'string', Rule::in(AnalyticsEventName::all())],
            'entity' => ['nullable', 'array'],
            'entity.type' => ['nullable', 'string', 'max:64'],
            'entity.id' => ['nullable', 'string', 'max:64'],
            'entity.slug' => ['nullable', 'string', 'max:255'],
            'page' => ['required', 'array'],
            'page.url' => ['required', 'string', 'max:2048'],
            'page.path' => ['required', 'string', 'max:2048'],
            'page.referrer' => ['nullable', 'string', 'max:2048'],
            'attribution' => ['nullable', 'array'],
            'attribution.utm_source' => ['nullable', 'string', 'max:255'],
            'attribution.utm_medium' => ['nullable', 'string', 'max:255'],
            'attribution.utm_campaign' => ['nullable', 'string', 'max:255'],
            'attribution.utm_content' => ['nullable', 'string', 'max:255'],
            'attribution.utm_term' => ['nullable', 'string', 'max:255'],
            'meta' => ['nullable', 'array'],
            'meta.fbp' => ['nullable', 'string', 'max:255'],
            'meta.fbc' => ['nullable', 'string', 'max:255'],
            'consent' => ['required', 'array'],
            'consent.analytics' => ['required', 'boolean'],
            'consent.marketing' => ['required', 'boolean'],
            'consent.necessary' => ['nullable', 'boolean'],
            'metadata' => ['nullable', 'array'],
        ];
    }
}
