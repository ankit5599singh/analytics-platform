<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreAnalyticsEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $properties = $this->input('properties', []);
        if (is_array($properties)) {
            $encoded = json_encode($properties);
            if ($encoded !== false && strlen($encoded) > 8192) {
                $this->merge(['properties' => null]);
                $this->attributes->set('properties_too_large', true);
            }
        }
    }

    public function rules(): array
    {
        return [
            'event_id' => ['required', 'uuid'],
            'event_name' => ['required', 'string', 'max:100', 'regex:/^[a-zA-Z][a-zA-Z0-9_.-]*$/'],
            'source' => ['required', Rule::in(['browser', 'server'])],
            'anonymous_id' => ['nullable', 'string', 'max:64'],
            'session_id' => ['nullable', 'string', 'max:64'],
            'user_id' => ['nullable', 'string', 'max:100'],
            'occurred_at' => [
                'required',
                'date',
                'after_or_equal:' . now()->subDays(30)->toIso8601String(),
                'before_or_equal:' . now()->addMinutes(5)->toIso8601String(),
            ],
            'page' => ['nullable', 'array'],
            'page.url' => ['nullable', 'string', 'max:2048'],
            'page.title' => ['nullable', 'string', 'max:255'],
            'page.referrer' => ['nullable', 'string', 'max:2048'],
            'properties' => ['nullable', 'array'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($this->attributes->get('properties_too_large')) {
                $validator->errors()->add('properties', 'Event properties must not exceed 8 KB.');
            }
        });
    }
}
