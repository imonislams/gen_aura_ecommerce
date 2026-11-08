<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DeliveryZone;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DeliveryZoneController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Settings/DeliveryZones', [
            'section' => 'delivery-zones',
            'zones' => DeliveryZone::ordered()->get()->map(fn (DeliveryZone $zone) => [
                'id' => $zone->id,
                'name' => $zone->name,
                'charge' => $zone->charge,
                'is_active' => $zone->is_active,
                'sort' => $zone->sort,
            ]),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);

        DeliveryZone::create($data);

        return back()->with('ok', 'Delivery zone added');
    }

    public function update(Request $request, DeliveryZone $zone)
    {
        $data = $this->validated($request, $zone);

        $zone->update($data);

        return back()->with('ok', 'Delivery zone updated');
    }

    public function destroy(DeliveryZone $zone)
    {
        $zone->delete();

        return back()->with('ok', 'Delivery zone deleted');
    }

    private function validated(Request $request, ?DeliveryZone $zone = null): array
    {
        $request->merge(['is_active' => $request->boolean('is_active')]);

        $data = $request->validate([
            'name' => ['required', 'max:80', 'unique:delivery_zones,name' . ($zone ? ',' . $zone->id : '')],
            'charge' => 'required|integer|min:0|max:100000',
            'is_active' => 'required|boolean',
            'sort' => 'nullable|integer|min:0|max:1000',
        ]);

        $data['sort'] = (int) ($data['sort'] ?? 0);

        return $data;
    }
}
