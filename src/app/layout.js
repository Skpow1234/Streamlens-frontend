'use client';
import "./globals.css";
import { AuthProvider, useAuth } from "../context/AuthContext";
import Link from "next/link";
import Head from "next/head";

function NavBar() {
  const { user, signOut } = useAuth();
  return (
    <nav className="w-full flex justify-between items-center p-4 bg-gray-100 gap-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold text-blue-700 tracking-wide">Streamlens</span>
      </div>
      <div className="flex gap-2 items-center">
        {user ? (
          <>
            <span className="mr-2">Signed in as <b>{user.username}</b></span>
            <button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600" onClick={signOut}>Sign Out</button>
          </>
        ) : (
          <>
            <Link href="/sign-in"><button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Sign In</button></Link>
            <Link href="/sign-up"><button className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">Sign Up</button></Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <title>Streamlens</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body>
        <AuthProvider>
          <NavBar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
