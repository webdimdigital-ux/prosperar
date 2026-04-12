<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('hospital_id')->constrained('hospitals');
            $table->foreignId('uploaded_by')->constrained('users');
            $table->string('cpf');
            $table->string('name');
            $table->date('exam_date');
            $table->string('file_path');
            $table->text('observations')->nullable();
            $table->enum('status', ['pending', 'available', 'delivered', 'error'])->default('pending');
            $table->timestamps();

            $table->index('cpf');
            $table->index('hospital_id');
            $table->index('client_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exams');
    }
};
