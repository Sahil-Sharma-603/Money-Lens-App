'use client';

import React, { useState, FormEvent } from 'react';
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
  const [isLoading, setIsLoading] = useState(false);

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
      });

      localStorage.setItem('token', data.token);
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
    } finally {
      setIsLoading(false);
    }
  };

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

            <form onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <div className={styles.options}>
                <Link
                  href="/pages/forgot-password"
                  className={styles.forgotPassword}
                >
                  Forgot password?
                </Link>
              </div>

              <button type="submit" className={styles.signInButton}>
                Sign In
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
