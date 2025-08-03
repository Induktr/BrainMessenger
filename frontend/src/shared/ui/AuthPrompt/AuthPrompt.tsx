import React from 'react';
import { 
  useTranslation 
} from 'react-i18next';
import Link, { 
  LinkProps 
} from 'next/link';

interface AuthPromptProps {
  textKey: string;
  textKeyOptions?: Record<string, any>;
  linkTextKey?: string;
  optionPage?: 'login' | 'register';
}

const AuthPrompt: React.FC<AuthPromptProps> = ({ textKey, textKeyOptions, linkTextKey, optionPage }) => {
  const { t } = useTranslation();

  const linkHref = optionPage ? `/${optionPage}` : '#';

  return (
    <p className="text-center text-sm text-[var(--color-text-secondary)] mt-8">
      {t(textKey || 'Already have an Account?')}
      {" "}
      <Link href={linkHref}>
        {t(linkTextKey || 'Login')}
      </Link>
    </p>
  );
};

export default AuthPrompt;