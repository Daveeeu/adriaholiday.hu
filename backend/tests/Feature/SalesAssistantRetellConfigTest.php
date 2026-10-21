<?php

namespace Tests\Feature;

use App\Services\SalesAssistant\SalesAssistantToolRegistry;
use App\Services\SalesAssistant\Tools\SalesAssistantTool;
use Illuminate\Support\Facades\Artisan;
use Tests\TestCase;

class SalesAssistantRetellConfigTest extends TestCase
{
    public function test_the_llm_config_exposes_the_five_catalog_functions_on_the_site(): void
    {
        config(['sales_assistant.retell.api_key' => 'key_must_not_leak']);

        $this->assertSame(0, Artisan::call('sales-assistant:retell-config', ['part' => 'llm', '--site-url' => 'https://demo.example.test/']));
        $output = Artisan::output();
        $llm = json_decode($output, true, flags: JSON_THROW_ON_ERROR);

        $this->assertStringNotContainsString('key_must_not_leak', $output);
        $this->assertSame('agent', $llm['start_speaker']);
        $this->assertStringContainsString('Hungarian', $llm['general_prompt']);
        $this->assertStringContainsString('{{current_time_Europe/Budapest}}', $llm['general_prompt']);

        $functions = collect($llm['general_tools'])->where('type', 'custom')->keyBy('name');
        $tools = collect(app(SalesAssistantToolRegistry::class)->all())->keyBy(fn (SalesAssistantTool $tool): string => $tool->name());

        $this->assertSame(
            ['get_pickup_locations', 'get_trip_departures', 'get_trip_details', 'get_trip_price', 'search_trips'],
            $functions->keys()->sort()->values()->all(),
        );

        foreach ($functions as $name => $function) {
            $this->assertSame("https://demo.example.test/api/sales-assistant/retell/functions/{$name}", $function['url']);
            $this->assertSame('POST', $function['method']);
            $this->assertFalse($function['args_at_root']);
            $this->assertSame($tools[$name]->parameters(), $function['parameters']);
        }

        $this->assertTrue(collect($llm['general_tools'])->contains('type', 'end_call'));
    }

    public function test_the_agent_config_speaks_hungarian_and_stores_no_conversation(): void
    {
        config(['sales_assistant.session_ttl_seconds' => 600, 'sales_assistant.retell.voice_id' => 'voice_hu']);

        Artisan::call('sales-assistant:retell-config', ['part' => 'agent', '--llm-id' => 'llm_123']);
        $agent = json_decode(Artisan::output(), true, flags: JSON_THROW_ON_ERROR);

        $this->assertSame(['type' => 'retell-llm', 'llm_id' => 'llm_123'], $agent['response_engine']);
        $this->assertSame('hu-HU', $agent['language']);
        $this->assertSame('voice_hu', $agent['voice_id']);
        $this->assertSame(600000, $agent['max_call_duration_ms']);
        $this->assertSame('basic_attributes_only', $agent['data_storage_setting']);
    }

    public function test_an_unknown_part_fails(): void
    {
        $this->assertSame(1, Artisan::call('sales-assistant:retell-config', ['part' => 'phone-number']));
    }
}
