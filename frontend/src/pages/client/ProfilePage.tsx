import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { UPDATE_PROFILE } from '@/graphql/mutations/auth'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ProfilePage() {
  const { user } = useAuth()
  const [form, setForm] = useState({ name: user?.name ?? '', phone: '', password: '', password_confirmation: '' })
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [updateProfile, { loading }] = useMutation(UPDATE_PROFILE)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    try {
      const input: Record<string, string> = { name: form.name }
      if (form.phone) input.phone = form.phone
      if (form.password) { input.password = form.password; input.password_confirmation = form.password_confirmation }
      await updateProfile({ variables: { input } })
      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Falha ao atualizar')
    }
  }

  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-lg font-semibold text-[#2E3A59]">Perfil</h1>
      {success && <div className="p-3 bg-green-50 text-green-700 rounded-xl text-sm border border-green-200">Perfil atualizado.</div>}
      {error && <div className="p-3 bg-destructive/10 text-destructive rounded-xl text-sm">{error}</div>}
      <div className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(46,58,89,0.08)] p-6">
        <p className="text-sm text-[#7C8DB5] mb-4">
          E-mail: <span className="text-[#2E3A59] font-medium">{user?.email}</span>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" type="text" required value={form.name} onChange={set('name')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" type="tel" value={form.phone} onChange={set('phone')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Nova senha (opcional)</Label>
            <Input id="password" type="password" value={form.password} onChange={set('password')} />
          </div>
          {form.password && (
            <div className="space-y-1.5">
              <Label htmlFor="password_confirmation">Confirmar senha</Label>
              <Input id="password_confirmation" type="password" value={form.password_confirmation} onChange={set('password_confirmation')} />
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
