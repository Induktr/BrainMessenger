import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  phone?: string;
  bio?: string;
  status?: 'online' | 'away' | 'busy' | 'offline';
  lastSeen?: Date;
  joinedDate: Date;
  language: string;
  theme: 'light' | 'dark' | 'system';
  notifications: {
    messages: boolean;
    calls: boolean;
    groupMessages: boolean;
  };
}

const ProfilePage = () => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  
  // Mock user profile data
  const [profile, setProfile] = useState<UserProfile>({
    id: 'user123',
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    avatar: '/avatars/alex.jpg',
    phone: '+1 (555) 123-4567',
    bio: 'Software developer passionate about creating useful applications',
    status: 'online',
    lastSeen: new Date(),
    joinedDate: new Date(2023, 0, 15),
    language: 'English',
    theme: 'system',
    notifications: {
      messages: true,
      calls: true,
      groupMessages: true
    }
  });

  const [formData, setFormData] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone || '',
    bio: profile.bio || '',
    status: profile.status || 'online',
    language: profile.language,
    theme: profile.theme
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    const [category, setting] = name.split('.');
    
    if (category === 'notifications') {
      setProfile({
        ...profile,
        notifications: {
          ...profile.notifications,
          [setting]: checked
        }
      });
    }
  };

  const handleSaveProfile = () => {
    // In a real app, this would send data to the backend
    setProfile({
      ...profile,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      bio: formData.bio,
      status: formData.status as 'online' | 'away' | 'busy' | 'offline',
      language: formData.language,
      theme: formData.theme as 'light' | 'dark' | 'system'
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset form data to current profile values
    setFormData({
      name: profile.name,
      email: profile.email,
      phone: profile.phone || '',
      bio: profile.bio || '',
      status: profile.status || 'online',
      language: profile.language,
      theme: profile.theme
    });
    setIsEditing(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        className="px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Save
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
                {/* Avatar section */}
                <div className="flex flex-col items-center md:w-1/3 mb-6 md:mb-0">
                  <div className="relative">
                    <img
                      src={profile.avatar || '/avatars/default.jpg'}
                      alt={profile.name}
                      className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-md"
                    />
                    {profile.status === 'online' && (
                      <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-700"></div>
                    )}
                  </div>
                  <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">{profile.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{profile.email}</p>
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <p>Joined {formatDate(profile.joinedDate)}</p>
                  </div>
                </div>
                
                {/* Profile details */}
                <div className="md:w-2/3 md:pl-8">
                  {isEditing ? (
                    <div className="space-y-4">
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
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                        />
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
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          id="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Bio
                        </label>
                        <textarea
                          name="bio"
                          id="bio"
                          rows={3}
                          value={formData.bio}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Status
                        </label>
                        <select
                          name="status"
                          id="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                        >
                          <option value="online">Online</option>
                          <option value="away">Away</option>
                          <option value="busy">Busy</option>
                          <option value="offline">Offline</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Language
                        </label>
                        <select
                          name="language"
                          id="language"
                          value={formData.language}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                        >
                          <option value="English">English</option>
                          <option value="Spanish">Spanish</option>
                          <option value="French">French</option>
                          <option value="German">German</option>
                          <option value="Russian">Russian</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="theme" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Theme
                        </label>
                        <select
                          name="theme"
                          id="theme"
                          value={formData.theme}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="system">System</option>
                        </select>
                      </div>
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
                          
                          {profile.phone && (
                            <div className="flex items-center">
                              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                              </svg>
                              <span className="ml-2 text-gray-700 dark:text-gray-300">{profile.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {profile.bio && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Bio</h4>
                          <p className="mt-2 text-gray-700 dark:text-gray-300">{profile.bio}</p>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Settings</h4>
                        <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">Language:</span>
                            <span className="ml-2 text-gray-700 dark:text-gray-300">{profile.language}</span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">Theme:</span>
                            <span className="ml-2 text-gray-700 dark:text-gray-300">
                              {profile.theme.charAt(0).toUpperCase() + profile.theme.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Notification Preferences</h4>
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700 dark:text-gray-300">Messages</span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${profile.notifications.messages ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                              {profile.notifications.messages ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700 dark:text-gray-300">Calls</span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${profile.notifications.calls ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                              {profile.notifications.calls ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700 dark:text-gray-300">Group Messages</span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${profile.notifications.groupMessages ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                              {profile.notifications.groupMessages ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                        </div>
                      </div>
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