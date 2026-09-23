<!DOCTYPE html>
<html lang="hu">
<head>
    <meta charset="utf-8">
    <title>{{ $tour->name }}</title>
    <style>
        @page {
            margin: 28px 0 54px;
        }

        @page :first {
            margin-top: 0;
        }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            color: #1f2937;
            font-size: 11.5px;
            line-height: 1.5;
            margin: 0;
        }

        p {
            margin: 0 0 6px;
        }

        ul {
            margin: 4px 0 4px 16px;
            padding: 0;
        }

        li {
            margin-bottom: 3px;
        }

        .page-footer {
            position: fixed;
            left: 0;
            right: 0;
            bottom: -54px;
            height: 54px;
            background: #0f172a;
            color: #cbd5e1;
            font-size: 9.5px;
        }

        .page-footer table {
            width: 100%;
            border-collapse: collapse;
        }

        .page-footer td {
            padding: 12px 36px 0;
            vertical-align: top;
        }

        .page-footer .brand-name {
            color: #ffffff;
            font-weight: bold;
            font-size: 10.5px;
        }

        .page-footer .contact {
            text-align: right;
            color: #ffffff;
        }

        .page-footer .accent {
            color: #34d6a4;
        }

        .top-stripe {
            height: 6px;
            background: #00c389;
        }

        .top-stripe-accent {
            height: 6px;
            width: 35%;
            background: #16b8ff;
        }

        .header {
            width: 100%;
            border-collapse: collapse;
        }

        .header td {
            padding: 18px 36px 14px;
            vertical-align: middle;
        }

        .header .logo {
            height: 46px;
        }

        .header .site-name {
            font-size: 20px;
            font-weight: bold;
            color: #0f172a;
        }

        .header .doc-label {
            text-align: right;
        }

        .doc-badge {
            display: inline-block;
            padding: 5px 12px;
            border-radius: 12px;
            background: #e6f9f3;
            color: #00815b;
            font-size: 10px;
            font-weight: bold;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .hero {
            margin: 0 36px;
            padding: 20px 22px 18px;
            border-radius: 14px;
            background: #0f172a;
            color: #ffffff;
        }

        .hero h1 {
            margin: 0;
            font-size: 22px;
            line-height: 1.25;
            color: #ffffff;
        }

        .hero .subtitle {
            margin: 6px 0 0;
            font-size: 13px;
            color: #a7f3d0;
        }

        .hero-rule {
            width: 56px;
            height: 4px;
            margin: 12px 0 0;
            background: #00c389;
            border-radius: 2px;
        }

        .content {
            padding: 0 36px;
        }

        .meta-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 8px 0;
            margin: 14px -8px 4px;
        }

        .meta-table td {
            width: 25%;
            padding: 9px 11px;
            border-radius: 10px;
            background: #f1fbf7;
            border: 1px solid #c9f0e1;
            border-top: 3px solid #00c389;
            font-size: 9.5px;
            color: #047857;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            vertical-align: top;
        }

        .meta-table td.price {
            background: #eaf7ff;
            border-color: #c3e9fd;
            border-top-color: #16b8ff;
            color: #0369a1;
        }

        .meta-table td strong {
            display: block;
            margin-top: 2px;
            color: #0f172a;
            font-size: 12px;
            text-transform: none;
            letter-spacing: 0;
        }

        .lead {
            margin-top: 12px;
            padding: 10px 14px;
            border-left: 4px solid #16b8ff;
            background: #f5f9fc;
            color: #334155;
            font-size: 12px;
        }

        h2 {
            margin: 20px 0 10px;
            padding: 7px 12px;
            border-left: 5px solid #00c389;
            border-radius: 0 8px 8px 0;
            background: #ecfbf5;
            color: #0f172a;
            font-size: 14px;
        }

        .day {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
            page-break-inside: avoid;
        }

        .day td {
            vertical-align: top;
        }

        .day .day-number-cell {
            width: 40px;
        }

        .day-number {
            width: 28px;
            padding: 6px 0;
            border-radius: 14px;
            background: #00c389;
            color: #ffffff;
            font-weight: bold;
            font-size: 12px;
            line-height: 16px;
            text-align: center;
        }

        .day-title {
            font-weight: bold;
            color: #0f172a;
            font-size: 12.5px;
            padding-top: 4px;
        }

        .day-title .day-label {
            color: #00a878;
        }

        .day-body {
            margin-top: 3px;
            padding-bottom: 8px;
            border-bottom: 1px dashed #d1e7df;
        }

        .keep-together {
            page-break-inside: avoid;
        }

        .price-columns {
            width: 100%;
            border-collapse: separate;
            border-spacing: 8px 0;
            margin: 0 -8px;
        }

        .price-columns td {
            width: 50%;
            padding: 10px 12px;
            border-radius: 10px;
            vertical-align: top;
        }

        .price-columns td.included {
            background: #f1fbf7;
            border: 1px solid #c9f0e1;
        }

        .price-columns td.excluded {
            background: #fff5f5;
            border: 1px solid #fde0e0;
        }

        .price-columns .column-title {
            display: block;
            margin-bottom: 6px;
            font-weight: bold;
        }

        .price-columns td.included .column-title {
            color: #047857;
        }

        .price-columns td.excluded .column-title {
            color: #b91c1c;
        }

        .check-list {
            list-style: none;
            margin: 0;
        }

        .check-list li {
            padding-left: 16px;
            position: relative;
        }

        .check-list .mark {
            position: absolute;
            left: 0;
            top: 0;
            font-weight: bold;
        }

        .included .mark {
            color: #00a878;
        }

        .excluded .mark {
            color: #ef4444;
        }

        .footer-note {
            margin-top: 22px;
            padding: 10px 14px;
            border-radius: 10px;
            background: #fff8e6;
            border: 1px solid #fde8b0;
            color: #92400e;
            font-size: 9.5px;
        }
    </style>
</head>
<body>
    <div class="page-footer">
        <table>
            <tr>
                <td>
                    <span class="brand-name">{{ $branding['siteName'] }}</span><br>
                    <span class="accent">Utazási program</span> &middot; {{ $tour->name }}
                </td>
                <td class="contact">
                    @if ($branding['phone'])
                        <span class="accent">Tel.:</span> {{ $branding['phone'] }}
                    @endif
                    @if ($branding['phone'] && $branding['email'])
                        &nbsp;&middot;&nbsp;
                    @endif
                    @if ($branding['email'])
                        <span class="accent">E-mail:</span> {{ $branding['email'] }}
                    @endif
                </td>
            </tr>
        </table>
    </div>

    <div class="top-stripe"><div class="top-stripe-accent"></div></div>

    <table class="header">
        <tr>
            <td>
                @if ($branding['logoDataUri'])
                    <img class="logo" src="{{ $branding['logoDataUri'] }}" alt="{{ $branding['siteName'] }}">
                @else
                    <span class="site-name">{{ $branding['siteName'] }}</span>
                @endif
            </td>
            <td class="doc-label">
                <span class="doc-badge">Utazási program</span>
            </td>
        </tr>
    </table>

    <div class="hero">
        <h1>{{ $tour->name }}</h1>
        @if ($tour->subtitle)
            <p class="subtitle">{{ $tour->subtitle }}</p>
        @endif
        <div class="hero-rule"></div>
    </div>

    <div class="content">
        <table class="meta-table">
            <tr>
                <td>
                    Időtartam
                    <strong>{{ $duration }}</strong>
                </td>
                <td>
                    Indulás
                    <strong>{{ $departureLabel }}</strong>
                </td>
                <td>
                    Utazás
                    <strong>{{ $transportLabel }}</strong>
                </td>
                <td class="price">
                    Ár
                    <strong>{{ $displayedPrice ?? 'Érdeklődjön' }}</strong>
                </td>
            </tr>
        </table>

        @if ($tour->short_description)
            <div class="lead">{!! $tour->short_description !!}</div>
        @endif

        @if ($tour->program_before)
            <h2>Az utazásról</h2>
            {!! $tour->program_before !!}
        @endif

        @if ($programDays->isNotEmpty())
            <h2>Program napról napra</h2>
            @foreach ($programDays as $day)
                <table class="day">
                    <tr>
                        <td class="day-number-cell">
                            <div class="day-number">{{ $day->day_number }}</div>
                        </td>
                        <td>
                            <div class="day-title"><span class="day-label">{{ $day->day_number }}. nap</span> &ndash; {{ $day->title }}</div>
                            @if ($day->description)
                                <div class="day-body">{!! $day->description !!}</div>
                            @endif
                        </td>
                    </tr>
                </table>
            @endforeach
        @endif

        @if ($includedItems->isNotEmpty() || $excludedItems->isNotEmpty())
            <div class="keep-together">
            <h2>Ár tartalma</h2>
            <table class="price-columns">
                <tr>
                    <td class="included">
                        <span class="column-title">A részvételi díj tartalmazza:</span>
                        <ul class="check-list">
                            @foreach ($includedItems as $item)
                                <li><span class="mark">&#10003;</span>{{ $item->text }}</li>
                            @endforeach
                        </ul>
                    </td>
                    <td class="excluded">
                        <span class="column-title">A részvételi díj nem tartalmazza:</span>
                        <ul class="check-list">
                            @foreach ($excludedItems as $item)
                                <li><span class="mark">&#10007;</span>{{ $item->text }}</li>
                            @endforeach
                        </ul>
                    </td>
                </tr>
            </table>
            </div>
        @endif

        @if ($tour->payment_program)
            <h2>Kiegészítő / fizető programok</h2>
            {!! $tour->payment_program !!}
        @endif

        @if ($tour->prices)
            <h2>Árak</h2>
            {!! $tour->prices !!}
        @endif

        @if ($tour->discounts)
            <h2>Kedvezmények</h2>
            {!! $tour->discounts !!}
        @endif

        <div class="footer-note">
            A dokumentum {{ $generatedAt }}-kor készült az aktuális ajánlati adatok alapján. Az árak és időpontok visszaigazolásig változhatnak.
        </div>
    </div>
</body>
</html>
