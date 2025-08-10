import './globals.css'
import Providers from '@/components/Providers'
import NavBar from '@/components/NavBar'

export const metadata = {
  title: 'Streamlens',
  description: 'Track and analyze YouTube video watch events and sessions',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <NavBar />
          {children}
        </Providers>
      </body>
    </html>
  )
}
