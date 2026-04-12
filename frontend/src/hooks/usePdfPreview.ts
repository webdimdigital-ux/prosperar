import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL ?? ''

export function usePdfPreview() {
  const [loading, setLoading] = useState(false)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [examId, setExamId] = useState<string | null>(null)

  const preview = async (id: string) => {
    if (examId === id && blobUrl) return
    setLoading(true)
    setExamId(id)
    setBlobUrl(null)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/exams/${id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('Failed to load PDF')
      const blob = await response.blob()
      setBlobUrl(URL.createObjectURL(blob))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const clear = () => {
    if (blobUrl) URL.revokeObjectURL(blobUrl)
    setBlobUrl(null)
    setExamId(null)
  }

  return { preview, clear, blobUrl, loading, examId }
}
