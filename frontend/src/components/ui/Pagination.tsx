import type { PaginationMeta } from '../../types'

interface PaginationProps {
  meta: PaginationMeta
  onPageChange: (page: number) => void
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  const { currentPage, lastPage, total, perPage } = meta

  const from = total === 0 ? 0 : (currentPage - 1) * perPage + 1
  const to = Math.min(currentPage * perPage, total)

  const pages: (number | '...')[] = []
  if (lastPage <= 7) {
    for (let i = 1; i <= lastPage; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push('...')
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(lastPage - 1, currentPage + 1); i++) {
      pages.push(i)
    }
    if (currentPage < lastPage - 2) pages.push('...')
    pages.push(lastPage)
  }

  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-t border-zinc-100 dark:border-zinc-800">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        {total === 0
          ? 'Aucun résultat'
          : <><span className="font-medium text-zinc-700 dark:text-zinc-300">{from}–{to}</span> sur <span className="font-medium text-zinc-700 dark:text-zinc-300">{total}</span></>
        }
      </p>
      {lastPage > 1 && (
        <div className="flex items-center gap-1">
          <PageBtn onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>‹</PageBtn>
          {pages.map((p, i) =>
            p === '...' ? (
              <span key={`e-${i}`} className="px-1 text-xs text-zinc-400">…</span>
            ) : (
              <PageBtn
                key={p}
                active={p === currentPage}
                onClick={() => onPageChange(p as number)}
              >
                {p}
              </PageBtn>
            )
          )}
          <PageBtn onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === lastPage}>›</PageBtn>
        </div>
      )}
    </div>
  )
}

function PageBtn({ children, active, disabled, onClick }: { children: React.ReactNode; active?: boolean; disabled?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`min-w-[30px] h-[30px] px-1.5 text-xs font-medium rounded-lg transition-colors
        disabled:opacity-40 disabled:cursor-not-allowed
        ${active
          ? 'bg-emi-violet text-white shadow-sm shadow-emi-violet/25'
          : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
        }`}
    >
      {children}
    </button>
  )
}
