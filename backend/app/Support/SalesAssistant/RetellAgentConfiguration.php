<?php

namespace App\Support\SalesAssistant;

use App\Services\SalesAssistant\SalesAssistantToolRegistry;
use App\Services\SalesAssistant\Tools\SalesAssistantTool;

/**
 * The Retell configuration of the sales assistant, built from the same tool
 * definitions and instructions the backend enforces: the Retell LLM (prompt
 * and custom functions) and the voice agent that uses it. Printed by
 * `php artisan sales-assistant:retell-config` for the Retell API or dashboard.
 */
final class RetellAgentConfiguration
{
    /**
     * Limit of each function call; the catalog answers well within it.
     */
    private const FUNCTION_TIMEOUT_MS = 10000;

    public function __construct(private readonly SalesAssistantToolRegistry $tools) {}

    /**
     * The body of POST /create-retell-llm.
     *
     * @param  string  $siteUrl  the public base URL Retell reaches the backend on
     * @return array<string, mixed>
     */
    public function llm(string $siteUrl): array
    {
        $maxOptions = (int) config('sales_assistant.max_search_results');

        return [
            'start_speaker' => 'agent',
            'begin_message' => SalesAssistantInstructions::BEGIN_MESSAGE,
            'general_prompt' => SalesAssistantInstructions::build($maxOptions),
            'model_config' => [
                'type' => 'cascading',
                'primary' => ['model' => (string) config('sales_assistant.retell.llm_model')],
                'temperature' => 0.2,
            ],
            'general_tools' => [
                ...array_map(fn (SalesAssistantTool $tool): array => $this->customFunction($tool, $siteUrl), $this->tools->all()),
                [
                    'type' => 'end_call',
                    'name' => 'end_call',
                    'description' => 'End the call after the customer has said goodbye.',
                ],
            ],
        ];
    }

    /**
     * The body of POST /create-agent, for the LLM created first.
     *
     * @return array<string, mixed>
     */
    public function agent(string $llmId): array
    {
        return [
            'agent_name' => 'Adria Holiday AI utazási tanácsadó (demó)',
            'response_engine' => ['type' => 'retell-llm', 'llm_id' => $llmId],
            'voice_id' => (string) (config('sales_assistant.retell.voice_id') ?: '<a Hungarian-capable voice id from the Retell dashboard>'),
            'language' => 'hu-HU',
            'max_call_duration_ms' => (int) config('sales_assistant.session_ttl_seconds') * 1000,
            'end_call_after_silence_ms' => 60000,
            // The demo stores no conversation: Retell keeps only basic call attributes.
            'data_storage_setting' => 'basic_attributes_only',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function customFunction(SalesAssistantTool $tool, string $siteUrl): array
    {
        return [
            'type' => 'custom',
            'name' => $tool->name(),
            'description' => $tool->description(),
            'url' => rtrim($siteUrl, '/').'/api/sales-assistant/retell/functions/'.$tool->name(),
            'method' => 'POST',
            // The backend reads the call (agent and call id) next to the arguments.
            'args_at_root' => false,
            'parameters' => $tool->parameters(),
            'speak_during_execution' => true,
            'execution_message_description' => 'Say a very short Hungarian filler such as "Máris megnézem." while the catalog is checked.',
            'speak_after_execution' => true,
            'timeout_ms' => self::FUNCTION_TIMEOUT_MS,
        ];
    }
}
