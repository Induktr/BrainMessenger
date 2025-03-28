import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import { useQuery, useMutation } from '@apollo/client';
import { GET_FILES } from '../../graphql/queries';
import { UPLOAD_FILE, DELETE_FILE } from '../../graphql/mutations';
// TODO: Import generated types

// Remove mock interface FileItem

const FilesPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'shared' | 'favorites'>('all'); // TODO: Implement shared/favorites filtering based on backend data
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedFile, setSelectedFile] = useState<any | null>(null); // Use 'any' for now
  const fileInputRef = useRef<HTMLInputElement>(null);

  // TODO: Get current user ID from authentication context/state
  const currentUserId = 'user123'; // Replace with actual dynamic user ID

  // --- Fetch Files ---
  const { data: filesData, loading: filesLoading, error: filesError, refetch: refetchFiles } = useQuery(GET_FILES, {
    // No variables needed if backend gets user from context
    pollInterval: 60000, // Optional polling
  });
  const files = filesData?.getFiles || [];
  // --- End Fetch Files ---

  // --- Upload File Mutation ---
  const [uploadFileMutation, { loading: uploadingFile, error: uploadError }] = useMutation(UPLOAD_FILE, {
    onCompleted: (data) => {
      console.log('File uploaded:', data);
      refetchFiles(); // Refetch file list after upload
      alert('File uploaded successfully!');
    },
    onError: (error) => {
      console.error("Upload error:", error);
      alert(`File upload failed: ${error.message}`);
    }
  });
  // --- End Upload File Mutation ---

  // --- Delete File Mutation ---
   const [deleteFileMutation, { loading: deletingFile, error: deleteError }] = useMutation(DELETE_FILE, {
    onCompleted: (data) => {
      if (data.deleteFile) {
        console.log('File deleted');
        refetchFiles(); // Refetch file list
        setSelectedFile(null); // Close details sidebar if open
        alert('File deleted successfully!');
      } else {
        alert('Failed to delete file.');
      }
    },
    onError: (error) => {
      console.error("Delete error:", error);
      alert(`Failed to delete file: ${error.message}`);
    }
  });
  // --- End Delete File Mutation ---

  // Remove mock files data
  // const [files, setFiles] = useState<FileItem[]>([]);

  // --- File Upload Handler ---
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('Selected file:', file.name, file.size, file.type);
      uploadFileMutation({ variables: { file } });
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  // --- End File Upload Handler ---

  // --- Delete File Handler ---
  const handleDeleteFile = (fileId: string, event: React.MouseEvent) => {
      event.stopPropagation(); // Prevent opening details sidebar
      if (window.confirm('Are you sure you want to delete this file?')) {
          deleteFileMutation({ variables: { fileId } });
      }
  };
  // --- End Delete File Handler ---


  // Filter files based on active tab and search query
  const filteredFiles = files.filter((file: any) => { // Use 'any' for now
    // TODO: Implement shared/favorites filtering when backend supports it
    // if (activeTab === 'shared' && ...) return false;
    // if (activeTab === 'favorites' && ...) return false;

    if (searchQuery && !file.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;

    return true;
  });

  // Sort files
  const sortedFiles = [...filteredFiles].sort((a: any, b: any) => { // Use 'any' for now
    if (sortBy === 'name') {
      return sortOrder === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortBy === 'date') {
      // Use createdAt from backend
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    } else { // size
      return sortOrder === 'asc' ? a.size - b.size : b.size - a.size;
    }
  });

  // Utility functions (keep formatFileSize, formatDate, getFileIcon)
   const formatFileSize = (bytes: number) => {
     if (!bytes) return '0 B'; // Handle null/zero size
     if (bytes < 1024) return bytes + ' B';
     if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
     if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
     return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
   };
   const formatDate = (dateString: string | Date) => {
     const date = new Date(dateString);
     const today = new Date();
     const yesterday = new Date(today);
     yesterday.setDate(yesterday.getDate() - 1);
     if (date.toDateString() === today.toDateString()) return 'Today, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
     if (date.toDateString() === yesterday.toDateString()) return 'Yesterday, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
     return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
   };
   const getFileIcon = (type: string) => {
     if (!type) return ( // Default icon if type is missing
        <svg className="h-8 w-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
           <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
         </svg>
     );
     const mimeType = type.split('/')[0];
     switch (mimeType) {
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
       case 'application':
         if (type.includes('pdf')) {
            // Specific PDF icon maybe?
         }
         return (
           <svg className="h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
             <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
           </svg>
         );
       default: // Default file icon
         return (
           <svg className="h-8 w-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
             <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
           </svg>
         );
     }
   };
  // --- End Utility Functions ---

  const handleFileClick = (file: any) => { // Use 'any' for now
    setSelectedFile(file);
  };

  const handleCloseFileDetails = () => {
    setSelectedFile(null);
  };

  // Removed handleToggleFavorite

  return (
    <>
      <NextSeo
        title="Files - BrainMessenger"
        description="Manage your files on BrainMessenger"
      />

      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        {/* Sidebar */}
        <div className="w-64 flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Files</h2>
          </div>

          {/* Upload Button */}
          <div className="p-4">
             <input
               type="file"
               ref={fileInputRef}
               onChange={handleFileChange}
               style={{ display: 'none' }}
             />
            <button
              onClick={triggerFileInput}
              disabled={uploadingFile}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {uploadingFile ? (
                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
              ) : (
                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {uploadingFile ? 'Uploading...' : 'Upload File'}
            </button>
             {uploadError && <p className="text-xs text-error-text mt-1">Upload failed.</p>}
          </div>

          {/* Navigation Tabs */}
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
             {/* TODO: Implement Shared/Favorites Tabs */}
             {/* <button onClick={() => setActiveTab('shared')} ... > Shared with me </button> */}
             {/* <button onClick={() => setActiveTab('favorites')} ... > Favorites </button> */}
          </nav>

          {/* Storage Info (Placeholder) */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
             <div className="flex items-center">
               <div className="flex-shrink-0">
                 <img className="h-8 w-8 rounded-full" src="/avatars/default.jpg" alt="Your profile" />
               </div>
               <div className="ml-3">
                 <p className="text-sm font-medium text-gray-900 dark:text-white">You</p>
                 <p className="text-xs text-gray-500 dark:text-gray-400">Storage info unavailable</p>
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
            {filesLoading && <p className="text-center text-textSecondary-dark">Loading files...</p>}
            {filesError && <p className="text-center text-error-text">Error loading files: {filesError.message}</p>}
            {!filesLoading && !filesError && sortedFiles.length === 0 && (
               <div className="flex flex-col items-center justify-center h-full">
                 <svg className="h-16 w-16 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                 </svg>
                 <p className="mt-4 text-gray-500 dark:text-gray-400">No files found</p>
               </div>
            )}
            {!filesLoading && !filesError && sortedFiles.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sortedFiles.map((file: any) => ( // Use fetched and sorted files
                  <div
                    key={file.id}
                    onClick={() => handleFileClick(file)}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200"
                  >
                    {/* Thumbnail/Icon */}
                    <div className="h-32 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      {/* TODO: Add proper thumbnail logic if URL available */}
                      {getFileIcon(file.type)}
                    </div>
                    {/* File Info */}
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate" title={file.name}>
                          {file.name}
                        </h3>
                        {/* TODO: Add Favorite button logic */}
                        <button className="ml-2 text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400">
                           <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                           </svg>
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(file.size)} • {formatDate(file.createdAt)}
                      </p>
                      {/* Uploader Info */}
                      <div className="mt-2 flex items-center">
                        <img
                          src={file.uploader?.avatar || '/avatars/default.jpg'} // Use uploader info
                          alt={file.uploader?.name || 'Unknown uploader'}
                          className="h-5 w-5 rounded-full"
                        />
                        <span className="ml-1 text-xs text-gray-500 dark:text-gray-400 truncate">
                          {file.uploader?.name || 'Unknown'}
                        </span>
                        {/* TODO: Add Shared With icons */}
                      </div>
                       {/* Delete Button */}
                       <button
                           onClick={(e) => handleDeleteFile(file.id, e)}
                           disabled={deletingFile}
                           className="mt-2 text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                       >
                           Delete
                       </button>
                       {deleteError && <p className="text-xs text-error-text mt-1">Delete failed.</p>}
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
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
               <h2 className="text-lg font-medium text-gray-900 dark:text-white">File Details</h2>
               <button onClick={handleCloseFileDetails} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
               </button>
            </div>
            {/* Content */}
            <div className="p-4">
               {/* Preview/Icon */}
               <div className="h-48 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                 {/* TODO: Add proper preview logic */}
                 {getFileIcon(selectedFile.type)}
               </div>
               <h3 className="text-lg font-medium text-gray-900 dark:text-white break-words">
                 {selectedFile.name}
               </h3>
               {/* File Info */}
               <div className="mt-4 space-y-3">
                 <div>
                   <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">File Info</h4>
                   <div className="mt-2 space-y-2">
                     <div className="flex justify-between"><span className="text-sm text-gray-500 dark:text-gray-400">Type</span><span className="text-sm text-gray-900 dark:text-white capitalize">{selectedFile.type}</span></div>
                     <div className="flex justify-between"><span className="text-sm text-gray-500 dark:text-gray-400">Size</span><span className="text-sm text-gray-900 dark:text-white">{formatFileSize(selectedFile.size)}</span></div>
                     <div className="flex justify-between"><span className="text-sm text-gray-500 dark:text-gray-400">Uploaded</span><span className="text-sm text-gray-900 dark:text-white">{formatDate(selectedFile.createdAt)}</span></div>
                     {/* Removed Modified */}
                   </div>
                 </div>
                 {/* Uploader Info */}
                 <div>
                   <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Uploaded By</h4>
                   <div className="mt-2 space-y-2">
                     <div className="flex items-center">
                       <img src={selectedFile.uploader?.avatar || '/avatars/default.jpg'} alt={selectedFile.uploader?.name || 'Unknown'} className="h-8 w-8 rounded-full" />
                       <div className="ml-3">
                         <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedFile.uploader?.name || 'Unknown'}</p>
                         <p className="text-xs text-gray-500 dark:text-gray-400">Owner</p>
                       </div>
                     </div>
                     {/* Removed Shared With section */}
                   </div>
                 </div>
               </div>
               {/* Action Buttons */}
               <div className="mt-6 flex space-x-2">
                  <a href={selectedFile.url} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                     <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg> Download
                  </a>
                  {/* Removed Share, Favorite buttons */}
                   <button
                       onClick={(e) => handleDeleteFile(selectedFile.id, e)}
                       disabled={deletingFile}
                       className="flex items-center justify-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
                   >
                       <svg className="h-5 w-5 mr-2 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                       Delete
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