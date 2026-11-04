<?php

namespace App\Services\Tour\RouteMap;

use GdImage;

/**
 * Draws a tour's route map as a PNG: the countries its stops lie in on a light
 * sea, the stops in order joined by dotted arcs, each stop with a dot and its
 * name — accommodations in red, other stops in black. Countries lying inside
 * the visited ones (e.g. Kosovo) are filled in a pale green, so no sea shows
 * through. Sizes below are in layout pixels of a 480×320 map, about the size
 * it is shown at; the image has twice as many pixels, and is drawn at twice
 * that and scaled down, as GD does not antialias filled shapes.
 */
class RouteMapRenderer
{
    /** Layout size; the image is OUTPUT_SCALE times larger. */
    private const WIDTH = 480;

    private const HEIGHT = 320;

    private const OUTPUT_SCALE = 2;

    /** Bump when the drawing changes, so every stored map is drawn again. */
    public const VERSION = 1;

    private const SUPERSAMPLE = 2;

    /** Free space around the countries, as a share of the image. */
    private const PADDING = 0.07;

    /** Land shown around the stops, in degrees: at least this much, or the stops' own extent. */
    private const MIN_SURROUNDING = 5.0;

    /** A country (part) at most this large, in degrees, is shown whole; a larger one only around the stops. */
    private const WHOLE_COUNTRY_SIZE = 20.0;

    private const SEA = '#c2f2fa';

    private const LAND = ['#7cc96a', '#5daf55', '#a8d98d', '#8fd073', '#4f9f49', '#b7e09c'];

    private const ENCLOSED_LAND = '#dcefc6';

    private const BORDER = '#4f9a46';

    private const ROUTE = '#3f4a5a';

    private const STOP = '#111827';

    private const ACCOMMODATION = '#e5322d';

    /** In points, as GD takes it. */
    private const FONT_SIZE = 9.5;

    public function __construct(private readonly CountryShapes $shapes) {}

    /**
     * @param  array<int, array{name: string, latitude: float, longitude: float, accommodation: bool}>  $stops  in travel order
     */
    public function render(array $stops): string
    {
        $scale = self::OUTPUT_SCALE * self::SUPERSAMPLE;
        $width = self::WIDTH * $scale;
        $height = self::HEIGHT * $scale;
        $image = imagecreatetruecolor($width, $height);
        imagefill($image, 0, 0, $this->color($image, self::SEA));

        $countries = $this->countriesOf($stops);
        $frame = $this->frame($stops, $countries);
        $project = $this->projection($frame, $width, $height);

        $this->drawCountries($image, $this->enclosedCountries($countries), $frame, $project, $scale, self::ENCLOSED_LAND);
        $this->drawCountries($image, $countries, $frame, $project, $scale);
        $this->drawRoute($image, $stops, $project, $scale);
        $this->drawStops($image, $this->markers($stops), $project, $scale, $width, $height);

        $output = imagecreatetruecolor(self::WIDTH * self::OUTPUT_SCALE, self::HEIGHT * self::OUTPUT_SCALE);
        imagecopyresampled($output, $image, 0, 0, 0, 0, self::WIDTH * self::OUTPUT_SCALE, self::HEIGHT * self::OUTPUT_SCALE, $width, $height);

        ob_start();
        imagepng($output, null, 9);

        return (string) ob_get_clean();
    }

    /**
     * The countries the stops lie in, in the order the route reaches them.
     *
     * @param  array<int, array{latitude: float, longitude: float}>  $stops
     * @return array<int, array{code: string, polygons: array<int, array{points: array<int, array{0: float, 1: float}>, bbox: array{0: float, 1: float, 2: float, 3: float}}>}>
     */
    private function countriesOf(array $stops): array
    {
        $countries = [];

        foreach ($stops as $stop) {
            $country = $this->shapes->at($stop['longitude'], $stop['latitude']);

            if ($country !== null) {
                $countries[$country['code']] ??= $country;
            }
        }

        return array_values($countries);
    }

    /**
     * Countries lying within the visited ones' extent, such as Kosovo between
     * Serbia, Albania and North Macedonia.
     *
     * @param  array<int, array{code: string, polygons: array<int, array{points: array<int, array{0: float, 1: float}>, bbox: array{0: float, 1: float, 2: float, 3: float}}>}>  $countries
     * @return array<int, array{code: string, polygons: array<int, array{points: array<int, array{0: float, 1: float}>, bbox: array{0: float, 1: float, 2: float, 3: float}}>}>
     */
    private function enclosedCountries(array $countries): array
    {
        if ($countries === []) {
            return [];
        }

        $boxes = array_merge(...array_map(fn (array $country): array => array_column($country['polygons'], 'bbox'), $countries));
        $extent = [min(array_column($boxes, 0)), min(array_column($boxes, 1)), max(array_column($boxes, 2)), max(array_column($boxes, 3))];
        $visited = array_column($countries, 'code');

        return array_values(array_filter($this->shapes->all(), function (array $country) use ($extent, $visited): bool {
            if (in_array($country['code'], $visited, true)) {
                return false;
            }

            $box = CountryShapes::bbox(array_merge(...array_column($country['polygons'], 'points')));

            return $box[0] >= $extent[0] && $box[1] >= $extent[1] && $box[2] <= $extent[2] && $box[3] <= $extent[3];
        }));
    }

    /**
     * The area shown, in degrees: the countries' parts near the stops, whole
     * unless very large — those no further from the stops than their
     * surroundings (a stop in Moscow shows western Russia, not Siberia).
     *
     * @param  array<int, array{latitude: float, longitude: float}>  $stops
     * @param  array<int, array{polygons: array<int, array{bbox: array{0: float, 1: float, 2: float, 3: float}}>}>  $countries
     * @return array{0: float, 1: float, 2: float, 3: float}
     */
    private function frame(array $stops, array $countries): array
    {
        $stopsBox = CountryShapes::bbox(array_map(fn (array $stop): array => [$stop['longitude'], $stop['latitude']], $stops));
        $surrounding = max(self::MIN_SURROUNDING, $stopsBox[2] - $stopsBox[0], $stopsBox[3] - $stopsBox[1]);
        $limit = [$stopsBox[0] - $surrounding, $stopsBox[1] - $surrounding, $stopsBox[2] + $surrounding, $stopsBox[3] + $surrounding];
        $frame = $stopsBox;

        foreach ($countries as $country) {
            foreach ($country['polygons'] as $polygon) {
                $box = $polygon['bbox'];

                if (! self::intersects($box, $limit)) {
                    continue;
                }

                if ($box[2] - $box[0] > self::WHOLE_COUNTRY_SIZE || $box[3] - $box[1] > self::WHOLE_COUNTRY_SIZE) {
                    $box = [max($box[0], $limit[0]), max($box[1], $limit[1]), min($box[2], $limit[2]), min($box[3], $limit[3])];
                }

                $frame = [min($frame[0], $box[0]), min($frame[1], $box[1]), max($frame[2], $box[2]), max($frame[3], $box[3])];
            }
        }

        // A single stop with no country around it still gets some surroundings.
        if ($frame[2] - $frame[0] < 0.5 && $frame[3] - $frame[1] < 0.5) {
            $frame = [$frame[0] - 1, $frame[1] - 1, $frame[2] + 1, $frame[3] + 1];
        }

        return $frame;
    }

    /**
     * Mercator, fitted into the image with the frame centred.
     *
     * @param  array{0: float, 1: float, 2: float, 3: float}  $frame
     * @return callable(float, float): array{0: float, 1: float} longitude, latitude => x, y
     */
    private function projection(array $frame, int $width, int $height): callable
    {
        $mercator = fn (float $longitude, float $latitude): array => [
            deg2rad($longitude),
            log(tan(M_PI / 4 + deg2rad(max(-85, min(85, $latitude))) / 2)),
        ];

        [$left, $bottom] = $mercator($frame[0], $frame[1]);
        [$right, $top] = $mercator($frame[2], $frame[3]);
        $padding = self::PADDING * min($width, $height);
        $unit = min(($width - 2 * $padding) / max($right - $left, 1e-6), ($height - 2 * $padding) / max($top - $bottom, 1e-6));
        $offsetX = ($width - ($right - $left) * $unit) / 2;
        $offsetY = ($height - ($top - $bottom) * $unit) / 2;

        return function (float $longitude, float $latitude) use ($mercator, $left, $top, $unit, $offsetX, $offsetY): array {
            [$x, $y] = $mercator($longitude, $latitude);

            return [$offsetX + ($x - $left) * $unit, $offsetY + ($top - $y) * $unit];
        };
    }

    /**
     * @param  array<int, array{polygons: array<int, array{points: array<int, array{0: float, 1: float}>, bbox: array{0: float, 1: float, 2: float, 3: float}}>}>  $countries
     * @param  array{0: float, 1: float, 2: float, 3: float}  $frame
     */
    private function drawCountries(GdImage $image, array $countries, array $frame, callable $project, int $scale, ?string $color = null): void
    {
        $border = $this->color($image, self::BORDER);
        $visible = [$frame[0] - 20, $frame[1] - 20, $frame[2] + 20, $frame[3] + 20];

        foreach ($countries as $index => $country) {
            $fill = $this->color($image, $color ?? self::LAND[$index % count(self::LAND)]);

            foreach ($country['polygons'] as $polygon) {
                if (! self::intersects($polygon['bbox'], $visible)) {
                    continue;
                }

                $points = [];

                foreach ($polygon['points'] as [$longitude, $latitude]) {
                    [$x, $y] = $project($longitude, $latitude);
                    $points[] = (int) round($x);
                    $points[] = (int) round($y);
                }

                imagefilledpolygon($image, $points, $fill);
                imagesetthickness($image, (int) round($scale / 2));
                imagepolygon($image, $points, $border);
                imagesetthickness($image, 1);
            }
        }
    }

    /**
     * Dotted arcs from stop to stop, bending to alternate sides so a route
     * there and back stays readable.
     *
     * @param  array<int, array{latitude: float, longitude: float}>  $stops
     */
    private function drawRoute(GdImage $image, array $stops, callable $project, int $scale): void
    {
        $color = $this->color($image, self::ROUTE);
        $gap = 5.5 * $scale;
        $radius = (int) round(0.9 * $scale);

        for ($i = 1, $count = count($stops); $i < $count; $i++) {
            [$x1, $y1] = $project($stops[$i - 1]['longitude'], $stops[$i - 1]['latitude']);
            [$x2, $y2] = $project($stops[$i]['longitude'], $stops[$i]['latitude']);
            $length = hypot($x2 - $x1, $y2 - $y1);

            if ($length < 3 * $scale) {
                continue;
            }

            $bend = 0.18 * $length * ($i % 2 === 0 ? 1 : -1);
            $controlX = ($x1 + $x2) / 2 - ($y2 - $y1) / $length * $bend;
            $controlY = ($y1 + $y2) / 2 + ($x2 - $x1) / $length * $bend;
            $dots = max(2, (int) round($length * 1.1 / $gap));

            for ($dot = 0; $dot <= $dots; $dot++) {
                $t = $dot / $dots;
                $x = (1 - $t) ** 2 * $x1 + 2 * (1 - $t) * $t * $controlX + $t ** 2 * $x2;
                $y = (1 - $t) ** 2 * $y1 + 2 * (1 - $t) * $t * $controlY + $t ** 2 * $y2;
                imagefilledellipse($image, (int) round($x), (int) round($y), 2 * $radius, 2 * $radius, $color);
            }
        }
    }

    /**
     * Each place once, red when the tour stays there on any of its visits.
     *
     * @param  array<int, array{name: string, latitude: float, longitude: float, accommodation: bool}>  $stops
     * @return array<int, array{name: string, latitude: float, longitude: float, accommodation: bool}>
     */
    private function markers(array $stops): array
    {
        $markers = [];

        foreach ($stops as $stop) {
            $key = round($stop['latitude'], 3).','.round($stop['longitude'], 3);

            if (isset($markers[$key])) {
                $markers[$key]['accommodation'] = $markers[$key]['accommodation'] || $stop['accommodation'];
            } else {
                $markers[$key] = $stop;
            }
        }

        return array_values($markers);
    }

    /**
     * @param  array<int, array{name: string, latitude: float, longitude: float, accommodation: bool}>  $markers
     */
    private function drawStops(GdImage $image, array $markers, callable $project, int $scale, int $width, int $height): void
    {
        $font = resource_path('fonts/OpenSans-Bold.ttf');
        $size = self::FONT_SIZE * $scale;
        $radius = (int) round(2.6 * $scale);
        $positions = array_map(fn (array $marker): array => $project($marker['longitude'], $marker['latitude']), $markers);
        $taken = array_map(fn (array $position): array => [
            $position[0] - $radius, $position[1] - $radius, $position[0] + $radius, $position[1] + $radius,
        ], $positions);

        foreach ($markers as $index => $marker) {
            [$x, $y] = $positions[$index];
            $color = $this->color($image, $marker['accommodation'] ? self::ACCOMMODATION : self::STOP);
            imagefilledellipse($image, (int) round($x), (int) round($y), 2 * $radius, 2 * $radius, $color);

            $box = imagettfbbox($size, 0, $font, $marker['name']);
            $textWidth = $box[2] - $box[0];
            $textHeight = $box[1] - $box[7];
            $label = $this->labelPosition($x, $y, $textWidth, $textHeight, $radius + 2 * $scale, $taken, $width, $height);
            $taken[] = $label;

            imagettftext($image, $size, 0, (int) round($label[0] - $box[0]), (int) round($label[3] - $box[1]), $color, $font, $marker['name']);
        }
    }

    /**
     * The first place beside the dot (right, left, above, below, then the
     * corners; then the same further out) where the label stays inside the
     * image and clear of the other dots and labels; failing that, the place
     * inside the image that covers the least of them.
     *
     * @param  array<int, array{0: float, 1: float, 2: float, 3: float}>  $taken
     * @return array{0: float, 1: float, 2: float, 3: float} left, top, right, bottom
     */
    private function labelPosition(float $x, float $y, float $textWidth, float $textHeight, float $gap, array $taken, int $width, int $height): array
    {
        $boxes = [];

        foreach ([$gap, 2.2 * $gap] as $distance) {
            foreach ([
                [$x + $distance, $y - $textHeight / 2],
                [$x - $distance - $textWidth, $y - $textHeight / 2],
                [$x - $textWidth / 2, $y - $distance - $textHeight],
                [$x - $textWidth / 2, $y + $distance],
                [$x + $distance, $y - $distance - $textHeight / 2],
                [$x + $distance, $y + $distance - $textHeight / 2],
                [$x - $distance - $textWidth, $y - $distance - $textHeight / 2],
                [$x - $distance - $textWidth, $y + $distance - $textHeight / 2],
            ] as [$left, $top]) {
                $boxes[] = [$left, $top, $left + $textWidth, $top + $textHeight];
            }
        }

        $inside = array_values(array_filter($boxes, fn (array $box): bool => $box[0] >= 0 && $box[1] >= 0 && $box[2] <= $width && $box[3] <= $height));

        if ($inside === []) {
            return $boxes[0];
        }

        $covered = array_map(fn (array $box): float => array_sum(array_map(fn (array $other): float => self::overlap($box, $other), $taken)), $inside);

        return $inside[array_search(min($covered), $covered, true)];
    }

    /**
     * @param  array{0: float, 1: float, 2: float, 3: float}  $a
     * @param  array{0: float, 1: float, 2: float, 3: float}  $b
     */
    private static function intersects(array $a, array $b): bool
    {
        return $a[0] < $b[2] && $a[2] > $b[0] && $a[1] < $b[3] && $a[3] > $b[1];
    }

    /**
     * @param  array{0: float, 1: float, 2: float, 3: float}  $a
     * @param  array{0: float, 1: float, 2: float, 3: float}  $b
     */
    private static function overlap(array $a, array $b): float
    {
        return max(0, min($a[2], $b[2]) - max($a[0], $b[0])) * max(0, min($a[3], $b[3]) - max($a[1], $b[1]));
    }

    private function color(GdImage $image, string $hex): int
    {
        [$red, $green, $blue] = sscanf($hex, '#%02x%02x%02x');

        return imagecolorallocate($image, $red, $green, $blue);
    }
}
