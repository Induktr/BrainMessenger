import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { UseFormRegister, FieldErrors, UseFormWatch } from 'react-hook-form';
import { RegisterFormInputs } from '@/features/user-auth/model/user-auth.types';
import { useFeedbackAnimation } from '@/hooks/useFeedbackAnimation';
import Input from '@/shared/ui/Input/Input';
import { Eye, EyeOff, Castle, Man, UsernameDog, Mail } from '@/shared/assets/Icons/icons';
import { variantsStylesIcons } from '@/shared/assets/VariantStyles/variantStyles';

interface RegistrationFormFieldsProps {
  fields: any[];
  register: UseFormRegister<RegisterFormInputs>;
  errors: FieldErrors<RegisterFormInputs>;
  watch: UseFormWatch<RegisterFormInputs>;
}

const iconComponents: { [key: string]: React.ElementType } = {
  Castle,
  Man,
  UsernameDog,
  Mail,
};

const RegistrationFormFields: React.FC<RegistrationFormFieldsProps> = ({ fields, register, errors, watch }) => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [isSuggestionVisible, setIsSuggestionVisible] = useState(false);
  const password = watch('password', '');
  const prevPasswordRef = useRef(password);
  const { triggerAnimation: triggerJiggle, animationClassName: jiggleClassName } = useFeedbackAnimation('jiggle-effect', 300);

  const getPasswordSuggestion = useMemo(() => (pass: string): string => {
    if (!pass) return '';
    if (pass.length < 8) return '...';
    if (!/[A-Z]/.test(pass)) return 'A';
    if (!/[a-z]/.test(pass)) return 'a';
    if (!/[0-9]/.test(pass)) return '1';
    if (!/[^A-Za-z0-9]/.test(pass)) return '!';
    return '';
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showPassword) {
      timer = setTimeout(() => setIsSuggestionVisible(true), 1000);
    } else {
      setIsSuggestionVisible(false);
    }
    return () => clearTimeout(timer);
  }, [showPassword]);

  useEffect(() => {
    if (!showPassword || !isSuggestionVisible) return;

    const suggestion = getPasswordSuggestion(password);
    const interval = setInterval(() => {
      if (suggestion) triggerJiggle();
    }, 5000);

    const lastChar = password.slice(-1);
    const prevSuggestion = getPasswordSuggestion(prevPasswordRef.current);

    if (password.length > prevPasswordRef.current.length && prevSuggestion) {
      let isCharInvalid = false;
      if (prevSuggestion === 'A' && !/[A-Z]/.test(lastChar)) isCharInvalid = true;
      else if (prevSuggestion === 'a' && !/[a-z]/.test(lastChar)) isCharInvalid = true;
      else if (prevSuggestion === '1' && !/[0-9]/.test(lastChar)) isCharInvalid = true;
      else if (prevSuggestion === '!' && !/[^A-Za-z0-9]/.test(lastChar)) isCharInvalid = true;
      
      if(isCharInvalid) triggerJiggle();
    }

    prevPasswordRef.current = password;
    return () => clearInterval(interval);
  }, [password, getPasswordSuggestion, triggerJiggle, showPassword, isSuggestionVisible]);

  return (
    <>
      {fields.map((field: any) => (
        <Input
          key={field.name}
          id={field.name}
          placeholder={field.label}
          type={field.type === 'password' && showPassword ? 'text' : field.type}
          registration={register(field.name as keyof RegisterFormInputs, {
            required: t(`validation.${field.name}.required`),
            minLength: {
              value: field.name === 'name' ? 2 : field.name === 'password' ? 8 : 0,
              message: t(`validation.${field.name}.minLength`)
            },
            maxLength: {
              value: field.name === 'name' ? 50 : 255,
              message: t(`validation.${field.name}.maxLength`)
            },
            validate: (value) => {
              if (field.name === 'password') {
                if (!/[A-Z]/.test(value)) return t('validation.password.uppercase');
                if (!/[0-9]/.test(value)) return t('validation.password.digit');
                if (!/[!@#$%^&*]/.test(value)) return t('validation.password.specialChar');
              }
              if (field.name === 'email') {
                if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) return t('validation.email.invalid');
                if (!/@gmail\.com$/.test(value)) return t('validation.email.gmailOnly');
              }
              return true;
            }
          })}
          error={errors[field.name as keyof RegisterFormInputs]?.message}
          icon={
            field.icon && iconComponents[field.icon]
              ? React.createElement(iconComponents[field.icon], { className: `${variantsStylesIcons.iconSecondary} w-6 h-6` })
              : null
          }
          rightIcon={
            field.type === 'password' && (
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="focus:outline-none">
                {showPassword ? <EyeOff className={`${variantsStylesIcons.iconSecondary} w-6 h-6`} /> : <Eye className={`${variantsStylesIcons.iconSecondary} w-6 h-6`} />}
              </button>
            )
          }
          suggestion={
            field.type === 'password' && showPassword && isSuggestionVisible
              ? getPasswordSuggestion(password)
              : ''
          }
          suggestionClassName={field.name === 'password' ? jiggleClassName : ''}
          suggestionContainerClassName={field.name === 'password' && isSuggestionVisible ? 'fade-in-up-effect' : 'opacity-0'}
          {...(field.name === 'password' && { value: password })}
        />
      ))}
    </>
  );
};

export default RegistrationFormFields;