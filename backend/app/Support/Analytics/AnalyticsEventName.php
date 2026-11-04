<?php

namespace App\Support\Analytics;

final class AnalyticsEventName
{
    public const PAGE_VIEW = 'page_view';

    public const CATEGORY_VIEW = 'category_view';

    public const HOMEPAGE_OFFER_VIEW = 'homepage_offer_view';

    public const OFFER_VIEW = 'offer_view';

    public const ITEM_LIST_VIEW = 'item_list_view';

    public const ITEM_SELECT = 'item_select';

    public const GALLERY_OPEN = 'gallery_open';

    public const GALLERY_NEXT = 'gallery_next';

    public const GALLERY_PREVIOUS = 'gallery_previous';

    public const PROGRAM_VIEW = 'program_view';

    public const PROGRAM_DAY_OPEN = 'program_day_open';

    public const PROGRAM_PDF_DOWNLOAD = 'program_pdf_download';

    public const PROGRAM_PDF_PRINT = 'program_pdf_print';

    public const PRICEBOX_VIEW = 'pricebox_view';

    public const DATE_SELECT = 'date_select';

    public const PARTICIPANTS_CHANGE = 'participants_change';

    public const CTA_CLICK = 'cta_click';

    public const BOOKING_ANCHOR_CLICK = 'booking_anchor_click';

    public const FILTER_CLICK = 'filter_click';

    public const FILTER_REMOVE = 'filter_remove';

    public const SEARCH = 'search';

    public const PHONE_CLICK = 'phone_click';

    public const EMAIL_CLICK = 'email_click';

    public const WHATSAPP_CLICK = 'whatsapp_click';

    public const LEAD_START = 'lead_start';

    public const LEAD_SUBMIT = 'lead_submit';

    public const BOOKING_START = 'booking_start';

    public const BOOKING_STEP = 'booking_step';

    public const BOOKING_FIELD_ERROR = 'booking_field_error';

    public const BOOKING_ABANDON = 'booking_abandon';

    public const BOOKING_SUCCESS = 'booking_success';

    public const BOOKING_ERROR = 'booking_error';

    public const BOOKING_STATUS_CHANGE = 'booking_status_change';

    public const NEWSLETTER_SIGNUP = 'newsletter_signup';

    public const PAYMENT_RESULT = 'payment_result';

    public const PAGE_NOT_FOUND = 'page_not_found';

    public static function all(): array
    {
        return [
            self::PAGE_VIEW,
            self::CATEGORY_VIEW,
            self::HOMEPAGE_OFFER_VIEW,
            self::OFFER_VIEW,
            self::ITEM_LIST_VIEW,
            self::ITEM_SELECT,
            self::GALLERY_OPEN,
            self::GALLERY_NEXT,
            self::GALLERY_PREVIOUS,
            self::PROGRAM_VIEW,
            self::PROGRAM_DAY_OPEN,
            self::PROGRAM_PDF_DOWNLOAD,
            self::PROGRAM_PDF_PRINT,
            self::PRICEBOX_VIEW,
            self::DATE_SELECT,
            self::PARTICIPANTS_CHANGE,
            self::CTA_CLICK,
            self::BOOKING_ANCHOR_CLICK,
            self::FILTER_CLICK,
            self::FILTER_REMOVE,
            self::SEARCH,
            self::PHONE_CLICK,
            self::EMAIL_CLICK,
            self::WHATSAPP_CLICK,
            self::LEAD_START,
            self::LEAD_SUBMIT,
            self::BOOKING_START,
            self::BOOKING_STEP,
            self::BOOKING_FIELD_ERROR,
            self::BOOKING_ABANDON,
            self::BOOKING_SUCCESS,
            self::BOOKING_ERROR,
            self::BOOKING_STATUS_CHANGE,
            self::NEWSLETTER_SIGNUP,
            self::PAYMENT_RESULT,
            self::PAGE_NOT_FOUND,
        ];
    }
}
