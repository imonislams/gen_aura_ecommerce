<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Showroom;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShowroomController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Settings/Showrooms', [
            'section' => 'showrooms',
            'showrooms' => Showroom::ordered()->get()->map(fn (Showroom $showroom) => [
                'id' => $showroom->id,
                'name' => $showroom->name,
                'address' => $showroom->address,
                'phone' => $showroom->phone,
                'is_active' => $showroom->is_active,
                'sort' => $showroom->sort,
            ]),
        ]);
    }

    public function store(Request $request)
    {
        Showroom::create($this->validated($request));

        return back()->with('ok', 'Showroom added');
    }

    public function update(Request $request, Showroom $showroom)
    {
        $showroom->update($this->validated($request, $showroom));

        return back()->with('ok', 'Showroom updated');
    }

    public function destroy(Showroom $showroom)
    {
        $showroom->delete();

        return back()->with('ok', 'Showroom deleted');
    }

    private function validated(Request $request, ?Showroom $showroom = null): array
    {
        $request->merge(['is_active' => $request->boolean('is_active')]);

        $data = $request->validate([
            'name' => ['required', 'max:80', 'unique:showrooms,name' . ($showroom ? ',' . $showroom->id : '')],
            'address' => 'required|max:255',
            'phone' => 'nullable|max:30',
            'is_active' => 'required|boolean',
            'sort' => 'nullable|integer|min:0|max:1000',
        ]);

        $data['sort'] = (int) ($data['sort'] ?? 0);

        return $data;
    }
}
