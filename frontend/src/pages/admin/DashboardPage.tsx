import { useQuery } from '@apollo/client/react'
import { useAuth } from '@/context/AuthContext'
import { GET_EXAMS } from '@/graphql/queries/exams'
import { GET_CLIENTS } from '@/graphql/queries/clients'
import { GET_HOSPITALS } from '@/graphql/queries/hospitals'
import {
  FileTextIcon, UsersIcon, BuildingIcon, UploadIcon,
} from 'lucide-react'

interface StatCardProps {
  label: string
  value: number | string
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  loading?: boolean
  trend?: string
}

function StatCard({ label, value, icon, iconBg, iconColor, loading }: StatCardProps) {
  return (
    <div
      className="bg-white rounded-2xl p-5 flex items-center gap-4"
      style={{ boxShadow: '0 2px 12px rgba(46,58,89,0.06)' }}
    >
      <div
        className="size-14 rounded-2xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: iconBg }}
      >
        <span style={{ color: iconColor }}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium" style={{ color: '#7C8DB5' }}>{label}</p>
        {loading ? (
          <div className="h-8 w-16 rounded-lg animate-pulse mt-1" style={{ backgroundColor: '#F0F3F8' }} />
        ) : (
          <p className="text-3xl font-bold leading-tight" style={{ color: '#2E3A59', fontFamily: 'Poppins, sans-serif' }}>
            {value}
          </p>
        )}
      </div>
    </div>
  )
}

function StatusRow({
  label, value, color, bg, loading,
}: {
  label: string; value: number; color: string; bg: string; loading: boolean
}) {
  return (
    <div
      className="bg-white rounded-2xl p-5 flex items-center justify-between"
      style={{ boxShadow: '0 2px 12px rgba(46,58,89,0.06)' }}
    >
      <div className="flex items-center gap-3">
        <div className="size-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <span className="text-sm font-medium" style={{ color: '#2E3A59' }}>{label}</span>
      </div>
      {loading ? (
        <div className="h-6 w-10 rounded animate-pulse" style={{ backgroundColor: '#F0F3F8' }} />
      ) : (
        <span
          className="text-sm font-bold px-3 py-1 rounded-full"
          style={{ backgroundColor: bg, color }}
        >
          {value}
        </span>
      )}
    </div>
  )
}

export function AdminDashboardPage() {
  const { user } = useAuth()
  const firstName = user?.name.split(' ')[0] ?? 'Usuário'

  const { data: totalExams,     loading: l1 } = useQuery<any>(GET_EXAMS,     { variables: { first: 1 }, fetchPolicy: 'cache-and-network' })
  const { data: pendingExams,   loading: l2 } = useQuery<any>(GET_EXAMS,     { variables: { first: 1, filter: { status: 'pending' } },   fetchPolicy: 'cache-and-network' })
  const { data: availableExams, loading: l3 } = useQuery<any>(GET_EXAMS,     { variables: { first: 1, filter: { status: 'available' } }, fetchPolicy: 'cache-and-network' })
  const { data: deliveredExams, loading: l4 } = useQuery<any>(GET_EXAMS,     { variables: { first: 1, filter: { status: 'delivered' } }, fetchPolicy: 'cache-and-network' })
  const { data: errorExams,     loading: l5 } = useQuery<any>(GET_EXAMS,     { variables: { first: 1, filter: { status: 'error' } },     fetchPolicy: 'cache-and-network' })
  const { data: clientsData,    loading: l6 } = useQuery<any>(GET_CLIENTS,   { variables: { first: 1 }, fetchPolicy: 'cache-and-network' })
  const { data: hospitalsData,  loading: l7 } = useQuery<any>(GET_HOSPITALS, { variables: { first: 1 }, fetchPolicy: 'cache-and-network' })

  const total     = totalExams?.exams?.paginatorInfo?.total     ?? 0
  const pending   = pendingExams?.exams?.paginatorInfo?.total   ?? 0
  const available = availableExams?.exams?.paginatorInfo?.total ?? 0
  const delivered = deliveredExams?.exams?.paginatorInfo?.total ?? 0
  const errors    = errorExams?.exams?.paginatorInfo?.total     ?? 0
  const patients  = clientsData?.clients?.paginatorInfo?.total  ?? 0
  const units     = hospitalsData?.hospitals?.paginatorInfo?.total ?? 0

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <div className="space-y-6">

      {/* ── Welcome card ── */}
      <div
        className="rounded-2xl text-white relative overflow-hidden flex items-stretch"
        style={{
          background: 'linear-gradient(135deg, #34C38F 0%, #26A69A 60%, #1E8A88 100%)',
          minHeight: 160,
          boxShadow: '0 8px 32px rgba(52,195,143,0.30)',
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full opacity-[0.12] bg-white pointer-events-none" />
        <div className="absolute top-8 right-32 w-28 h-28 rounded-full opacity-[0.10] bg-white pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full opacity-[0.08] bg-white pointer-events-none" />

        {/* Text */}
        <div className="relative z-10 flex flex-col justify-center px-8 py-7 flex-1">
          <p className="text-sm font-medium opacity-80 mb-1 capitalize">{today}</p>
          <h2
            className="text-3xl font-bold leading-tight mb-2"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Olá, {firstName}! 👋
          </h2>
          <p className="text-sm opacity-75 max-w-sm leading-relaxed">
            Você tem <strong>{pending}</strong> exame{pending !== 1 ? 's' : ''} pendente{pending !== 1 ? 's' : ''} hoje.
            Gerencie tudo em um só lugar.
          </p>
        </div>

        {/* Right illustration placeholder */}
        <div className="relative z-10 hidden sm:flex items-end pr-8 pb-0">
          <svg width="140" height="140" viewBox="0 0 140 140" fill="none" opacity="0.18">
            <circle cx="70" cy="50" r="28" fill="white" />
            <rect x="30" y="85" width="80" height="55" rx="8" fill="white" />
            <rect x="55" y="75" width="30" height="20" rx="4" fill="white" />
            <rect x="45" y="100" width="20" height="40" rx="4" fill="white" opacity="0.6" />
            <rect x="75" y="100" width="20" height="40" rx="4" fill="white" opacity="0.6" />
          </svg>
        </div>
      </div>

      {/* ── Main stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total de Exames"
          value={total}
          loading={l1}
          iconBg="#EAF7F2"
          iconColor="#34C38F"
          icon={<FileTextIcon className="size-6" strokeWidth={1.5} />}
        />
        <StatCard
          label="Pacientes"
          value={patients}
          loading={l6}
          iconBg="#EDF5FF"
          iconColor="#4A90D9"
          icon={<UsersIcon className="size-6" strokeWidth={1.5} />}
        />
        <StatCard
          label="Unidades"
          value={units}
          loading={l7}
          iconBg="#F3EEFF"
          iconColor="#9B72E8"
          icon={<BuildingIcon className="size-6" strokeWidth={1.5} />}
        />
      </div>

      {/* ── Status breakdown ── */}
      <div>
        <h3
          className="text-sm font-semibold uppercase tracking-widest mb-3"
          style={{ color: '#B0BBCF' }}
        >
          Exames por status
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatusRow label="Pendentes"   value={pending}   color="#F5A623" bg="#FEF5E6" loading={l2} />
          <StatusRow label="Disponíveis" value={available} color="#34C38F" bg="#EAF7F2" loading={l3} />
          <StatusRow label="Entregues"   value={delivered} color="#4A90D9" bg="#EDF5FF" loading={l4} />
          <StatusRow label="Com Erro"    value={errors}    color="#EF4444" bg="#FEE2E2" loading={l5} />
        </div>
      </div>

      {/* ── Quick info cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          className="bg-white rounded-2xl p-5"
          style={{ boxShadow: '0 2px 12px rgba(46,58,89,0.06)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-sm" style={{ color: '#2E3A59' }}>Visão Geral</h4>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: '#EAF7F2', color: '#34C38F' }}>
              Hoje
            </span>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Taxa de conclusão', value: total > 0 ? `${Math.round(((available + delivered) / total) * 100)}%` : '—', color: '#34C38F' },
              { label: 'Em andamento', value: pending, color: '#F5A623' },
              { label: 'Com problema', value: errors, color: '#EF4444' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm" style={{ color: '#7C8DB5' }}>{item.label}</span>
                <span className="text-sm font-bold" style={{ color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          className="bg-white rounded-2xl p-5"
          style={{ boxShadow: '0 2px 12px rgba(46,58,89,0.06)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-sm" style={{ color: '#2E3A59' }}>Ações Rápidas</h4>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Enviar novo exame', to: '/admin/upload', icon: <UploadIcon className="size-4" strokeWidth={1.5} />, color: '#34C38F', bg: '#EAF7F2' },
              { label: 'Ver todos os exames', to: '/admin/exams', icon: <FileTextIcon className="size-4" strokeWidth={1.5} />, color: '#4A90D9', bg: '#EDF5FF' },
              { label: 'Gerenciar pacientes', to: '/admin/clients', icon: <UsersIcon className="size-4" strokeWidth={1.5} />, color: '#9B72E8', bg: '#F3EEFF' },
            ].map(item => (
              <a
                key={item.to}
                href={item.to}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:opacity-80"
                style={{ backgroundColor: item.bg }}
              >
                <span style={{ color: item.color }}>{item.icon}</span>
                <span className="text-sm font-medium" style={{ color: item.color }}>{item.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

