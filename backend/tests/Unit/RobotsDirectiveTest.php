<?php

namespace Tests\Unit;

use App\Support\Seo\RobotsDirective;
use PHPUnit\Framework\TestCase;

class RobotsDirectiveTest extends TestCase
{
    public function test_only_a_restrictive_setting_overrides_the_default(): void
    {
        $this->assertSame('noindex,follow', RobotsDirective::restrictive('NoIndex, Follow'));
        $this->assertSame('index,nofollow', RobotsDirective::restrictive('index, nofollow'));
        $this->assertNull(RobotsDirective::restrictive('index, follow'));
        $this->assertNull(RobotsDirective::restrictive(''));
        $this->assertNull(RobotsDirective::restrictive(null));
        $this->assertNull(RobotsDirective::restrictive('<script>, index'));
    }
}
