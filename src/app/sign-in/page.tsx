'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { FaApple } from 'react-icons/fa';
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { FormEvent } from 'react';

export default function SignInPage(): JSX.Element {
  const { signIn } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(username, password);
      toast.success('Signed in successfully')
      router.push('/');
    } catch (err) {
      setError((err as Error).message);
      toast.error((err as Error).message || 'Failed to sign in')
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  // Dummy handlers for social sign-in (replace with real logic as needed)
  const handleGoogleSignIn = (): void => {
    alert('Google sign-in coming soon!');
  };
  const handleAppleSignIn = (): void => {
    alert('Apple sign-in coming soon!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <AnimatePresence>
        <motion.div
          className="streamlens-card w-full"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.5, type: 'spring' }}
        >
          <h2 className="streamlens-heading mb-2">Sign in to your account</h2>
          <p className="mb-6 text-center text-base text-gray-600">Welcome back! Please sign in.</p>

          {/* Social sign-in buttons */}
          <div className="flex flex-col gap-3 w-full max-w-[400px] mx-auto mb-6">
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 transition-colors font-semibold text-base shadow-sm"
              onClick={handleGoogleSignIn}
              type="button"
              aria-label="Sign in with Google"
            >
              <FcGoogle size={22} /> Sign in with Google
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 transition-colors font-semibold text-base shadow-sm"
              onClick={handleAppleSignIn}
              type="button"
              aria-label="Sign in with Apple"
            >
              <FaApple size={20} /> Sign in with Apple
            </motion.button>
          </div>

          <div className="w-full flex items-center mb-6">
            <div className="flex-grow h-px bg-gray-300" />
            <span className="mx-3 text-gray-400 text-sm">or</span>
            <div className="flex-grow h-px bg-gray-300" />
          </div>

          <motion.form
            className={`w-full flex flex-col items-center ${shake ? 'animate-shake' : ''}`}
            onSubmit={handleSubmit}
            initial={false}
            animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : { x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Input className="mb-4" placeholder="Username" type="text" value={username} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)} required />
            <div className="w-full max-w-[500px] mb-4 relative">
              <Input className="pr-16" placeholder="Password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} required />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-blue-600 hover:underline"
                onClick={() => setShowPassword(v => !v)}
                tabIndex={-1}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {error && <motion.div className="text-red-500 text-center text-sm mb-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{error}</motion.div>}
            <motion.div whileTap={{ scale: 0.97 }}>
              <Button type="submit" disabled={loading} className="mt-2" variant="default" size="default">{loading ? 'Signing in...' : 'Sign In'}</Button>
            </motion.div>
          </motion.form>
          <div className="mt-6 text-center text-gray-500">
            Don&apos;t have an account?{' '}
            <a href="/sign-up" className="text-blue-600 hover:underline font-medium">Sign Up</a>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}