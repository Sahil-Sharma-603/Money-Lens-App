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
import QRCode from 'qrcode';

interface TwoFactorSetupResponse {
  qrCodeUrl: string;
}

interface TwoFactorVerifyResponse {
  verified: boolean;
}

export default function SignupPage() {
  const [firstName, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [setupComplete, setSetupComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const validateForm = () => {
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match!');
      return false;
    }
    if (!email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      return false;
    }
    if (!firstName || !lastName) {
      setErrorMessage('Please fill in all fields');
      return false;
    }
    return true;
  };

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
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
        requireAuth: false,
      });

      if (response && response.message) {
        // Get 2FA setup information
        const setupResponse = await apiRequest<TwoFactorSetupResponse>('/users/setup-2fa', {
          method: 'POST',
          body: { userId: response.user._id },
          requireAuth: false,
        });

        setQrCodeUrl(setupResponse.qrCodeUrl);
        setShowQRCode(true);
      } else {
        throw new Error('Failed to create user in backend');
      }
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage =
        error instanceof FirebaseError
          ? getFirebaseErrorMessage(error)
          : error instanceof Error
          ? error.message
          : 'An unknown error occurred';

      setErrorMessage('Signup failed: ' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const verify2FA = async () => {
    try {
      setErrorMessage('');
      const response = await apiRequest<TwoFactorVerifyResponse>('/users/verify-2fa', {
        method: 'POST',
        body: {
          email,
          token: otpCode
        },
        requireAuth: false,
      });

      if (response.verified) {
        setSetupComplete(true);
      } else {
        setErrorMessage('Invalid 2FA code. Please try again.');
      }
    } catch (error) {
      setErrorMessage('Error verifying 2FA code');
    }
  };

  const getFirebaseErrorMessage = (error: FirebaseError) => {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'An account already exists with this email. Please sign in instead.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/operation-not-allowed':
        return 'Email/password sign up is not enabled. Please contact support.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 6 characters.';
      default:
        return error.message;
    }
  };

  if (setupComplete) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.sidebar}>
            <div className={styles.brandContent}>
              <h1>MoneyLens</h1>
              <p>Thank you for signing up!</p>
            </div>
          </div>
          <div className={styles.formSection}>
            <div className={styles.formContainer}>
              <div className={styles.formContent}>
                <h2>Account Setup Complete!</h2>
                <div className={styles.successMessage}>
                  <p>Before Logging in:</p>
                  <ol>
                    <li>Please check your email to verify your account</li>
                    <li>After verifying your email, you can login with your credentials and 2FA code</li>
                  </ol>
                </div>
                <button 
                  onClick={() => router.push('/')}
                  className={styles.signInButton}
                >
                  Go to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showQRCode) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.sidebar}>
            <div className={styles.brandContent}>
              <h1>MoneyLens</h1>
              <p>Secure authentication for your finances</p>
            </div>
          </div>
          <div className={styles.formSection}>
            <div className={styles.formContainer}>
              <div className={styles.formContent}>
                <h2>Set up Two-Factor Authentication</h2>
                <p>Scan this QR code with Google Authenticator app</p>
                <div className={styles.qrCodeContainer}>
                  <img src={qrCodeUrl} alt="QR Code" className={styles.qrCode} />
                </div>
                <div className={styles.inputGroup}>
                  <label>Verification Code</label>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className={styles.input}
                  />
                </div>
                <button 
                  onClick={verify2FA}
                  className={styles.signInButton}
                  disabled={isLoading}
                >
                  {isLoading ? 'Verifying...' : 'Verify'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

            {errorMessage && (
              <div className={styles.errorMessage}>
                {errorMessage}
              </div>
            )}

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
