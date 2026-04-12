<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Exam extends Model
{
    protected $fillable = [
        'client_id', 'hospital_id', 'uploaded_by',
        'cpf', 'patient_id', 'name', 'exam_date', 'file_path',
        'observations', 'status',
        'technician', 'sex', 'birth_date', 'height', 'weight', 'age', 'smoking', 'diagnosis', 'medico', 'crm',
    ];

    protected $casts = [
        'exam_date'  => 'date',
        'birth_date' => 'date',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function hospital(): BelongsTo
    {
        return $this->belongsTo(Hospital::class);
    }

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
