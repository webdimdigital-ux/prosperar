import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useMutation } from '@apollo/client/react'
import { LOGOUT } from '@/graphql/mutations/auth'
import {
  MenuIcon, LogOutIcon, UserIcon, LayoutDashboardIcon,
  UploadIcon, UsersIcon, BuildingIcon, FileTextIcon,
  ChevronDownIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type NavItem = { label: string; to: string; icon: React.ReactNode }

const navByRole: Record<string, NavItem[]> = {
  client: [
    { label: 'Meus Exames', to: '/client/exams', icon: <FileTextIcon className="size-[18px]" strokeWidth={1.5} /> },
  ],
  admin: [
    { label: 'Dashboard',    to: '/admin/dashboard', icon: <LayoutDashboardIcon className="size-[18px]" strokeWidth={1.5} /> },
    { label: 'Exames',       to: '/admin/exams',      icon: <FileTextIcon className="size-[18px]" strokeWidth={1.5} /> },
    { label: 'Enviar Exame', to: '/admin/upload',     icon: <UploadIcon className="size-[18px]" strokeWidth={1.5} /> },
    { label: 'Pacientes',    to: '/admin/clients',    icon: <UsersIcon className="size-[18px]" strokeWidth={1.5} /> },
    { label: 'Unidades',     to: '/admin/hospitals',  icon: <BuildingIcon className="size-[18px]" strokeWidth={1.5} /> },
  ],
  hospital: [
    { label: 'Exames', to: '/hospital/exams', icon: <FileTextIcon className="size-[18px]" strokeWidth={1.5} /> },
  ],
}

const roleLabel: Record<string, string> = {
  admin:    'Administrador',
  hospital: 'Unidade',
  client:   'Paciente',
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const location  = useLocation()
  const navigate  = useNavigate()
  const [menuOpen,    setMenuOpen]    = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [logoutMutation] = useMutation(LOGOUT)

  if (!user) return null

  const nav = navByRole[user.role] ?? []

  const handleLogout = async () => {
    try { await logoutMutation() } catch { /* ignore */ }
    logout()
    navigate('/login')
  }

  const initials = user.name
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const currentTitle =
    nav.find(item =>
      location.pathname === item.to ||
      location.pathname.startsWith(item.to + '/')
    )?.label ?? 'Início'

  return (
    <div className="h-screen overflow-hidden flex bg-[linear-gradient(135deg,#EEF0FF_0%,#E8F7F2_100%)] p-4 gap-5">

      {/* ══════════════════ SIDEBAR CARD ══════════════════ */}
      <aside className="hidden lg:flex flex-col bg-white shrink-0 w-57.5 rounded-[20px] shadow-[0_4px_24px_rgba(46,58,89,0.08)] overflow-hidden">
        <SidebarContent
          nav={nav}
          user={user}
          location={location}
          initials={initials}
          roleLabel={roleLabel}
          onNavClick={() => {}}
          onLogout={handleLogout}
        />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex flex-col bg-white lg:hidden w-61.5 rounded-r-[20px] shadow-[4px_0_24px_rgba(46,58,89,0.12)] p-4 overflow-hidden">
            <SidebarContent
              nav={nav}
              user={user}
              location={location}
              initials={initials}
              roleLabel={roleLabel}
              onNavClick={() => setSidebarOpen(false)}
              onLogout={handleLogout}
            />
          </aside>
        </>
      )}

      {/* ══════════════════ MAIN COLUMN ══════════════════ */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">

        {/* ── Topbar ── */}
        <header className="flex items-center h-15 shrink-0 px-1 mb-4">

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(o => !o)}
            className="lg:hidden size-8 mr-2 shrink-0 text-[#7C8DB5]"
          >
            <MenuIcon className="size-5" strokeWidth={1.5} />
          </Button>

          {/* Page title */}
          <h2 className="text-xl font-bold text-[#2E3A59] shrink-0">
            {currentTitle}
          </h2>

         

          <div className="flex-1" />

          

          {/* Avatar + name dropdown */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="flex items-center gap-2 py-1 pr-2 pl-1 rounded-xl bg-transparent border-none cursor-pointer"
            >
              <div className="size-9 rounded-full bg-linear-to-br from-[#34C38F] to-[#26A69A] flex items-center justify-center text-white text-xs font-bold shrink-0">
                {initials}
              </div>
              <span className="hidden sm:block text-sm font-semibold text-[#2E3A59] whitespace-nowrap">
                {user.name.split(' ')[0]}
              </span>
              <ChevronDownIcon className="hidden sm:block size-3.5 text-[#9BA8C2]" strokeWidth={2} />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 z-50 top-[calc(100%+8px)] w-52 bg-white rounded-2xl shadow-[0_8px_32px_rgba(46,58,89,0.12)] border border-[#EEF1F8] py-1 overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-[#F0F3F8]">
                    <p className="text-sm font-semibold text-[#2E3A59]">{user.name}</p>
                    <p className="text-[11px] text-[#9BA8C2] mt-px">{roleLabel[user.role]}</p>
                  </div>
                  {user.role === 'client' && (
                    <Link
                      to="/client/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#2E3A59] no-underline hover:bg-[#F5F6FA] transition-colors"
                    >
                      <UserIcon className="size-4 text-[#9BA8C2]" strokeWidth={1.5} />
                      Meu Perfil
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 px-4 py-2.5 w-full text-sm text-red-500 bg-transparent border-none cursor-pointer text-left hover:bg-red-50 transition-colors"
                  >
                    <LogOutIcon className="size-4" strokeWidth={1.5} />
                    Sair
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 overflow-y-auto pr-1 pb-1">
          {children}
        </main>
      </div>
    </div>
  )
}

/* ─── Sidebar inner content (shared between desktop + mobile) ─── */
function SidebarContent({
  nav, location, onNavClick, onLogout,
}: {
  nav: { label: string; to: string; icon: React.ReactNode }[]
  user: { name: string; role: string }
  location: { pathname: string }
  initials: string
  roleLabel: Record<string, string>
  onNavClick: () => void
  onLogout: () => void
}) {
  return (
    <>
      {/* Logo */}
      <div className="flex flex-col items-center pt-7 pb-5 shrink-0">
        <img src="https://prosperar.med.br/images/logo.png" alt="P" />
      </div>

      {/* Divider */}
      <div className="h-px bg-[#F0F3F8] mb-2 shrink-0" />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        {nav.map(item => {
          const active =
            location.pathname === item.to ||
            location.pathname.startsWith(item.to + '/')
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavClick}
              className={cn(
                'flex items-center gap-3 py-2.5 pl-5 pr-4 text-[13px] font-medium no-underline border-l-[3px] transition-all duration-150',
                active
                  ? 'border-[#34C38F] text-[#34C38F]'
                  : 'border-transparent text-[#9BA8C2] hover:text-[#2E3A59]',
              )}
            >
              <span className={cn('shrink-0', active ? 'text-[#34C38F]' : 'text-[#9BA8C2]')}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom — user card + logout */}
      <div className="shrink-0 px-4 pt-3 pb-5">
        
        <Button onClick={onLogout} className="w-full gap-2 text-xs">
          <LogOutIcon className="size-4" strokeWidth={2} />
          Sair da conta
        </Button>
      </div>
    </>
  )
}
