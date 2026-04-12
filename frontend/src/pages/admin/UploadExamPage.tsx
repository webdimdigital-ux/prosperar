import { useRef, useState } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import { UPLOAD_EXAM } from '@/graphql/queries/exams'
import { GET_HOSPITALS } from '@/graphql/queries/hospitals'
import { useUploadFormStore } from '@/stores/uploadFormStore'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { UploadCloudIcon, FileTextIcon, XIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageError { page: number; reason: string }
interface UploadResult { total: number; processed: number; failed: number; errors: PageError[] }

export function UploadExamPage() {
  const store = useUploadFormStore()
  const [result, setResult] = useState<UploadResult | null>(null)
  const [serverError, setServerError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const { data: hospitalsData } = useQuery<any>(GET_HOSPITALS, { variables: { first: 100 } })
  const hospitals = hospitalsData?.hospitals?.data ?? []

  const [uploadExam, { loading }] = useMutation<any>(UPLOAD_EXAM)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!store.validate()) return
    setServerError('')
    setResult(null)
    try {
      const { data } = await uploadExam({
        variables: { input: { ...store.fields, file: store.file } },
        context: { headers: { 'Apollo-Require-Preflight': 'true' } },
      })
      setResult(data.uploadExam)
      store.reset()
      if (fileRef.current) fileRef.current.value = ''
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Falha no upload')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f && f.type === 'application/pdf') store.setFile(f)
  }

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true) }
  const handleDragLeave = () => setDragOver(false)

  const { fields, errors, file } = store

  return (
    <div className="max-w-lg space-y-4">

      {serverError && (
        <div className="p-4 text-sm text-red-700 bg-[#FEE2E2] rounded-2xl">
          {serverError}
        </div>
      )}

      {result && (
        <div className="p-4 space-y-2 text-sm bg-[#EAF7F2] rounded-2xl">
          <p className="font-semibold text-[#2BAF7A]">
            Upload concluído: {result.processed} de {result.total} páginas processadas com sucesso.
          </p>
          {result.failed > 0 && (
            <div>
              <p className="font-medium text-red-500">Páginas com erro:</p>
              <ul className="list-disc list-inside text-red-500">
                {result.errors.map(e => <li key={e.page}>Página {e.page}: {e.reason}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(46,58,89,0.08)] p-6">
        <p className="text-base font-semibold mb-5 text-[#2E3A59]">
          Dados do exame
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Unidade */}
            <div className="space-y-1.5">
              <Label>Unidade</Label>
              <Select value={fields.hospital_id} onValueChange={v => store.setField('hospital_id', v)}>
                <SelectTrigger aria-invalid={!!errors.hospital_id}>
                  <SelectValue placeholder="Selecione a unidade" />
                </SelectTrigger>
                <SelectContent>
                  {hospitals.map((h: { id: string; name: string }) => (
                    <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.hospital_id && <p className="text-xs text-destructive">{errors.hospital_id}</p>}
            </div>

            {/* Data */}
            <div className="space-y-1.5">
              <Label htmlFor="exam_date">Data do exame</Label>
              <DatePicker
                value={fields.exam_date}
                onChange={v => store.setField('exam_date', v)}
                placeholder="Selecionar data"
                className={errors.exam_date ? 'border-destructive' : ''}
              />
              {errors.exam_date && <p className="text-xs text-destructive">{errors.exam_date}</p>}
            </div>

            {/* Observações */}
            <div className="space-y-1.5">
              <Label htmlFor="observations">Observações</Label>
              <Textarea id="observations" value={fields.observations} rows={3}
                onChange={e => store.setField('observations', e.target.value)} />
            </div>

            {/* Arquivo — Drag & Drop */}
            <div className="space-y-1.5">
              <Label>Arquivo PDF</Label>
              <input
                ref={fileRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={e => store.setFile(e.target.files?.[0] ?? null)}
              />

              {file ? (
                <div className="flex items-center gap-3 px-4 py-3 border border-primary bg-[#f0f7ff] rounded-xl">
                  <FileTextIcon className="size-5 text-primary shrink-0" strokeWidth={1.5} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#2E3A59] truncate">{file.name}</p>
                    <p className="text-xs text-[#7C8DB5]">{(file.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { store.setFile(null); if (fileRef.current) fileRef.current.value = '' }}
                    className="text-[#7C8DB5] hover:text-destructive transition-colors"
                  >
                    <XIcon className="size-4" />
                  </button>
                </div>
              ) : (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileRef.current?.click()}
                  className={cn(
                    'flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors',
                    dragOver
                      ? 'border-primary bg-[#f0f7ff]'
                      : errors.file
                        ? 'border-destructive bg-destructive/5'
                        : 'border-[#E8ECF4] hover:border-primary hover:bg-[#f0f7ff]'
                  )}
                >
                  <UploadCloudIcon
                    className={cn('size-10', dragOver ? 'text-primary' : 'text-[#7C8DB5]')}
                    strokeWidth={1.5}
                  />
                  <p className="text-sm font-medium text-[#2E3A59]">
                    {dragOver ? 'Solte o arquivo aqui' : 'Arraste o PDF aqui'}
                  </p>
                  <p className="text-xs text-[#7C8DB5]">ou <span className="text-primary font-medium">clique para selecionar</span></p>
                </div>
              )}
              {errors.file && <p className="text-xs text-destructive">{errors.file}</p>}
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Processando...' : 'Enviar e processar'}
            </Button>
        </form>
      </div>
    </div>
  )
}
