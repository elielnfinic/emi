import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import pdfMake from 'pdfmake'

const pdfmakeEntry = fileURLToPath(import.meta.resolve('pdfmake'))
const fontsDir = join(dirname(pdfmakeEntry), '..', 'fonts', 'Roboto')

pdfMake.setFonts({
  Roboto: {
    normal: join(fontsDir, 'Roboto-Regular.ttf'),
    bold: join(fontsDir, 'Roboto-Medium.ttf'),
    italics: join(fontsDir, 'Roboto-Italic.ttf'),
    bolditalics: join(fontsDir, 'Roboto-MediumItalic.ttf'),
  },
})

export function fmtMoney(n: number, currency: string) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n)
}

export default pdfMake
