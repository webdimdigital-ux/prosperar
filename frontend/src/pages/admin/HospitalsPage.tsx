import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { GET_HOSPITALS, CREATE_HOSPITAL, UPDATE_HOSPITAL } from '@/graphql/queries/hospitals'
import { useHospitalFormStore } from '@/stores/hospitalFormStore'
import { DataTable } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { FilterToolbar } from '@/components/shared/FilterToolbar'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { MoreHorizontalIcon, PencilIcon } from 'lucide-react'

const ALL = '__all__'

export function AdminHospitalsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [filter, setFilter] = useState<Record<string, string>>({})
  const [sortColumn, setSortColumn] = useState('name')
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC')

  const store = useHospitalFormStore()

  const { data, loading, refetch } = useQuery<any>(GET_HOSPITALS, {
    variables: { search: search || undefined, filter: Object.keys(filter).length ? filter : undefined,
      sort: { column: sortColumn, order: sortOrder }, first: perPage, page },
    fetchPolicy: 'cache-and-network',
  })

  const [createHospital, { loading: creating }] = useMutation(CREATE_HOSPITAL)
  const [updateHospital, { loading: updating }] = useMutation(UPDATE_HOSPITAL)

  const hospitals = data?.hospitals?.data ?? []
  const paginatorInfo = data?.hospitals?.paginatorInfo

  const handleSort = (col: string) => {
    if (sortColumn === col) setSortOrder(o => o === 'ASC' ? 'DESC' : 'ASC')
    else { setSortColumn(col); setSortOrder('ASC') }
    setPage(1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!store.validate()) return
    const { fields, editId } = store
    const input = { ...fields, status: fields.status as 'active' | 'inactive' }
    if (editId) await updateHospital({ variables: { id: editId, input } })
    else await createHospital({ variables: { input } })
    store.close()
    refetch()
  }

  const textFields: [keyof typeof store.fields, string, string][] = [
    ['name', 'Nome', 'text'],
    ['cnpj', 'CNPJ', 'text'],
    ['address', 'Endereço', 'text'],
    ['city', 'Cidade', 'text'],
    ['state', 'Estado (UF)', 'text'],
    ['phone', 'Telefone', 'tel'],
    ['email', 'E-mail (login)', 'email'],
  ]

  const columns = [
    { key: 'name', label: 'Nome', sortable: true },
    { key: 'cnpj', label: 'CNPJ' },
    { key: 'city', label: 'Cidade', sortable: true },
    { key: 'phone', label: 'Telefone' },
    { key: 'status', label: 'Status', render: (r: { status: string }) => <StatusBadge status={r.status} /> },
    {
      key: 'actions', label: 'Ações', compact: true,
      render: (r: { id: string; name: string; cnpj: string; address: string; city: string; state: string; phone: string; email: string; status: string }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="size-8 p-0">
              <MoreHorizontalIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => store.open({ name: r.name, cnpj: r.cnpj, address: r.address ?? '', city: r.city ?? '', state: r.state ?? '', phone: r.phone ?? '', email: r.email ?? '', status: r.status }, r.id)}>
              <PencilIcon className="size-4 text-[#7C8DB5]" />
              Editar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const { fields, errors, editId, isOpen } = store

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button onClick={() => store.open()}>Adicionar unidade</Button>
      </div>

      <Dialog open={isOpen} onOpenChange={open => !open && store.close()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? 'Editar unidade' : 'Adicionar unidade'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            {textFields.map(([k, l, t]) => (
              <div key={k} className="space-y-1.5">
                <Label htmlFor={`h-${k}`}>{l}</Label>
                <Input id={`h-${k}`} type={t} value={fields[k]} onChange={e => store.setField(k, e.target.value)}
                  aria-invalid={!!(errors as Record<string, string>)[k]} />
                {(errors as Record<string, string>)[k] && (
                  <p className="text-xs text-destructive">{(errors as Record<string, string>)[k]}</p>
                )}
              </div>
            ))}
            {/* Senha */}
            <div className="space-y-1.5">
              <Label htmlFor="h-password">{editId ? 'Nova senha (opcional)' : 'Senha de acesso'}</Label>
              <Input
                id="h-password"
                type="password"
                value={fields.password}
                onChange={e => store.setField('password', e.target.value)}
                aria-invalid={!!errors.password}
                placeholder={editId ? 'Deixe em branco para não alterar' : ''}
              />
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              {!editId && <p className="text-xs text-muted-foreground">Login: e-mail + esta senha</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={fields.status} onValueChange={v => store.setField('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={store.close}>Cancelar</Button>
              <Button type="submit" disabled={creating || updating}>
                {creating || updating ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DataTable
        columns={columns as never}
        data={hospitals}
        loading={loading}
        sortColumn={sortColumn}
        sortOrder={sortOrder}
        onSort={handleSort}
        toolbar={
          <FilterToolbar
            search={search}
            onSearch={v => { setSearch(v); setPage(1) }}
            placeholder="Buscar por nome ou CNPJ da unidade..."
            filterCount={filter.status ? 1 : 0}
          >
            <Select value={filter.status || ALL} onValueChange={v => { setFilter(v === ALL ? {} : { status: v }); setPage(1) }}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Todos os status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos os status</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </FilterToolbar>
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
