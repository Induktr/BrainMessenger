import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';

interface SettingsState {
  appearance: {
    theme: 'light' | 'dark' | 'system';
    fontSize: 'small' | 'medium' | 'large';
    chatBackground: string;
  };
  privacy: {
    lastSeen: 'everyone' | 'contacts' | 'nobody';
    profilePhoto: 'everyone' | 'contacts' | 'nobody';
    readReceipts: boolean;
    typingIndicator: boolean;
  };
  notifications: {
    messages: boolean;
    groupMessages: boolean;
    calls: boolean;
    soundEnabled: boolean;
    vibrationEnabled: boolean;
  };
  language: string;
  dataUsage: {
    autoDownloadMedia: 'always' | 'wifi' | 'never';
    lowDataMode: boolean;
  };
}

const SettingsPage = () => {
  const router = useRouter();
  
  // Mock settings data
  const [settings, setSettings] = useState<SettingsState>({
    appearance: {
      theme: 'system',
      fontSize: 'medium',
      chatBackground: 'default',
    },
    privacy: {
      lastSeen: 'contacts',
      profilePhoto: 'everyone',
      readReceipts: true,
      typingIndicator: true,
    },
    notifications: {
      messages: true,
      groupMessages: true,
      calls: true,
      soundEnabled: true,
      vibrationEnabled: true,
    },
    language: 'English',
    dataUsage: {
      autoDownloadMedia: 'wifi',
      lowDataMode: false,
    },
  });

  const [activeTab, setActiveTab] = useState('appearance');

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setSettings({
      ...settings,
      appearance: {
        ...settings.appearance,
        theme,
      },
    });
  };

  const handleFontSizeChange = (fontSize: 'small' | 'medium' | 'large') => {
    setSettings({
      ...settings,
      appearance: {
        ...settings.appearance,
        fontSize,
      },
    });
  };

  const handleChatBackgroundChange = (chatBackground: string) => {
    setSettings({
      ...settings,
      appearance: {
        ...settings.appearance,
        chatBackground,
      },
    });
  };

  const handlePrivacyChange = (setting: string, value: any) => {
    setSettings({
      ...settings,
      privacy: {
        ...settings.privacy,
        [setting]: value,
      },
    });
  };

  const handleNotificationChange = (setting: string, value: boolean) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [setting]: value,
      },
    });
  };

  const handleLanguageChange = (language: string) => {
    setSettings({
      ...settings,
      language,
    });
  };

  const handleDataUsageChange = (setting: string, value: any) => {
    setSettings({
      ...settings,
      dataUsage: {
        ...settings.dataUsage,
        [setting]: value,
      },
    });
  };

  const renderAppearanceSettings = () => {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Theme</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Choose how BrainMessenger looks for you</p>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div
              className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer ${settings.appearance.theme === 'light' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}
              onClick={() => handleThemeChange('light')}
            >
              <div className="w-16 h-16 bg-white border border-gray-200 rounded-md shadow-sm mb-2"></div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Light</span>
            </div>
            <div
              className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer ${settings.appearance.theme === 'dark' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}
              onClick={() => handleThemeChange('dark')}
            >
              <div className="w-16 h-16 bg-gray-800 border border-gray-700 rounded-md shadow-sm mb-2"></div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Dark</span>
            </div>
            <div
              className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer ${settings.appearance.theme === 'system' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}
              onClick={() => handleThemeChange('system')}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-white to-gray-800 border border-gray-200 rounded-md shadow-sm mb-2"></div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">System</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Font Size</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Adjust the text size in your chats</p>
          <div className="mt-4 flex items-center space-x-4">
            <button
              className={`px-4 py-2 rounded-md ${settings.appearance.fontSize === 'small' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
              onClick={() => handleFontSizeChange('small')}
            >
              Small
            </button>
            <button
              className={`px-4 py-2 rounded-md ${settings.appearance.fontSize === 'medium' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
              onClick={() => handleFontSizeChange('medium')}
            >
              Medium
            </button>
            <button
              className={`px-4 py-2 rounded-md ${settings.appearance.fontSize === 'large' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
              onClick={() => handleFontSizeChange('large')}
            >
              Large
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Chat Background</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Choose a background for your chat conversations</p>
          <div className="mt-4 grid grid-cols-4 gap-4">
            {['default', 'pattern1', 'pattern2', 'solid'].map((bg) => (
              <div
                key={bg}
                className={`h-20 rounded-md cursor-pointer border-2 ${settings.appearance.chatBackground === bg ? 'border-blue-500' : 'border-transparent'}`}
                style={{
                  background: bg === 'default' ? 'linear-gradient(to bottom, #f0f4f8, #d9e2ec)' :
                            bg === 'pattern1' ? 'repeating-linear-gradient(45deg, #f0f4f8, #f0f4f8 10px, #e4e7eb 10px, #e4e7eb 20px)' :
                            bg === 'pattern2' ? 'radial-gradient(circle, #f0f4f8 20%, #e4e7eb 100%)' : '#f0f4f8'
                }}
                onClick={() => handleChatBackgroundChange(bg)}
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderPrivacySettings = () => {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Privacy Settings</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Control who can see your information</p>
          
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Seen</label>
              <select
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
                value={settings.privacy.lastSeen}
                onChange={(e) => handlePrivacyChange('lastSeen', e.target.value)}
              >
                <option value="everyone">Everyone</option>
                <option value="contacts">My Contacts</option>
                <option value="nobody">Nobody</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Profile Photo</label>
              <select
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
                value={settings.privacy.profilePhoto}
                onChange={(e) => handlePrivacyChange('profilePhoto', e.target.value)}
              >
                <option value="everyone">Everyone</option>
                <option value="contacts">My Contacts</option>
                <option value="nobody">Nobody</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Read Receipts</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Let others know when you've read their messages</p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={settings.privacy.readReceipts}
                      onChange={(e) => handlePrivacyChange('readReceipts', e.target.checked)}
                    />
                    <div className={`block w-10 h-6 rounded-full ${settings.privacy.readReceipts ? 'bg-blue-600' : 'bg-gray-400 dark:bg-gray-600'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${settings.privacy.readReceipts ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Typing Indicator</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Let others know when you're typing</p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={settings.privacy.typingIndicator}
                      onChange={(e) => handlePrivacyChange('typingIndicator', e.target.checked)}
                    />
                    <div className={`block w-10 h-6 rounded-full ${settings.privacy.typingIndicator ? 'bg-blue-600' : 'bg-gray-400 dark:bg-gray-600'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${settings.privacy.typingIndicator ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderNotificationSettings = () => {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Notification Settings</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Control how you receive notifications</p>
          
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Messages</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Receive notifications for new messages</p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={settings.notifications.messages}
                      onChange={(e) => handleNotificationChange('messages', e.target.checked)}
                    />
                    <div className={`block w-10 h-6 rounded-full ${settings.notifications.messages ? 'bg-blue-600' : 'bg-gray-400 dark:bg-gray-600'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${settings.notifications.messages ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Group Messages</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Receive notifications for group messages</p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={settings.notifications.groupMessages}
                      onChange={(e) => handleNotificationChange('groupMessages', e.target.checked)}
                    />
                    <div className={`block w-10 h-6 rounded-full ${settings.notifications.groupMessages ? 'bg-blue-600' : 'bg-gray-400 dark:bg-gray-600'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${settings.notifications.groupMessages ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Calls</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Receive notifications for incoming calls</p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={settings.notifications.calls}
                      onChange={(e) => handleNotificationChange('calls', e.target.checked)}
                    />
                    <div className={`block w-10 h-6 rounded-full ${settings.notifications.calls ? 'bg-blue-600' : 'bg-gray-400 dark:bg-gray-600'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${settings.notifications.calls ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sound</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Play sound for notifications</p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={settings.notifications.soundEnabled}
                      onChange={(e) => handleNotificationChange('soundEnabled', e.target.checked)}
                    />
                    <div className={`block w-10 h-6 rounded-full ${settings.notifications.soundEnabled ? 'bg-blue-600' : 'bg-gray-400 dark:bg-gray-600'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${settings.notifications.soundEnabled ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Vibration</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Vibrate for notifications</p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={settings.notifications.vibrationEnabled}
                      onChange={(e) => handleNotificationChange('vibrationEnabled', e.target.checked)}
                    />
                    <div className={`block w-10 h-6 rounded-full ${settings.notifications.vibrationEnabled ? 'bg-blue-600' : 'bg-gray-400 dark:bg-gray-600'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${settings.notifications.vibrationEnabled ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLanguageSettings = () => {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Language</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Choose your preferred language</p>
          
          <div className="mt-4">
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
              value={settings.language}
              onChange={(e) => handleLanguageChange(e.target.value)}
            >
              <option value="English">English</option>
              <option value="Spanish">Español (Spanish)</option>
              <option value="French">Français (French)</option>
              <option value="German">Deutsch (German)</option>
              <option value="Russian">Русский (Russian)</option>
              <option value="Chinese">中文 (Chinese)</option>
              <option value="Japanese">日本語 (Japanese)</option>
              <option value="Korean">한국어 (Korean)</option>
            </select>
          </div>
        </div>
      </div>
    );
  };

  const renderDataUsageSettings = () => {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Data Usage</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Control how BrainMessenger uses your data</p>
          
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Auto-download Media</label>
              <select
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
                value={settings.dataUsage.autoDownloadMedia}
                onChange={(e) => handleDataUsageChange('autoDownloadMedia', e.target.value)}
              >
                <option value="always">Always</option>
                <option value="wifi">Wi-Fi only</option>
                <option value="never">Never</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Low Data Mode</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Reduce data usage when using BrainMessenger</p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={settings.dataUsage.lowDataMode}
                      onChange={(e) => handleDataUsageChange('lowDataMode', e.target.checked)}
                    />
                    <div className={`block w-10 h-6 rounded-full ${settings.dataUsage.lowDataMode ? 'bg-blue-600' : 'bg-gray-400 dark:bg-gray-600'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${settings.dataUsage.lowDataMode ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <NextSeo
        title="Profile - BrainMessenger"
        description="Your profile on BrainMessenger"
      />
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                  {['appearance', 'privacy', 'notifications', 'language', 'dataUsage'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`
                        whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                        ${activeTab === tab
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                        }
                      `}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </nav>
              </div>
              
              <div className="px-6 py-6">
                {activeTab === 'appearance' && renderAppearanceSettings()}
                {activeTab === 'privacy' && renderPrivacySettings()}
                {activeTab === 'notifications' && renderNotificationSettings()}
                {activeTab === 'language' && renderLanguageSettings()}
                {activeTab === 'dataUsage' && renderDataUsageSettings()}
              </div>
              
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;