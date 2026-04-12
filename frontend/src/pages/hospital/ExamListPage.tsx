import { useExamList } from '@/hooks/useExamList'
import { DataTable } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { FilterToolbar } from '@/components/shared/FilterToolbar'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ExamActionsMenu } from '@/components/shared/ExamActionsMenu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { formatCPF, formatDate} from '@/lib/utils'

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
      <DataTable
        columns={columns as never}
        data={data}
        loading={loading}
        sortColumn={sortColumn}
        sortOrder={sortOrder}
        onSort={handleSort}
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
