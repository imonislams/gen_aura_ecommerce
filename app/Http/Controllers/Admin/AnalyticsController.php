<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Services\Analytics\MetricsService;
use App\Services\Analytics\ReportService;
use App\Support\Analytics\DateRange;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnalyticsController extends Controller
{
    public function __construct(private MetricsService $metrics, private ReportService $reports)
    {
    }

    public function overview(Request $request)
    {
        return Inertia::render('Admin/Analytics/Overview', $this->metrics->overview(DateRange::fromRequest($request)));
    }

    public function live()
    {
        return Inertia::render('Admin/Analytics/Live', ['initial' => $this->metrics->live()]);
    }

    public function liveData()
    {
        return response()->json($this->metrics->live());
    }

    public function visitors(Request $request)
    {
        $range = DateRange::fromRequest($request);
        $filters = $request->only(['q', 'type', 'device', 'has']);

        $visitors = $this->metrics->visitors($range, $filters)->through(fn ($visitor) => [
            'uuid' => $visitor->uuid,
            'short' => substr($visitor->uuid, 0, 8),
            'type' => $visitor->first_seen_at >= $range->startUtc() ? 'new' : 'returning',
            'first_seen_at' => $visitor->first_seen_at?->toIso8601String(),
            'last_seen_at' => $visitor->last_seen_at?->toIso8601String(),
            'total_sessions' => $visitor->total_sessions,
            'total_page_views' => $visitor->total_page_views,
            'device_type' => $visitor->device_type,
            'browser' => $visitor->browser,
            'os' => $visitor->os,
            'last_path' => $visitor->last_path,
            'has_ordered' => $visitor->has_ordered,
        ]);

        return Inertia::render('Admin/Analytics/Visitors/Index', [
            'visitors' => $visitors,
            'range' => $range->toArray(),
            'filters' => $filters,
        ]);
    }

    public function visitor(string $uuid)
    {
        return Inertia::render('Admin/Analytics/Visitors/Show', $this->metrics->visitorDetail($uuid));
    }

    public function activity(Request $request)
    {
        $range = DateRange::fromRequest($request);
        $filters = $request->only(['event_type']);
        $data = $this->metrics->activity($range, $filters);

        $data['events'] = $data['events']->through(fn ($event) => [
            'id' => $event->id,
            'event_type' => $event->event_type,
            'page_type' => $event->page_type,
            'path' => $event->path,
            'product_id' => $event->product_id,
            'occurred_at' => $event->occurred_at?->toIso8601String(),
            'short' => substr($event->visitor?->uuid ?? '', 0, 8),
            'uuid' => $event->visitor?->uuid,
            'device' => $event->visitor?->device_type,
        ]);
        $data['filters'] = $filters;

        return Inertia::render('Admin/Analytics/Activity', $data);
    }

    public function products(Request $request)
    {
        $range = DateRange::fromRequest($request);

        return Inertia::render('Admin/Analytics/Products', [
            'products' => $this->metrics->products($range),
            'range' => $range->toArray(),
        ]);
    }

    public function product(Request $request, int $product)
    {
        $range = DateRange::fromRequest($request);

        return Inertia::render('Admin/Analytics/ProductShow', $this->metrics->productDetail($product, $range));
    }

    public function cart(Request $request)
    {
        return Inertia::render('Admin/Analytics/Cart', $this->metrics->cart(DateRange::fromRequest($request)));
    }

    public function checkout(Request $request)
    {
        return Inertia::render('Admin/Analytics/Checkout', $this->metrics->checkout(DateRange::fromRequest($request)));
    }

    public function funnel(Request $request)
    {
        return Inertia::render('Admin/Analytics/Funnel', $this->metrics->funnel(DateRange::fromRequest($request)));
    }

    public function reports(Request $request)
    {
        return Inertia::render('Admin/Analytics/Reports', [
            'groups' => $this->reports->groups(),
            'range' => DateRange::fromRequest($request)->toArray(),
        ]);
    }

    public function exportReport(Request $request, string $report, string $format)
    {
        if (!in_array($format, ['pdf', 'xlsx'], true)) {
            abort(404);
        }

        $range = DateRange::fromRequest($request);
        $data = $this->reports->build($report, $range);
        $filename = 'gen-aura-' . $report . '-' . $range->from->format('Ymd') . '-' . $range->to->format('Ymd') . '.' . $format;

        if ($format === 'xlsx') {
            return response()->streamDownload(function () use ($data) {
                $writer = new \OpenSpout\Writer\XLSX\Writer();
                $writer->openToFile('php://output');
                $writer->addRow(\OpenSpout\Common\Entity\Row::fromValues($data['headings']));

                foreach ($data['rows'] as $row) {
                    $writer->addRow(\OpenSpout\Common\Entity\Row::fromValues(array_map(
                        fn ($value) => $value === null ? '' : (is_scalar($value) ? $value : (string) $value),
                        $row
                    )));
                }

                $writer->close();
            }, $filename, ['Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']);
        }

        $pdf = Pdf::loadView('exports.analytics-report', [
            'data' => $data,
            'range' => $range->toArray(),
            'settings' => Setting::all_(),
        ]);

        return $pdf->download($filename);
    }
}
