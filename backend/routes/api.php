<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

Route::middleware('auth:sanctum')->get('/exams/{id}/download', function ($id) {
    $user = request()->user();
    $exam = \App\Models\Exam::findOrFail($id);

    $allowed = match ($user->role) {
        'admin'    => true,
        'client'   => ( preg_replace('/\D/', '', $exam->cpf) === preg_replace('/\D/', '', $user->cpf) ),
        'hospital' => $exam->hospital_id === $user->hospital_id,
        default    => false,
    };

    abort_unless($allowed, 403, 'Unauthorized.');
    abort_unless(Storage::disk('local')->exists($exam->file_path), 404, 'File not found.');

    if ($user->role === 'client' && $exam->status === 'available') {
        $exam->update(['status' => 'delivered']);
    }

    return Storage::disk('local')->download($exam->file_path, basename($exam->file_path));
});
