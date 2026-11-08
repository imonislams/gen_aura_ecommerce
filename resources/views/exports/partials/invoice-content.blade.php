  <table>
    <tr>
      <td style="width:60%">
        <div class="brand">{{ $settings['name'] }}</div>
        <div class="muted">{{ $settings['top'] }}</div>
      </td>
      <td class="right">
        <div style="font-size:18px;font-weight:bold">INVOICE</div>
        <div class="muted">{{ $order->order_number ?: '#' . $order->id }}</div>
        <div class="muted">{{ $order->created_at?->copy()->setTimezone(config('shop.timezone', 'Asia/Dhaka'))->format('d M Y, h:i A') }}</div>
      </td>
    </tr>
  </table>

  <div class="line"></div>

  <table>
    <tr>
      <td style="width:55%">
        <div class="muted" style="font-size:10px;text-transform:uppercase">Customer details</div>
        <b>{{ $order->name }}</b><br>
        <span class="muted">Phone:</span> {{ $order->phone }}<br>
        <span class="muted">Address:</span> {{ $order->address }}<br>
        @if($order->delivery_area)<span class="muted">Delivery area:</span> {{ $order->delivery_area }}<br>@endif
        @if($order->note)<span class="muted">Note:</span> {{ $order->note }}<br>@endif
      </td>
      <td>
        <div class="muted" style="font-size:10px;text-transform:uppercase">Order details</div>
        <span class="muted">Order:</span> <b>{{ $order->order_number ?: '#' . $order->id }}</b><br>
        <span class="muted">Date:</span> {{ $order->created_at?->copy()->setTimezone(config('shop.timezone', 'Asia/Dhaka'))->format('d M Y, h:i A') }}<br>
        <span class="muted">Payment:</span> {{ $order->payment_method === 'COD' ? 'Cash on Delivery' : $order->payment_method }}
      </td>
    </tr>
  </table>

  <div class="line"></div>

  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th>Size</th>
        <th>Qty</th>
        <th class="right">Price</th>
        <th class="right">Line total</th>
      </tr>
    </thead>
    <tbody>
      @foreach($order->items as $item)
      <tr>
        <td>{{ $item->name }}</td>
        <td>{{ $item->size ?: '—' }}</td>
        <td>{{ $item->qty }}</td>
        <td class="right">BDT {{ number_format($item->price) }}</td>
        <td class="right">BDT {{ number_format($item->price * $item->qty) }}</td>
      </tr>
      @endforeach
    </tbody>
  </table>

  <table style="width:45%;margin-left:auto;margin-top:12px">
    <tr><td>Subtotal</td><td class="right">BDT {{ number_format($order->subtotal) }}</td></tr>
    <tr><td>Delivery</td><td class="right">BDT {{ number_format($order->ship) }}</td></tr>
    <tr><td class="total">Total</td><td class="total right">BDT {{ number_format($order->total) }}</td></tr>
  </table>

  <div class="line"></div>
  <div class="box muted">Thank you for shopping with {{ $settings['name'] }}. Questions? WhatsApp +{{ $settings['wa'] }}.</div>
