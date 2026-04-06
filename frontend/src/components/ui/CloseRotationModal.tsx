import { useState } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { Icon } from './Icon'

interface Financials {
  totalRevenue: number
  totalExpenses: number
  profit: number
}

interface CloseRotationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
  rotationName: string
  currency?: string
  financials?: Financials
}

function fmt(n: number, currency = 'USD') {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
}

const CHECKS = [
  {
    id: 'revenue',
    label: "Je confirme le chiffre d'affaires total",
    sublabel: 'Le montant total des ventes et encaissements est exact et complet.',
  },
  {
    id: 'profit',
    label: 'Je confirme le résultat net de la rotation',
    sublabel: 'Le bénéfice net (ou la perte) calculé est conforme à la réalité.',
  },
  {
    id: 'expenses',
    label: 'Toutes les charges ont été enregistrées et payées',
    sublabel: 'Achats, frais divers, commissions — aucune dépense en attente ou oubliée.',
  },
  {
    id: 'cash',
    label: 'Le solde de trésorerie correspond au solde réel du compte',
    sublabel: 'Rapprochement effectué : les liquidités affichées concordent avec le compte bancaire.',
  },
]

export function CloseRotationModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
  rotationName,
  currency = 'USD',
  financials,
}: CloseRotationModalProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  const allChecked = CHECKS.every((c) => checked[c.id])

  const toggle = (id: string) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }))

  const handleClose = () => {
    setChecked({})
    onClose()
  }

  const handleConfirm = () => {
    if (allChecked) onConfirm()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Clôturer la rotation">
      <div className="space-y-4">
        {/* Warning banner */}
        <div className="flex items-start gap-3 p-3.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl">
          <Icon name="alert" size={15} className="text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Action irréversible</p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
              La clôture de <strong>{rotationName}</strong> est définitive. Vérifiez les informations ci-dessous avant de confirmer.
            </p>
          </div>
        </div>

        {/* Financial summary — shown only when detail data is available */}
        {financials && (
          <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
            <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800/60">
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                Synthèse financière
              </p>
            </div>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Chiffre d'affaires</span>
                <span className="text-sm font-semibold text-emerald-600">{fmt(financials.totalRevenue, currency)}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Charges totales</span>
                <span className="text-sm font-semibold text-red-500">−{fmt(financials.totalExpenses, currency)}</span>
              </div>
              <div
                className={`flex items-center justify-between px-4 py-2.5 ${
                  financials.profit >= 0
                    ? 'bg-emerald-50 dark:bg-emerald-950/20'
                    : 'bg-red-50 dark:bg-red-950/20'
                }`}
              >
                <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Bénéfice net</span>
                <span
                  className={`text-sm font-bold ${
                    financials.profit >= 0
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-red-600'
                  }`}
                >
                  {financials.profit >= 0 ? '+' : ''}
                  {fmt(financials.profit, currency)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Checklist */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
            Checklist de clôture
          </p>
          {CHECKS.map((c, i) => (
            <label
              key={c.id}
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                checked[c.id]
                  ? 'border-emi-violet bg-violet-50 dark:bg-violet-950/20'
                  : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700'
              }`}
            >
              {/* Custom checkbox */}
              <div className="relative mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  checked={!!checked[c.id]}
                  onChange={() => toggle(c.id)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                    checked[c.id]
                      ? 'bg-emi-violet'
                      : 'border-2 border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900'
                  }`}
                >
                  {checked[c.id] && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path
                        d="M1.5 5L4 7.5L8.5 2.5"
                        stroke="white"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 leading-snug">
                  <span className="text-xs font-semibold text-zinc-400 mr-1.5">{i + 1}.</span>
                  {c.label}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{c.sublabel}</p>
              </div>
            </label>
          ))}
        </div>

        {/* Progress hint */}
        {!allChecked && (
          <p className="text-xs text-center text-zinc-400">
            {CHECKS.filter((c) => checked[c.id]).length}/{CHECKS.length} confirmations requises pour clôturer
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={handleClose} className="flex-1">
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            loading={loading}
            disabled={!allChecked}
            className="flex-1"
          >
            Clôturer
          </Button>
        </div>
      </div>
    </Modal>
  )
}
