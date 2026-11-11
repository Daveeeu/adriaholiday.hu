<?php

namespace App\Mcp\Tools;

use App\Models\User;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Tool;

/**
 * A read-only MCP tool over the admin's data. A staff member's assistant
 * only sees, and can only call, the tools whose admin permission they hold;
 * every concrete tool is marked #[IsReadOnly] (a test keeps it so).
 */
abstract class AdminTool extends Tool
{
    /**
     * The admin permission the tool's data needs (e.g. "bookings.view").
     */
    abstract protected function permission(): string;

    public function shouldRegister(Request $request): bool
    {
        $user = $request->user();

        return $user instanceof User && $user->checkPermissionTo($this->permission());
    }

    /**
     * The data as JSON text the model reads, followed by any images.
     *
     * @param  array<string, mixed>  $data
     * @param  array<int, Response>  $images
     */
    protected function respond(array $data, array $images = []): ResponseFactory
    {
        return Response::make([
            Response::text((string) json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRESERVE_ZERO_FRACTION | JSON_THROW_ON_ERROR)),
            ...$images,
        ]);
    }

    protected function user(Request $request): User
    {
        /** @var User */
        return $request->user();
    }
}
