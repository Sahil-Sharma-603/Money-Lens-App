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
  const [errorMessage, setErrorMessage] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  // Check if user is already logged in or has saved credentials
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedEmail = localStorage.getItem('rememberedEmail');
    
    if (token) {
      router.push('/pages/dashboard');
    } else {
      
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
      setIsCheckingAuth(false);
    }
  }, [router]);

  
  useEffect(() => {
   
    if (formRef.current) {
      const inputs = formRef.current.querySelectorAll('input');
      inputs.forEach(input => {
        if (input.type === 'password') {
          input.value = '';
        }
      });
    }
  }, []);

  const getFirebaseErrorMessage = (error: FirebaseError) => {
    switch (error.code) {
      case 'auth/invalid-email':
        return 'The email address is not properly formatted. Please enter a valid email address (e.g., user@example.com).';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support at support@moneylens.com for assistance.';
      case 'auth/user-not-found':
        return 'We couldn\'t find an account with this email address. Please check your spelling or click "Sign Up" to create a new account.';
      case 'auth/wrong-password':
        return 'The password you entered is incorrect. Please try again or click "Forgot password?" to reset it.';
      case 'auth/too-many-requests':
        return 'Access temporarily blocked due to multiple failed attempts. Please try again in a few minutes or reset your password using the "Forgot password?" link.';
      case 'auth/network-request-failed':
        return 'Unable to connect to the authentication server. Please check your internet connection and try again.';
      case 'auth/popup-closed-by-user':
        return 'The authentication window was closed before completion. Please try signing in again.';
      case 'auth/requires-recent-login':
        return 'For security reasons, please sign in again to continue.';
      case 'auth/email-already-in-use':
        return 'An account already exists with this email. Please sign in instead or use "Forgot password?" if you can\'t remember your password.';
      case 'auth/operation-not-allowed':
        return 'Email/password sign-in is not enabled. Please contact support.';
      case 'auth/weak-password':
        return 'Your password is too weak. Please use a stronger password with at least 6 characters.';
      case 'auth/missing-password':
        return 'Please enter your password to sign in.';
      case 'auth/invalid-credential':
        return 'The email or password you entered is incorrect. Please check your credentials and try again.';
      case 'auth/invalid-verification-code':
        return 'The verification code you entered is invalid. Please check your email for the correct code.';
      case 'auth/invalid-verification-id':
        return 'Your verification session has expired. Please request a new verification email.';
      case 'auth/timeout':
        return 'The sign-in request timed out. Please check your internet connection and try again.';
      default:
        console.error('Firebase error code:', error.code);
        return `Authentication error: ${error.message}. Please try again or contact support if the problem persists.`;
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    // Input validation with specific messages
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      setIsLoading(false);
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Please enter your password.');
      setIsLoading(false);
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address (e.g., user@example.com).');
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      const user = userCredential.user;

      if (!user.emailVerified) {
        setErrorMessage('Please verify your email before logging in. Check your inbox for the verification link.');
        setIsLoading(false);
        return;
      }

      try {
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

        localStorage.setItem('token', data.token);
        
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberedEmail');
          localStorage.removeItem('rememberMe');
        }
        
        setPassword('');
        router.push('/pages/dashboard');
      } catch (apiError) {
        setErrorMessage('Failed to connect to the server. Please try again later.');
        console.error('API Error:', apiError);
      }
    } catch (error) {
      if (error instanceof FirebaseError) {
        setErrorMessage(getFirebaseErrorMessage(error));
      } else if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
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

            {errorMessage && (
              <div className={styles.errorMessage}>
                {errorMessage}
              </div>
            )}

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