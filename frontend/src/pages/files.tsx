import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';

interface FileItem {
  id: string;
  name: string;
  type: 'image' | 'document' | 'audio' | 'video' | 'other';
  size: number; // in bytes
  uploadedBy: {
    id: string;
    name: string;
    avatar: string;
  };
  sharedWith: {
    id: string;
    name: string;
    avatar: string;
  }[];
  uploadDate: Date;
  lastModified: Date;
  thumbnailUrl?: string;
  url: string;
  favorite: boolean;
}

const FilesPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'shared' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  
  // Mock files data
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: 'file1',
      name: 'Project Presentation.pptx',
      type: 'document',
      size: 2500000, // 2.5 MB
      uploadedBy: {
        id: 'user1',
        name: 'Alex Johnson',
        avatar: '/avatars/alex.jpg'
      },
      sharedWith: [
        { id: 'user2', name: 'John Doe', avatar: '/avatars/john.jpg' },
        { id: 'user3', name: 'Jane Smith', avatar: '/avatars/jane.jpg' }
      ],
      uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      url: '/files/presentation.pptx',
      favorite: true
    },
    {
      id: 'file2',
      name: 'Team Photo.jpg',
      type: 'image',
      size: 1500000, // 1.5 MB
      uploadedBy: {
        id: 'user2',
        name: 'John Doe',
        avatar: '/avatars/john.jpg'
      },
      sharedWith: [
        { id: 'user1', name: 'Alex Johnson', avatar: '/avatars/alex.jpg' },
        { id: 'user3', name: 'Jane Smith', avatar: '/avatars/jane.jpg' }
      ],
      uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
      lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
      thumbnailUrl: '/files/thumbnails/team-photo.jpg',
      url: '/files/team-photo.jpg',
      favorite: false
    },
    {
      id: 'file3',
      name: 'Project Requirements.docx',
      type: 'document',
      size: 350000, // 350 KB
      uploadedBy: {
        id: 'user3',
        name: 'Jane Smith',
        avatar: '/avatars/jane.jpg'
      },
      sharedWith: [
        { id: 'user1', name: 'Alex Johnson', avatar: '/avatars/alex.jpg' },
        { id: 'user2', name: 'John Doe', avatar: '/avatars/john.jpg' }
      ],
      uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
      lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      url: '/files/requirements.docx',
      favorite: true
    },
    {
      id: 'file4',
      name: 'Meeting Recording.mp3',
      type: 'audio',
      size: 15000000, // 15 MB
      uploadedBy: {
        id: 'user1',
        name: 'Alex Johnson',
        avatar: '/avatars/alex.jpg'
      },
      sharedWith: [
        { id: 'user2', name: 'John Doe', avatar: '/avatars/john.jpg' },
        { id: 'user3', name: 'Jane Smith', avatar: '/avatars/jane.jpg' }
      ],
      uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
      lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
      url: '/files/meeting.mp3',
      favorite: false
    },
    {
      id: 'file5',
      name: 'Product Demo.mp4',
      type: 'video',
      size: 45000000, // 45 MB
      uploadedBy: {
        id: 'user2',
        name: 'John Doe',
        avatar: '/avatars/john.jpg'
      },
      sharedWith: [
        { id: 'user1', name: 'Alex Johnson', avatar: '/avatars/alex.jpg' },
        { id: 'user3', name: 'Jane Smith', avatar: '/avatars/jane.jpg' }
      ],
      uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago
      lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago
      thumbnailUrl: '/files/thumbnails/product-demo.jpg',
      url: '/files/product-demo.mp4',
      favorite: true
    }
  ]);

  // Filter files based on active tab and search query
  const filteredFiles = files.filter(file => {
    // Filter by tab
    if (activeTab === 'shared' && file.sharedWith.length === 0) return false;
    if (activeTab === 'favorites' && !file.favorite) return false;
    
    // Filter by search query
    if (searchQuery && !file.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    return true;
  });

  // Sort files
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    if (sortBy === 'name') {
      return sortOrder === 'asc' 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    } else if (sortBy === 'date') {
      return sortOrder === 'asc' 
        ? a.uploadDate.getTime() - b.uploadDate.getTime() 
        : b.uploadDate.getTime() - a.uploadDate.getTime();
    } else { // size
      return sortOrder === 'asc' 
        ? a.size - b.size 
        : b.size - a.size;
    }
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'document':
        return (
          <svg className="h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      case 'image':
        return (
          <svg className="h-8 w-8 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        );
      case 'audio':
        return (
          <svg className="h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
          </svg>
        );
      case 'video':
        return (
          <svg className="h-8 w-8 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
        );
      default:
        return (
          <svg className="h-8 w-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const handleFileClick = (file: FileItem) => {
    setSelectedFile(file);
  };

  const handleCloseFileDetails = () => {
    setSelectedFile(null);
  };

  const handleToggleFavorite = (fileId: string) => {
    setFiles(files.map(file => 
      file.id === fileId ? { ...file, favorite: !file.favorite } : file
    ));
  };

  const handleUploadFile = () => {
    // In a real app, this would open a file picker and upload the file
    console.log('Upload file');
  };

  return (
    <>
        <NextSeo
          title="Profile - BrainMessenger"
          description="Your profile on BrainMessenger"
        />

      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        {/* Sidebar */}
        <div className="w-64 flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Files</h2>
          </div>
          
          <div className="p-4">
            <button
              onClick={handleUploadFile}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              Upload File
            </button>
          </div>
          
          <nav className="flex-1 px-2 py-4 space-y-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`w-full flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                activeTab === 'all'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <svg className="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
              All Files
            </button>
            
            <button
              onClick={() => setActiveTab('shared')}
              className={`w-full flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                activeTab === 'shared'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <svg className="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
              </svg>
              Shared with me
            </button>
            
            <button
              onClick={() => setActiveTab('favorites')}
              className={`w-full flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                activeTab === 'favorites'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <svg className="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Favorites
            </button>
          </nav>
          
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img
                  className="h-8 w-8 rounded-full"
                  src="/avatars/alex.jpg"
                  alt="Your profile"
                />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Alex Johnson</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">5 GB used of 15 GB</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Search and sort */}
          <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search files..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              
              <div className="flex items-center ml-4">
                <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Sort by:</span>
                <select
                  className="border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'size')}
                >
                  <option value="name">Name</option>
                  <option value="date">Date</option>
                  <option value="size">Size</option>
                </select>
                
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="ml-2 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {sortOrder === 'asc' ? (
                    <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* File list */}
          <div className="flex-1 overflow-y-auto p-4">
            {sortedFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <svg className="h-16 w-16 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                <p className="mt-4 text-gray-500 dark:text-gray-400">No files found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sortedFiles.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => handleFileClick(file)}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="h-32 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      {file.type === 'image' && file.thumbnailUrl ? (
                        <img
                          src={file.thumbnailUrl}
                          alt={file.name}
                          className="h-full w-full object-cover"
                        />
                      ) : file.type === 'video' && file.thumbnailUrl ? (
                        <div className="relative h-full w-full">
                          <img
                            src={file.thumbnailUrl}
                            alt={file.name}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-black bg-opacity-50 rounded-full p-2">
                              <svg className="h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      ) : (
                        getFileIcon(file.type)
                      )}
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate" title={file.name}>
                          {file.name}
                        </h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(file.id);
                          }}
                          className="ml-2 text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400"
                        >
                          {file.favorite ? (
                            <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          )}
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(file.size)} • {formatDate(file.uploadDate)}
                      </p>
                      <div className="mt-2 flex items-center">
                        <img
                          src={file.uploadedBy.avatar}
                          alt={file.uploadedBy.name}
                          className="h-5 w-5 rounded-full"
                        />
                        <span className="ml-1 text-xs text-gray-500 dark:text-gray-400 truncate">
                          {file.uploadedBy.name}
                        </span>
                        {file.sharedWith.length > 0 && (
                          <div className="ml-auto flex -space-x-1">
                            {file.sharedWith.slice(0, 3).map((user) => (
                              <img
                                key={user.id}
                                src={user.avatar}
                                alt={user.name}
                                className="h-5 w-5 rounded-full border border-white dark:border-gray-800"
                                title={user.name}
                              />
                            ))}
                            {file.sharedWith.length > 3 && (
                              <div className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs text-gray-600 dark:text-gray-300 border border-white dark:border-gray-800">
                                +{file.sharedWith.length - 3}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* File details sidebar */}
        {selectedFile && (
          <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">File Details</h2>
              <button
                onClick={handleCloseFileDetails}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="p-4">
              <div className="h-48 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                {selectedFile.type === 'image' && selectedFile.thumbnailUrl ? (
                  <img
                    src={selectedFile.thumbnailUrl}
                    alt={selectedFile.name}
                    className="h-full w-full object-contain rounded-lg"
                  />
                ) : selectedFile.type === 'video' && selectedFile.thumbnailUrl ? (
                  <div className="relative h-full w-full">
                    <img
                      src={selectedFile.thumbnailUrl}
                      alt={selectedFile.name}
                      className="h-full w-full object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black bg-opacity-50 rounded-full p-3">
                        <svg className="h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-24 w-24">
                    {getFileIcon(selectedFile.type)}
                  </div>
                )}
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 dark:text-white break-words">
                {selectedFile.name}
              </h3>
              
              <div className="mt-4 space-y-3">
                <div>
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">File Info</h4>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Type</span>
                      <span className="text-sm text-gray-900 dark:text-white capitalize">{selectedFile.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Size</span>
                      <span className="text-sm text-gray-900 dark:text-white">{formatFileSize(selectedFile.size)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Uploaded</span>
                      <span className="text-sm text-gray-900 dark:text-white">{formatDate(selectedFile.uploadDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Modified</span>
                      <span className="text-sm text-gray-900 dark:text-white">{formatDate(selectedFile.lastModified)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Shared With</h4>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center">
                      <img
                        src={selectedFile.uploadedBy.avatar}
                        alt={selectedFile.uploadedBy.name}
                        className="h-8 w-8 rounded-full"
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedFile.uploadedBy.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Owner</p>
                      </div>
                    </div>
                    
                    {selectedFile.sharedWith.map((user) => (
                      <div key={user.id} className="flex items-center">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="h-8 w-8 rounded-full"
                        />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Can view</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex space-x-2">
                <button className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Download
                </button>
                <button className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleToggleFavorite(selectedFile.id)}
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {selectedFile.favorite ? (
                    <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FilesPage;