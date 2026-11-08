<?php

namespace App\Services\Analytics;

class UserAgentParser
{
    public function parse(?string $userAgent): array
    {
        $ua = (string) $userAgent;
        $lower = strtolower($ua);

        $isBot = (bool) preg_match('/bot|crawl|spider|slurp|bingpreview|facebookexternalhit|headless|curl|wget|python|monitor|uptime/i', $lower);

        $device = 'desktop';
        if (preg_match('/ipad|tablet|kindle|playbook|silk/i', $lower)) {
            $device = 'tablet';
        } elseif (preg_match('/mobile|iphone|ipod|android|blackberry|windows phone|opera mini/i', $lower)) {
            $device = 'mobile';
        }
        if ($isBot) {
            $device = 'bot';
        }

        $browser = 'Other';
        foreach ([
            'Edg' => 'Edge',
            'OPR' => 'Opera',
            'SamsungBrowser' => 'Samsung Internet',
            'Chrome' => 'Chrome',
            'CriOS' => 'Chrome',
            'Firefox' => 'Firefox',
            'FxiOS' => 'Firefox',
            'Safari' => 'Safari',
        ] as $needle => $name) {
            if (str_contains($ua, $needle)) {
                $browser = $name;
                break;
            }
        }

        $os = 'Other';
        foreach ([
            'Windows NT' => 'Windows',
            'Android' => 'Android',
            'iPhone' => 'iOS',
            'iPad' => 'iOS',
            'Mac OS X' => 'macOS',
            'Linux' => 'Linux',
        ] as $needle => $name) {
            if (str_contains($ua, $needle)) {
                $os = $name;
                break;
            }
        }

        return [
            'device_type' => $device,
            'browser' => $browser,
            'os' => $os,
            'is_bot' => $isBot,
        ];
    }
}
