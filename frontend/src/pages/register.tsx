'use client'; // Add this directive

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { NextSeo } from 'next-seo';
import { useMutation, gql } from '@apollo/client'; // Import gql here
// import { REGISTER } from '../../graphql/mutations'; // Temporarily remove import
// TODO: Import types for RegisterInput and RegisterMutation response if available/generated

const RegisterPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    api: '', // For API errors
  });

  // Use the useMutation hook
  // Temporarily use inline gql string instead of imported REGISTER
  const [registerUser, { loading, error: apiError }] = useMutation(gql`
    mutation Register($registerInput: RegisterInput!) {
      register(registerInput: $registerInput) {
        access_token
        user {
          id
          name
          email
        }
      }
    }
  `, {
    onCompleted: (data) => {
      console.log('Registration successful:', data);
      // TODO: Store the access_token (e.g., in localStorage or state management)
      // localStorage.setItem('token', data.register.access_token);
      router.push('/chat'); // Redirect to chat page on success
    },
    onError: (error) => {
      console.error('Registration error:', error);
      setErrors(prev => ({ ...prev, api: error.message || 'Registration failed. Please try again.' }));
    }
  });

  // --- Validation Functions (Keep them simple for now) ---
  const validatePassword = (password: string) => {
    if (password.length < 8) return 'Password must be at least 8 characters long';
    return '';
  };
  const validateName = (name: string) => {
    if (!name.trim()) return 'Name is required';
    if (name.length < 2 || name.length > 50) return 'Name must be between 2 and 50 characters';
    // Basic validation, adjust as needed
    if (!/^[A-Za-z\s]+$/.test(name)) return 'Name can only contain letters and spaces';
    return '';
  };
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };
  // --- End Validation Functions ---

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear specific field error and API error on input change
    setErrors(prev => ({ ...prev, [name]: '', api: '' }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({ name: '', email: '', password: '', api: '' }); // Clear previous errors

    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    if (nameError || emailError || passwordError) {
      setErrors({ name: nameError, email: emailError, password: passwordError, api: '' });
      return;
    }

    // Call the mutation
    registerUser({
      variables: {
        registerInput: { // Ensure variable name matches mutation definition
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }
      }
    });
  };

  return (
    <>
      <NextSeo
        title="Register - BrainMessenger"
        description="Create your BrainMessenger account"
      />
      <div className="min-h-screen flex items-center justify-center bg-background-dark p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary-gradient-from to-primary-gradient-to flex items-center justify-center">
              <span className="text-2xl font-bold text-textPrimary-dark">😎</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-6 text-center text-primary-light dark:text-primary-light">Create Account</h2>

          <form onSubmit={handleSubmit}>
            {/* Name Input */}
            <div className="mb-4">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border ${errors.name ? 'border-error-text' : 'border-border-light dark:border-border-dark'} focus:outline-none focus:ring-2 focus:ring-primary dark:bg-surface-dark dark:text-textPrimary-dark`}
                placeholder="Your name"
                required
              />
              {errors.name && <p className="mt-1 text-xs text-error-text">{errors.name}</p>}
            </div>

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
               <p className="mt-1 text-xs text-textSecondary-light dark:text-textSecondary-dark">Password must be at least 8 characters long</p>
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
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/login" className="text-sm text-textSecondary-dark hover:underline">Already have an Account? Login</a>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;