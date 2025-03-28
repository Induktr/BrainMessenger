import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { NextSeo } from 'next-seo';
import { useMutation } from '@apollo/client';
import { LOGIN } from '../../graphql/mutations'; // Import the LOGIN mutation
// TODO: Import types for LoginInput and LoginMutation response if available/generated

const LoginPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    api: '', // For API errors
  });

  // Use the useMutation hook
  const [loginUser, { loading, error: apiError }] = useMutation(LOGIN, {
    onCompleted: (data) => {
      console.log('Login successful:', data);
      // TODO: Store the access_token (e.g., in localStorage or state management)
      // localStorage.setItem('token', data.login.access_token);
      router.push('/chat'); // Redirect to chat page on success
    },
    onError: (error) => {
      console.error('Login error:', error);
      setErrors(prev => ({ ...prev, api: error.message || 'Login failed. Please check credentials.' }));
    }
  });

  // --- Basic Validation ---
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };
  const validatePassword = (password: string) => {
    if (!password) return 'Password is required';
    return '';
  };
  // --- End Validation ---

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '', api: '' }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({ email: '', password: '', api: '' });

    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError, api: '' });
      return;
    }

    loginUser({
      variables: {
        loginInput: { // Ensure variable name matches mutation definition
          email: formData.email,
          password: formData.password,
        }
      }
    });
  };

  return (
    <>
      <NextSeo
        title="Login - BrainMessenger"
        description="Log in to your BrainMessenger account"
      />
      <div className="min-h-screen flex items-center justify-center bg-background-dark p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary-gradient-from to-primary-gradient-to flex items-center justify-center">
              <span className="text-2xl font-bold text-textPrimary-dark">😎</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-6 text-center text-primary-light dark:text-primary-light">Log In</h2>

          <form onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className="mb-4">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-error-text' : 'border-border-light dark:border-border-dark'} focus:outline-none focus:ring-2 focus:ring-primary dark:bg-surface-dark dark:text-textPrimary-dark`}
                placeholder="Email"
                required
              />
              {errors.email && <p className="mt-1 text-xs text-error-text">{errors.email}</p>}
            </div>

            {/* Password Input */}
            <div className="mb-6">
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border ${errors.password ? 'border-error-text' : 'border-border-light dark:border-border-dark'} focus:outline-none focus:ring-2 focus:ring-primary dark:bg-surface-dark dark:text-textPrimary-dark`}
                placeholder="Password"
                required
              />
              {errors.password && <p className="mt-1 text-xs text-error-text">{errors.password}</p>}
            </div>

            {/* API Error Display */}
            {errors.api && <p className="mb-4 text-sm text-center text-error-text">{errors.api}</p>}
            {apiError && !errors.api && <p className="mb-4 text-sm text-center text-error-text">{apiError.message || 'An unexpected error occurred.'}</p>}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full px-4 py-3 rounded-lg ${loading ? 'bg-gray-500' : 'bg-gradient-to-r from-primary-gradient-from to-primary-gradient-to hover:opacity-90'} text-textPrimary-dark font-semibold transition duration-200`}
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/register" className="text-sm text-textSecondary-dark hover:underline">Don't have an account? Register</a>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;