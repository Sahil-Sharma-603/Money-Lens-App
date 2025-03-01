'use client';

import React, { useState, FormEvent, useEffect, useRef } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../app/config/firebase';
import styles from './assets/styles/page.module.css';
import Link from 'next/link';
import { FirebaseError } from 'firebase/app';
import { useRouter } from 'next/navigation';
import { apiRequest, LoginResponse } from './assets/utilities/API_HANDLER';

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const formRef = useRef<HTMLFormElement>(null);

  // Check if user is already logged in or has saved credentials
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedEmail = localStorage.getItem('rememberedEmail');
    
    if (token) {
      router.push('/pages/dashboard');
    } else {
      // If we have a saved email, it means "Remember Me" was checked previously
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
      setIsCheckingAuth(false);
    }
  }, [router]);

  // Reset password field when form is mounted
  useEffect(() => {
    // Clear form browser autocomplete data
    if (formRef.current) {
      const inputs = formRef.current.querySelectorAll('input');
      inputs.forEach(input => {
        if (input.type === 'password') {
          input.value = '';
        }
      });
    }
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      if (!user.emailVerified) {
        alert('Please verify your email before logging in.');
        return;
      }

      const data = await apiRequest<LoginResponse>('/users/login', {
        method: 'POST',
        body: {
          email: user.email,
          firebaseUid: user.uid,
          name: user.displayName?.split(' ')[0] || 'User',
          lastName: user.displayName?.split(' ')[1] || 'Unknown',
        },
        requireAuth: false,
      });

      // Store the token in localStorage
      localStorage.setItem('token', data.token);
      
      // If remember me is checked, save the email for future auto-fill
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('rememberMe', 'true');
      } else {
        // Clear any saved credentials
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberMe');
      }
      
      // Clear password field before redirecting
      setPassword('');
      
      router.push('/pages/dashboard');
    } catch (error) {
      const errorMessage =
        error instanceof FirebaseError
          ? error.message
          : error instanceof Error
          ? error.message
          : 'An unknown error occurred';
      console.error('Login failed:', errorMessage);
      alert('Login failed: ' + errorMessage);
      // Clear password on error
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.formSection}>
            <div className={styles.formContainer}>
              <p>Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Left Side */}
        <div className={styles.sidebar}>
          <div className={styles.brandContent}>
            <h1>MoneyLens</h1>
            <p>We solve all your money problems...</p>
          </div>
        </div>

        {/* Right Side */}
        <div className={styles.formSection}>
          <div className={styles.formContainer}>
            <h2>Welcome!</h2>
            <p>Enter your email and password to login</p>

            {/* Hidden form to trick browser autofill */}
            <div style={{ display: 'none' }}>
              <input type="text" id="fake-email" name="fake-email" tabIndex={-1} />
              <input type="password" id="fake-password" name="fake-password" tabIndex={-1} />
            </div>

            <form 
              ref={formRef}
              onSubmit={handleSubmit} 
              autoComplete="off" 
              spellCheck="false"
            >
              <div className={styles.inputGroup}>
                <label htmlFor="ml-email">Email</label>
                <input
                  type="email"
                  id="ml-email"
                  name="ml-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="ml-password">Password</label>
                <input
                  type="password"
                  id="ml-password"
                  name="ml-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                />
              </div>

              <div className={styles.options}>
                <div className={styles.rememberMeContainer}>
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="rememberMe">Remember me</label>
                </div>
                <Link
                  href="/pages/forgot-password"
                  className={styles.forgotPassword}
                >
                  Forgot password?
                </Link>
              </div>

              <button 
                type="submit" 
                className={styles.signInButton}
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className={styles.signUpPrompt}>
              Don&apos;t have an account?{' '}
              <Link href="/pages/signup" className={styles.signUpLink}>
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}