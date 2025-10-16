export interface MyAccountProps {
    isOpen: boolean;
    onClose: () => void;
    onBack: () => void;
}

export interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingField: 'name' | 'username' | 'email' | null;
  editValue: string;
  setEditValue: (value: string) => void;
  editError: string;
  isVerified?: boolean;
  onResendVerificationEmail?: () => void;
  isResendingCode?: boolean;
  resendSuccess?: boolean;
}