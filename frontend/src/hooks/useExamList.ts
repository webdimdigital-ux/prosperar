import { useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { GET_EXAMS } from '@/graphql/queries/exams'

export function useExamList() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(15)
  const [sortColumn, setSortColumn] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC')
  const [filter, setFilter] = useState<Record<string, string>>({})

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, previousData, loading, refetch } = useQuery<any>(GET_EXAMS, {
    variables: {
      search: search || undefined,
      first: perPage,
      page,
      sort: { column: sortColumn, order: sortOrder },
      filter: Object.keys(filter).length ? filter : undefined,
    },
    fetchPolicy: 'cache-and-network',
  })

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortOrder(o => o === 'ASC' ? 'DESC' : 'ASC')
    } else {
      setSortColumn(column)
      setSortOrder('ASC')
    }
    setPage(1)
  }

  const resolved = data ?? previousData

  return {
    data: resolved?.exams?.data ?? [],
    paginatorInfo: resolved?.exams?.paginatorInfo,
    loading,
    search, setSearch: (v: string) => { setSearch(v); setPage(1) },
    page, setPage,
    perPage, setPerPage: (v: number) => { setPerPage(v); setPage(1) },
    sortColumn, sortOrder, handleSort,
    filter, setFilter: (v: Record<string, string>) => { setFilter(v); setPage(1) },
    refetch,
  }
}
