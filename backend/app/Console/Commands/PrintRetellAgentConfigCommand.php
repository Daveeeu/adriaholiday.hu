<?php

namespace App\Console\Commands;

use App\Support\SalesAssistant\RetellAgentConfiguration;
use Illuminate\Console\Command;

/**
 * Prints the Retell configuration of the AI sales assistant: the Retell LLM
 * (prompt and custom functions) and the agent. Nothing is sent to Retell;
 * see docs/ai-sales-assistant.md for creating them.
 */
class PrintRetellAgentConfigCommand extends Command
{
    protected $signature = 'sales-assistant:retell-config
        {part=llm : "llm" (POST /create-retell-llm body) or "agent" (POST /create-agent body)}
        {--site-url= : Public base URL Retell calls the functions on (default: APP_URL)}
        {--llm-id= : The llm_id the agent uses (for "agent")}';

    protected $description = 'Print the Retell LLM or agent configuration of the AI sales assistant as JSON.';

    public function handle(RetellAgentConfiguration $configuration): int
    {
        $payload = match ($this->argument('part')) {
            'llm' => $configuration->llm((string) ($this->option('site-url') ?: config('app.url'))),
            'agent' => $configuration->agent((string) ($this->option('llm-id') ?: '<llm_id from create-retell-llm>')),
            default => null,
        };

        if ($payload === null) {
            $this->error('The part must be "llm" or "agent".');

            return self::FAILURE;
        }

        $this->line((string) json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

        return self::SUCCESS;
    }
}
