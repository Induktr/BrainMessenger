'use client';

import React, { useState, useEffect, useRef } from 'react'; // Corrected import
import Modal from '@/shared/ui/Modal/Modal';
import { ICONS } from '@/shared/assets/Icons/icons'; // Adjusted import based on usage
import Button from '@/shared/ui/Button/Button';
import { useAuth } from '@/features/user-auth/ui/AuthContext';
import { generateAvatarData } from '@/entities/user/model/user-generate-avatar';
import Spinner from '@/shared/ui/Spinner/Spinner'; // Import LazyLoading
import { useMutation, useApolloClient } from '@apollo/client';
import Image from 'next/image'; // Corrected import
import { UPLOAD_AVATAR, UPDATE_USER_PROFILE, GET_CURRENT_USER, SEND_VERIFICATION_EMAIL, VERIFY_EMAIL } from '@/entities/user/model/user.queries';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { MyAccountProps } from '@/features/manage-account/model/manage-account.types';
import useStatusTyping from '@/entities/chat/model/useStatusTyping';

const MyAccount: React.FC<MyAccountProps> = ({ isOpen, onClose, onBack, chatId, status }) => {
  const { user, queryLoading, refetchUser, setUserState, logout } = useAuth();
  const [uploadAvatarMutation, { loading: uploading, error: uploadError }] = useMutation(UPLOAD_AVATAR);
  const [updateUserProfileMutation, { loading: isUpdatingProfile, error: updateProfileError }] = useMutation(UPDATE_USER_PROFILE);
  const [sendVerificationEmailMutation, { loading: isSendingVerificationEmail, error: sendVerificationEmailError }] = useMutation(SEND_VERIFICATION_EMAIL);
  const [verifyEmailMutation, { loading: isVerifyingEmail, error: verifyEmailError }] = useMutation(VERIFY_EMAIL);

  const client = useApolloClient();
  const [biography, setBiography] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<'name' | 'username' | 'email' | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editError, setEditError] = useState(''); // New state for edit modal errors
  const [emailVerificationModalOpen, setEmailVerificationModalOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [isResendingCode, setIsResendingCode] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false); // State for cropping modal visibility
  const [imageSrc, setImageSrc] = useState<string | null>(null); // State for image source
  const [crop, setCrop] = useState<Crop>(); // State for the crop object
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>(); // State for the completed crop
  const imgRef = useRef<HTMLImageElement>(null); // Ref for the image element
  const { dynamicStatus } = useStatusTyping(chatId, status)

// Effect to potentially show email verification modal
  useEffect(() => {
    if (user && !user.isVerified && isOpen) {
      // Only show if the main MyAccount modal is open and user is not verified
      // setEmailVerificationModalOpen(true); // Enable this when ready to force verification
    }
  }, [user, isOpen]);
  // Effect to initialize biography state when user data is loaded or changes
  useEffect(() => {
    if (user) {
      setBiography(user.bio || '');
    }
  }, [user]); // Re-run when user object changes

  // Effect to refetch user data when the modal is opened
  useEffect(() => {
    if (isOpen && refetchUser) {
      refetchUser();
    }
  }, [isOpen, refetchUser]); // Re-run when modal is opened or refetchUser changes

  // Debounce effect for saving biography
  useEffect(() => {
    if (!user || (biography === user?.bio) || (biography === '' && (user?.bio === null || user?.bio === undefined))) {
      return;
    }

    const handler = setTimeout(() => {
      updateUserProfileMutation({
        variables: {
          id: user.id,
          input: { bio: biography },
        },
      })
      .then(response => {
        if (response.data && response.data.updateUser) {
          client.writeQuery({
            query: GET_CURRENT_USER,
            data: {
              getCurrentUser: response.data.updateUser,
            },
          });
          setUserState(response.data.updateUser);
        }
      })
      .catch(error => {
        console.error('MyAccount - Error saving biography:', error);
      });
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [biography, user, updateUserProfileMutation, client, setUserState]);
  // Generate avatar data
  const avatarData = generateAvatarData(user?.name);

  // Optional: Show loading state or placeholder if user data is loading
  if (queryLoading) {
    return (
      <Modal onClose={onClose} isOpen={isOpen}>
        <div className="myaccount-modal-content">
          <div className="myaccount-header">
            <Button className="myaccount-back-button" onClick={onBack}>
              <Image width={24} height={24} src={ICONS.arrowLeft} alt="Back" className="icon" />
            </Button>
            <h2 className="myaccount-header-title">Info</h2>
            <Button className="myaccount-close-button" onClick={onClose}>
              <Image width={24} height={24} src={ICONS.closeModal} alt="Close" className="icon" />
            </Button>
          </div>
          <div className="myaccount-user-info-section">
            <Spinner className="myaccount-avatar" /> {/* Avatar loading */}
            <div className="myaccount-name-status">
              <Spinner className="lazy-loading-text-line myaccount-loading-name" /> {/* Name loading */}
              <Spinner className="lazy-loading-text-line myaccount-loading-status" /> {/* Status loading */}
            </div>
            <Spinner className="lazy-loading-block myaccount-loading-bio" /> {/* Biography loading */}
          </div>
          <div className="myaccount-separator"></div>
          <div className="myaccount-detailed-info">
            <div className="myaccount-name-username-group">
              <div className="myaccount-info-item">
                <Spinner className="lazy-loading-text-line myaccount-loading-info-label" /> {/* Name label loading */}
                <Spinner className="lazy-loading-text-line myaccount-loading-info-value" /> {/* Name value loading */}
              </div>
              <div className="myaccount-info-item">
                <Spinner className="lazy-loading-text-line myaccount-loading-info-label" /> {/* Username label loading */}
                <Spinner className="lazy-loading-text-line myaccount-loading-info-value" /> {/* Username value loading */}
              </div>
            </div>
            <div className="myaccount-info-item myaccount-info-item-centered">
              <Spinner className="lazy-loading-text-line myaccount-loading-info-label" /> {/* Email label loading */}
              <Spinner className="lazy-loading-text-line myaccount-loading-email-value" /> {/* Email value loading */}
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  // Optional: Handle case where user is not logged in
  if (!user) {
    // Depending on app flow, maybe redirect or show a message
    return null; // Or render a different component/message
  }

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setCropModalOpen(true); // Open the cropping modal
      };
      reader.readAsDataURL(file);
    }
    // Clear the input value so the same file can be selected again
    event.target.value = '';
  };

  const handleEditClick = (field: 'name' | 'username' | 'email') => {
    if (!user) return; // Add null check for user
    setEditingField(field);
    if (field === 'name') {
      setEditValue(user.name || '');
    } else if (field === 'username') {
      setEditValue(user.username || '');
    } else if (field === 'email') {
      setEditValue(user.email || '');
    }
    setEditError(''); // Clear previous errors when opening the modal
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setEditingField(null);
    setEditValue('');
  };

  const handleEmailVerificationModalClose = () => {
    setEmailVerificationModalOpen(false);
    setVerificationCode('');
    setVerificationError('');
    setResendSuccess(false);
    setIsResendingCode(false);
  };

  const handleSaveEdit = async () => {
    if (!user || !editingField) return; // Ensure user is not null

    const trimmedEditValue = editValue.trim();

    // Validation for empty fields
    if (trimmedEditValue === '') {
      setEditError(`${editingField.charAt(0).toUpperCase() + editingField.slice(1)} cannot be empty.`);
      return;
    }

    // Specific validation for email format
    if (editingField === 'email' && trimmedEditValue !== '' && !/\S+@\S+\.\S+/.test(trimmedEditValue)) {
      setEditError('Please enter a valid email address.');
      return;
    }

    // If the value hasn't changed, just close the modal without saving
    if (
      (editingField === 'name' && trimmedEditValue === user.name) ||
      (editingField === 'username' && trimmedEditValue === user.username) ||
      (editingField === 'email' && trimmedEditValue === user.email)
    ) {
      handleEditModalClose();
      return;
    }

    const input: { name?: string; username?: string; email?: string } = {};
    let shouldRefetch = true; // Flag to control refetching

    if (editingField === 'name') {
      input.name = trimmedEditValue;
    } else if (editingField === 'username') {
      input.username = trimmedEditValue;
    } else if (editingField === 'email') {
      input.email = trimmedEditValue;
      // If email is changed, set isVerified to false on the client side immediately
      // The backend will handle sending a new verification email and updating isVerified status
    }

    try {
      const response = await updateUserProfileMutation({
        variables: {
          id: user.id,
          input: input,
        },
      });

      if (response.data && response.data.updateUser) {
        // Update Apollo Client cache
        client.writeQuery({
          query: GET_CURRENT_USER,
          data: {
            getCurrentUser: response.data.updateUser,
          },
        });
        setUserState(response.data.updateUser); // Always update AuthContext state with backend's response
        handleEditModalClose();
        refetchUser(); // Always refetch to ensure all components get the latest data, including isVerified

        // If email was changed and the backend indicates it's no longer verified, open the verification modal
        if (editingField === 'email' && !response.data.updateUser.isVerified) {
          setEmailVerificationModalOpen(true);
        }
      }
    } catch (error: any) {
      console.error(`Error saving ${editingField}:`, error);
      // Display error message to user
      setEditError(error.message || `Failed to update ${editingField}.`); // Use setEditError for edit modal
    }
  };

  const handleResendVerificationEmail = async () => {
    if (!user || isResendingCode) return; // Ensure user is not null
    setIsResendingCode(true);
    setResendSuccess(false);
    setVerificationError('');
    try {
      await sendVerificationEmailMutation({ variables: { email: user.email } }); // Pass user.email as a variable
      setResendSuccess(true);
      setEmailVerificationModalOpen(true); // Open the verification modal after successful resend
    } catch (error: any) {
      console.error('Error resending verification email:', error);
      setVerificationError(error.message || 'Failed to resend verification email.');
    } finally {
      setIsResendingCode(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!user) return; // Ensure user is not null
    setVerificationError('');
    try {
      const response = await verifyEmailMutation({
        variables: { code: verificationCode },
      });
      if (response.data && response.data.verifyEmail) {
        setUserState(response.data.verifyEmail);
        handleEmailVerificationModalClose();
        refetchUser(); // Refetch to ensure all components are updated
      }
    } catch (error: any) {
      console.error('Error verifying email:', error);
      setVerificationError(error.message || 'Invalid verification code or email.');
    }
  };

  if (queryLoading) {
    return (
      <Modal onClose={onClose} isOpen={isOpen}>
        <div className="myaccount-modal-content">
          <div className="myaccount-header">
            <Button className="myaccount-back-button" onClick={onBack}>
              <Image width={24} height={24} src={ICONS.arrowLeft} alt="Back" className="icon" />
            </Button>
            <h2 className="myaccount-header-title">Info</h2>
            <Button className="myaccount-close-button" onClick={onClose}>
              <Image width={24} height={24} src={ICONS.closeModal} alt="Close" className="icon" />
            </Button>
          </div>
          <div className="myaccount-user-info-section">
            <Spinner className="myaccount-avatar" /> {/* Avatar loading */}
            <div className="myaccount-name-status">
              <Spinner className="lazy-loading-text-line myaccount-loading-name" /> {/* Name loading */}
              <Spinner className="lazy-loading-text-line myaccount-loading-status" /> {/* Status loading */}
            </div>
            <Spinner className="lazy-loading-block myaccount-loading-bio" /> {/* Biography loading */}
          </div>
          <div className="myaccount-separator"></div>
          <div className="myaccount-detailed-info">
            <div className="myaccount-name-username-group">
              <div className="myaccount-info-item">
                <Spinner className="lazy-loading-text-line myaccount-loading-info-label" /> {/* Name label loading */}
                <Spinner className="lazy-loading-text-line myaccount-loading-info-value" /> {/* Name value loading */}
              </div>
              <div className="myaccount-info-item">
                <Spinner className="lazy-loading-text-line myaccount-loading-info-label" /> {/* Username label loading */}
                <Spinner className="lazy-loading-text-line myaccount-loading-info-value" /> {/* Username value loading */}
              </div>
            </div>
            <div className="myaccount-info-item myaccount-info-item-centered">
              <Spinner className="lazy-loading-text-line myaccount-loading-info-label" /> {/* Email label loading */}
              <Spinner className="lazy-loading-text-line myaccount-loading-email-value" /> {/* Email value loading */}
            </div>
          </div>
        </div>
      </Modal>
    );
  }


  return (
    <>
      <Modal onClose={onClose} isOpen={isOpen}>
        <div className="myaccount-modal-content">
          {/* Header */}
          <div className="myaccount-header">
            <Button className="myaccount-back-button" onClick={onBack}>
              <Image width={24} height={24} src={ICONS.arrowLeft} alt="Back" className="icon" />
            </Button>
            <h2 className="myaccount-header-title">Info</h2>
            <Button className="myaccount-close-button" onClick={onClose}>
              <Image width={24} height={24} src={ICONS.closeModal} alt="Close" className="icon" />
            </Button>
          </div>

          {/* User Info Section */}
          <div className="myaccount-user-info-section">
            {/* Avatar and Dropdown Container */}
            <div className="myaccount-avatar-container" style={{ position: 'relative' }}>
              <div
                className="myaccount-avatar"
                style={{ backgroundColor: avatarData.color, cursor: 'pointer' }}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {user.avatarUrl ? (
                  <img key={user.avatarUrl} src={user.avatarUrl} alt="User Avatar" className="myaccount-avatar-image" />
                ) : (
                  <>
                    <span className="myaccount-avatar-letter">{avatarData.letter}</span>
                    <div className="myaccount-avatar-overlay">
                      <span className="myaccount-avatar-upload-text">Upload a fresh photo</span>
                    </div>
                  </>
                )}
              </div>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="myaccount-avatar-dropdown">
                  {/* Upload Avatar Option */}
                  <div
                    className="myaccount-dropdown-item"
                    onClick={() => {
                      document.getElementById('avatarUploadInput')?.click();
                      setDropdownOpen(false);
                    }}
                    style={{ padding: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    <Image width={24} height={24} className="myaccount-dropdown-icon" alt="Upload Avatar" src={ICONS.uploadImage}></Image>
                    Upload Avatar
                  </div>
                  {/* Logout Option */}
                  <div
                    className="myaccount-dropdown-item"
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                    style={{ padding: '10px', cursor: 'pointer' }}
                  >
                    <Image width={24} height={24} className="myaccount-dropdown-icon" alt="Logout Account" src={ICONS.logout}></Image>
                    Logout
                  </div>
                </div>
              )}
            </div>
            {/* Hidden file input */}
            <input
              id="avatarUploadInput"
              type="file"
              accept=".png,.jpeg,.jpg,.webp,.ico"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            {/* Upload status indicators */}
            {uploading && <p className="myaccount-upload-status">Uploading...</p>}
            {uploadError && (
              <p className="myaccount-upload-error">
                Upload failed: {uploadError.message}
              </p>
            )}
            <div className="myaccount-name-status">
                <h2 className="myaccount-user-name">{user.name || 'Guest'}</h2>
                <p className={`myaccount-user-status ${dynamicStatus}`}>
                  {dynamicStatus  || 'offline' ? 'online' : 'offline'}
                </p>
            </div>
            {/* Replace placeholder p with textarea for biography */}
            <textarea
              className="myaccount-bio-textarea"
              value={biography}
              onChange={(e) => setBiography(e.target.value)}
              placeholder="Enter your biography here..."
              rows={4}
            />
          </div>

          {/* Separator */}
          <div className="myaccount-separator"></div>

          {/* Detailed User Info */}
          <div className="myaccount-detailed-info">
            <div className="myaccount-name-username-group">
              <div className="myaccount-info-item" onClick={() => handleEditClick('name')} style={{ cursor: 'pointer' }}>
                <div className="myaccount-info-icon"><Image width={24} height={24} src={ICONS.account} alt="Account" /></div>
                <div className="myaccount-info-text">
                  <p className="myaccount-info-label">Name</p>
                  <p className="myaccount-info-value">{user.name || 'N/A'}</p>
                </div>
              </div>
              <div className="myaccount-info-item" onClick={() => handleEditClick('username')} style={{ cursor: 'pointer' }}>
                <div className="myaccount-info-icon"><Image width={24} height={24} src={ICONS.usernameDog} alt="Username" /></div>
                <div className="myaccount-info-text">
                  <p className="myaccount-info-label">Username</p>
                  <p className="myaccount-info-value myaccount-info-value-green">@{user.username || 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className="myaccount-info-item myaccount-info-item-centered" onClick={() => handleEditClick('email')} style={{ cursor: 'pointer' }}>
              <div className="myaccount-info-icon"><Image width={24} height={24} src={ICONS.mail} alt="Email" /></div>
              <div className="myaccount-info-text">
                <p className="myaccount-info-label">Email</p>
                <p className="myaccount-info-value">{user.email || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Generic Edit Modal */}
      {editModalOpen && (
        <Modal onClose={handleEditModalClose} isOpen={editModalOpen}>
          <div className="edit-modal-content">
            <h3>Edit {editingField}</h3>
            <input
              type={editingField === 'email' ? 'email' : 'text'}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="edit-modal-input"
            />
            {editingField === 'email' && (
              <div className="email-verification-section">
                <p>Status: {user.isVerified ? 'Verified' : 'Not Verified'}</p>
                {!user.isVerified && (
                  <Button onClick={handleResendVerificationEmail} disabled={isResendingCode}>
                    {isResendingCode ? 'Sending...' : 'Resend Verification Email'}
                  </Button>
                )}
                {resendSuccess && <p className="success-message">Verification email sent!</p>}


                {editError && <p className="error-message">{editError}</p>} {/* Display editError here */}
              </div>
            )}
            <Button onClick={handleSaveEdit}>Save</Button>
            <Button onClick={handleEditModalClose}>Cancel</Button>
          </div>
        </Modal>
      )}

      {/* Email Verification Modal (for unverified users on login) */}
      {emailVerificationModalOpen && (
        <Modal onClose={handleEmailVerificationModalClose} isOpen={emailVerificationModalOpen}>
          <div className="verification-modal-content">
            <h3>Verify Your Email</h3>
            <p>Please enter the verification code sent to {user.email}.</p>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter code"
              className="verification-modal-input"
            />
            {verificationError && <p className="error-message">{verificationError}</p>}
            <Button onClick={handleVerifyEmail}>Verify</Button>
            <Button onClick={handleResendVerificationEmail} disabled={isResendingCode}>
              {isResendingCode ? 'Sending...' : 'Resend Code'}
            </Button>
            {resendSuccess && <p className="success-message">Verification email sent!</p>}
          </div>
        </Modal>
      )}

      {/* Image Cropping Modal */}
      {cropModalOpen && (
        <Modal onClose={() => setCropModalOpen(false)} isOpen={cropModalOpen}>
          <div className="crop-modal-content">
            <h3>Crop Avatar</h3>
            {imageSrc && (
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1} // Force aspect ratio to 1:1 for a circle
                circularCrop={true} // Enable circular cropping
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={imageSrc}
                  onLoad={(e) => {
                    const { width, height } = e.currentTarget; // Use displayed dimensions
                    // Set initial crop to a square in the center
                    const size = Math.min(width, height);
                    setCrop({
                      unit: 'px',
                      x: (width - size) / 2,
                      y: (height - size) / 2,
                      width: size,
                      height: size,
                    });
                  }}
                  onWheel={(e) => {
                    if (!imgRef.current || !crop) return;

                    e.preventDefault(); // Prevent default scroll behavior

                    const img = imgRef.current;
                    const { width, height } = img; // Use displayed dimensions
                    const currentCrop = crop;

                    // Calculate the current crop size in pixels based on displayed dimensions
                    const currentCropWidthPx = (currentCrop.unit === 'px' ? currentCrop.width : (currentCrop.width / 100) * width);
                    const currentCropHeightPx = (currentCrop.unit === 'px' ? currentCrop.height : (currentCrop.height / 100) * height);


                    // Determine zoom direction and factor
                    const zoomFactor = e.deltaY < 0 ? 1.05 : 0.95; // Zoom in or out

                    // Calculate new crop size in pixels
                    let newCropWidthPx = currentCropWidthPx * zoomFactor;
                    let newCropHeightPx = currentCropHeightPx * zoomFactor;

                    // Ensure new crop size is within bounds (e.g., min size, max size)
                    const minSizePx = 50; // Minimum crop size in pixels
                    newCropWidthPx = Math.max(minSizePx, newCropWidthPx);
                    newCropHeightPx = Math.max(minSizePx, newCropHeightPx);
                    newCropWidthPx = Math.min(width, newCropWidthPx); // Use displayed width for max size
                    newCropHeightPx = Math.min(height, newCropHeightPx); // Use displayed height for max size


                    // Calculate the new crop position to keep it centered
                    const newCropX = currentCrop.x + (currentCropWidthPx - newCropWidthPx) / 2;
                    const newCropY = currentCrop.y + (currentCropHeightPx - newCropHeightPx) / 2;

                    // Ensure the new crop stays within the image boundaries based on displayed dimensions
                    const boundedNewCropX = Math.max(0, Math.min(width - newCropWidthPx, newCropX));
                    const boundedNewCropY = Math.max(0, Math.min(height - newCropHeightPx, newCropY));


                    // Update the crop state using pixel units
                     setCrop({
                       unit: 'px',
                       x: boundedNewCropX,
                       y: boundedNewCropY,
                       width: newCropWidthPx,
                       height: newCropHeightPx,
                     });
                  }}
                />
              </ReactCrop>
            )}
            {/* Add controls for zoom/radius here later */}
            <div className="crop-controls">
              {/* Zoom/Radius control */}
              {/* <input type="range" ... /> */}
            </div>
            <div className="crop-buttons">
              <Button onClick={async () => {
                if (!completedCrop || !imgRef.current || !user) {
                  return;
                }
                try {
                  const croppedBlob = await getCroppedImg(imgRef.current, completedCrop);
                  // Convert blob to File object for upload
                  const croppedFile = new File([croppedBlob], `avatar_${user.id}.png`, { type: 'image/png' });

                  // Call the uploadAvatar mutation with the cropped file
                  const response = await uploadAvatarMutation({
                    variables: {
                      file: croppedFile,
                    },
                  });

                  if (response.data && response.data.uploadAvatar) {
                    setUserState(response.data.uploadAvatar); // Update user state with the new avatar URL
                    refetchUser(); // Explicitly refetch user data
                    setCropModalOpen(false); // Close the modal on success
                    setImageSrc(null); // Clear the image source
                    setCrop(undefined); // Reset crop state
                    setCompletedCrop(undefined); // Reset completed crop state
                  }
                } catch (error) {
                  console.error('Error cropping or uploading avatar:', error);
                  // Handle error, maybe show a message to the user
                }
              }}>Save</Button>
              <Button onClick={() => {
                setCropModalOpen(false);
                setImageSrc(null); // Clear the image source when cancelling
                setCrop(undefined); // Reset crop state
                setCompletedCrop(undefined); // Reset completed crop state
              }}>Cancel</Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

// Helper function to create a cropped image blob
const getCroppedImg = (image: HTMLImageElement, crop: PixelCrop): Promise<Blob> => {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return Promise.reject(new Error('No 2d context available'));
  }

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Canvas is empty'));
      }
    }, 'image/png'); // You can adjust the image format here
  });
};

export default MyAccount;