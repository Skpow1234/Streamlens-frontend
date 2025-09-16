'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useTheme } from '@/context/ThemeContext'
import { Switch } from '@/components/ui/switch'
import { usePathname } from 'next/navigation'

export default function NavBar(): JSX.Element {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const pathname = usePathname()
  const isActive = (href: string): boolean => pathname === href

  return (
    <nav className="w-full flex justify-between items-center p-4 bg-white/70 backdrop-blur border-b">
      <div className="flex items-center gap-2">
        <Link href="/" className="text-2xl font-bold text-blue-700 tracking-wide">Streamlens</Link>
      </div>
      <div className="flex items-center gap-2">
        <Link href="/all-events"><Button variant={isActive('/all-events') ? 'secondary' : 'ghost'}>All Events</Button></Link>
        <Link href="/top"><Button variant={isActive('/top') ? 'secondary' : 'ghost'}>Top</Button></Link>
        <div className="flex items-center gap-2 px-2">
          <span className="text-xs text-muted-foreground">Dark</span>
          <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
        </div>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary">{user.username}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex gap-2">
            <Link href="/sign-in"><Button>Sign In</Button></Link>
            <Link href="/sign-up"><Button variant="outline">Sign Up</Button></Link>
          </div>
        )}
      </div>
    </nav>
  )
}


