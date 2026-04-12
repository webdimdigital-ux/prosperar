import { DownloadIcon, LoaderCircleIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDownload } from '@/hooks/useDownload'

interface Props {
  examId: string
  filename?: string
  disabled?: boolean
}

export function DownloadButton({ examId, filename, disabled }: Props) {
  const { download, downloading } = useDownload()
  const isLoading = downloading === examId

  return (
    <Button
      size="sm"
      onClick={() => download(examId, filename)}
      disabled={disabled || isLoading}
    >
      {isLoading
        ? <><LoaderCircleIcon className="size-3.5 animate-spin" /> Baixando…</>
        : <><DownloadIcon className="size-3.5" /> Baixar PDF</>
      }
    </Button>
  )
}
