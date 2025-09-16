'use client'

import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { PreferencesProvider } from '@/context/PreferencesContext'
import { NotificationProvider } from '@/hooks/useNotifications'
import { Toaster } from '@/components/ui/sonner'

interface ProvidersProps {
  children: React.ReactNode
}

export default function Providers({ children }: ProvidersProps): JSX.Element {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PreferencesProvider>
          <NotificationProvider>
            {children}
            <Toaster richColors position="top-right" />
          </NotificationProvider>
        </PreferencesProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}


