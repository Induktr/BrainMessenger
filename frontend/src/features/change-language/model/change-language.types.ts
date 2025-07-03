export interface LanguageProps {
    isOpen: boolean;
    onClose: () => void;
    onBack: () => void; // Prop to handle going back to main settings
}