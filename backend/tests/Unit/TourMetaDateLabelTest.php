<?php

namespace Tests\Unit;

use App\Models\Tour;
use App\Models\TourDate;
use App\Support\TourMeta;
use Tests\TestCase;

class TourMetaDateLabelTest extends TestCase
{
    public function test_a_multi_day_date_shows_its_span(): void
    {
        $this->assertSame('2027.04.04. - 04.10.', TourMeta::dateRangeLabel($this->date('2027-04-04', '2027-04-10')));
        $this->assertSame('2027.07.30. - 08.02.', TourMeta::dateRangeLabel($this->date('2027-07-30', '2027-08-02')));
    }

    public function test_a_one_day_trip_shows_only_its_day(): void
    {
        $this->assertSame('2027.04.04.', TourMeta::dateRangeLabel($this->date('2027-04-04', '2027-04-04')));
        $this->assertSame('2027.04.04.', TourMeta::dateRangeLabel($this->date('2027-04-04', null)));
    }

    public function test_the_departure_label_uses_the_earliest_date(): void
    {
        $tour = new Tour;
        $tour->setRelation('dates', collect([
            $this->date('2027-08-10', '2027-08-10'),
            $this->date('2027-07-30', '2027-08-02'),
        ]));

        $this->assertSame('2027.07.30. - 08.02.', TourMeta::departureLabel($tour));

        $tour->setRelation('dates', collect([$this->date('2027-12-06', '2027-12-06')]));

        $this->assertSame('2027.12.06.', TourMeta::departureLabel($tour));
    }

    private function date(string $start, ?string $end): TourDate
    {
        return new TourDate(['start_date' => $start, 'end_date' => $end]);
    }
}
