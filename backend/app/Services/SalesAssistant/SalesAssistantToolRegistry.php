<?php

namespace App\Services\SalesAssistant;

use App\Services\SalesAssistant\Tools\GetPickupLocationsTool;
use App\Services\SalesAssistant\Tools\GetTripDeparturesTool;
use App\Services\SalesAssistant\Tools\GetTripDetailsTool;
use App\Services\SalesAssistant\Tools\GetTripPriceTool;
use App\Services\SalesAssistant\Tools\SalesAssistantTool;
use App\Services\SalesAssistant\Tools\SalesAssistantToolResult;
use App\Services\SalesAssistant\Tools\SearchTripsTool;
use Throwable;

/**
 * The only functions the assistant model can call: read-only catalog
 * queries. Anything not listed here does not exist for the model.
 */
class SalesAssistantToolRegistry
{
    /**
     * @var array<string, SalesAssistantTool>
     */
    private array $tools = [];

    public function __construct(
        SearchTripsTool $searchTrips,
        GetTripDetailsTool $tripDetails,
        GetTripDeparturesTool $tripDepartures,
        GetPickupLocationsTool $pickupLocations,
        GetTripPriceTool $tripPrice,
    ) {
        foreach ([$searchTrips, $tripDetails, $tripDepartures, $pickupLocations, $tripPrice] as $tool) {
            $this->tools[$tool->name()] = $tool;
        }
    }

    public function find(string $name): ?SalesAssistantTool
    {
        return $this->tools[$name] ?? null;
    }

    /**
     * The tools in the Realtime session's function format.
     *
     * @return array<int, array<string, mixed>>
     */
    public function definitions(): array
    {
        return array_values(array_map(fn (SalesAssistantTool $tool): array => [
            'type' => 'function',
            'name' => $tool->name(),
            'description' => $tool->description(),
            'parameters' => $tool->parameters(),
        ], $this->tools));
    }

    /**
     * Runs a tool on validated arguments. An unexpected failure is reported
     * and answered with a generic error the model can relay honestly.
     *
     * @param  array<string, mixed>  $arguments
     *
     * @throws SalesAssistantToolException
     */
    public function execute(SalesAssistantTool $tool, array $arguments): SalesAssistantToolResult
    {
        try {
            return $tool->handle($arguments);
        } catch (SalesAssistantToolException $exception) {
            throw $exception;
        } catch (Throwable $exception) {
            report($exception);

            throw SalesAssistantToolException::failed();
        }
    }
}
