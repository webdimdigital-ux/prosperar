import { useEffect, useRef } from 'react'
import { DownloadIcon, PrinterIcon, LoaderCircleIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { useDownload } from '@/hooks/useDownload'

interface Props {
  open: boolean
  onClose: () => void
  examId: string
  examName: string
  clientName: string
  examDate: string
  blobUrl: string | null
  loading: boolean
}

export function PdfViewerDialog({ open, onClose, examId, examName, clientName, examDate, blobUrl, loading }: Props) {
  const { download, downloading } = useDownload()
  const printRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const handlePrint = () => {
    printRef.current?.contentWindow?.print()
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full max-w-4xl flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle>{clientName || examName}</SheetTitle>
          <SheetDescription>Exame #{examId} — {examDate}</SheetDescription>
        </SheetHeader>

        {/* Toolbar */}
        <div className="flex items-center justify-end px-6 py-3 border-b bg-muted/30">
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              disabled={!blobUrl || loading}
            >
              <PrinterIcon className="size-4 mr-2" />
              Imprimir
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => download(examId, `${examName}.pdf`)}
              disabled={downloading === examId || loading}
            >
              {downloading === examId
                ? <LoaderCircleIcon className="size-4 mr-2 animate-spin" />
                : <DownloadIcon className="size-4 mr-2" />}
              Download
            </Button>
          </div>
        </div>

        {/* PDF area */}
        <div className="flex-1 relative bg-muted/10">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <LoaderCircleIcon className="size-8 animate-spin text-primary" />
            </div>
          )}
          {blobUrl && !loading && (
            <iframe
              ref={printRef}
              src={`${blobUrl}#toolbar=0&navpanes=0&scrollbar=0`}
              className="w-full h-full border-0"
              title="Visualizador de exame"
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
