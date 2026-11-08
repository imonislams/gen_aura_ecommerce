<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title inertia>GEN AURA</title>
@php $favicon = $s['favicon'] ?? ''; @endphp
  <link rel="icon" href="{{ $favicon ? asset('storage/' . $favicon) : '/favicon.svg' }}">
  <link rel="apple-touch-icon" href="{{ $favicon ? asset('storage/' . $favicon) : '/favicon.svg' }}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Hind+Siliguri:wght@400;600&family=Noto+Naskh+Arabic:wght@600&display=swap" rel="stylesheet">
  @viteReactRefresh
  @vite(['resources/css/app.css', 'resources/js/app.jsx'])
  @inertiaHead
</head>
<body class="min-h-screen">
  @inertia
</body>
</html>
