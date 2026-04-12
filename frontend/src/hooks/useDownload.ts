import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export function useDownload() {
  const [downloading, setDownloading] = useState<string | null>(null)

  const download = async (examId: string, filename?: string) => {
    setDownloading(examId)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/exams/${examId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error('Download failed')

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename ?? `exam-${examId}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
    } finally {
      setDownloading(null)
    }
  }

  return { download, downloading }
}
