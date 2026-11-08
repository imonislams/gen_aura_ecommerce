<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{{ $data['title'] }}</title>
<style>
  body { font-family: DejaVu Sans, sans-serif; color: #2b2233; font-size: 11px; }
  .brand { color: #8E3FD0; font-size: 20px; font-weight: bold; letter-spacing: 2px; }
  .muted { color: #6b6572; }
  .line { border-top: 1px solid #e5e1ea; margin: 10px 0; }
  h1 { font-size: 18px; margin: 0 0 2px; }
  table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  th { text-align: left; font-size: 9px; text-transform: uppercase; color: #8b8497; border-bottom: 1px solid #e5e1ea; padding: 6px; }
  td { padding: 5px 6px; border-bottom: 1px solid #f2eef6; vertical-align: top; }
  tr:nth-child(even) td { background: #fcfaf8; }
  .footer { margin-top: 14px; font-size: 9px; color: #9b94a6; }
</style>
</head>
<body>
  <table style="margin-top:0">
    <tr>
      <td style="width:60%;border-bottom:0">
        <div class="brand">{{ $settings['name'] }}</div>
        <div class="muted">{{ $settings['top'] }}</div>
      </td>
      <td style="border-bottom:0" class="muted" align="right">
        Generated {{ now(config('shop.timezone', 'Asia/Dhaka'))->format('d M Y, h:i A') }}
      </td>
    </tr>
  </table>

  <div class="line"></div>

  <h1>{{ $data['title'] }}</h1>
  <div class="muted">{{ $range['label'] }} · {{ $range['from'] }} to {{ $range['to'] }}</div>

  <table>
    <thead>
      <tr>
        @foreach($data['headings'] as $heading)
          <th>{{ $heading }}</th>
        @endforeach
      </tr>
    </thead>
    <tbody>
      @forelse($data['rows'] as $row)
        <tr>
          @foreach($row as $cell)
            <td>{{ $cell }}</td>
          @endforeach
        </tr>
      @empty
        <tr>
          <td colspan="{{ count($data['headings']) }}">No data for this range.</td>
        </tr>
      @endforelse
    </tbody>
  </table>

  <div class="footer">
    {{ $settings['name'] }} · WhatsApp +{{ $settings['wa'] }} · Report respects the selected date range.
  </div>
</body>
</html>
