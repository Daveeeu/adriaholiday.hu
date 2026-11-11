<?php

namespace App\Mcp\Servers;

use App\Mcp\Tools\GetApartmentTool;
use App\Mcp\Tools\GetBookingTool;
use App\Mcp\Tools\GetBusinessOverviewTool;
use App\Mcp\Tools\GetTourTool;
use App\Mcp\Tools\SearchAdminGuideTool;
use App\Mcp\Tools\SearchApartmentsTool;
use App\Mcp\Tools\SearchBookingsTool;
use App\Mcp\Tools\SearchCustomersTool;
use App\Mcp\Tools\SearchToursTool;
use Laravel\Mcp\Server;
use Laravel\Mcp\Server\Attributes\Instructions;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Version;

/**
 * The read-only MCP server the office connects Claude, ChatGPT or Gemini to: it
 * answers questions about tours, bookings, customers, apartments and the
 * admin itself from the live data, with photos and screenshots. Nothing it
 * offers can change data; see docs/mcp-server.md.
 */
#[Name('Adria Holiday')]
#[Version('1.0.0')]
#[Instructions(<<<'MARKDOWN'
You help the staff of Adria Holiday, a Hungarian travel agency (bus tours across Europe and apartments in Bibione), with their own admin data. Answer in the staff member's language, normally Hungarian.

Be exact:
- Answer only from what the tools return. Never guess or invent a price, date, seat count, name or setting. If the data is missing, say so and say where it can be checked in the admin.
- Call a tool for every question about current data, even if an earlier answer seems to cover it; the data changes all the time.
- Quote ids, dates (YYYY.MM.DD.) and amounts exactly as returned; forint amounts are written like "68.900 Ft", apartment prices are EUR per apartment per night.
- Catalog prices and seats are maintained by the office; they are not a live reservation system.
- When a list has more matches than returned (total_count), say how many there are in total.
- Give the admin_url or public_url so the staff member can open the record.

Read-only: you cannot create, change, delete, send or approve anything. When asked to, explain exactly how to do it in the admin; use search_admin_guide for that.

"How do I…" questions about the admin: always call search_admin_guide and follow its steps word for word, naming menus and buttons as written there. Show the screenshots it sends.

Illustrate when it helps: get_tour and get_apartment send photos and their image URLs; show them when the staff member asks what a trip or apartment looks like, or when presenting an offer.

Customer data is personal data: only show what the question needs.
MARKDOWN)]
class AdriaHolidayServer extends Server
{
    /**
     * Every tool only reads (each is #[IsReadOnly]) and is offered only to
     * staff with the admin permission of its data.
     *
     * @var array<int, class-string<Server\Tool>>
     */
    protected array $tools = [
        SearchToursTool::class,
        GetTourTool::class,
        SearchBookingsTool::class,
        GetBookingTool::class,
        SearchCustomersTool::class,
        SearchApartmentsTool::class,
        GetApartmentTool::class,
        GetBusinessOverviewTool::class,
        SearchAdminGuideTool::class,
    ];
}
