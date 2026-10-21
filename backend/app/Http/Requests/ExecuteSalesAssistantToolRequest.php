<?php

namespace App\Http\Requests;

use App\Http\Middleware\RequireSalesAssistantSession;
use App\Services\SalesAssistant\SalesAssistantToolException;
use App\Services\SalesAssistant\SalesAssistantToolRegistry;
use App\Services\SalesAssistant\Tools\SalesAssistantTool;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

/**
 * A function call of the assistant model, relayed by the browser:
 * `{"arguments": {...}}` for the tool named in the URL. The arguments are
 * validated against the tool's own rules; arguments it does not know are
 * dropped.
 */
class ExecuteSalesAssistantToolRequest extends FormRequest
{
    private ?SalesAssistantTool $tool = null;

    public function authorize(): bool
    {
        // The session middleware has admitted the request.
        return true;
    }

    public function rules(): array
    {
        return [
            'arguments' => ['present', 'array'],
            ...collect($this->tool()->rules())
                ->mapWithKeys(fn (mixed $rules, string $field): array => ["arguments.{$field}" => $rules])
                ->all(),
        ];
    }

    /**
     * @throws SalesAssistantToolException for a tool that does not exist
     */
    public function tool(): SalesAssistantTool
    {
        $name = (string) $this->route('tool');

        return $this->tool ??= app(SalesAssistantToolRegistry::class)->find($name)
            ?? throw new SalesAssistantToolException('unknown_tool', "There is no tool named \"{$name}\".", 404);
    }

    /**
     * @return array<string, mixed>
     */
    public function toolArguments(): array
    {
        // A call without arguments ({}) validates to nothing.
        return Arr::only($this->validated('arguments') ?? [], array_keys($this->tool()->rules()));
    }

    public function sessionToken(): string
    {
        return (string) $this->attributes->get(RequireSalesAssistantSession::ATTRIBUTE);
    }

    /**
     * Answers invalid arguments in the tool error shape, so the model reads
     * which argument to fix.
     */
    protected function failedValidation(Validator $validator): void
    {
        $errors = collect($validator->errors()->toArray())
            ->mapWithKeys(fn (array $messages, string $field): array => [Str::after($field, 'arguments.') => $messages])
            ->all();

        throw new SalesAssistantToolException(
            'invalid_arguments',
            'Some arguments are invalid. Fix them and call the tool again, or ask the customer to clarify.',
            422,
            ['errors' => $errors],
        );
    }
}
