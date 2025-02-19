'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../config/firebase.js';
import styles from '../page.module.css';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      // Create user in Firebase Authentication
      const responser = await fetch('http://localhost:5001/api/users/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, lastName, email, password }),
      });
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Send email verification
      await sendEmailVerification(user);
      console.log('Verification email sent');
      alert('Signup successful! Please verify your email.');

      // Wait for email verification (max retries: 30)
      let isVerified = user.emailVerified;
      let attempts = 0;
      while (!isVerified && attempts < 30) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        await user.reload();
        isVerified = user.emailVerified;
        attempts++;
      }

      if (!isVerified) {
        alert('Please verify your email before logging in.');
        return;
      }

      // Save user details in MongoDB
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          name,
          lastName,
          email,
        }),
      });

      if (!response.ok) throw new Error('Failed to store user in database');

      console.log('User registered:', user);
      alert('Signup successful! You can now log in.');
      
      // Redirect to login page
      router.push('/');
    } catch (error: any) {
      console.error('Signup error:', error);
      alert('Signup failed: ' + error.message);
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
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className={styles.signInButton}>Sign Up</button>
            </form>

            <p className={styles.signUpPrompt}>
              Already have an account? <a href="/" className={styles.signUpLink}>Log in</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
