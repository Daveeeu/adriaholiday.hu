<?php

namespace App\Mail;

use App\Models\Coupon;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewsletterCouponMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public readonly Coupon $coupon)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Köszönjük a feliratkozást! Itt a kedvezményed',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.newsletter.coupon',
            with: [
                'coupon' => $this->coupon,
            ],
        );
    }
}
