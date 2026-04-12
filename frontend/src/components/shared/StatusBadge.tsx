import { Badge } from '@/components/ui/badge'

const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  available: { label: 'Disponível', variant: 'default' },
  delivered: { label: 'Entregue',   variant: 'secondary' },
  active:    { label: 'Ativo',      variant: 'default' },
  inactive:  { label: 'Inativo',    variant: 'outline' },
}

export function StatusBadge({ status }: { status: string }) {
  const { label, variant } = config[status] ?? { label: status, variant: 'outline' as const }
  return <Badge variant={variant}>{label}</Badge>
}
