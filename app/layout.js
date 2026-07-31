import { Cormorant_Garamond, Jost } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-cormorant',
})

const jost = Jost({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jost',
})

export const metadata = {
  title: 'NadunVish',
  description: 'Wedding and event violinist',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable}`}>
      <body className="bg-ivory text-charcoal font-sans">{children}</body>
    </html>
  )
}