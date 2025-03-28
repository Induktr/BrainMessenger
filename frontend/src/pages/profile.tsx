import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USER } from '../../graphql/queries'; // Import GET_USER query
import { UPDATE_USER } from '../../graphql/mutations'; // Import UPDATE_USER mutation
// TODO: Import generated types for queries/mutations

// Remove mock interface UserProfile

const ProfilePage = () => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  // TODO: Get current user ID from authentication context/state
  const currentUserId = 'user123'; // Replace with actual dynamic user ID

  // --- Fetch User Data ---
  const { data: userData, loading: userLoading, error: userError, refetch } = useQuery(GET_USER, {
    variables: { id: currentUserId },
    skip: !currentUserId, // Skip query if no user ID
    onCompleted: (data) => {
      // Initialize formData when data is loaded
      if (data?.getUser) {
        setFormData({
          name: data.getUser.name || '',
          email: data.getUser.email || '',
          // Only include fields present in UpdateUserInput and UserDto
        });
      }
    }
  });
  const profile = userData?.getUser;
  // --- End Fetch User Data ---

  // --- Update User Mutation ---
  const [updateUserMutation, { loading: updateLoading, error: updateError }] = useMutation(UPDATE_USER, {
    onCompleted: (data) => {
      console.log('Profile updated:', data);
      setIsEditing(false);
      refetch(); // Refetch user data after update
    },
    onError: (error) => {
      console.error('Update error:', error);
      // TODO: Show error to user
    }
  });
  // --- End Update User Mutation ---

  // State for form data during editing
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    // Removed fields not in backend: phone, bio, status, language, theme
  });

  // Reset formData when editing starts or profile data loads
  useEffect(() => {
    if (profile && !isEditing) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
      });
    }
  }, [profile, isEditing]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Removed handleCheckboxChange as notification settings are not in backend model

  const handleSaveProfile = () => {
    if (!currentUserId) return;

    // Prepare input based on UpdateUserInput type in GraphQL schema
    const updateInput = {
      name: formData.name,
      email: formData.email,
      // Add other fields from UpdateUserInput if they exist and are editable
    };

    updateUserMutation({
      variables: {
        id: currentUserId,
        input: updateInput
      }
    });
  };

  const handleCancel = () => {
    // Reset form data to current profile values from query
    if (profile) {
       setFormData({
        name: profile.name || '',
        email: profile.email || '',
      });
    }
    setIsEditing(false);
  };

  // Keep formatDate if needed elsewhere, or remove
  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  if (userLoading) return <p>Loading profile...</p>; // Add a loading state
  if (userError) return <p>Error loading profile: {userError.message}</p>; // Add an error state
  if (!profile && !userLoading) return <p>User not found.</p> // Handle case where user data is not available

  return (
    <>
      <NextSeo
        title="Profile - BrainMessenger"
        description="Your profile on BrainMessenger"
      />
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
            {/* Profile header */}
            <div className="px-4 py-5 sm:px-6 bg-blue-50 dark:bg-blue-900/20">
              <div className="flex items-center justify-between">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">User Profile</h3>
                <div>
                  {isEditing ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleCancel}
                        disabled={updateLoading}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={updateLoading}
                        className="px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {updateLoading ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Profile content */}
            <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
              <div className="flex flex-col md:flex-row">
                {/* Avatar section - simplified */}
                <div className="flex flex-col items-center md:w-1/3 mb-6 md:mb-0">
                  <div className="relative">
                    <img
                      src={'/avatars/default.jpg'} // Placeholder avatar
                      alt={profile.name}
                      className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-md"
                    />
                    {/* Online status removed */}
                  </div>
                  <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">{profile.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{profile.email}</p>
                  {/* Joined date removed */}
                </div>

                {/* Profile details */}
                <div className="md:w-2/3 md:pl-8">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      {/* Removed phone, bio, status, language, theme inputs */}
                       {updateError && <p className="text-sm text-error-text mt-2">{updateError.message || 'Failed to update profile.'}</p>}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact Information</h4>
                        <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="flex items-center">
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                            <span className="ml-2 text-gray-700 dark:text-gray-300">{profile.email}</span>
                          </div>
                          {/* Removed phone display */}
                        </div>
                      </div>
                      {/* Removed Bio, Settings, Notifications sections */}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;