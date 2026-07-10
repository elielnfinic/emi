declare module 'pdfmake' {
  export interface PdfMakeFontDescriptor {
    normal: string
    bold?: string
    italics?: string
    bolditalics?: string
  }

  export interface PdfMakeDocument {
    getBuffer(): Promise<Buffer>
  }

  export interface PdfMakeInstance {
    setFonts(fonts: Record<string, PdfMakeFontDescriptor>): void
    addFonts(fonts: Record<string, PdfMakeFontDescriptor>): void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createPdf(docDefinition: Record<string, any>): PdfMakeDocument
  }

  const pdfMake: PdfMakeInstance
  export default pdfMake
}
