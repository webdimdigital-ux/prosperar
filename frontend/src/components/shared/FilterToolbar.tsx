import { useState } from 'react'
import { ListFilterIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { SearchBar } from '@/components/shared/SearchBar'

interface Props {
  search: string
  onSearch: (value: string) => void
  placeholder?: string
  filterCount?: number
  children?: React.ReactNode
}

export function FilterToolbar({ search, onSearch, placeholder, filterCount = 0, children }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <>
      {/* Mobile layout */}
      <div className="flex gap-2 sm:hidden">
        <div className="w-[80%]">
          <SearchBar value={search} onChange={onSearch} placeholder={placeholder} />
        </div>
        {children && (
          <Button
            variant="outline"
            className="relative w-[20%]"
            onClick={() => setSheetOpen(true)}
          >
            <ListFilterIcon className="size-4 shrink-0" />
            {filterCount > 0 && (
              <Badge className="absolute -top-2 -right-2 size-5 p-0 flex items-center justify-center text-[10px] bg-[#E8624A] text-white border-0 rounded-full">
                {filterCount}
              </Badge>
            )}
          </Button>
        )}
      </div>

      {/* Desktop layout */}
      <div className="hidden sm:flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-48">
          <SearchBar value={search} onChange={onSearch} placeholder={placeholder} />
        </div>
        {children}
      </div>

      {/* Filter Sheet (mobile only) */}
      {children && (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent side="bottom" className="rounded-t-xs px-6 pb-8">
            <SheetHeader className="mb-4">
              <SheetTitle>Filtros</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-3">
              {children}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  )
}
