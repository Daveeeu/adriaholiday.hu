<?php

namespace Tests\Unit\Payment;

use App\Services\Payment\SimplePay\SimplePayClient;
use App\Support\Payment\BookingPaymentStatus;
use PHPUnit\Framework\TestCase;

class SimplePayClientTest extends TestCase
{
    public function test_signatures_match_the_example_of_the_simplepay_documentation(): void
    {
        $body = '{"salt":"f2dbffcef9a3ab94b618ddb59f0da637","merchant":"PUBLICTESTHUF","orderRef":"1853354717597262343977",'
            .'"currency":"HUF","customerEmail":"sdk_test@simplepay.com","language":"HU",'
            .'"sdkVersion":"SimplePay_PHP_SDK_2.1.5_250731:819df13a2304433007f4e3159610f623","methods":["CARD"],"total":"25",'
            .'"timeout":"2025-10-06T07:00:34+02:00","url":"https:\/\/sdk.simplepay.hu\/back.php"}';

        $this->assertSame(
            'ioi43JEN1utnzPTdJGjuU7we8zgyWh7s0NILYgN0PYLej3OnyjFohbI3YZ747J0v',
            SimplePayClient::sign($body, 'FxDa5w314kLlNseq2sKuVwaqZshZT5d6'),
        );
    }

    public function test_only_finished_succeeds_and_only_known_final_states_fail(): void
    {
        $this->assertSame(BookingPaymentStatus::SUCCEEDED, SimplePayClient::toPaymentStatus('FINISHED'));

        foreach (['CANCELLED', 'TIMEOUT', 'NOTAUTHORIZED', 'FRAUD', 'REVERSED'] as $state) {
            $this->assertSame(BookingPaymentStatus::FAILED, SimplePayClient::toPaymentStatus($state));
        }

        foreach (['INIT', 'INPAYMENT', 'INFRAUD', 'AUTHORIZED', 'SOMETHING_NEW', ''] as $state) {
            $this->assertSame(BookingPaymentStatus::STARTED, SimplePayClient::toPaymentStatus($state));
        }
    }
}
