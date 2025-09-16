import './globals.css'
import Providers from '@/components/Providers'
import NavBar from '@/components/NavBar'
import { Montserrat } from 'next/font/google'

const montserrat = Montserrat({ subsets: ['latin'], weight: ['400','600','700'] })

export const metadata = {
  title: 'Streamlens',
  description: 'Track and analyze YouTube video watch events and sessions',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={montserrat.className}>
        <Providers>
          <NavBar />
          {children}
        </Providers>
      </body>
    </html>
  )
}
