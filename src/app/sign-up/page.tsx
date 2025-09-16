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

type PasswordStrength = 'Weak' | 'Medium' | 'Strong';

function getPasswordStrength(password: string): PasswordStrength {
  if (password.length < 6) return 'Weak';
  if (password.match(/[A-Z]/) && password.match(/[0-9]/) && password.length >= 8) return 'Strong';
  return 'Medium';
}

export default function SignUpPage(): JSX.Element {
  const { signUp } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<{username?: string, email?: string, password?: string, confirmPassword?: string}>({});

  const validateForm = () => {
    const errors: {username?: string, email?: string, password?: string, confirmPassword?: string} = {};

    // Username validation
    if (!username.trim()) {
      errors.username = 'Username is required';
    } else if (username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (username.length > 50) {
      errors.username = 'Username must be less than 50 characters';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      errors.username = 'Username can only contain letters, numbers, hyphens, and underscores';
    }

    // Email validation
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(password)) {
      errors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(password)) {
      errors.password = 'Password must contain at least one lowercase letter';
    } else if (!/\d/.test(password)) {
      errors.password = 'Password must contain at least one number';
    }

    // Confirm password validation
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFormErrors({});

    if (!validateForm()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setLoading(true);
    try {
      await signUp(username.trim(), email.trim().toLowerCase(), password);
      toast.success('Account created')
      router.push('/');
    } catch (err) {
      setError((err as Error).message);
      toast.error((err as Error).message || 'Failed to sign up')
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(password);

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
          <h2 className="streamlens-heading mb-2">Create your account</h2>
          <p className="mb-6 text-center text-base text-gray-600">Sign up to get started</p>

          {/* Social sign-in buttons */}
          <div className="flex flex-col gap-3 w-full max-w-[400px] mx-auto mb-6">
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 transition-colors font-semibold text-base shadow-sm"
              onClick={handleGoogleSignIn}
              type="button"
              aria-label="Sign up with Google"
            >
              <FcGoogle size={22} /> Sign up with Google
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 transition-colors font-semibold text-base shadow-sm"
              onClick={handleAppleSignIn}
              type="button"
              aria-label="Sign up with Apple"
            >
              <FaApple size={20} /> Sign up with Apple
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
            <div className="w-full max-w-[500px] mb-4">
              <Input
                className={formErrors.username ? "border-red-500" : ""}
                placeholder="Username"
                type="text"
                value={username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setUsername(e.target.value);
                  if (formErrors.username) setFormErrors({...formErrors, username: undefined});
                }}
                required
              />
              {formErrors.username && <p className="text-red-500 text-sm mt-1">{formErrors.username}</p>}
            </div>
            <div className="w-full max-w-[500px] mb-4">
              <Input
                className={formErrors.email ? "border-red-500" : ""}
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setEmail(e.target.value);
                  if (formErrors.email) setFormErrors({...formErrors, email: undefined});
                }}
                required
              />
              {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
            </div>
            <div className="w-full max-w-[500px] mb-4 relative">
              <Input
                className={`pr-16 ${formErrors.password ? "border-red-500" : ""}`}
                placeholder="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setPassword(e.target.value);
                  if (formErrors.password) setFormErrors({...formErrors, password: undefined});
                }}
                required
              />
              {formErrors.password && <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>}
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-blue-600 hover:underline"
                onClick={() => setShowPassword(v => !v)}
                tabIndex={-1}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
              <div className={`mt-1 text-xs font-semibold ${passwordStrength === 'Strong' ? 'text-green-600' : passwordStrength === 'Medium' ? 'text-yellow-600' : 'text-red-600'}`}>Password strength: {passwordStrength}</div>
            </div>
            <div className="w-full max-w-[500px] mb-4">
              <Input
                className={formErrors.confirmPassword ? "border-red-500" : ""}
                placeholder="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setConfirmPassword(e.target.value);
                  if (formErrors.confirmPassword) setFormErrors({...formErrors, confirmPassword: undefined});
                }}
                required
              />
              {formErrors.confirmPassword && <p className="text-red-500 text-sm mt-1">{formErrors.confirmPassword}</p>}
            </div>
            {error && <motion.div className="text-red-500 text-center text-sm mb-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{error}</motion.div>}
            <motion.div whileTap={{ scale: 0.97 }}>
              <Button type="submit" disabled={loading} className="mt-2" variant="default" size="default">{loading ? 'Signing up...' : 'Sign Up'}</Button>
            </motion.div>
          </motion.form>
          <div className="mt-6 text-center text-gray-500">
            Already have an account?{' '}
            <a href="/sign-in" className="text-blue-600 hover:underline font-medium">Sign In</a>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}