<?php

namespace Tests\Unit;

use App\Support\SalesAssistant\RetellSignature;
use PHPUnit\Framework\TestCase;

class RetellSignatureTest extends TestCase
{
    private const KEY = 'key_secret';

    private const NOW = 1_792_500_000_000;

    private const TOLERANCE = 300_000;

    public function test_it_signs_like_retell_sdks(): void
    {
        // v=<ms>,d=hex(HMAC-SHA256(key, body . ms))
        $this->assertSame(
            'v='.self::NOW.',d='.hash_hmac('sha256', '{"a":1}'.self::NOW, self::KEY),
            RetellSignature::sign('{"a":1}', self::KEY, self::NOW),
        );
    }

    public function test_a_fresh_signature_of_the_exact_body_verifies(): void
    {
        $signature = RetellSignature::sign('{"a":1}', self::KEY, self::NOW - 1000);

        $this->assertTrue(RetellSignature::verify('{"a":1}', self::KEY, $signature, self::NOW, self::TOLERANCE));
        $this->assertTrue(RetellSignature::verify('{"a":1}', self::KEY, " {$signature} ", self::NOW, self::TOLERANCE));
    }

    public function test_any_change_or_age_fails(): void
    {
        $signature = RetellSignature::sign('{"a":1}', self::KEY, self::NOW);

        $this->assertFalse(RetellSignature::verify('{"a": 1}', self::KEY, $signature, self::NOW, self::TOLERANCE));
        $this->assertFalse(RetellSignature::verify('{"a":1}', 'other_key', $signature, self::NOW, self::TOLERANCE));
        $this->assertFalse(RetellSignature::verify('{"a":1}', self::KEY, $signature, self::NOW + self::TOLERANCE + 1, self::TOLERANCE));
        $this->assertFalse(RetellSignature::verify('{"a":1}', self::KEY, $signature, self::NOW - self::TOLERANCE - 1, self::TOLERANCE));
        $this->assertFalse(RetellSignature::verify('{"a":1}', '', RetellSignature::sign('{"a":1}', '', self::NOW), self::NOW, self::TOLERANCE));
    }

    public function test_malformed_signatures_fail(): void
    {
        foreach ([null, '', 'garbage', 'v=abc,d='.str_repeat('a', 64), 'v=1,d='.str_repeat('a', 63), 'v=1,d='.str_repeat('A', 64)] as $signature) {
            $this->assertFalse(RetellSignature::verify('{}', self::KEY, $signature, self::NOW, self::TOLERANCE), (string) $signature);
        }
    }
}
