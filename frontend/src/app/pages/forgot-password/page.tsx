'use client';

import React, { useState, FormEvent } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';

import styles from '../../assets/styles/page.module.css';

import Link from 'next/link';
import { FirebaseError } from 'firebase/app';
import { useRouter } from 'next/navigation';
import { auth } from '../../config/firebase'; // Also update this path as needed

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage('Password reset email sent! Please check your inbox.');
      // Optional: Automatically redirect after a few seconds
      // setTimeout(() => router.push('/'), 5000);
    } catch (error) {
      const errorMessage =
        error instanceof FirebaseError
          ? error.message
          : error instanceof Error
          ? error.message
          : 'An unknown error occurred';
      console.error('Password reset failed:', errorMessage);
      setErrorMessage('Password reset failed: ' + errorMessage);
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
            <h2>Forgot Password</h2>
            <p>Enter your email address to receive a password reset link</p>

            {successMessage && (
              <div className={styles.successMessage}>
                {successMessage}
              </div>
            )}

            {errorMessage && (
              <div className={styles.errorMessage}>
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} autoComplete="off">
              <div className={styles.inputGroup}>
                <label htmlFor="reset-email">Email</label>
                <input
                  type="email"
                  id="reset-email"
                  name="reset-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  autoComplete="new-email" // Prevents browser autofill
                />
              </div>

              <button 
                type="submit" 
                className={styles.signInButton}
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Reset Password'}
              </button>
            </form>

            <p className={styles.signUpPrompt}>
              Remember your password?{' '}
              <Link href="/" className={styles.signUpLink}>
                Back to Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}