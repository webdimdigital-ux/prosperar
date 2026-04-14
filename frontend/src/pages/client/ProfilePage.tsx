import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { UPDATE_PROFILE } from '@/graphql/mutations/auth'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCPF, formatPhone, formatDateMask, parseDateMask } from '@/lib/utils'

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs mt-1 text-destructive">{message}</p>
}

export function ProfilePage() {
  const { user, updateUser } = useAuth()

  const toDisplayDate = (iso: string | null | undefined) => {
    if (!iso) return ''
    return iso.substring(0, 10).split('-').reverse().join('/')
  }

  const [form, setForm] = useState({
    name: user?.name ?? '',
    phone: user?.phone ? formatPhone(user.phone) : '',
    birth_date: user?.birth_date ?? '',
    birth_date_display: toDisplayDate(user?.birth_date),
    password: '',
    password_confirmation: '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({})
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState('')
  const [updateProfile, { loading }] = useMutation(UPDATE_PROFILE)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
    if (k === 'phone') value = formatPhone(value)
    setForm(f => ({ ...f, [k]: value }))
    if (errors[k]) setErrors(prev => ({ ...prev, [k]: '' }))
  }

  const handleDateChange = (value: string) => {
    const masked = formatDateMask(value)
    const iso = parseDateMask(masked)
    setForm(f => ({ ...f, birth_date_display: masked, birth_date: iso }))
    if (errors.birth_date) setErrors(prev => ({ ...prev, birth_date: '' }))
  }

  const validate = (): boolean => {
    const next: Partial<Record<keyof typeof form, string>> = {}

    if (!form.name.trim()) next.name = 'Nome é obrigatório.'

    if (form.birth_date_display) {
      const digits = form.birth_date_display.replace(/\D/g, '')
      if (digits.length === 8 && !form.birth_date) next.birth_date = 'Data inválida.'
    }

    if (form.phone) {
      const digits = form.phone.replace(/\D/g, '')
      if (digits.length < 10) next.phone = 'Telefone inválido.'
    }

    if (form.password) {
      if (form.password.length < 8) next.password = 'Mínimo de 8 caracteres.'
      if (!form.password_confirmation) next.password_confirmation = 'Confirme a senha.'
      else if (form.password !== form.password_confirmation) next.password_confirmation = 'As senhas não coincidem.'
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setServerError('')
    setSuccess(false)
    try {
      const input: Record<string, string> = { name: form.name }
      if (form.phone) input.phone = form.phone.replace(/\D/g, '')
      if (form.birth_date) input.birth_date = form.birth_date
      if (form.password) {
        input.password = form.password
        input.password_confirmation = form.password_confirmation
      }
      const { data } = await updateProfile({ variables: { input } }) as {
        data?: { updateProfile?: { name: string; phone: string | null; birth_date: string | null } }
      }
      if (data?.updateProfile) {
        updateUser({
          name: data.updateProfile.name,
          phone: data.updateProfile.phone ?? null,
          birth_date: data.updateProfile.birth_date ?? null,
        })
      }
      setSuccess(true)
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Falha ao atualizar')
    }
  }

  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-lg font-semibold text-[#2E3A59]">Perfil</h1>

      {success && (
        <div className="p-3 bg-green-50 text-green-700 rounded-xl text-sm border border-green-200">
          Perfil atualizado.
        </div>
      )}
      {serverError && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-xl text-sm">
          {serverError}
        </div>
      )}

      <div className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(46,58,89,0.08)] p-6">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Nome */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome completo</Label>
            <Input id="name" type="text" value={form.name} onChange={set('name')} aria-invalid={!!errors.name} />
            <FieldError message={errors.name} />
          </div>

          {/* E-mail — bloqueado */}
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={user?.email ?? ''}
              disabled
              className="bg-muted text-muted-foreground cursor-not-allowed"
            />
          </div>

          {/* CPF — bloqueado */}
          <div className="space-y-1.5">
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              value={formatCPF(user?.cpf ?? '')}
              disabled
              className="bg-muted text-muted-foreground cursor-not-allowed"
            />
          </div>

          {/* Telefone */}
          <div className="space-y-1.5">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(00) 000000000"
              value={form.phone}
              onChange={set('phone')}
              inputMode="numeric"
              aria-invalid={!!errors.phone}
            />
            <FieldError message={errors.phone} />
          </div>

          {/* Data de nascimento */}
          <div className="space-y-1.5">
            <Label htmlFor="birth_date">Data de nascimento</Label>
            <Input
              id="birth_date"
              type="text"
              placeholder="DD/MM/AAAA"
              value={form.birth_date_display}
              onChange={e => handleDateChange(e.target.value)}
              inputMode="numeric"
              aria-invalid={!!errors.birth_date}
            />
            <FieldError message={errors.birth_date} />
          </div>

          {/* Nova senha */}
          <div className="space-y-1.5">
            <Label htmlFor="password">Nova senha (opcional)</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={set('password')}
              aria-invalid={!!errors.password}
            />
            <FieldError message={errors.password} />
          </div>

          {/* Confirmar senha — só aparece se digitou senha */}
          {form.password && (
            <div className="space-y-1.5">
              <Label htmlFor="password_confirmation">Confirmar senha</Label>
              <Input
                id="password_confirmation"
                type="password"
                placeholder="••••••••"
                value={form.password_confirmation}
                onChange={set('password_confirmation')}
                aria-invalid={!!errors.password_confirmation}
              />
              <FieldError message={errors.password_confirmation} />
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </form>
      </div>
    </div>
  )
}
