'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export default function NavBar() {
  const { user, signOut } = useAuth()

  return (
    <nav className="w-full flex justify-between items-center p-4 bg-white/70 backdrop-blur border-b">
      <div className="flex items-center gap-2">
        <Link href="/" className="text-2xl font-bold text-blue-700 tracking-wide">Streamlens</Link>
      </div>
      <div className="flex items-center gap-2">
        <Link href="/all-events"><Button variant="ghost">All Events</Button></Link>
        <Link href="/top"><Button variant="ghost">Top</Button></Link>
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


