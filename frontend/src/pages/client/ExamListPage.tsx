import { useExamList } from '@/hooks/useExamList'
import { Pagination } from '@/components/shared/Pagination'
import { SearchBar } from '@/components/shared/SearchBar'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { Button } from '@/components/ui/button'
import { EyeIcon, DownloadIcon, LoaderCircleIcon, FileTextIcon, CalendarIcon, BuildingIcon, UserIcon } from 'lucide-react'
import { useDownload } from '@/hooks/useDownload'
import { usePdfPreview } from '@/hooks/usePdfPreview'
import { PdfViewerDialog } from '@/components/shared/PdfViewerDialog'
import { useState } from 'react'
import { formatDate } from '@/lib/utils'

const ALL = '__all__'

type ExamRow = {
  id: string
  name: string
  cpf: string
  exam_date: string
  status: string
  technician?: string
  sex?: string
  client: { name: string } | null
  hospital: { name: string }
}

const CARD = 'bg-white rounded-[20px] shadow-[0_4px_24px_rgba(46,58,89,0.08)]'

export function ClientExamListPage() {
  const {
    data, paginatorInfo, loading, search, setSearch,
    page, setPage, perPage, setPerPage, filter, setFilter,
  } = useExamList()

  const [viewerOpen, setViewerOpen]     = useState(false)
  const [selectedExam, setSelectedExam] = useState<ExamRow | null>(null)
  const { download, downloading }       = useDownload()
  const { preview, clear, blobUrl, loading: previewing } = usePdfPreview()

  const handleView = (exam: ExamRow) => {
    setSelectedExam(exam)
    setViewerOpen(true)
    preview(exam.id)
  }

  const handleViewerClose = () => {
    setViewerOpen(false)
    setSelectedExam(null)
    clear()
  }

  return (
    <div className="flex flex-col gap-4">

      {/* ── Toolbar card ── */}
      <div className={`${CARD} p-7`}>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-48">
            <SearchBar value={search} onChange={setSearch} placeholder="Buscar por nome ou unidade..." />
          </div>
          <Select value={filter.status || ALL} onValueChange={v => setFilter(v === ALL ? {} : { status: v })}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Todos os status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos os status</SelectItem>
              <SelectItem value="available">Disponível</SelectItem>
              <SelectItem value="delivered">Entregue</SelectItem>
            </SelectContent>
          </Select>
          <DatePicker value={filter.date_from ?? ''} onChange={v => setFilter({ ...filter, date_from: v })} placeholder="De" className="w-36" />
          <DatePicker value={filter.date_to ?? ''} onChange={v => setFilter({ ...filter, date_to: v })} placeholder="Até" className="w-36" />
        </div>
      </div>

      {/* ── Exam cards ── */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`${CARD} p-5`}>
              <div className="flex gap-4 items-center">
                <div className="animate-pulse size-12 rounded-full bg-[#F0F3F8] shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="animate-pulse h-3.5 bg-[#F0F3F8] rounded-lg w-[55%]" />
                  <div className="animate-pulse h-3 bg-[#F0F3F8] rounded-lg w-[35%]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className={`${CARD} py-12 px-6 text-center text-sm text-[#9BA8C2]`}>
          Nenhum exame encontrado.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {(data as ExamRow[]).map(exam => (
            <div key={exam.id} className={`${CARD} p-7`}>
              <div className="flex gap-5 items-start">

                {/* Icon circle */}
                <div className="size-14 rounded-full bg-linear-to-br from-[#34C38F] to-[#26A69A] flex items-center justify-center shrink-0">
                  <FileTextIcon className="size-6.5 text-white" strokeWidth={1.5} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">

                  {/* Title row */}
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <div>
                      <p className="font-semibold text-base text-[#2E3A59] leading-snug">
                        {exam.name}
                      </p>
                      <p className="text-xs text-[#9BA8C2] mt-1">
                        Exame #{exam.id}
                      </p>
                    </div>
                    <StatusBadge status={exam.status} />
                  </div>

                  {/* Meta chips */}
                  <div className="flex flex-wrap gap-x-6 gap-y-2 mb-5">
                    <span className="flex items-center gap-1.25 text-[13px] text-[#7C8DB5]">
                      <CalendarIcon className="size-3.5" strokeWidth={1.5} />
                      {formatDate(exam.exam_date)}
                    </span>
                    <span className="flex items-center gap-1.25 text-[13px] text-[#7C8DB5]">
                      <BuildingIcon className="size-3.5" strokeWidth={1.5} />
                      {exam.hospital?.name ?? '—'}
                    </span>
                    {exam.technician && (
                      <span className="flex items-center gap-1.25 text-[13px] text-[#7C8DB5]">
                        <UserIcon className="size-3.5" strokeWidth={1.5} />
                        {exam.technician}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-4 border-t border-[#F0F3F8]">
                    <Button variant="outline" size="sm" onClick={() => handleView(exam)}>
                      <EyeIcon className="size-4" />
                      Visualizar
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => download(exam.id, `${exam.name}.pdf`)}
                      disabled={downloading === exam.id}
                    >
                      {downloading === exam.id
                        ? <LoaderCircleIcon className="size-4 animate-spin" />
                        : <DownloadIcon className="size-4" />}
                      Baixar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {paginatorInfo && paginatorInfo.total > 0 && (
        <div className={`${CARD} px-4 py-1`}>
          <Pagination
            currentPage={page}
            lastPage={paginatorInfo.lastPage ?? 1}
            perPage={perPage}
            total={paginatorInfo.total ?? 0}
            onPageChange={setPage}
            onPerPageChange={setPerPage}
          />
        </div>
      )}

      {selectedExam && (
        <PdfViewerDialog
          open={viewerOpen}
          onClose={handleViewerClose}
          examId={selectedExam.id}
          examName={selectedExam.name}
          clientName={selectedExam.client?.name ?? ''}
          examDate={formatDate(selectedExam.exam_date)}
          blobUrl={blobUrl}
          loading={previewing}
        />
      )}
    </div>
  )
}
