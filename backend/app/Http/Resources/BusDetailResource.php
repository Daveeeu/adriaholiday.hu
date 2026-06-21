<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class BusDetailResource extends BusResource
{
    public function toArray(Request $request): array
    {
        return parent::toArray($request);
    }
}
