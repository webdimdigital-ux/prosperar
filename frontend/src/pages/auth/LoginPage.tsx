import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@apollo/client/react'
import { LOGIN } from '@/graphql/mutations/auth'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle2 } from 'lucide-react'

const FEATURES = [
  'Acesse seus resultados de exames a qualquer hora',
  'Histórico completo de exames anteriores',
  'Download seguro em PDF com apenas um clique',
]

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loginMutation, { loading }] = useMutation<any>(LOGIN)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const { data } = await loginMutation({ variables: { email, password } })
      login(data.login.token, data.login.user)
      const role = data.login.user.role
      if (role === 'admin') navigate('/admin/exams')
      else if (role === 'hospital') navigate('/hospital/exams')
      else navigate('/client/exams')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Falha no login')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #2E3A59 0%, #1a2d45 100%)' }}
      >
        {/* Background decoration */}
        <div
          className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: '#34C38F' }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-[380px] h-[380px] rounded-full opacity-10"
          style={{ background: '#34C38F' }}
        />

        {/* Logo */}
        <div className="relative z-10">
         
        </div>

        {/* Main copy */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1
              className="text-4xl font-bold leading-tight mb-4"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Seus exames,<br />
              <span style={{ color: '#34C38F' }}>na palma da mão.</span>
            </h1>
            <p className="text-base opacity-70 leading-relaxed max-w-sm">
              Acesse resultados, faça download de laudos de seus exames de forma simples e segura.
            </p>
          </div>

          <ul className="space-y-3">
            {FEATURES.map(f => (
              <li key={f} className="flex items-start gap-3 text-sm opacity-80">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#34C38F' }} />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer quote */}
        <div className="relative z-10 border-t border-white/10 pt-6">
          
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ background: '#F5F6FA' }}>
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <img
              src="https://prosperar.med.br/images/logo.png"
              alt="Prosperar"
              className="h-10 w-auto object-contain"
            />
          </div>

          <div className="bg-white rounded-xs p-8" style={{ boxShadow: '0 2px 8px rgba(46,58,89,0.06)' }}>
            <h2
              className="text-2xl font-bold mb-1"
              style={{ color: '#2E3A59', fontFamily: 'Poppins, sans-serif' }}
            >
              Bem-vindo de volta!
            </h2>
            <p className="text-sm mb-6" style={{ color: '#7C8DB5' }}>
              Insira seus dados para continuar.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="space-y-1.5">
                <Label htmlFor="email" style={{ color: '#2E3A59' }}>E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" style={{ color: '#2E3A59' }}>Senha</Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs hover:underline"
                    style={{ color: '#34C38F' }}
                  >
                    Esqueci minha senha
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full mt-2 font-semibold"
                style={{ background: '#34C38F', color: '#fff', border: 'none' }}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm" style={{ color: '#7C8DB5' }}>
              Não tem conta?{' '}
              <Link to="/register" className="font-semibold hover:underline" style={{ color: '#34C38F' }}>
                Criar conta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
