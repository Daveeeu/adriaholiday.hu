<?php

namespace App\Mcp\Tools;

use App\Models\Booking;
use App\Services\Mcp\BookingBriefing;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Title;
use Laravel\Mcp\Server\Tools\Annotations\IsIdempotent;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Name('get_booking')]
#[Title('Foglalás részletei')]
#[Description('One booking, inquiry or apartment booking by id, as the admin\'s booking sheet shows it: contact details, every passenger with the extras and insurance they chose, trip and departure, price breakdown and total, instalments with due dates, online payments, the e-mails sent and the change history.')]
#[IsReadOnly]
#[IsIdempotent]
class GetBookingTool extends AdminTool
{
    public function __construct(private readonly BookingBriefing $bookings) {}

    protected function permission(): string
    {
        return 'bookings.view';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'id' => $schema->integer()->description('The booking id (from search_bookings).')->required(),
        ];
    }

    public function handle(Request $request): ResponseFactory|Response
    {
        $validated = $request->validate(['id' => ['required', 'integer']]);

        $booking = Booking::query()->with(BookingBriefing::detailRelations())->find($validated['id']);

        if ($booking === null) {
            return Response::error('Nincs ilyen foglalás. Keresd meg a search_bookings eszközzel.');
        }

        return $this->respond($this->bookings->details($booking));
    }
}
