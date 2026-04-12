import { useState } from 'react'
import { MoreHorizontalIcon, EyeIcon, Trash2Icon, DownloadIcon, PencilIcon, LoaderCircleIcon } from 'lucide-react'
import { useMutation } from '@apollo/client/react'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { usePdfPreview } from '@/hooks/usePdfPreview'
import { useDownload } from '@/hooks/useDownload'
import { PdfViewerDialog } from '@/components/shared/PdfViewerDialog'
import { DELETE_EXAM } from '@/graphql/mutations/exams'

interface Props {
  examId: string
  examName: string
  clientName: string
  examDate: string
  isAdmin?: boolean
  onDeleted?: () => void
  onEdit?: () => void
}

export function ExamActionsMenu({ examId, examName, clientName, examDate, isAdmin, onDeleted, onEdit }: Props) {
  const [viewerOpen, setViewerOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const { preview, clear, blobUrl, loading: previewing } = usePdfPreview()
  const { download, downloading } = useDownload()
  const [deleteExam, { loading: deleting }] = useMutation(DELETE_EXAM)

  const handleView = () => {
    setViewerOpen(true)
    preview(examId)
  }

  const handleViewerClose = () => {
    setViewerOpen(false)
    clear()
  }

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    await deleteExam({ variables: { id: examId } })
    setConfirmDelete(false)
    onDeleted?.()
  }

  return (
    <>
      <DropdownMenu onOpenChange={open => { if (!open) setConfirmDelete(false) }}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="size-8 p-0">
            {downloading === examId
              ? <LoaderCircleIcon className="size-4 animate-spin" />
              : <MoreHorizontalIcon className="size-4" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleView}>
            <EyeIcon className="size-4 text-[#7C8DB5]" />
            Visualizar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => download(examId, `${examName}.pdf`)}>
            <DownloadIcon className="size-4 text-[#7C8DB5]" />
            {downloading === examId ? 'Baixando...' : 'Baixar PDF'}
          </DropdownMenuItem>
          {isAdmin && onEdit && (
            <DropdownMenuItem onClick={onEdit}>
              <PencilIcon className="size-4 text-[#7C8DB5]" />
              Editar
            </DropdownMenuItem>
          )}
          {isAdmin && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                onClick={handleDelete}
                disabled={deleting}
              >
                <Trash2Icon className="size-4" />
                {deleting ? 'Removendo...' : confirmDelete ? 'Confirmar remoção' : 'Remover'}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <PdfViewerDialog
        open={viewerOpen}
        onClose={handleViewerClose}
        examId={examId}
        examName={examName}
        clientName={clientName}
        examDate={examDate}
        blobUrl={blobUrl}
        loading={previewing}
      />
    </>
  )
}
