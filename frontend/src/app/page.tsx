'use client';

import React, { useState, FormEvent } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../app/config/firebase';
import styles from './page.module.css';
import Link from 'next/link';
import { FirebaseError } from 'firebase/app';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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

      alert('Login successful!');
      console.log('User logged in:', user);

      // Redirect user to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      // Type guard for Firebase errors
      const errorMessage =
        error instanceof FirebaseError
          ? error.message
          : 'An unknown error occurred';

      console.error('Login failed:', errorMessage);
      alert('Login failed: ' + errorMessage);
    }
  };

  // Only initialize the Plaid config when we have a valid linkToken
  const config = {
    token: linkToken!,
    onSuccess,
  };

  const { open, ready } = usePlaidLink(linkToken ? config : { token: '' });

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
                <label className={styles.rememberMe}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  Remember me
                </label>
                <Link href="/forgot-password" className={styles.forgotPassword}>
                  Forgot password?
                </Link>
              </div>

              <button type="submit" className={styles.signInButton}>
                Sign In
              </button>
            </form>

            <p className={styles.signUpPrompt}>
              Don&apos;t have an account?{' '}
              <Link href="/signup" className={styles.signUpLink}>
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
