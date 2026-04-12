import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { GET_CLIENTS, CREATE_CLIENT, UPDATE_CLIENT } from '@/graphql/queries/clients'
import { formatCPF } from '@/lib/utils'
import { useClientFormStore } from '@/stores/clientFormStore'
import { DataTable } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { SearchBar } from '@/components/shared/SearchBar'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { MoreHorizontalIcon, PencilIcon } from 'lucide-react'

const ALL = '__all__'

export function AdminClientsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(15)
  const [filter, setFilter] = useState<Record<string, string>>({})
  const [sortColumn, setSortColumn] = useState('name')
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC')

  const store = useClientFormStore()

  const { data, loading, refetch } = useQuery<any>(GET_CLIENTS, {
    variables: { search: search || undefined, filter: Object.keys(filter).length ? filter : undefined,
      sort: { column: sortColumn, order: sortOrder }, first: perPage, page },
    fetchPolicy: 'cache-and-network',
  })

  const [createClient, { loading: creating }] = useMutation(CREATE_CLIENT)
  const [updateClient, { loading: updating }] = useMutation(UPDATE_CLIENT)

  const clients = data?.clients?.data ?? []
  const paginatorInfo = data?.clients?.paginatorInfo

  const handleSort = (col: string) => {
    if (sortColumn === col) setSortOrder(o => o === 'ASC' ? 'DESC' : 'ASC')
    else { setSortColumn(col); setSortOrder('ASC') }
    setPage(1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!store.validate()) return
    const { fields, editId } = store
    if (editId) {
      const input: Record<string, string> = { name: fields.name, email: fields.email, phone: fields.phone, status: fields.status }
      if (fields.password) input.password = fields.password
      await updateClient({ variables: { id: editId, input } })
    } else {
      await createClient({ variables: { input: { name: fields.name, email: fields.email, cpf: fields.cpf, phone: fields.phone, password: fields.password, status: fields.status } } })
    }
    store.close()
    refetch()
  }

  const columns = [
    { key: 'name', label: 'Nome', sortable: true },
    { key: 'email', label: 'E-mail', sortable: true },
    { key: 'cpf', label: 'CPF', render: (r: { cpf: string }) => formatCPF(r.cpf) },
    { key: 'phone', label: 'Telefone' },
    { key: 'status', label: 'Status', render: (r: { status: string }) => <StatusBadge status={r.status} /> },
    {
      key: 'actions', label: 'Ações', compact: true,
      render: (r: { id: string; name: string; email: string; phone: string; status: string }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="size-8 p-0">
              <MoreHorizontalIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => store.open({ name: r.name, email: r.email, phone: r.phone ?? '', status: r.status }, r.id)}>
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
    <div className="space-y-4 mt-8">
      <div className="flex items-center justify-end">
        <Button className='rounded-sm' onClick={() => store.open()}>Adicionar paciente</Button>
      </div>

      <Dialog open={isOpen} onOpenChange={open => !open && store.close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? 'Editar paciente' : 'Adicionar paciente'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="c-name">Nome</Label>
              <Input id="c-name" value={fields.name} onChange={e => store.setField('name', e.target.value)}
                aria-invalid={!!errors.name} />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="c-email">E-mail</Label>
              <Input id="c-email" type="email" value={fields.email} onChange={e => store.setField('email', e.target.value)}
                aria-invalid={!!errors.email} />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            {/* CPF only on create */}
            {!editId && (
              <div className="space-y-1.5">
                <Label htmlFor="c-cpf">ID do Paciente (CPF)</Label>
                <Input
                  id="c-cpf"
                  value={formatCPF(fields.cpf)}
                  onChange={e => store.setField('cpf', e.target.value.replace(/\D/g, ''))}
                  placeholder="000.000.000-00"
                  aria-invalid={!!errors.cpf}
                />
                {errors.cpf && <p className="text-xs text-destructive">{errors.cpf}</p>}
              </div>
            )}
            {/* Password: required on create, optional on edit */}
            <div className="space-y-1.5">
              <Label htmlFor="c-pass">{editId ? 'Nova senha (opcional)' : 'Senha'}</Label>
              <Input id="c-pass" type="password" value={fields.password} onChange={e => store.setField('password', e.target.value)}
                aria-invalid={!!errors.password} />
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>
            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="c-phone">Telefone</Label>
              <Input id="c-phone" type="tel" value={fields.phone} onChange={e => store.setField('phone', e.target.value)} />
            </div>
            {/* Status */}
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
        data={clients}
        loading={loading}
        sortColumn={sortColumn}
        sortOrder={sortOrder}
        onSort={handleSort}
        toolbar={
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-48">
              <SearchBar value={search} onChange={v => { setSearch(v); setPage(1) }} placeholder="Buscar por nome, e-mail ou ID..." />
            </div>
            <Select value={filter.status || ALL} onValueChange={v => { setFilter(v === ALL ? {} : { status: v }); setPage(1) }}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Todos os status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos os status</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
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
