'use client';

import { apiRequest, SignupResponse } from '@/app/assets/utilities/API_HANDLER';
import { FirebaseError } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import styles from '../../assets/styles/page.module.css';
import { auth } from '../../config/firebase.js';
import { log } from 'console';

export default function SignupPage() {
  const [firstName, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validateForm = () => {
    if (password.length < 6) {
      alert('Password must be at least 6 characters long');
      return false;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return false;
    }
    if (!email.includes('@')) {
      alert('Please enter a valid email address');
      return false;
    }
    if (!firstName || !lastName) {
      alert('Please fill in all fields');
      return false;
    }
    return true;
  };

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      // Create user in Firebase Authentication first
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Send email verification
      await sendEmailVerification(user);

      // Create user in backend with Firebase UID using apiRequest
      const response = await apiRequest<SignupResponse>('/users/signup', {
        method: 'POST',
        body: {
          firstName,
          lastName,
          email,
          firebaseUid: user.uid,
        },
      });

      console.log(response);

      if (response && response.message) {
        alert(
          'Signup successful! Please check your email for verification link.'
        );
        router.push('/');
      } else {
        throw new Error('Failed to create user in backend');
      }
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage =
        error instanceof FirebaseError
          ? error.message
          : error instanceof Error
          ? error.message
          : 'An unknown error occurred';

      alert('Signup failed: ' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.sidebar}>
          <div className={styles.brandContent}>
            <h1>MoneyLens</h1>
            <p>Sign up to start managing your finances.</p>
          </div>
        </div>

        <div className={styles.formSection}>
          <div className={styles.formContainer}>
            <h2>Create an Account</h2>
            <p>Enter your details to sign up</p>

            <form onSubmit={handleSignup}>
              <div className={styles.inputGroup}>
                <label>First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                className={styles.signInButton}
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>

            <p className={styles.signUpPrompt}>
              Already have an account?{' '}
              <Link href="/" className={styles.signUpLink}>
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
