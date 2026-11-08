<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Analytics\ReportService;
use App\Support\Analytics\DateRange;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function __construct(private ReportService $reports)
    {
    }

    public function index(Request $request)
    {
        return Inertia::render('Admin/Reports/Index', [
            'groups' => $this->reports->groups(),
            'group' => (string) $request->input('group', 'all'),
            'range' => DateRange::fromRequest($request)->toArray(),
        ]);
    }

    public function show(Request $request, string $report)
    {
        $range = DateRange::fromRequest($request);

        return Inertia::render('Admin/Reports/Show', [
            'report' => $this->reports->build($report, $range),
            'groups' => $this->reports->groups(),
            'range' => $range->toArray(),
        ]);
    }
}
