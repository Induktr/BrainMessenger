import {
  useState,
  useRef,
  FC,
  ClipboardEvent,
  KeyboardEvent,
  createRef
} from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@apollo/client/react';
import { ServerError } from '@apollo/client/errors';
import { VERIFY_EMAIL, SEND_VERIFICATION_EMAIL } from '@/entities/user/model/user.queries';
import { useFeedbackAnimation } from '@/hooks/useFeedbackAnimation';
import InputCell from '@/shared/ui/InputCell/InputCell';
import { Button } from '@/shared/ui/Button/Button';

interface VerificationCodeInputProps {
  email: string;
  onSuccess: () => void;
}

const VerificationCodeInput: FC<VerificationCodeInputProps> = ({ email, onSuccess }) => {
  const { t } = useTranslation();
  const [confirmationCode, setConfirmationCode] = useState<string[]>(Array(8).fill(''));
  const inputRefs = useRef<Array<React.RefObject<HTMLInputElement | null>>>(Array(8).fill(null).map(() => createRef()));
  
  const [verifyEmail, { loading: loadingVerification, error: errorVerification }] = useMutation(VERIFY_EMAIL);
  const [resendVerificationCode, { loading: loadingResend, error: errorResend }] = useMutation(SEND_VERIFICATION_EMAIL);

  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const { triggerAnimation: triggerGlitch, animationClassName: glitchClassName } = useFeedbackAnimation('glitch-effect', 400);

  const handleCodeInputChange = (index: number, value: string) => {
    const newCode = [...confirmationCode];
    newCode[index] = value;
    setConfirmationCode(newCode);

    if (value !== '' && index < 7) {
      inputRefs.current[index + 1]?.current?.focus();
    }
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && confirmationCode[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.current?.focus();
    } else if (event.key === 'Backspace' && confirmationCode[index] !== '') {
      const newCode = [...confirmationCode];
      newCode[index] = '';
      setConfirmationCode(newCode);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pastedData = event.clipboardData.getData('text');
    const codeArray = pastedData.slice(0, 8).split('');
    const newCode = [...confirmationCode];
    codeArray.forEach((char, index) => {
      if (index < 8) {
        newCode[index] = char;
      }
    });
    setConfirmationCode(newCode);
    const lastFilledIndex = Math.min(codeArray.length, 8) - 1;
    if (lastFilledIndex >= 0) {
      inputRefs.current[lastFilledIndex]?.current?.focus();
    }
  };

  const handleVerificationSubmit = async () => {
    const enteredCode = confirmationCode.join('');
    if (enteredCode.length !== 8) return;

    setVerificationStatus('checking');

    try {
      const response = await verifyEmail({
        variables: { email, code: enteredCode },
      });

      if (response.data && response.data.verifyEmail === true) {
        setVerificationStatus('success');
        setTimeout(onSuccess, 1000);
      } else {
        setVerificationStatus('error');
        triggerGlitch();
      }
    } catch (e) {
      if(e instanceof ServerError) {
        console.error('Verification error:', e);
        setVerificationStatus('error');
      };
      triggerGlitch();
    }
  };

  const handleResendCode = async () => {
    try {
      await resendVerificationCode({ variables: { email } });
      alert(t('register_page.code_resent_success'));
    } catch (e) {
      console.error('Resend code error:', e);
      alert(t('register_page.resend_code_failed_with_error', { error: e }));
    }
  };

  const isCodeInputStarted = confirmationCode.some(code => code !== '');

  return (
    <div className="text-center">
      <div className={`flex justify-center gap-2 mb-4 ${verificationStatus === 'checking' ? 'neural-check-animation' : ''} ${glitchClassName}`}>
        {confirmationCode.map((digit, index) => (
          <InputCell
            key={index}
            value={digit}
            onChange={(value) => handleCodeInputChange(index, value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            inputRef={inputRefs.current[index] as React.RefObject<HTMLInputElement>}
            className={
              verificationStatus === 'success' ? 'bg-green-500/20 border-green-500' :
              verificationStatus === 'error' ? 'bg-red-500/20 border-red-500' : ''
            }
          />
        ))}
      </div>
      <Button
        type="button"
        onClick={handleVerificationSubmit}
        className="w-full"
        disabled={loadingVerification || !isCodeInputStarted}
      >
        {loadingVerification ? t('register_page.verifying_button') : t('register_page.verify_button')}
      </Button>
      <button onClick={handleResendCode} className="text-sm text-[var(--color-accent)] mt-4 hover:underline" disabled={loadingResend}>
        {loadingResend ? t('register_page.resending_code_button') : t('register_page.resend_code_button')}
      </button>
      {errorVerification && <p className="text-[var(--color-danger)] text-sm mt-2">{errorVerification.message}</p>}
      {errorResend && <p className="text-[var(--color-danger)] text-sm mt-2">{errorResend.message}</p>}
    </div>
  );
};

export default VerificationCodeInput;