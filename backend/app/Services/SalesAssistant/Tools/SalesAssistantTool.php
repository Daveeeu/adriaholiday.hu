<?php

namespace App\Services\SalesAssistant\Tools;

/**
 * A read-only catalog function the assistant model may call. The JSON schema
 * tells the model how to call it; the Laravel rules are what the server
 * enforces, since the arguments arrive through the browser.
 */
interface SalesAssistantTool
{
    public function name(): string;

    /**
     * Explains the model when to call the tool and what it returns.
     */
    public function description(): string;

    /**
     * The arguments as a JSON schema object.
     *
     * @return array<string, mixed>
     */
    public function parameters(): array;

    /**
     * Laravel validation rules of the arguments.
     *
     * @return array<string, mixed>
     */
    public function rules(): array;

    /**
     * @param  array<string, mixed>  $arguments  validated against rules()
     */
    public function handle(array $arguments): SalesAssistantToolResult;
}
