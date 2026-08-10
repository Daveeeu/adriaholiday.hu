<!DOCTYPE html>
<html lang="hu">
<head>
    <meta charset="utf-8">
    <title>{{ $tour->name }}</title>
    <style>
        @page {
            margin: 28px 36px;
        }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            color: #1f2937;
            font-size: 12px;
            line-height: 1.5;
        }

        h1, h2, h3 {
            color: #0f172a;
            margin: 0 0 6px;
        }

        h1 {
            font-size: 22px;
        }

        h2 {
            font-size: 15px;
            margin-top: 18px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 4px;
        }

        .subtitle {
            font-size: 14px;
            color: #334155;
            margin: 0 0 10px;
        }

        .meta-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 6px;
        }

        .meta-table td {
            width: 25%;
            padding: 8px 10px;
            background: #f5f9fc;
            border: 1px solid #e5e7eb;
            font-size: 11px;
        }

        .meta-table td strong {
            display: block;
            color: #0f172a;
            font-size: 12px;
        }

        .day {
            margin-bottom: 10px;
        }

        .day-title {
            font-weight: bold;
            color: #0f172a;
            font-size: 12.5px;
        }

        .day-body {
            margin-top: 2px;
        }

        .price-columns {
            width: 100%;
        }

        .price-columns td {
            vertical-align: top;
            width: 50%;
            padding-right: 12px;
        }

        ul {
            margin: 4px 0 4px 16px;
            padding: 0;
        }

        li {
            margin-bottom: 3px;
        }

        .footer-note {
            margin-top: 24px;
            font-size: 10px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 8px;
        }

        p {
            margin: 0 0 6px;
        }
    </style>
</head>
<body>
    <h1>{{ $tour->name }}</h1>

    @if ($tour->subtitle)
        <p class="subtitle">{{ $tour->subtitle }}</p>
    @endif

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
            <td>
                Ár
                <strong>{{ $displayedPrice ?? 'Érdeklődjön' }}</strong>
            </td>
        </tr>
    </table>

    @if ($tour->short_description)
        <p>{!! $tour->short_description !!}</p>
    @endif

    @if ($tour->program_before)
        <h2>Az utazásról</h2>
        {!! $tour->program_before !!}
    @endif

    @if ($programDays->isNotEmpty())
        <h2>Program napról napra</h2>
        @foreach ($programDays as $day)
            <div class="day">
                <div class="day-title">{{ $day->day_number }}. nap &ndash; {{ $day->title }}</div>
                @if ($day->description)
                    <div class="day-body">{!! $day->description !!}</div>
                @endif
            </div>
        @endforeach
    @endif

    @if ($includedItems->isNotEmpty() || $excludedItems->isNotEmpty())
        <h2>Ár tartalma</h2>
        <table class="price-columns">
            <tr>
                <td>
                    <strong>A részvételi díj tartalmazza:</strong>
                    <ul>
                        @foreach ($includedItems as $item)
                            <li>{{ $item->text }}</li>
                        @endforeach
                    </ul>
                </td>
                <td>
                    <strong>A részvételi díj nem tartalmazza:</strong>
                    <ul>
                        @foreach ($excludedItems as $item)
                            <li>{{ $item->text }}</li>
                        @endforeach
                    </ul>
                </td>
            </tr>
        </table>
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
        {{ config('app.name') }} &middot; A dokumentum {{ $generatedAt }}-kor generálva, az aktuális ajánlati adatok alapján. Az árak és időpontok visszaigazolásig változhatnak.
    </div>
</body>
</html>
