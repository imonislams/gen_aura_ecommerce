<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function show() { return session('admin_id') ? redirect()->route('admin.dashboard') : Inertia::render('Admin/Login'); }

    public function login(Request $r)
    {
        $a = Admin::where('username', $r->input('username'))->first();
        if (!$a || !Hash::check((string) $r->input('password'), $a->password)) return back()->withErrors('Wrong username or password')->withInput($r->only('username'));
        $r->session()->regenerate();
        session(['admin_id' => $a->id]);

        return redirect()->route('admin.dashboard');
    }

    public function logout(Request $r)
    {
        $r->session()->forget('admin_id');
        $r->session()->regenerate();
        return redirect()->route('admin.login');
    }
}
