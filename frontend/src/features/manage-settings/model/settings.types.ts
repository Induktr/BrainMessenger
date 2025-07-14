export interface AdvancedSettingsProps {
    isOpen: boolean;
    onClose: () => void;
    onBack: () => void; // Prop to handle going back to main settings
}
 
export interface SettingsProps {
    isOpen: boolean;
    onClose: () => void;
}

export interface SmallSettingsProps {
    isOpen: boolean;
    onClose: () => void;
}

export interface SupportProps {
    onBack: () => void;
    onClose: () => void;
    isOpen: boolean;
}