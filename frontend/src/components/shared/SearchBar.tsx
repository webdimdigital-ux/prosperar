import { useEffect, useState } from 'react'
import { SearchIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChange, placeholder = 'Buscar...' }: Props) {
  const [local, setLocal] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => onChange(local), 300)
    return () => clearTimeout(timer)
  }, [local])

  return (
    <div className="relative">
      <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 pointer-events-none z-10" style={{ color: '#B0BBCF' }} />
      <Input
        type="text"
        value={local}
        onChange={e => setLocal(e.target.value)}
        placeholder={placeholder}
        className="pl-9"
      />
    </div>
  )
}
