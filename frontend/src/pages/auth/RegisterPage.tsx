import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@apollo/client/react'
import { REGISTER } from '@/graphql/mutations/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle2 } from 'lucide-react'
import { formatCPF, formatPhone, formatDateMask, parseDateMask, validateCPF, validateEmail } from '@/lib/utils'

const FEATURES = [
  'Acesse seus resultados de exames a qualquer hora',
  'Histórico completo de exames anteriores',
  'Download seguro em PDF com apenas um clique',
]

const emptyForm = { name: '', email: '', cpf: '', phone: '', birth_date: '', birth_date_display: '', password: '', password_confirmation: '' }

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs mt-1 text-[#E8624A]">{message}</p>
}

export function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Partial<typeof emptyForm>>({})
  const [serverError, setServerError] = useState('')
  const [registerMutation, { loading }] = useMutation(REGISTER)

  const set = (k: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
    if (k === 'cpf') value = formatCPF(value)
    if (k === 'phone') value = formatPhone(value)
    if (k === 'birth_date_display') {
      const masked = formatDateMask(value)
      setForm(f => ({ ...f, birth_date_display: masked, birth_date: parseDateMask(masked) }))
      if (errors.birth_date) setErrors(prev => ({ ...prev, birth_date: '' }))
      return
    }
    setForm(f => ({ ...f, [k]: value }))
    if (errors[k]) setErrors(prev => ({ ...prev, [k]: '' }))
  }

  const validate = (): boolean => {
    const next: Partial<typeof emptyForm> = {}

    if (!form.name.trim()) next.name = 'Nome é obrigatório.'
    if (!form.email.trim()) next.email = 'E-mail é obrigatório.'
    else if (!validateEmail(form.email)) next.email = 'E-mail inválido.'
    if (!form.cpf.trim()) next.cpf = 'CPF é obrigatório.'
    else if (!validateCPF(form.cpf)) next.cpf = 'CPF inválido.'
    if (form.birth_date_display) {
      const digits = form.birth_date_display.replace(/\D/g, '')
      if (digits.length === 8 && !form.birth_date) next.birth_date = 'Data inválida.'
    }
    if (form.phone) {
      const digits = form.phone.replace(/\D/g, '')
      if (digits.length < 10) next.phone = 'Telefone inválido.'
    }
    if (!form.password) next.password = 'Senha é obrigatória.'
    else if (form.password.length < 8) next.password = 'Mínimo de 8 caracteres.'
    if (!form.password_confirmation) next.password_confirmation = 'Confirme a senha.'
    else if (form.password !== form.password_confirmation) next.password_confirmation = 'As senhas não coincidem.'

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setServerError('')
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { birth_date_display, ...rest } = form
      await registerMutation({
        variables: {
          input: {
            ...rest,
            cpf: form.cpf.replace(/\D/g, ''),
            phone: form.phone.replace(/\D/g, '') || null,
          },
        },
      })
      navigate('/login')
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Falha no cadastro')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white relative overflow-hidden bg-[linear-gradient(145deg,#2E3A59_0%,#1a2d45_100%)]">
        <div className="absolute -top-32 -right-32 w-125 h-125 rounded-full opacity-10 bg-[#34C38F]" />
        <div className="absolute -bottom-24 -left-24 w-95 h-95 rounded-full opacity-10 bg-[#34C38F]" />

        <div className="relative z-10" />

        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-bold leading-tight mb-4">
              Crie sua conta<br />
              <span className="text-[#34C38F]">em poucos passos.</span>
            </h1>
            <p className="text-base opacity-70 leading-relaxed max-w-sm">
              Cadastre-se e tenha acesso completo aos seus exames médicos de forma rápida e segura.
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

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto bg-[#F5F6FA]">
        <div className="w-full max-w-105 py-4">
          <div className="flex justify-center mb-8 lg:hidden">
            <img src="https://prosperar.med.br/images/logo.png" alt="Prosperar" className="h-10 w-auto object-contain" />
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-[0_2px_8px_rgba(46,58,89,0.06)]">
            <h2 className="text-2xl font-bold mb-1 text-[#2E3A59]">
              Criar conta
            </h2>
            <p className="text-sm mb-6 text-[#7C8DB5]">
              Preencha seus dados para se cadastrar.
            </p>

            {serverError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-[#2E3A59]">Nome completo</Label>
                <Input id="name" type="text" value={form.name} onChange={set('name')} />
                <FieldError message={errors.name} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[#2E3A59]">E-mail</Label>
                <Input id="email" type="email" placeholder="seu@email.com" value={form.email} onChange={set('email')} />
                <FieldError message={errors.email} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cpf" className="text-[#2E3A59]">CPF</Label>
                <Input id="cpf" type="text" placeholder="000.000.000-00" value={form.cpf} onChange={set('cpf')} inputMode="numeric" />
                <FieldError message={errors.cpf} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-[#2E3A59]">Telefone</Label>
                <Input id="phone" type="text" placeholder="(00) 000000000" value={form.phone} onChange={set('phone')} inputMode="numeric" />
                <FieldError message={errors.phone} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="birth_date_display" className="text-[#2E3A59]">Data de nascimento</Label>
                <Input
                  id="birth_date_display"
                  type="text"
                  placeholder="DD/MM/AAAA"
                  value={form.birth_date_display}
                  onChange={set('birth_date_display')}
                  inputMode="numeric"
                />
                <FieldError message={errors.birth_date} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[#2E3A59]">Senha</Label>
                <Input id="password" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} />
                <FieldError message={errors.password} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password_confirmation" className="text-[#2E3A59]">Confirmar senha</Label>
                <Input id="password_confirmation" type="password" placeholder="••••••••" value={form.password_confirmation} onChange={set('password_confirmation')} />
                <FieldError message={errors.password_confirmation} />
              </div>

              <Button type="submit" disabled={loading} className="w-full mt-2">
                {loading ? 'Criando conta...' : 'Criar conta'}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-[#7C8DB5]">
              Já tem uma conta?{' '}
              <Link to="/login" className="font-semibold hover:underline text-[#34C38F]">
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
