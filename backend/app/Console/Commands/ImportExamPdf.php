<?php

namespace App\Console\Commands;

use App\Services\PdfExamService;
use Illuminate\Console\Command;
use Illuminate\Http\UploadedFile;

class ImportExamPdf extends Command
{
    protected $signature = 'exam:import-pdf
                            {path : Absolute path to the PDF file}
                            {--hospital=1 : Hospital ID}
                            {--uploaded-by=1 : User ID of uploader}
                            {--date= : Exam date YYYY-MM-DD (defaults to today)}
                            {--observations= : Optional observations}';

    protected $description = 'Import exams from a multi-page PDF file into the database';

    public function handle(PdfExamService $service): int
    {
        $path = $this->argument('path');

        if (! file_exists($path)) {
            $this->error("File not found: {$path}");
            return self::FAILURE;
        }

        $hospitalId  = (int) $this->option('hospital');
        $uploadedBy  = (int) $this->option('uploaded-by');
        $examDate    = $this->option('date') ?: now()->format('Y-m-d');
        $observations = $this->option('observations');

        $this->info("Processing: {$path}");
        $this->info("Hospital ID: {$hospitalId} | Uploaded by: {$uploadedBy} | Date: {$examDate}");

        $file = new UploadedFile($path, basename($path), 'application/pdf', null, true);

        $result = $service->process($file, $hospitalId, $examDate, $observations, $uploadedBy);

        $this->info("Total pages  : {$result['total']}");
        $this->info("Processed    : {$result['processed']}");
        $this->info("Failed       : {$result['failed']}");

        if (! empty($result['errors'])) {
            $this->warn('Errors:');
            foreach ($result['errors'] as $err) {
                $this->warn("  Page {$err['page']}: {$err['reason']}");
            }
        }

        return self::SUCCESS;
    }
}
