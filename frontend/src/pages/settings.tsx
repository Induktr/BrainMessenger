import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USER } from '../../graphql/queries'; // Import GET_USER query
import { UPDATE_USER } from '../../graphql/mutations'; // Import UPDATE_USER mutation
// TODO: Import generated types for queries/mutations

const SettingsPage = () => {
  const router = useRouter();

  // TODO: Get current user ID from authentication context/state
  const currentUserId = 'user123'; // Replace with actual dynamic user ID

  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [errors, setErrors] = useState({ name: '', email: '', api: '' });

  // --- Fetch User Data ---
  const { data: userData, loading: userLoading, error: userError, refetch } = useQuery(GET_USER, {
    variables: { id: currentUserId },
    skip: !currentUserId,
    onCompleted: (data) => {
      if (data?.getUser) {
        setFormData({
          name: data.getUser.name || '',
          email: data.getUser.email || '',
        });
      }
    },
    onError: (error) => {
       setErrors(prev => ({ ...prev, api: `Failed to load user data: ${error.message}` }));
    }
  });
  // --- End Fetch User Data ---

  // --- Update User Mutation ---
  const [updateUserMutation, { loading: updateLoading, error: updateError }] = useMutation(UPDATE_USER, {
    onCompleted: (data) => {
      console.log('Settings updated:', data);
      alert('Settings saved successfully!');
      refetch(); // Refetch data to show updated values
    },
    onError: (error) => {
      console.error('Update error:', error);
      setErrors(prev => ({ ...prev, api: error.message || 'Failed to save settings.' }));
    }
  });
  // --- End Update User Mutation ---

  // --- Basic Validation ---
   const validateName = (name: string) => {
    if (!name.trim()) return 'Name is required';
    if (name.length < 2 || name.length > 50) return 'Name must be between 2 and 50 characters';
    if (!/^[A-Za-z\s]+$/.test(name)) return 'Name can only contain letters and spaces';
    return '';
  };
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };
  // --- End Validation ---


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
     setErrors(prev => ({ ...prev, [name]: '', api: '' }));
  };

  const handleSaveChanges = () => {
    if (!currentUserId) return;
     setErrors({ name: '', email: '', api: '' }); // Clear previous errors

    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);

    if (nameError || emailError) {
      setErrors({ name: nameError, email: emailError, api: '' });
      return;
    }

    const updateInput = {
      name: formData.name,
      email: formData.email,
      // Only include fields that are part of UpdateUserInput in the backend schema
    };

    updateUserMutation({
      variables: {
        id: currentUserId,
        input: updateInput
      }
    });
  };

  return (
    <>
      <NextSeo
        title="Settings - BrainMessenger"
        description="Manage your BrainMessenger settings"
      />
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Settings</h1>
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 sm:p-6 space-y-6">
              {userLoading && <p>Loading settings...</p>}
              {userError && !errors.api && <p className="text-error-text">Error loading settings: {userError.message}</p>}

              {!userLoading && userData?.getUser && (
                <>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full border ${errors.name ? 'border-error-text' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white`}
                    />
                     {errors.name && <p className="mt-1 text-xs text-error-text">{errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full border ${errors.email ? 'border-error-text' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white`}
                    />
                     {errors.email && <p className="mt-1 text-xs text-error-text">{errors.email}</p>}
                  </div>
                   {/* API Error Display */}
                  {errors.api && <p className="text-sm text-center text-error-text">{errors.api}</p>}
                  {updateError && !errors.api && <p className="text-sm text-center text-error-text">{updateError.message || 'An unexpected error occurred.'}</p>}
                </>
              )}
            </div>
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-right sm:px-6">
              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={userLoading || updateLoading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {updateLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;