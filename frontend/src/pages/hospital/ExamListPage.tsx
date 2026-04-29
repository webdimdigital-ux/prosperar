import { useState } from 'react'
import JSZip from 'jszip'
import { useExamList } from '@/hooks/useExamList'
import { DataTable } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { FilterToolbar } from '@/components/shared/FilterToolbar'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ExamActionsMenu } from '@/components/shared/ExamActionsMenu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { formatCPF, formatDate } from '@/lib/utils'
import { ArchiveIcon, LoaderCircleIcon } from 'lucide-react'

const ALL = '__all__'

type ExamRow = {
  id: string
  name: string
  cpf: string
  exam_date: string
  status: string
  technician?: string
  sex?: string
  birth_date?: string
  client: { name: string } | null
  hospital: { name: string }
}

export function HospitalExamListPage() {
  const { data, paginatorInfo, loading, search, setSearch, page, setPage, perPage, setPerPage,
    sortColumn, sortOrder, handleSort, filter, setFilter } = useExamList()

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkDownloading, setBulkDownloading] = useState(false)

  const handleBulkDownload = async () => {
    if (selectedIds.size === 0) return
    setBulkDownloading(true)
    const toastId = toast.loading(`Preparando ZIP com ${selectedIds.size} exame${selectedIds.size > 1 ? 's' : ''}...`)
    const token = localStorage.getItem('token')
    const apiUrl = import.meta.env.VITE_API_URL ?? ''
    const zip = new JSZip()
    let failed = 0

    for (const id of selectedIds) {
      try {
        const response = await fetch(`${apiUrl}/api/exams/${id}/download`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) { failed++; continue }
        const blob = await response.blob()
        const exam = (data as ExamRow[]).find(r => r.id === id)
        const filename = exam ? `${exam.name}.pdf` : `exame-${id}.pdf`
        zip.file(filename, blob)
      } catch {
        failed++
      }
    }

    const ok = selectedIds.size - failed
    if (ok === 0) {
      toast.dismiss(toastId)
      toast.error('Não foi possível baixar nenhum PDF. Tente novamente.')
      setBulkDownloading(false)
      return
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(zipBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `exames-${new Date().toISOString().slice(0, 10)}.zip`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)

    toast.dismiss(toastId)
    if (failed === 0)
      toast.success(`ZIP gerado com ${ok} exame${ok > 1 ? 's' : ''} com sucesso!`)
    else
      toast.warning(`ZIP gerado com ${ok} exame${ok > 1 ? 's' : ''}. ${failed} não pôde${failed > 1 ? 'ram' : ''} ser incluído${failed > 1 ? 's' : ''}.`)

    setBulkDownloading(false)
  }

  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'client_name', label: 'Nome', render: (r: ExamRow) => r.name ?? '—' },
    { key: 'cpf', label: 'CPF', render: (r: ExamRow) => formatCPF(r.cpf) },
    { key: 'exam_date', label: 'Data', sortable: true, render: (r: ExamRow) => formatDate(r.exam_date) },
    { key: 'birth_date', label: 'Dt. Nasc.', render: (r: ExamRow) => formatDate(r.birth_date) },
    { key: 'sex', label: 'Sexo', render: (r: ExamRow) => r.sex ?? '—' },
    { key: 'technician', label: 'Técnico', render: (r: ExamRow) => r.technician ?? '—' },
    { key: 'status', label: 'Status', sortable: true, render: (r: ExamRow) => <StatusBadge status={r.status} /> },
    {
      key: 'actions', label: 'Ações', compact: true,
      render: (r: ExamRow) => (
        <ExamActionsMenu
          examId={r.id}
          examName={r.name}
          clientName={r.client?.name ?? ''}
          examDate={formatDate(r.exam_date)}
        />
      ),
    },
  ]

  return (
    <div className="space-y-4">

      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-[16px] shadow-[0_2px_8px_rgba(46,58,89,0.06)] border border-[#E8ECF4]">
          <span className="text-sm font-semibold text-[#2E3A59]">
            {selectedIds.size} selecionado{selectedIds.size > 1 ? 's' : ''}
          </span>
          <div className="flex-1" />
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkDownload}
            disabled={bulkDownloading}
            className="gap-1.5"
          >
            {bulkDownloading
              ? <LoaderCircleIcon className="size-4 animate-spin" />
              : <ArchiveIcon className="size-4" />}
            {bulkDownloading ? 'Gerando ZIP...' : 'Baixar exames'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedIds(new Set())}
            disabled={bulkDownloading}
          >
            Cancelar
          </Button>
        </div>
      )}

      <DataTable
        columns={columns as never}
        data={data}
        loading={loading}
        sortColumn={sortColumn}
        sortOrder={sortOrder}
        onSort={handleSort}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        toolbar={
          <FilterToolbar
            search={search}
            onSearch={setSearch}
            placeholder="Buscar paciente ou exame..."
            filterCount={[filter.status, filter.date_from, filter.date_to].filter(Boolean).length}
          >
            <Select value={filter.status || ALL} onValueChange={v => setFilter(v === ALL ? {} : { status: v })}>
              <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Todos os status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos os status</SelectItem>
                <SelectItem value="available">Disponível</SelectItem>
                <SelectItem value="delivered">Entregue</SelectItem>
              </SelectContent>
            </Select>
            <DatePicker value={filter.date_from ?? ''} onChange={v => setFilter({ ...filter, date_from: v })} placeholder="Data início" className="w-full sm:w-40" />
            <DatePicker value={filter.date_to ?? ''} onChange={v => setFilter({ ...filter, date_to: v })} placeholder="Data fim" className="w-full sm:w-40" />
          </FilterToolbar>
        }
        pagination={
          <Pagination currentPage={page} lastPage={paginatorInfo?.lastPage ?? 1}
            perPage={perPage} total={paginatorInfo?.total ?? 0}
            onPageChange={setPage} onPerPageChange={setPerPage} />
        }
      />
    </div>
  )
}
