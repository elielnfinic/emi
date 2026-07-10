import pdfMake, { fmtMoney } from '#services/pdf_service'
import Requisition from '#models/requisition'

const STATUS_LABEL: Record<string, string> = {
  draft: 'Brouillon',
  pending: 'En attente',
  approved: 'Approuvée',
  rejected: 'Rejetée',
  converted: 'Convertie',
}

export interface RequisitionPdfOptions {
  includeEmail?: boolean
  includeName?: boolean
  includeSupplier?: boolean
  includeNeededBy?: boolean
}

/**
 * Builds a requisition PDF as a Buffer. `requisition` must already be
 * preloaded with `items`, `supplier`, `user`, `approvedBy` and `business`.
 */
export async function buildRequisitionPdf(
  requisition: Requisition,
  options: RequisitionPdfOptions = {}
): Promise<Buffer> {
  const {
    includeEmail = true,
    includeName = true,
    includeSupplier = true,
    includeNeededBy = true,
  } = options
  const currency = requisition.business.currency || 'USD'

  const itemRows = requisition.items.map((item) => [
    item.name,
    { text: String(item.quantity), alignment: 'right' },
    { text: fmtMoney(Number(item.estimatedUnitPrice ?? 0), currency), alignment: 'right' },
    {
      text: fmtMoney(Number(item.quantity) * Number(item.estimatedUnitPrice ?? 0), currency),
      alignment: 'right',
    },
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leftLines: any[] = []
  if (includeSupplier) {
    if (leftLines.length) leftLines.push('\n')
    leftLines.push({ text: 'Fournisseur: ', bold: true }, requisition.supplier?.name ?? 'Non spécifié')
  }
  if (includeName) {
    if (leftLines.length) leftLines.push('\n')
    leftLines.push({ text: 'Demandeur: ', bold: true }, requisition.user?.fullName ?? '—')
  }
  if (includeEmail) {
    if (leftLines.length) leftLines.push('\n')
    leftLines.push({ text: 'Email: ', bold: true }, requisition.user?.email ?? '—')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rightLines: any[] = [{ text: 'Date: ', bold: true }, String(requisition.date).slice(0, 10)]
  if (includeNeededBy && requisition.neededByDate) {
    rightLines.push(`\nBesoin avant le: ${String(requisition.neededByDate).slice(0, 10)}`)
  }
  if (requisition.approvedBy) {
    rightLines.push(`\nApprouvé par: ${requisition.approvedBy.fullName ?? requisition.approvedBy.email}`)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const docDefinition: Record<string, any> = {
    content: [
      { text: requisition.business.name, style: 'businessName' },
      requisition.business.address ? { text: requisition.business.address, style: 'muted' } : {},
      requisition.business.phone ? { text: requisition.business.phone, style: 'muted' } : {},
      { text: 'BON DE RÉQUISITION', style: 'title', margin: [0, 20, 0, 4] },
      { text: `${requisition.reference} · ${STATUS_LABEL[requisition.status] ?? requisition.status}`, style: 'reference' },
      {
        columns: [
          {
            width: '50%',
            text: leftLines.length ? leftLines : '',
          },
          {
            width: '50%',
            alignment: 'right',
            text: rightLines,
          },
        ],
        margin: [0, 16, 0, 16],
      },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto'],
          body: [
            [
              { text: 'Article', style: 'tableHeader' },
              { text: 'Qté', style: 'tableHeader', alignment: 'right' },
              { text: 'Prix estimé', style: 'tableHeader', alignment: 'right' },
              { text: 'Total', style: 'tableHeader', alignment: 'right' },
            ],
            ...itemRows,
          ],
        },
        layout: 'lightHorizontalLines',
      },
      {
        columns: [
          { width: '*', text: '' },
          {
            width: 'auto',
            table: {
              body: [
                [
                  { text: 'Total estimé', bold: true, margin: [0, 4, 12, 4] },
                  {
                    text: fmtMoney(Number(requisition.totalAmount), currency),
                    bold: true,
                    alignment: 'right',
                    margin: [0, 4, 0, 4],
                  },
                ],
              ],
            },
            layout: 'noBorders',
          },
        ],
        margin: [0, 12, 0, 0],
      },
      requisition.status === 'rejected' && requisition.rejectionReason
        ? { text: `Motif du rejet: ${requisition.rejectionReason}`, style: 'muted', margin: [0, 20, 0, 0] }
        : {},
      requisition.notes ? { text: requisition.notes, style: 'muted', margin: [0, 8, 0, 0] } : {},
    ],
    styles: {
      businessName: { fontSize: 16, bold: true },
      muted: { fontSize: 9, color: '#666666' },
      title: { fontSize: 14, bold: true },
      reference: { fontSize: 10, color: '#666666' },
      tableHeader: { bold: true, fontSize: 10, color: '#333333' },
    },
    defaultStyle: { fontSize: 10 },
  }

  const pdfDoc = pdfMake.createPdf(docDefinition)
  return pdfDoc.getBuffer()
}
