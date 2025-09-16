import './globals.css'
import Providers from '@/components/Providers'
import NavBar from '@/components/NavBar'
import { Montserrat } from 'next/font/google'
import { Metadata } from 'next'

const montserrat = Montserrat({ subsets: ['latin'], weight: ['400','600','700'] })

export const metadata: Metadata = {
  title: 'Streamlens',
  description: 'Track and analyze YouTube video watch events and sessions',
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
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
