<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Smalot\PdfParser\Parser;

class DebugPdfParse extends Command
{
    protected $signature = 'exam:debug-pdf
                            {path : Absolute path to the PDF file}
                            {--page=1 : Page number to inspect}';

    protected $description = 'Dump raw extracted text and parsed fields for a PDF page (no DB writes)';

    public function handle(): int
    {
        $path = $this->argument('path');
        $pageNum = (int) $this->option('page');

        if (! file_exists($path)) {
            $this->error("File not found: {$path}");
            return self::FAILURE;
        }

        $parser = new Parser();
        $pdf = $parser->parseFile($path);
        $pages = $pdf->getPages();

        if ($pageNum < 1 || $pageNum > count($pages)) {
            $this->error("Page {$pageNum} does not exist (total: " . count($pages) . ')');
            return self::FAILURE;
        }

        $text = $pages[$pageNum - 1]->getText();

        $this->line('<comment>─── RAW TEXT ─────────────────────────────────────</comment>');
        $this->line($text);

        // Detect format
        $format = preg_match('#^\d{2}/\d{2}/\d{4}\n[\d,]+\n[\d,]+#mu', $text) ? 'B' : 'A';
        $this->newLine();
        $this->info("Detected format: {$format}");

        $patternsA = [
            'id'          => '#ID:\s*(\S+)#i',
            'cpf'         => '#(\d{3}[.]\d{3}[.]\d{3}[-./]\d{2})#',
            'medico'      => '#(Dr\.\s+[^\n]+)#iu',
            'crm'         => '#(CRM-\w+\s*:\s*\d+)#iu',
            'nome'        => '#^(.+)\n\d{2}/\d{2}/\d{4}\n#mu',
            'data_nasc'   => '#^(\d{2}/\d{2}/\d{4})\n[\d,]+ [\d,]+#mu',
            'sexo'        => '#^(Female|Male|Feminino|Masculino)(?:Pereira|Polgar|Crapo)#imu',
            'diagnostico' => '#^([^\n]+)\n[\p{L}]+\d{2}/\d{2}/\d{2}[^\n]*\n\d+\nNome:#mu',
            'tecnico'     => '#([\p{L}][\p{L} ]*)(?=\d{2}/\d{2}/\d{2})#u',
            'idade'       => '#^(\d+)\nNome:#mu',
            'altura_cm'   => '#^([\d,]+) [\d,]+\n(?:Female|Male|Feminino|Masculino)#mu',
            'peso_kg'     => '#^[\d,]+ ([\d,]+)\n(?:Female|Male|Feminino|Masculino)#mu',
            'tabagismo'   => '#Tabagismo\s*\(M/A\):\s*(\d+)#iu',
        ];

        $patternsB = [
            'id'          => '#ID:\s*(\S+)#i',
            'cpf'         => '#(\d{3}[.]\d{3}[.]\d{3}[-./]\d{2})#',
            'medico'      => '#(Dr\.\s+[^\n]+)#iu',
            'crm'         => '#(CRM-\w+\s*:\s*\d+)#iu',
            'nome'        => '#^(.+)\n\d{2}/\d{2}/\d{4}\n#mu',
            'data_nasc'   => '#^(\d{2}/\d{2}/\d{4})\n[\d,]+\n[\d,]+#mu',
            'sexo'        => '#^(Female|Male|Feminino|Masculino)\n(?:Pereira|Polgar|Crapo)#imu',
            'diagnostico' => '#^([^\n]+)\n[\p{L}][\p{L} ]+\n\d{2}/\d{2}/\d{2}(?!\d)[^\n]*\n\d+\nNome:#mu',
            'tecnico'     => '#^([\p{L}][\p{L} ]+)\n\d{2}/\d{2}/\d{2}(?!\d)#mu',
            'idade'       => '#^(\d+)\nNome:#mu',
            'altura_cm'   => '#^([\d,]+)\n[\d,]+\n\d+\n(?:Female|Male|Feminino|Masculino)#mu',
            'peso_kg'     => '#^[\d,]+\n([\d,]+)\n\d+\n(?:Female|Male|Feminino|Masculino)#mu',
            'tabagismo'   => '#^(\d+)\n(?:Female|Male|Feminino|Masculino)#mu',
        ];

        $patterns = $format === 'B' ? $patternsB : $patternsA;

        $this->line('<comment>─── EXTRACTED FIELDS ─────────────────────────────</comment>');
        foreach ($patterns as $key => $pattern) {
            $value = preg_match($pattern, $text, $m) ? trim($m[1]) : '<fg=red>NOT FOUND</>';
            $this->line(sprintf('  %-14s %s', $key . ':', $value));
        }

        return self::SUCCESS;
    }
}
