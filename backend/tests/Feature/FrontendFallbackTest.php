<?php

namespace Tests\Feature;

use Tests\TestCase;

class FrontendFallbackTest extends TestCase
{
    public function test_root_route_serves_portfolio_spa_index(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertHeader('content-type', 'text/html; charset=UTF-8');
    }

    public function test_portfolio_deep_link_serves_portfolio_spa_index(): void
    {
        $this->get('/kapcsolat')
            ->assertOk()
            ->assertHeader('content-type', 'text/html; charset=UTF-8');
    }

    public function test_admin_routes_serve_admin_spa_index(): void
    {
        $this->get('/admin/apartments')
            ->assertOk()
            ->assertHeader('content-type', 'text/html; charset=UTF-8');
    }

    public function test_api_and_static_asset_paths_do_not_fall_back_to_spa(): void
    {
        $this->get('/api/does-not-exist')->assertNotFound();
        $this->get('/admin/assets/missing.js')->assertNotFound();
        $this->get('/portfolio/assets/missing.js')->assertNotFound();
    }
}
