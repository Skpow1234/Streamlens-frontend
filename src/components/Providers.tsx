'use client'

import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { Toaster } from '@/components/ui/sonner'

interface ProvidersProps {
  children: React.ReactNode
}

export default function Providers({ children }: ProvidersProps): JSX.Element {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </ThemeProvider>
  )
}


