import { BaseMail } from '@adonisjs/mail'
import Proforma from '#models/proforma'

export default class ProformaMail extends BaseMail {
  from = { address: process.env.SMTP_FROM_ADDRESS || 'noreply@emi.local', name: 'Emi' }

  constructor(
    private proforma: Proforma,
    private pdfBuffer: Buffer,
    private toEmail: string,
    private customMessage?: string | null
  ) {
    super()
    this.subject = `Facture proforma ${proforma.reference}`
  }

  prepare() {
    const businessName = this.proforma.business?.name ?? 'Emi'
    const customerName = this.proforma.customer?.name ?? ''

    this.message.to(this.toEmail)
    this.message.html(`
      <p>Bonjour ${customerName},</p>
      <p>Veuillez trouver ci-joint la facture proforma <strong>${this.proforma.reference}</strong> de la part de ${businessName}.</p>
      ${this.customMessage ? `<p>${this.customMessage}</p>` : ''}
      <p>Cordialement,<br />${businessName}</p>
    `)
    this.message.attachData(this.pdfBuffer, {
      filename: `${this.proforma.reference}.pdf`,
      contentType: 'application/pdf',
    })
  }
}
