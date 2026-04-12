import { create } from 'zustand'

export interface UploadFormFields {
  hospital_id: string
  exam_date: string
  observations: string
}

export type UploadFormErrors = Partial<Record<keyof UploadFormFields | 'file', string>>

interface UploadFormStore {
  fields: UploadFormFields
  errors: UploadFormErrors
  file: File | null
  setField: <K extends keyof UploadFormFields>(key: K, value: UploadFormFields[K]) => void
  setFile: (file: File | null) => void
  validate: () => boolean
  reset: () => void
}

const empty: UploadFormFields = {
  hospital_id: '',
  exam_date: '',
  observations: '',
}

export const useUploadFormStore = create<UploadFormStore>((set, get) => ({
  fields: { ...empty },
  errors: {},
  file: null,

  setField: (key, value) =>
    set(s => ({
      fields: { ...s.fields, [key]: value },
      errors: { ...s.errors, [key]: undefined },
    })),

  setFile: (file) =>
    set({ file, errors: { ...get().errors, file: undefined } }),

  validate: () => {
    const { fields, file } = get()
    const errs: UploadFormErrors = {}

    if (!fields.hospital_id) errs.hospital_id = 'Selecione uma unidade'
    if (!fields.exam_date) errs.exam_date = 'Data do exame é obrigatória'
    if (!file) errs.file = 'Selecione um arquivo PDF'

    set({ errors: errs })
    return Object.keys(errs).length === 0
  },

  reset: () => set({ fields: { ...empty }, errors: {}, file: null }),
}))
