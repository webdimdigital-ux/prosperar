import { useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { GET_CLIENTS } from '@/graphql/queries/clients'
import { DataTable } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { SearchBar } from '@/components/shared/SearchBar'

export function HospitalClientListPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(15)
  const [sortColumn, setSortColumn] = useState('name')
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC')

  const { data, loading } = useQuery<any>(GET_CLIENTS, {
    variables: { search: search || undefined, sort: { column: sortColumn, order: sortOrder }, first: perPage, page },
    fetchPolicy: 'cache-and-network',
  })

  const clients = data?.clients?.data ?? []
  const paginatorInfo = data?.clients?.paginatorInfo

  const handleSort = (col: string) => {
    if (sortColumn === col) setSortOrder(o => o === 'ASC' ? 'DESC' : 'ASC')
    else { setSortColumn(col); setSortOrder('ASC') }
    setPage(1)
  }

  const columns = [
    { key: 'name', label: 'Nome', sortable: true },
    { key: 'cpf', label: 'ID do Paciente' },
    { key: 'phone', label: 'Telefone' },
  ]

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={clients}
        loading={loading}
        sortColumn={sortColumn}
        sortOrder={sortOrder}
        onSort={handleSort}
        toolbar={
          <div className="flex-1 min-w-48">
            <SearchBar value={search} onChange={v => { setSearch(v); setPage(1) }} placeholder="Buscar por nome ou ID do paciente..." />
          </div>
        }
        pagination={
          <Pagination currentPage={page} lastPage={paginatorInfo?.lastPage ?? 1}
            perPage={perPage} total={paginatorInfo?.total ?? 0}
            onPageChange={setPage} onPerPageChange={v => { setPerPage(v); setPage(1) }} />
        }
      />
    </div>
  )
}
