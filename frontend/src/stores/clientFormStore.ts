import { create } from 'zustand'

export interface ClientFormFields {
  name: string
  email: string
  cpf: string
  phone: string
  password: string
  status: string
}

export type ClientFormErrors = Partial<Record<keyof ClientFormFields, string>>

interface ClientFormStore {
  fields: ClientFormFields
  errors: ClientFormErrors
  editId: string | null
  isOpen: boolean
  setField: <K extends keyof ClientFormFields>(key: K, value: ClientFormFields[K]) => void
  setEditId: (id: string | null) => void
  open: (initial?: Partial<ClientFormFields>, editId?: string | null) => void
  close: () => void
  validate: () => boolean
  reset: () => void
}

const empty: ClientFormFields = {
  name: '',
  email: '',
  cpf: '',
  phone: '',
  password: '',
  status: 'active',
}

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

export const useClientFormStore = create<ClientFormStore>((set, get) => ({
  fields: { ...empty },
  errors: {},
  editId: null,
  isOpen: false,

  setField: (key, value) =>
    set(s => ({
      fields: { ...s.fields, [key]: value },
      errors: { ...s.errors, [key]: undefined },
    })),

  setEditId: (id) => set({ editId: id }),

  open: (initial = {}, editId = null) =>
    set({ isOpen: true, editId, fields: { ...empty, ...initial }, errors: {} }),

  close: () => set({ isOpen: false, editId: null, fields: { ...empty }, errors: {} }),

  validate: () => {
    const { fields, editId } = get()
    const errs: ClientFormErrors = {}

    if (!fields.name.trim()) errs.name = 'Nome é obrigatório'
    if (!fields.email.trim()) errs.email = 'E-mail é obrigatório'
    else if (!isValidEmail(fields.email)) errs.email = 'E-mail inválido'
    if (!editId) {
      if (!fields.cpf.trim()) errs.cpf = 'ID do paciente é obrigatório'
      if (!fields.password.trim()) errs.password = 'Senha é obrigatória'
      else if (fields.password.length < 6) errs.password = 'Mínimo 6 caracteres'
    }

    set({ errors: errs })
    return Object.keys(errs).length === 0
  },

  reset: () => set({ fields: { ...empty }, errors: {}, editId: null }),
}))
