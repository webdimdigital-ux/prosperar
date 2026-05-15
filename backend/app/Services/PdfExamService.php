<?php

namespace App\Services;

use App\Models\Exam;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Smalot\PdfParser\Parser;
use setasign\Fpdi\Fpdi;

class PdfExamService
{
    // Format A: espirômetro Koko/ASF — altura e peso na mesma linha
    private const PATTERNS_A = [
        'id'         => '#ID:\s*(\S+)#i',
        'cpf'        => '#(\d{3}[.]\d{3}[.]\d{3}[-./]\d{2})#',
        'medico'     => '#(Dr\.\s+[^\n]+)#iu',
        'crm'        => '#(CRM-\w+\s*:\s*\d+)#iu',
        'nome'       => '#^(.+)\n\d{2}/\d{2}/\d{4}\n#mu',
        'data_nasc'  => '#^(\d{2}/\d{2}/\d{4})\n[\d,]+ [\d,]+#mu',
        'sexo'       => '#^(Female|Male|Feminino|Masculino)(?:Pereira|Polgar|Crapo)#imu',
        'diagnostico'=> '#^([^\n]+)\n[\p{L}]+\d{2}/\d{2}/\d{2}[^\n]*\n\d+\nNome:#mu',
        'tecnico'    => '#([\p{L}][\p{L} ]*)(?=\d{2}/\d{2}/\d{2})#u',
        'idade'      => '#^(\d+)\nNome:#mu',
        'altura_cm'  => '#^([\d,]+) [\d,]+\n(?:Female|Male|Feminino|Masculino)#mu',
        'peso_kg'    => '#^[\d,]+ ([\d,]+)\n(?:Female|Male|Feminino|Masculino)#mu',
        'tabagismo'  => '#Tabagismo\s*\(M/A\):\s*(\d+)#iu',
    ];

    // Format B: SPDM/Vila Prudente — cada valor em linha separada (altura, peso, tabagismo)
    private const PATTERNS_B = [
        'id'         => '#ID:\s*(\S+)#i',
        'cpf'        => '#(\d{3}[.]\d{3}[.]\d{3}[-./]\d{2})#',
        'medico'     => '#(Dr\.\s+[^\n]+)#iu',
        'crm'        => '#(CRM-\w+\s*:\s*\d+)#iu',
        'nome'       => '#^(.+)\n\d{2}/\d{2}/\d{4}\n#mu',
        'data_nasc'  => '#^(\d{2}/\d{2}/\d{4})\n[\d,]+\n[\d,]+#mu',
        'sexo'       => '#^(Female|Male|Feminino|Masculino)\n(?:Pereira|Polgar|Crapo)#imu',
        'diagnostico'=> '#^([^\n]+)\n[\p{L}][\p{L} ]+\n\d{2}/\d{2}/\d{2}(?!\d)[^\n]*\n\d+\nNome:#mu',
        'tecnico'    => '#^([\p{L}][\p{L} ]+)\n\d{2}/\d{2}/\d{2}(?!\d)#mu',
        'idade'      => '#^(\d+)\nNome:#mu',
        'altura_cm'  => '#^([\d,]+)\n[\d,]+\n\d+\n(?:Female|Male|Feminino|Masculino)#mu',
        'peso_kg'    => '#^[\d,]+\n([\d,]+)\n\d+\n(?:Female|Male|Feminino|Masculino)#mu',
        'tabagismo'  => '#^(\d+)\n(?:Female|Male|Feminino|Masculino)#mu',
    ];

    public function process(UploadedFile $file, int $hospitalId, string $examDate, ?string $observations, int $uploadedBy): array
    {
        $parser = new Parser();
        $pdf = $parser->parseFile($file->getRealPath());
        $pages = $pdf->getPages();
        $total = count($pages);

        $processed = 0;
        $failed = 0;
        $errors = [];
        $exams = [];

        foreach ($pages as $index => $page) {
            $pageNum = $index + 1;

            try {
                $text = $page->getText();
                $fields = $this->extractAll($text);

                $patientId = $fields['id'];
                $cpf = $fields['cpf'];
                $splitPath = $this->extractPage($file->getRealPath(), $pageNum, $hospitalId, $patientId ?? 'unknown');

                $clientId = null;
                if ($cpf) {
                    $user = User::where('cpf', $cpf)->first();
                    $clientId = $user?->id;
                }

                $birthDate = $this->normalizeDate($fields['data_nasc']);

                $exam = Exam::create([
                    'client_id'   => $clientId,
                    'hospital_id' => $hospitalId,
                    'uploaded_by' => $uploadedBy,
                    'cpf'         => $cpf ?? '',
                    'patient_id'  => $patientId,
                    'name'        => $fields['nome'] ?? ($cpf ? "Paciente {$cpf}" : "Página {$pageNum}"),
                    'exam_date'   => $examDate,
                    'file_path'   => $splitPath,
                    'observations'=> $observations,
                    'status'      => 'available',
                    'technician'  => $fields['tecnico'],
                    'sex'         => $this->normalizeSexo($fields['sexo']),
                    'birth_date'  => $birthDate,
                    'height'      => $fields['altura_cm'],
                    'weight'      => $fields['peso_kg'],
                    'age'         => $fields['idade'],
                    'smoking'     => $fields['tabagismo'],
                    'diagnosis'   => $fields['diagnostico'],
                    'medico'      => $fields['medico'],
                    'crm'         => $fields['crm'],
                ]);

                $exams[] = $exam;
                $processed++;

                if (! $cpf) {
                    $errors[] = ['page' => $pageNum, 'reason' => 'CPF not found in page content'];
                }
            } catch (\Throwable $e) {
                $failed++;
                $errors[] = ['page' => $pageNum, 'reason' => $e->getMessage()];
            }
        }

        return compact('total', 'processed', 'failed', 'errors', 'exams');
    }

    private function detectFormat(string $text): string
    {
        // Format B: birth date is followed by height and weight on separate lines (no space between them on same line)
        if (preg_match('#^\d{2}/\d{2}/\d{4}\n[\d,]+\n[\d,]+#mu', $text)) {
            return 'B';
        }
        return 'A';
    }

    private function extractAll(string $text): array
    {
        $patterns = $this->detectFormat($text) === 'B' ? self::PATTERNS_B : self::PATTERNS_A;
        $result = [];
        foreach ($patterns as $key => $pattern) {
            if (preg_match($pattern, $text, $m)) {
                $result[$key] = trim($m[1]);
            } else {
                $result[$key] = null;
            }
        }
        return $result;
    }

    private function normalizeSexo(?string $value): ?string
    {
        if (! $value) return null;
        return match (strtolower(trim($value))) {
            'female', 'feminino', 'f' => 'Feminino',
            'male', 'masculino', 'm'  => 'Masculino',
            default                   => $value,
        };
    }

    private function normalizeDate(?string $value): ?string
    {
        if (! $value) return null;
        // DD/MM/YYYY → YYYY-MM-DD
        if (preg_match('#(\d{2})/(\d{2})/(\d{4})#', $value, $d)) {
            return "{$d[3]}-{$d[2]}-{$d[1]}";
        }
        return $value;
    }

    private function extractPage(string $sourcePath, int $pageNum, int $hospitalId, string $patientId): string
    {
        $pdf = new Fpdi();
        $pageCount = $pdf->setSourceFile($sourcePath);

        if ($pageNum > $pageCount) {
            throw new \RuntimeException("Page {$pageNum} does not exist.");
        }

        $template = $pdf->importPage($pageNum);
        $size = $pdf->getTemplateSize($template);
        $orientation = ($size['width'] > $size['height']) ? 'L' : 'P';
        $pdf->AddPage($orientation, [$size['width'], $size['height']]);
        $pdf->useTemplate($template);

        $dir = "exams/{$hospitalId}";
        Storage::disk('local')->makeDirectory($dir);

        $filename = "{$dir}/{$patientId}_page{$pageNum}_" . uniqid() . '.pdf';
        Storage::disk('local')->put($filename, $pdf->Output('S'));

        return $filename;
    }
}
