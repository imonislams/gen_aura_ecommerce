<?php
namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Product;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        Admin::firstOrCreate(
            ['username' => env('ADMIN_EMAIL', 'admin@example.com')],
            [
                'name' => env('ADMIN_NAME', 'System Administrator'),
                'password' => env('ADMIN_PASSWORD', 'password'),
                'must_change_password' => false,
            ]
        );
        if (Product::count() === 0) {
            foreach ([
                ['Classic Cotton T-Shirt', 'T-Shirt', 'Everyday Comfort', 'M,L,XL', '100% Cotton,Breathable,Soft feel,Regular fit', 'Soft, breathable cotton tee for everyday wear.', 650, 850],
                ['Oxford Formal Shirt', 'Shirt', 'Office Ready', 'M,L,XL,XXL', 'Premium fabric,Wrinkle resistant,Slim fit,Easy care', 'Crisp, comfortable shirt for office and occasions.', 1250, 1550],
                ['Slim Fit Chino Pant', 'Pant', 'Stretch Fit', '30,32,34,36', 'Stretch fabric,All-day comfort,Slim fit,Easy care', 'Stretch-fit chino with a clean, modern look.', 1450, 1800],
                ['Embroidered Panjabi', 'Panjabi', 'Festive Edition', 'M,L,XL,XXL', 'Fine embroidery,Soft fabric,Regular fit,Premium finish', 'Elegant panjabi with fine embroidery for Eid and festivities.', 1990, 2500],
            ] as [$n, $c, $s, $z, $f, $d, $p, $o]) {
                Product::create(['name' => $n, 'cat' => $c, 'sub' => $s, 'sizes' => $z, 'feat' => $f, 'description' => $d, 'price' => $p, 'old_price' => $o, 'stock' => 20]);
            }
        }
    }
}
