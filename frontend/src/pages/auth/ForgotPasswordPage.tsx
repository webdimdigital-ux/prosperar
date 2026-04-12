import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@apollo/client/react'
import { FORGOT_PASSWORD } from '@/graphql/mutations/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle2, MailCheck } from 'lucide-react'

const FEATURES = [
  'Acesse seus resultados de exames a qualquer hora',
  'Histórico completo de exames anteriores',
  'Download seguro em PDF com apenas um clique',
]

function LeftPanel() {
  return (
    <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white relative overflow-hidden bg-[linear-gradient(145deg,#2E3A59_0%,#1a2d45_100%)]">
      <div className="absolute -top-32 -right-32 w-125 h-125 rounded-full opacity-10 bg-[#34C38F]" />
      <div className="absolute -bottom-24 -left-24 w-95 h-95 rounded-full opacity-10 bg-[#34C38F]" />

      <div className="relative z-10" />

      <div className="relative z-10 space-y-8">
        <div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Seus exames,<br />
            <span className="text-[#34C38F]">na palma da mão.</span>
          </h1>
          <p className="text-base opacity-70 leading-relaxed max-w-sm">
            Acesse resultados, faça download de laudos de seus exames de forma simples e segura.
          </p>
        </div>

        <ul className="space-y-3">
          {FEATURES.map(f => (
            <li key={f} className="flex items-start gap-3 text-sm opacity-80">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-[#34C38F]" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative z-10 border-t border-white/10 pt-6" />
    </div>
  )
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [forgotPassword, { loading }] = useMutation(FORGOT_PASSWORD)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await forgotPassword({ variables: { email } })
    setSent(true)
  }

  if (sent) {
    return (
      <div className="min-h-screen flex">
        <LeftPanel />
        <div className="flex-1 flex items-center justify-center p-8 bg-[#F5F6FA]">
          <div className="w-full max-w-105">
            <div className="bg-white rounded-2xl p-8 text-center shadow-[0_2px_8px_rgba(46,58,89,0.06)]">
              <div className="size-14 rounded-full flex items-center justify-center mx-auto mb-4 bg-[#EBF5FC]">
                <MailCheck className="size-7 text-[#34C38F]" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-[#2E3A59]">
                E-mail enviado!
              </h2>
              <p className="text-sm mb-6 text-[#7C8DB5]">
                Verifique sua caixa de entrada para o link de redefinição de senha.
              </p>
              <Link to="/login" className="text-sm font-semibold hover:underline text-[#34C38F]">
                Voltar para o login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      <LeftPanel />

      <div className="flex-1 flex items-center justify-center p-8 bg-[#F5F6FA]">
        <div className="w-full max-w-105">
          <div className="flex justify-center mb-8 lg:hidden">
            <img
              src="https://prosperar.med.br/images/logo.png"
              alt="Prosperar"
              className="h-10 w-auto object-contain"
            />
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-[0_2px_8px_rgba(46,58,89,0.06)]">
            <h2 className="text-2xl font-bold mb-1 text-[#2E3A59]">
              Redefinir senha
            </h2>
            <p className="text-sm mb-6 text-[#7C8DB5]">
              Informe seu e-mail e enviaremos um link para redefinir sua senha.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[#2E3A59]">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full mt-2">
                {loading ? 'Enviando...' : 'Enviar link de recuperação'}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-[#7C8DB5]">
              Lembrou a senha?{' '}
              <Link to="/login" className="font-semibold hover:underline text-[#34C38F]">
                Voltar para o login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
