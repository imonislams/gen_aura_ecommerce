<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Invoice {{ $order->order_number ?: $order->id }}</title>
@include('exports.partials.invoice-styles')
</head>
<body>
@include('exports.partials.invoice-content')
</body>
</html>
