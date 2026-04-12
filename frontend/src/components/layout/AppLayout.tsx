import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useMutation } from '@apollo/client/react'
import { LOGOUT } from '@/graphql/mutations/auth'
import {
  MenuIcon, LogOutIcon, UserIcon, LayoutDashboardIcon,
  UploadIcon, UsersIcon, BuildingIcon, FileTextIcon,
  ChevronDownIcon, BellIcon, SearchIcon,
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
    { label: 'Exames',    to: '/hospital/exams',   icon: <FileTextIcon className="size-[18px]" strokeWidth={1.5} /> },
    { label: 'Pacientes', to: '/hospital/clients', icon: <UsersIcon className="size-[18px]" strokeWidth={1.5} /> },
  ],
}

const roleLabel: Record<string, string> = {
  admin:    'Administrador',
  hospital: 'Unidade',
  client:   'Paciente',
}

const GAP         = 20
const PADDING     = 16

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
    /* ── Viewport root ── */
    <div
      style={{
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        background: 'linear-gradient(135deg, #EEF0FF 0%, #E8F7F2 100%)',
        fontFamily: 'Poppins, sans-serif',
        padding: PADDING,
        gap: GAP,
      }}
    >
      {/* ══════════════════ SIDEBAR CARD ══════════════════ */}
      <aside
        className={cn(
          'flex-col bg-white transition-transform duration-200 shrink-0',
          /* desktop: always visible  |  mobile: slide in/out */
          'hidden lg:flex w-[230px]',
        )}
        style={{
          borderRadius: 20,
          boxShadow: '0 4px 24px rgba(46,58,89,0.08)',
          overflow: 'hidden',
        }}
      >
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
          <aside
            className="fixed inset-y-0 left-0 z-50 flex flex-col bg-white lg:hidden"
            style={{
              width: 230 + PADDING,
              borderRadius: '0 20px 20px 0',
              boxShadow: '4px 0 24px rgba(46,58,89,0.12)',
              padding: PADDING,
              paddingLeft: PADDING,
              overflow: 'hidden',
            }}
          >
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
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* ── Topbar — transparent, no background ── */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            height: 60,
            flexShrink: 0,
            background: 'transparent',
            paddingLeft: 4,
            paddingRight: 4,
          }}
        >
          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(o => !o)}
            className="lg:hidden size-8 mr-2 shrink-0"
            style={{ color: '#7C8DB5' }}
          >
            <MenuIcon className="size-5" strokeWidth={1.5} />
          </Button>

          {/* Page title */}
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: '#2E3A59',
              fontFamily: 'Poppins, sans-serif',
              flexShrink: 0,
            }}
          >
            {currentTitle}
          </h2>

          {/* Search circle button */}
          <button
            style={{
              marginLeft: 12,
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: '1.5px solid #D5DCE8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              color: '#9BA8C2',
              flexShrink: 0,
              cursor: 'pointer',
            }}
          >
            <SearchIcon style={{ width: 14, height: 14 }} strokeWidth={1.5} />
          </button>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Bell */}
          <button
            style={{
              position: 'relative',
              width: 36,
              height: 36,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              color: '#7C8DB5',
              cursor: 'pointer',
              marginRight: 4,
            }}
          >
            <BellIcon style={{ width: 20, height: 20 }} strokeWidth={1.5} />
            <span
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: '#34C38F',
              }}
            />
          </button>

          {/* Avatar + name dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setMenuOpen(o => !o)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 8px 4px 4px',
                borderRadius: 12,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #34C38F 0%, #26A69A 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: 12,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>
              <span
                className="hidden sm:block"
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#2E3A59',
                  fontFamily: 'Poppins, sans-serif',
                  whiteSpace: 'nowrap',
                }}
              >
                {user.name.split(' ')[0]}
              </span>
              <ChevronDownIcon
                className="hidden sm:block"
                style={{ width: 14, height: 14, color: '#9BA8C2' }}
                strokeWidth={2}
              />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div
                  className="absolute right-0 z-50"
                  style={{
                    top: 'calc(100% + 8px)',
                    width: 208,
                    background: 'white',
                    borderRadius: 16,
                    boxShadow: '0 8px 32px rgba(46,58,89,0.12)',
                    border: '1px solid #EEF1F8',
                    paddingTop: 4,
                    paddingBottom: 4,
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ padding: '10px 16px 10px', borderBottom: '1px solid #F0F3F8' }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#2E3A59' }}>{user.name}</p>
                    <p style={{ fontSize: 11, color: '#9BA8C2', marginTop: 1 }}>{roleLabel[user.role]}</p>
                  </div>
                  {user.role === 'client' && (
                    <Link
                      to="/client/profile"
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 16px',
                        fontSize: 14,
                        color: '#2E3A59',
                        textDecoration: 'none',
                      }}
                      className="hover:bg-[#F5F6FA] transition-colors"
                    >
                      <UserIcon style={{ width: 16, height: 16, color: '#9BA8C2' }} strokeWidth={1.5} />
                      Meu Perfil
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 16px',
                      width: '100%',
                      fontSize: 14,
                      color: '#EF4444',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    className="hover:bg-red-50 transition-colors"
                  >
                    <LogOutIcon style={{ width: 16, height: 16 }} strokeWidth={1.5} />
                    Sair
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* ── Page content ── */}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            paddingRight: 4,
            paddingBottom: 4,
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

/* ─── Sidebar inner content (shared between desktop + mobile) ─── */
function SidebarContent({
  nav, user, location, initials, roleLabel, onNavClick, onLogout,
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
      {/* Logo — centered */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 28,
          paddingBottom: 20,
          flexShrink: 0,
        }}
      >
        
          <img
            src="https://prosperar.med.br/images/logo.png"
            alt="P"

          />
         
        
       
      </div>

      {/* Divider */}
      <div style={{ height: 1, backgroundColor: '#F0F3F8', marginBottom: 8, flexShrink: 0 }} />

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', paddingTop: 8, paddingBottom: 8 }}>
        {nav.map(item => {
          const active =
            location.pathname === item.to ||
            location.pathname.startsWith(item.to + '/')
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                paddingTop: 10,
                paddingBottom: 10,
                paddingLeft: 20,
                paddingRight: 16,
                fontSize: 13,
                fontWeight: 500,
                textDecoration: 'none',
                borderLeft: active ? '3px solid #34C38F' : '3px solid transparent',
                color: active ? '#34C38F' : '#9BA8C2',
                transition: 'all 0.15s',
                fontFamily: 'Poppins, sans-serif',
              }}
              className={!active ? 'hover:text-[#2E3A59]' : ''}
            >
              <span style={{ color: active ? '#34C38F' : '#9BA8C2', flexShrink: 0 }}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom — user card + logout */}
      <div style={{ flexShrink: 0, padding: '12px 16px 20px' }}>
        {/* Upgrade-style card */}
        <div
          style={{
            borderRadius: 16,
            background: 'linear-gradient(145deg, #EAF7F2, #DFF2EC)',
            padding: '14px 12px',
            marginBottom: 12,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #34C38F 0%, #26A69A 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            {initials}
          </div>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#2E3A59', fontFamily: 'Poppins, sans-serif' }}>
            {user.name.split(' ')[0]}
          </p>
          <p style={{ fontSize: 10, color: '#7C8DB5', marginTop: 2 }}>
            {roleLabel[user.role]}
          </p>
        </div>

        {/* Logout button — styled like "Upgrade Now" */}
        <button
          onClick={onLogout}
          style={{
            width: '100%',
            padding: '10px 0',
            borderRadius: 12,
            background: 'linear-gradient(135deg, #34C38F 0%, #26A69A 100%)',
            color: 'white',
            fontSize: 13,
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontFamily: 'Poppins, sans-serif',
          }}
        >
          <LogOutIcon style={{ width: 15, height: 15 }} strokeWidth={2} />
          Sair da conta
        </button>
      </div>
    </>
  )
}
