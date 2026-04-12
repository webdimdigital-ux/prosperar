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

const CARD: React.CSSProperties = {
  background: 'white',
  borderRadius: 20,
  boxShadow: '0 4px 24px rgba(46,58,89,0.08)',
  padding: '28px 28px',
}

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Toolbar card ── */}
      <div style={CARD}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ ...CARD, padding: '20px 24px' }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div className="animate-pulse" style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#F0F3F8', flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="animate-pulse" style={{ height: 14, backgroundColor: '#F0F3F8', borderRadius: 8, width: '55%' }} />
                  <div className="animate-pulse" style={{ height: 12, backgroundColor: '#F0F3F8', borderRadius: 8, width: '35%' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <div style={{ ...CARD, padding: '48px 24px', textAlign: 'center', color: '#9BA8C2', fontSize: 14 }}>
          Nenhum exame encontrado.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(data as ExamRow[]).map(exam => (
            <div key={exam.id} style={CARD}>
              <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

                {/* Icon circle */}
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #34C38F 0%, #26A69A 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <FileTextIcon style={{ width: 26, height: 26, color: 'white' }} strokeWidth={1.5} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>

                  {/* Title row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 16, color: '#2E3A59', fontFamily: 'Poppins, sans-serif', lineHeight: 1.4 }}>
                        {exam.name}
                      </p>
                      <p style={{ fontSize: 12, color: '#9BA8C2', marginTop: 4 }}>
                        Exame #{exam.id}
                      </p>
                    </div>
                    <StatusBadge status={exam.status} />
                  </div>

                  {/* Meta chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 24px', marginBottom: 20 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#7C8DB5' }}>
                      <CalendarIcon style={{ width: 14, height: 14 }} strokeWidth={1.5} />
                      {formatDate(exam.exam_date)}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#7C8DB5' }}>
                      <BuildingIcon style={{ width: 14, height: 14 }} strokeWidth={1.5} />
                      {exam.hospital?.name ?? '—'}
                    </span>
                    {exam.technician && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#7C8DB5' }}>
                        <UserIcon style={{ width: 14, height: 14 }} strokeWidth={1.5} />
                        {exam.technician}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 16, borderTop: '1px solid #F0F3F8' }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(exam)}
                      style={{ borderRadius: 10, fontSize: 13 }}
                    >
                      <EyeIcon className="size-4" />
                      Visualizar
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => download(exam.id, `${exam.name}.pdf`)}
                      disabled={downloading === exam.id}
                      style={{
                        borderRadius: 10,
                        fontSize: 13,
                        background: 'linear-gradient(135deg, #34C38F 0%, #26A69A 100%)',
                        border: 'none',
                        color: 'white',
                      }}
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
        <div style={{ ...CARD, padding: '4px 16px' }}>
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
