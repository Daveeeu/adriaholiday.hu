<?php

namespace App\Mcp\Tools;

use App\Models\Customer;
use App\Services\Mcp\CustomerBriefing;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Title;
use Laravel\Mcp\Server\Tools\Annotations\IsIdempotent;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Name('search_customers')]
#[Title('Ügyfelek keresése')]
#[Description('Searches the registered customers by name, e-mail, phone or referral code. Returns their contact details and how many bookings they have. For a customer\'s bookings call search_bookings with their e-mail.')]
#[IsReadOnly]
#[IsIdempotent]
class SearchCustomersTool extends AdminTool
{
    private const DEFAULT_LIMIT = 25;

    private const MAX_LIMIT = 100;

    public function __construct(private readonly CustomerBriefing $customers) {}

    protected function permission(): string
    {
        return 'customers.viewAny';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'search' => $schema->string()->description('Text in the name, e-mail, phone or referral code.')->required(),
            'limit' => $schema->integer()->min(1)->max(self::MAX_LIMIT)->description('How many customers to return (default 25).'),
        ];
    }

    public function handle(Request $request): ResponseFactory
    {
        $validated = $request->validate([
            'search' => ['required', 'string', 'min:2', 'max:200'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:'.self::MAX_LIMIT],
        ]);

        $query = Customer::query()->search(trim($validated['search']));
        $total = (clone $query)->count();
        $customers = $query->withCount('bookings')->orderBy('name')->limit($validated['limit'] ?? self::DEFAULT_LIMIT)->get();

        return $this->respond([
            'total_count' => $total,
            'returned' => $customers->count(),
            'customers' => $customers->map(fn (Customer $customer): array => $this->customers->details($customer))->all(),
        ]);
    }
}
