<?php

namespace App\Http\Requests;

use Carbon\CarbonImmutable;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class AnalyticsDateRangeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $today = CarbonImmutable::now('UTC')->toDateString();
        $this->merge([
            'from' => $this->input('from', CarbonImmutable::now('UTC')->subDays(6)->toDateString()),
            'to' => $this->input('to', $today),
        ]);
    }

    public function rules(): array
    {
        return [
            'from' => ['required', 'date_format:Y-m-d'],
            'to' => ['required', 'date_format:Y-m-d', 'after_or_equal:from'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $from = CarbonImmutable::createFromFormat('!Y-m-d', $this->validated('from'), 'UTC');
                $to = CarbonImmutable::createFromFormat('!Y-m-d', $this->validated('to'), 'UTC');
                if ($from->diffInDays($to) > 89) {
                    $validator->errors()->add('to', 'The selected date range must not exceed 90 days.');
                }
            },
        ];
    }
}
