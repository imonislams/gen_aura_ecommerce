<?php

namespace App\Support\Analytics;

use Carbon\CarbonImmutable;
use Illuminate\Http\Request;

class DateRange
{
    public CarbonImmutable $from;
    public CarbonImmutable $to;
    public string $preset;

    public function __construct(string $preset = '7', ?string $from = null, ?string $to = null)
    {
        $tz = config('analytics.timezone', 'Asia/Dhaka');
        $this->preset = $preset;
        $today = CarbonImmutable::now($tz)->startOfDay();

        switch ($preset) {
            case 'today':
                $this->from = $today;
                $this->to = $today->endOfDay();
                break;
            case 'yesterday':
                $this->from = $today->subDay();
                $this->to = $this->from->endOfDay();
                break;
            case '30':
                $this->from = $today->subDays(29);
                $this->to = $today->endOfDay();
                break;
            case '90':
                $this->from = $today->subDays(89);
                $this->to = $today->endOfDay();
                break;
            case 'custom':
                $f = $from ? CarbonImmutable::parse($from, $tz)->startOfDay() : $today->subDays(6);
                $t = $to ? CarbonImmutable::parse($to, $tz)->endOfDay() : $today->endOfDay();
                if ($f->gt($t)) {
                    [$f, $t] = [$t->startOfDay(), $f->endOfDay()];
                }
                if ($f->diffInDays($t) > 366) {
                    $f = $t->subDays(366)->startOfDay();
                }
                $this->from = $f;
                $this->to = $t;
                break;
            case '7':
            default:
                $this->preset = '7';
                $this->from = $today->subDays(6);
                $this->to = $today->endOfDay();
                break;
        }
    }

    public static function fromRequest(Request $request): self
    {
        return new self(
            (string) $request->input('range', '7'),
            $request->input('from'),
            $request->input('to')
        );
    }

    public function startUtc(): CarbonImmutable
    {
        return $this->from->setTimezone('UTC');
    }

    public function endUtc(): CarbonImmutable
    {
        return $this->to->setTimezone('UTC');
    }

    public function days(): int
    {
        return (int) $this->from->diffInDays($this->to) + 1;
    }

    public function cacheKey(): string
    {
        return md5($this->from->toDateTimeString() . '|' . $this->to->toDateTimeString());
    }

    public function label(): string
    {
        return match ($this->preset) {
            'today' => 'Today',
            'yesterday' => 'Yesterday',
            '30' => 'Last 30 days',
            '90' => 'Last 90 days',
            'custom' => $this->from->format('d M Y') . ' – ' . $this->to->format('d M Y'),
            default => 'Last 7 days',
        };
    }

    public function toArray(): array
    {
        return [
            'preset' => $this->preset,
            'from' => $this->from->toDateString(),
            'to' => $this->to->toDateString(),
            'label' => $this->label(),
            'days' => $this->days(),
        ];
    }
}
