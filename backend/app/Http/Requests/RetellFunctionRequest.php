<?php

namespace App\Http\Requests;

use App\Services\SalesAssistant\SalesAssistantSessionService;
use App\Services\SalesAssistant\SalesAssistantToolException;
use App\Services\SalesAssistant\SalesAssistantToolRegistry;
use App\Services\SalesAssistant\Tools\SalesAssistantTool;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * A custom function call of the Retell agent: `{"name", "call", "args"}` for
 * the tool named in the URL (the signature middleware has verified Retell
 * sent it). The arguments are validated against the tool's own rules;
 * arguments it does not know are dropped.
 */
class RetellFunctionRequest extends FormRequest
{
    private ?SalesAssistantTool $tool = null;

    /**
     * Only calls of the configured agent may use the catalog tools.
     */
    public function authorize(SalesAssistantSessionService $sessions): bool
    {
        $agentId = $this->input('call.agent_id');

        return $sessions->isOwnAgent(is_string($agentId) ? $agentId : null);
    }

    public function rules(): array
    {
        return [
            'name' => ['nullable', Rule::in([$this->tool()->name()])],
            'call' => ['required', 'array'],
            'call.call_id' => ['required', 'string', 'max:128'],
            'args' => ['present', 'array'],
            ...collect($this->tool()->rules())
                ->mapWithKeys(fn (mixed $rules, string $field): array => ["args.{$field}" => $rules])
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
            ?? throw new SalesAssistantToolException('unknown_tool', "There is no tool named \"{$name}\".");
    }

    /**
     * @return array<string, mixed>
     */
    public function toolArguments(): array
    {
        // A call without arguments ({}) validates to nothing.
        return Arr::only($this->validated('args') ?? [], array_keys($this->tool()->rules()));
    }

    public function callId(): string
    {
        return (string) $this->validated('call.call_id');
    }

    protected function failedAuthorization(): void
    {
        throw new AuthorizationException('Unknown agent.');
    }

    /**
     * Answers invalid arguments in the tool error shape, so the model reads
     * which argument to fix.
     */
    protected function failedValidation(Validator $validator): void
    {
        $errors = collect($validator->errors()->toArray())
            ->mapWithKeys(fn (array $messages, string $field): array => [Str::after($field, 'args.') => $messages])
            ->all();

        throw new SalesAssistantToolException(
            'invalid_arguments',
            'Some arguments are invalid. Fix them and call the function again, or ask the customer to clarify.',
            ['errors' => $errors],
        );
    }
}
