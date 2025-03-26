import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { NextSeo } from 'next-seo';

const RegisterPage = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    password: '',
    name: '',
    email: '',
    confirmationCode: '',
  });
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [errors, setErrors] = useState({
    password: '',
    name: '',
    email: '',
    confirmationCode: ''
  });

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    return '';
  };

  const validateName = (name: string) => {
    if (name.length < 2 || name.length > 50) {
      return 'Name must be between 2 and 50 characters';
    }
    if (!/^[A-Za-z\s]+$/.test(name)) {
      return 'Name can only contain letters and spaces';
    }
    return '';
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validateConfirmationCode = (code: string) => {
    if (code.length !== 8 || !/^\d+$/.test(code)) {
      return 'Confirmation code must be 8 digits';
    }
    return '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (step === 4 && name === 'confirmationCode') {
      const isValid = validateConfirmationCode(value) === '';
      setIsCodeValid(isValid);
    }

    // Clear error when user starts typing
    setErrors({
      ...errors,
      [name]: ''
    });
  };

  const handleNextStep = () => {
    let isValid = true;
    let newErrors = { ...errors };

    switch (step) {
      case 1: // Password validation
        newErrors.password = validatePassword(formData.password);
        if (newErrors.password) isValid = false;
        break;
      case 2: // Name validation
        newErrors.name = validateName(formData.name);
        if (newErrors.name) isValid = false;
        break;
      case 3: // Email validation
        newErrors.email = validateEmail(formData.email);
        if (newErrors.email) isValid = false;
        break;
      case 4: // Confirmation code validation
        newErrors.confirmationCode = validateConfirmationCode(formData.confirmationCode);
        if (newErrors.confirmationCode) isValid = false;
        break;
    }

    setErrors(newErrors);

    if (isValid) {
      if (step < 4) {
        setStep(step + 1);
      } else {
        // Submit registration
        handleSubmit();
      }
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    // Here you would typically make an API call to register the user
    // For now, we'll just simulate success and redirect to the main page
    console.log('Registration data:', formData);
    
    // Simulate API call delay
    setTimeout(() => {
      router.push('/chat');
    }, 1500);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="step-container">
            <h2 className="text-h1 font-bold mb-6 text-center text-primary-light">Step 1</h2>
            <div className="mb-6">
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.password ? 'border-error-text' : 'border-border-light dark:border-border-dark'} focus:outline-none focus:ring-2 focus:ring-primary dark:bg-surface-dark dark:text-textPrimary-dark`}
                  placeholder="Password"
                  style={{ width: '400px' }}
                />
                <button
                  onClick={handleNextStep}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary-gradient-from to-primary-gradient-to text-textPrimary-dark hover:opacity-90"
                >
                  <img style={{width: '20px', height: '20px', filter: 'grayscale(1) brightness(0.8)' }} src="https://res.cloudinary.com/dsjalneil/image/upload/v1734771378/--shape--arrow-with-the-effect-of-forward-movement_doyeth.svg"></img>
                </button>
              </div>
              {errors.password && <p className="mt-2 text-sm text-error-text">{errors.password}</p>}
              <p className="mt-2 text-xs text-textSecondary-light dark:text-textSecondary-dark">Password must be at least 8 characters long</p>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="step-container">
            <h2 className="text-h1 font-bold mb-6 text-center text-primary-light">Step 2</h2>
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.name ? 'border-error-text' : 'border-border-light dark:border-border-dark'} focus:outline-none focus:ring-2 focus:ring-primary dark:bg-surface-dark dark:text-textPrimary-dark`}
                  placeholder="Your name"
                  style={{ width: '400px' }}
                />
                <button
                  onClick={handleNextStep}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary-gradient-from to-primary-gradient-to text-textPrimary-dark hover:opacity-90"
                >
                  <img style={{width: '20px', height: '20px', filter: 'grayscale(1) brightness(0.8)' }} src="https://res.cloudinary.com/dsjalneil/image/upload/v1734771378/--shape--arrow-with-the-effect-of-forward-movement_doyeth.svg"></img>
                </button>
              </div>
              {errors.name && <p className="mt-2 text-sm text-error-text">{errors.name}</p>}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="step-container">
            <h2 className="text-h1 font-bold mb-6 text-center text-primary-light">Step 3</h2>
            <div className="mb-6">
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-error-text' : 'border-border-light dark:border-border-dark'} focus:outline-none focus:ring-2 focus:ring-primary dark:bg-surface-dark dark:text-textPrimary-dark`}
                  placeholder="Email"
                  style={{ width: '400px' }}
                />
                <button
                  onClick={handleNextStep}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary-gradient-from to-primary-gradient-to text-textPrimary-dark hover:opacity-90"
                >
                  <img style={{width: '20px', height: '20px', filter: 'grayscale(1) brightness(0.8)' }} src="https://res.cloudinary.com/dsjalneil/image/upload/v1734771378/--shape--arrow-with-the-effect-of-forward-movement_doyeth.svg"></img>
                </button>
              </div>
              {errors.email && <p className="mt-2 text-sm text-error-text">{errors.email}</p>}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="step-container">
            <h2 className="text-h1 font-bold mb-6 text-center text-primary dark:text-primary-light">Confirm Your Email</h2>
            <p className="text-center text-textSecondary-light dark:text-textSecondary-dark mb-6">We've sent a confirmation code to {formData.email}</p>
            <div className="mb-6">
                <input
                  type="text"
                  id="confirmationCode"
                  name="confirmationCode"
                  value={formData.confirmationCode}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.confirmationCode ? 'border-error-text' : 'border-border-light dark:border-border-dark'} focus:outline-none focus:ring-2 focus:ring-primary dark:bg-surface-dark dark:text-textPrimary-dark`}
                  placeholder="Enter 8-digit code"
                  maxLength={8}
                  style={{ width: '400px' }}
                />
              <button
                  onClick={handleNextStep}
                  disabled={!isCodeValid}
                  className={`mx-auto w-full transform -translate-y-1/2 px-4 py-2 rounded-lg ${isCodeValid ? 'bg-gradient-to-r from-primary-gradient-from to-primary-gradient-to hover:opacity-90' : 'bg-gray-400 cursor-not-allowed'} text-textPrimary-dark`}>
                  Confirm
                </button>
              {errors.confirmationCode && <p className="mt-2 text-sm text-error-text">{errors.confirmationCode}</p>}
              <p className="mt-4 text-center text-sm text-textSecondary-light dark:text-textSecondary-dark">
                Didn't receive a code? <a href="#" className="text-secondary hover:underline">Resend Code</a>
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <NextSeo
        title="Register - BrainMessenger"
        description="Create your BrainMessenger account"
      />
      <div className="min-h-screen flex items-center justify-center bg-background-dark p-4">
          
          <div className="mb-8 flex flex-col items-center">
            {/* BrainMessenger Logo */}
            <div className="mb-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary-gradient-from to-primary-gradient-to flex items-center justify-center">
                <span className="text-2xl font-bold text-textPrimary-dark">😎</span>
              </div>
            </div>
            <div className="flex justify-between items-center mb-6 w-32 relative">
                          {[1, 2, 3].map((stepNumber) => {
                            const isCurrentStep = stepNumber === step;
                            const isCompletedStep = stepNumber < step;
                            return (
                              <div
                                key={stepNumber}
                                className={`step-indicator w-8 h-8 rounded-full flex items-center justify-center ${isCurrentStep ? 'bg-gradient-to-r from-primary-gradient-from to-primary-gradient-to text-textPrimary-dark' : isCompletedStep ? 'bg-success text-textPrimary-dark' : 'bg-disabled-dark text-textSecondary-dark'}`}
                              >
                                {isCompletedStep ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                ) : stepNumber}
                              </div>
                            );
                          })}
                          {step > 1 && (
                            <div
                              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-20 rounded-full"
                              style={{
                                backgroundColor: '#96C93D',
                                opacity: 0.1,
                                clipPath: 'polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%, 0% 100%, 0% 0%)',
                                transform: `rotate(${Math.min((step - 1) * 90, 180)}deg)`,
                              }}
                            />
                          )}
                        </div>
                      
                      {renderStep()}
                      
                      <div className="mt-4 text-center">
                        <a href="/login" className="text-sm text-textSecondary-dark hover:underline">Already have an Account? Login</a>
                      </div>
                    </div>

      </div>
    </>
  );
};

export default RegisterPage;