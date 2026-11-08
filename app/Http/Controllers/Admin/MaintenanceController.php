<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;

class MaintenanceController extends Controller
{
    private const SOURCE = 'app/public';

    public function index()
    {
        return Inertia::render('Admin/Settings/Maintenance', [
            'section' => 'maintenance',
            'storage' => $this->storageLinkStatus(),
        ]);
    }

    public function storageLink()
    {
        $status = $this->storageLinkStatus();

        if ($status['state'] === 'unsupported') {
            return back()->withErrors('symlink() is disabled on this server, so the storage link cannot be created here.');
        }

        if ($status['state'] === 'linked') {
            return back()->with('ok', 'Storage is already connected. Nothing was changed.');
        }

        if ($status['state'] === 'conflict') {
            return back()->withErrors(
                'public/storage already exists as a real folder, so it was left untouched. Back up its files, remove the folder, then try again.'
            );
        }

        if (!$status['source_exists']) {
            return back()->withErrors('The source folder storage/app/public is missing, so there is nothing to link.');
        }

        try {
            if ($status['state'] === 'broken') {
                $removed = @unlink($status['destination']) || @rmdir($status['destination']);

                if (!$removed) {
                    return back()->withErrors('The existing broken link could not be removed. Check file permissions.');
                }
            }

            File::link(storage_path(self::SOURCE), public_path('storage'));
        } catch (\Throwable $e) {
            return back()->withErrors('The storage link could not be created: ' . $e->getMessage());
        }

        $after = $this->storageLinkStatus();

        if ($after['state'] !== 'linked') {
            return back()->withErrors('The storage link was created but is not resolving correctly. Check the paths below.');
        }

        return back()->with('ok', 'Storage connected. Uploaded files are now served from /storage.');
    }

    private function storageLinkStatus(): array
    {
        $source = storage_path(self::SOURCE);
        $destination = public_path('storage');

        $sourceExists = is_dir($source);
        $destExists = file_exists($destination);

        $sourceReal = realpath($source);
        $destReal = realpath($destination);
        $pointsToSource = $sourceReal !== false && $destReal !== false && $sourceReal === $destReal;

        $rawTarget = @readlink($destination);
        $readLinkTarget = ($rawTarget === false || $rawTarget === '') ? null : $rawTarget;

        $isLink = is_link($destination) || $readLinkTarget !== null;
        $linkValid = $destExists && $pointsToSource;
        $linkBroken = !$destExists && $readLinkTarget !== null;
        $canSymlink = function_exists('symlink');

        if (!$canSymlink) {
            $state = 'unsupported';
            $message = 'The symlink() function is disabled by the hosting provider. Ask support to run "php artisan storage:link", or upload files directly into public/storage.';
        } elseif ($linkValid) {
            $state = 'linked';
            $message = 'Uploaded images in storage/app/public are served from /storage.';
        } elseif ($linkBroken) {
            $state = 'broken';
            $message = 'public/storage is a link but its target no longer exists. Connecting again is safe.';
        } elseif ($destExists) {
            $state = 'conflict';
            $message = 'public/storage exists but does not point to storage/app/public. It will not be overwritten or deleted.';
        } else {
            $state = 'missing';
            $message = 'Storage is not connected yet. Press Connect storage to serve uploaded images from /storage.';
        }

        return [
            'source' => $source,
            'destination' => $destination,
            'source_exists' => $sourceExists,
            'dest_exists' => $destExists,
            'is_link' => $isLink,
            'link_target' => $readLinkTarget,
            'link_valid' => $linkValid,
            'link_broken' => $linkBroken,
            'is_real_dir' => $destExists && !$pointsToSource && is_dir($destination),
            'can_symlink' => $canSymlink,
            'state' => $state,
            'message' => $message,
        ];
    }
}
