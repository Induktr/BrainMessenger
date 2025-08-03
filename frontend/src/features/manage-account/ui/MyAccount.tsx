'use client';

import React, { 
  useState, 
  useEffect, 
  useRef 
} from 'react'; // Corrected import
import Modal from '@/shared/ui/Modal/Modal';
import { 
  ArrowLeft, 
  CloseModal, 
  UploadImage, 
  Logout, 
  UsernameDog, 
  Account, 
  Mail 
} from '@/shared/assets/Icons/icons'; // Adjusted import based on usage
import Button from '@/shared/ui/Button/Button';
import { 
  useAuth 
} from '@/app/providers/AuthProvider/AuthContext';
import { 
  generateAvatarData 
} from '@/entities/user/model/user-generate-avatar';
import Spinner from '@/shared/ui/Spinner/Spinner'; // Import LazyLoading
import { 
  useMutation, 
  useApolloClient 
} from '@apollo/client';
import Image from 'next/image'; // Corrected import
import { 
  UPLOAD_AVATAR, 
  UPDATE_USER_PROFILE, 
  GET_CURRENT_USER, 
  SEND_VERIFICATION_EMAIL, 
  VERIFY_EMAIL 
} from '@/entities/user/model/user.queries';
import ReactCrop, { 
  Crop, 
  PixelCrop 
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { 
  MyAccountProps 
} from '@/features/manage-account/model/manage-account.types';
import { 
  useTranslation 
} from 'react-i18next';
import clsx from 'clsx';
import { 
  variantsStylesIcons 
} from '@/shared/assets/variantStyles/variantStyles';
import EditModal from './EditModal';
import DropdownMenu from '@/shared/ui/DropdownMenu/DropdownMenu';

const MyAccount: React.FC<MyAccountProps> = ({ isOpen, onClose, onBack }) => {
  const { t } = useTranslation();
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

  const avatarData = generateAvatarData(user?.name);

  const dropdownOptions = [
    {
      label: t('myAccount.userLabel.uploadPhoto'),
      icon: <UploadImage width={16} height={16} />,
      onClick: () => {
        document.getElementById('avatarUploadInput')?.click();
        setDropdownOpen(false);
      },
    },
    {
      label: t('myAccount.userLabel.logout'),
      icon: <Logout width={16} height={16} />,
      onClick: () => {
        logout();
        setDropdownOpen(false);
      },
      className: 'text-[var(--color-danger)]',
    },
  ];

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
        <div className="p-6 bg-[var(--color-surface)] rounded-lg shadow-lg max-w-md mx-auto animate-pulse">
          <div className="flex justify-between items-center pb-4 border-b border-[var(--color-border)]">
            <div className="h-6 bg-[var(--color-disabled)] rounded w-1/4"></div>
            <div className="h-6 w-6 bg-[var(--color-disabled)] rounded-full"></div>
          </div>
          <div className="flex flex-col items-center gap-4 mt-6">
            <div className="w-32 h-32 bg-[var(--color-disabled)] rounded-full"></div>
            <div className="w-3/4 h-6 bg-[var(--color-disabled)] rounded"></div>
            <div className="w-1/2 h-4 bg-[var(--color-disabled)] rounded"></div>
            <div className="w-full h-10 bg-[var(--color-disabled)] rounded-lg"></div>
          </div>
        </div>
      </Modal>
    );
  }


  return (
    <>
      <Modal onClose={onClose} isOpen={isOpen}>
        <div className="p-6 text-[var(--color-text-primary)] rounded-[10px] max-w-md mx-auto">
          {/* Header */}
          <div className={`${variantsStylesIcons.iconSecondary} flex justify-between items-center pb-4`}>
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft alt={t('myAccount.alt.back')} className="w-6 h-6" />
            </Button>
            <h2 className="text-lg font-semibold">{t('myAccount.userLabel.headerTitle')}</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <CloseModal alt={t('myAccount.alt.close')} className="w-6 h-6" />
            </Button>
          </div>

          {/* User Info Section */}
          <div className="flex flex-col items-center gap-4 mt-6">
            {/* Avatar and Dropdown Container */}
            <div className="relative">
              <div
                className="relative w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold cursor-pointer group"
                style={{ backgroundColor: avatarData.color }}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {user.avatarUrl ? (
                  <img key={user.avatarUrl} src={user.avatarUrl} alt="User Avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span>{avatarData.letter}</span>
                )}
                <div className="absolute inset-0 bg-[var(--color-background)]/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm text-center text-[var(--color-text-primary)]">{t('myAccount.userLabel.uploadPhoto')}</span>
                </div>
              </div>

              {/* Dropdown Menu */}
              {dropdownOpen && <DropdownMenu options={dropdownOptions} />}
            </div>
            {/* Hidden file input */}
            <input
              id="avatarUploadInput"
              type="file"
              accept=".png,.jpeg,.jpg,.webp,.ico"
              className="hidden"
              onChange={handleFileChange}
            />
            {/* Upload status indicators */}
            {uploading && <p className="text-sm text-[var(--color-text-secondary)]">{t('myAccount.userLabel.uploading')}</p>}
            {uploadError && (
              <p className="text-sm text-[var(--color-danger)]">
                {t('myAccount.userLabel.uploadFailed', { message: uploadError.message })}
              </p>
            )}
            <div className="text-center">
              <h2 className="text-2xl font-bold">{user.name || t('guest')}</h2>
              <p className={clsx("text-sm", {
                'text-[var(--color-success)]': user.status === 'online',
                'text-[var(--color-text-secondary)]': user.status !== 'online'                
              })}>
                {user.status === 'online' ? t('myAccount.status.online') : t('myAccount.status.offline')}
              </p>
            </div>
            <textarea
              className="w-full bg-transparent text-center text-[var(--color-text-secondary)] resize-none focus:outline-none p-2 rounded-lg hover:bg-[var(--color-surface-dark)] focus:bg-[var(--color-surface-dark)]"
              value={biography}
              onChange={(e) => setBiography(e.target.value)}
              placeholder={t('myAccount.userLabel.bioPlaceholder')}
              rows={2}
            />
          </div>

          {/* Separator */}
          <div className="w-full my-6 border-t border-[var(--color-border)]"></div>

          {/* Detailed User Info */}
          <div className={`${variantsStylesIcons.iconAccent} w-full space-y-4`}>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 rounded-lg cursor-pointer hover:bg-[var(--color-surface-dark)]" onClick={() => handleEditClick('name')}>
                <Account className="w-6 h-6 mx-auto mb-2 text-[var(--color-text-secondary)]" />
                <div>
                  <p className="text-xs text-[var(--color-text-secondary)]">{t('myAccount.labels.name')}</p>
                  <p className="text-sm text-[var(--color-gradient-start)] font-medium">{user.name || t('myAccount.notAvailable')}</p>
                </div>
              </div>
              <div className="p-3 rounded-lg cursor-pointer hover:bg-[var(--color-surface-dark)]" onClick={() => handleEditClick('username')}>
                <UsernameDog className="w-6 h-6 mx-auto mb-2 text-[var(--color-text-secondary)]" />
                <div>
                  <p className="text-xs text-[var(--color-text-secondary)]">{t('myAccount.labels.username')}</p>
                  <p className="text-sm text-[var(--color-gradient-start)] font-medium">@{user.username || t('myAccount.notAvailable')}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="p-3 rounded-lg cursor-pointer hover:bg-[var(--color-surface-dark)] text-center" onClick={() => handleEditClick('email')}>
                <Mail className="w-6 h-6 mx-auto mb-2 text-[var(--color-text-secondary)]" />
                <div>
                  <p className="text-xs text-[var(--color-text-secondary)]">{t('myAccount.labels.email')}</p>
                  <p className="text-sm text-[var(--color-gradient-start)] font-medium">{user.email || t('myAccount.notAvailable')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Generic Edit Modal */}
      <EditModal
        isOpen={editModalOpen}
        onClose={handleEditModalClose}
        onSave={handleSaveEdit}
        editingField={editingField}
        editValue={editValue}
        setEditValue={setEditValue}
        editError={editError}
        isVerified={user.isVerified}
        onResendVerificationEmail={handleResendVerificationEmail}
        isResendingCode={isResendingCode}
        resendSuccess={resendSuccess}
      />

      {/* Email Verification Modal */}
      {emailVerificationModalOpen && (
        <Modal onClose={handleEmailVerificationModalClose} isOpen={emailVerificationModalOpen}>
          <div className="p-6 bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg shadow-lg max-w-sm mx-auto">
            <h3 className="text-lg font-semibold mb-2">{t('myAccount.verifyModal.title')}</h3>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">{t('myAccount.verifyModal.instruction', { email: user.email })}</p>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder={t('myAccount.editModal.placeholder')}
              className="w-full p-2 rounded-lg bg-[var(--color-input-background)] border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
            {verificationError && <p className="text-[var(--color-danger)] text-sm mt-2">{verificationError}</p>}
            <div className="flex justify-end gap-4 mt-6">
              <Button onClick={handleResendVerificationEmail} disabled={isResendingCode} variant="secondary">
                {isResendingCode ? t('myAccount.editModal.sending') : t('myAccount.verifyModal.resendButton')}
              </Button>
              <Button onClick={handleVerifyEmail}>{t('myAccount.buttons.verify')}</Button>
            </div>
            {resendSuccess && <p className="text-[var(--color-success)] text-sm mt-2">{t('myAccount.editModal.resendSuccess')}</p>}
          </div>
        </Modal>
      )}

      {/* Image Cropping Modal */}
      {cropModalOpen && (
        <Modal onClose={() => setCropModalOpen(false)} isOpen={cropModalOpen}>
          <div className="p-6 bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg shadow-lg max-w-lg mx-auto">
            <h3 className="text-lg font-semibold mb-4">{t('myAccount.cropModal.title')}</h3>
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
                  alt={t('cropModal.alt.crop')}
                  src={imageSrc}
                  onLoad={(e) => {
                    const { width, height } = e.currentTarget; // Use displayed dimensions
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
                    e.preventDefault();
                    const img = imgRef.current;
                    const { width, height } = img;
                    const currentCrop = crop;
                    const currentCropWidthPx = (currentCrop.unit === 'px' ? currentCrop.width : (currentCrop.width / 100) * width);
                    const currentCropHeightPx = (currentCrop.unit === 'px' ? currentCrop.height : (currentCrop.height / 100) * height);
                    const zoomFactor = e.deltaY < 0 ? 1.05 : 0.95;
                    let newCropWidthPx = currentCropWidthPx * zoomFactor;
                    let newCropHeightPx = currentCropHeightPx * zoomFactor;
                    const minSizePx = 50;
                    newCropWidthPx = Math.max(minSizePx, newCropWidthPx);
                    newCropHeightPx = Math.max(minSizePx, newCropHeightPx);
                    newCropWidthPx = Math.min(width, newCropWidthPx);
                    newCropHeightPx = Math.min(height, newCropHeightPx);
                    const newCropX = currentCrop.x + (currentCropWidthPx - newCropWidthPx) / 2;
                    const newCropY = currentCrop.y + (currentCropHeightPx - newCropHeightPx) / 2;
                    const boundedNewCropX = Math.max(0, Math.min(width - newCropWidthPx, newCropX));
                    const boundedNewCropY = Math.max(0, Math.min(height - newCropHeightPx, newCropY));
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
            <div className="flex justify-end gap-4 mt-6">
              <Button onClick={() => {
                setCropModalOpen(false);
                setImageSrc(null);
                setCrop(undefined);
                setCompletedCrop(undefined);
              }} variant="secondary">{t('myAccount.buttons.cancel')}</Button>
              <Button onClick={async () => {
                if (!completedCrop || !imgRef.current || !user) {
                  return;
                }
                try {
                  const croppedBlob = await getCroppedImg(imgRef.current, completedCrop);
                  const croppedFile = new File([croppedBlob], `avatar_${user.id}.png`, { type: 'image/png' });
                  const response = await uploadAvatarMutation({
                    variables: {
                      file: croppedFile,
                    },
                  });

                  if (response.data && response.data.uploadAvatar) {
                    setUserState(response.data.uploadAvatar);
                    refetchUser();
                    setCropModalOpen(false);
                    setImageSrc(null);
                    setCrop(undefined);
                    setCompletedCrop(undefined);
                  }
                } catch (error) {
                  console.error('Error cropping or uploading avatar:', error);
                }
              }}>{t('myAccount.buttons.save')}</Button>
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
    }, 'image/png');
  });
};

export default MyAccount;