<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('exams', function (Blueprint $table) {
            $table->string('technician')->nullable()->after('observations');
            $table->string('sex')->nullable()->after('technician');
            $table->date('birth_date')->nullable()->after('sex');
            $table->string('height')->nullable()->after('birth_date');
            $table->string('weight')->nullable()->after('height');
            $table->string('age')->nullable()->after('weight');
            $table->string('smoking')->nullable()->after('age');
            $table->text('diagnosis')->nullable()->after('smoking');
        });
    }

    public function down(): void
    {
        Schema::table('exams', function (Blueprint $table) {
            $table->dropColumn(['technician', 'sex', 'birth_date', 'height', 'weight', 'age', 'smoking', 'diagnosis']);
        });
    }
};
