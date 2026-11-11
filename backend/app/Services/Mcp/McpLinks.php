<?php

namespace App\Services\Mcp;

/**
 * Absolute links the AI assistant can hand to the staff member: the admin
 * screen to open and the public page a customer sees.
 */
class McpLinks
{
    public function admin(string $path): string
    {
        return $this->absolute('/admin/'.ltrim($path, '/'));
    }

    public function public(string $path): string
    {
        return $this->absolute('/'.ltrim($path, '/'));
    }

    private function absolute(string $path): string
    {
        return rtrim((string) config('app.url'), '/').$path;
    }
}
