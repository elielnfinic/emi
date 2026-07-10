import pdfMake, { fmtMoney } from '#services/pdf_service'
import Proforma from '#models/proforma'

/**
 * Builds a proforma PDF as a Buffer. `proforma` must already be preloaded
 * with `items`, `customer` and `business`.
 */
export async function buildProformaPdf(proforma: Proforma): Promise<Buffer> {
  const currency = proforma.business.currency || 'USD'

  const itemRows = proforma.items.map((item) => [
    item.name,
    { text: String(item.quantity), alignment: 'right' },
    { text: fmtMoney(Number(item.unitPrice), currency), alignment: 'right' },
    { text: fmtMoney(Number(item.totalPrice), currency), alignment: 'right' },
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const docDefinition: Record<string, any> = {
    content: [
      { text: proforma.business.name, style: 'businessName' },
      proforma.business.address ? { text: proforma.business.address, style: 'muted' } : {},
      proforma.business.phone ? { text: proforma.business.phone, style: 'muted' } : {},
      { text: 'FACTURE PROFORMA', style: 'title', margin: [0, 20, 0, 4] },
      { text: proforma.reference, style: 'reference' },
      {
        columns: [
          {
            width: '50%',
            text: [
              { text: 'Client: ', bold: true },
              proforma.customer?.name ?? 'Client de passage',
            ],
          },
          {
            width: '50%',
            alignment: 'right',
            text: [
              { text: 'Date: ', bold: true },
              String(proforma.date).slice(0, 10),
              proforma.validUntil
                ? `\nValide jusqu'au: ${String(proforma.validUntil).slice(0, 10)}`
                : '',
            ],
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
              { text: 'Prix unitaire', style: 'tableHeader', alignment: 'right' },
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
                  { text: 'Total', bold: true, margin: [0, 4, 12, 4] },
                  {
                    text: fmtMoney(Number(proforma.totalAmount), currency),
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
      proforma.notes ? { text: proforma.notes, style: 'muted', margin: [0, 20, 0, 0] } : {},
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
