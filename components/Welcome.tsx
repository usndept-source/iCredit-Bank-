
import React, { useState, useEffect, useCallback } from 'react';
import { 
    ICreditUnionLogo, 
    LockClosedIcon,
    EnvelopeIcon,
    ArrowRightIcon,
    FingerprintIcon,
    FaceIdIcon,
    SpinnerIcon,
    DevicePhoneMobileIcon,
    UserCircleIcon,
    ShieldCheckIcon,
    QuestionMarkCircleIcon,
    EyeIcon,
    EyeSlashIcon
} from './Icons.tsx';
import { 
    sendSmsNotification, 
    sendTransactionalEmail, 
    generateOtpEmail, 
    generateOtpSms,
    generatePasswordResetEmail,
    generatePasswordResetSms
} from '../services/notificationService.ts';
import { USER_PASSWORD } from '../constants.ts';
import { ReCaptcha } from './ReCaptcha.tsx';

interface WelcomeProps {
  onLogin: () => void;
  onStartCreateAccount: () => void;
}

type LoginStep = 'username' | 'password' | 'recaptcha' | 'security_check' | 'mfa';
type WelcomeView = 'signin' | 'forgot_password' | 'forgot_password_confirmation';


const USER_EMAIL = "randy.m.chitwood@icreditunion.com";
const USER_NAME = "Randy M. Chitwood";
const USER_PHONE = "+1-555-012-1234";

const securityCheckMessages = [
    'Initializing secure session...',
    'Verifying device fingerprint...',
    'Security handshake complete.'
];

const LoginBackground: React.FC = () => (
    <div className="absolute inset-0 z-0 overflow-hidden">
        <img
            src="https://images.unsplash.com/photo-1533929736458-ca588d08c8be?q=80&w=2940&auto=format&fit=crop"
            alt="London street at night with light trails, representing global finance"
            className="absolute inset-0 w-full h-full object-cover animate-ken-burns"
        />
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
    </div>
);


export const Welcome: React.FC<WelcomeProps> = ({ onLogin, onStartCreateAccount }) => {
  const [view, setView] = useState<WelcomeView>('signin');
  const [step, setStep] = useState<LoginStep>('username');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [mfaCode, setMfaCode] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [securityMessageIndex, setSecurityMessageIndex] = useState(0);
  
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [biometricSupportMessage, setBiometricSupportMessage] = useState('Sign in with biometrics');

  useEffect(() => {
    const checkBiometricSupport = async () => {
      try {
        if (!window.PublicKeyCredential || !(await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable())) {
          setIsBiometricSupported(false);
          setBiometricSupportMessage('Biometrics not supported');
          return;
        }
        setIsBiometricSupported(true);
      } catch (e) {
        console.warn('Biometric support check failed:', e);
        setIsBiometricSupported(false);
        setBiometricSupportMessage('Biometric check failed');
      }
    };
    checkBiometricSupport();
  }, []);


  useEffect(() => {
    if (step === 'security_check') {
      setIsLoading(true);
      const interval = setInterval(() => {
        setSecurityMessageIndex(prev => {
          if (prev >= securityCheckMessages.length - 1) {
            clearInterval(interval);
            setTimeout(async () => {
                const { subject, body } = generateOtpEmail(USER_NAME);
                const emailResult = await sendTransactionalEmail(USER_EMAIL, subject, body);
                const smsResult = await sendSmsNotification(USER_PHONE, generateOtpSms());
                if (!emailResult.success || !smsResult.success) {
                    setError("Failed to send verification code. Please try logging in again.");
                    setStep('password'); // Go back to a previous step
                } else {
                    setStep('mfa');
                }
            }, 100); // Reduced delay to 100ms
            return prev;
          }
          return prev + 1;
        });
      }, 200); // Reduced interval to 200ms
      return () => clearInterval(interval);
    } else {
        setIsLoading(false);
        setSecurityMessageIndex(0);
    }
  }, [step]);
  
  const handleUsernameSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      if (!username.trim()) {
          setError('Please enter your username.');
          return;
      }
      setIsLoading(true);
      setTimeout(() => {
          setIsLoading(false);
          setStep('password');
      }, 200); // Reduced to 200ms
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      if (!password) {
          setError('Please enter your password.');
          return;
      }
      setIsLoading(true);
      setTimeout(() => {
        if (password !== USER_PASSWORD) {
            setError('The password you entered is incorrect. Please try again.');
            setIsLoading(false);
            return;
        }
        setIsLoading(false);
        setStep('recaptcha');
      }, 200); // Reduced to 200ms
  };
  
  const handleMfaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setTimeout(() => {
      if (mfaCode.length === 6) {
        onLogin();
      } else {
        setError('Please enter a valid 6-digit code.');
        setIsLoading(false);
      }
    }, 300); // Reduced to 300ms
  };
  
  const handleBiometricLogin = useCallback(async () => {
    if (!isBiometricSupported) {
        setError("Biometric authentication is not supported on this browser or device.");
        return;
    }
    
    setError('');
    setIsLoading(true);

    try {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);
        
        const options: PublicKeyCredentialRequestOptions = {
            challenge,
            userVerification: 'required',
        };

        const assertion = await navigator.credentials.get({ publicKey: options });

        console.log('Biometric authentication successful:', assertion);
        setStep('recaptcha');

    } catch (err: any) {
        console.error('Biometric authentication error:', err);
        if (err.name === 'NotAllowedError' || err.name === 'SecurityError') {
            if (err.message && (err.message.includes('feature is not enabled') || err.message.includes('Permissions Policy'))) {
                 setError('Biometric login is restricted by the browser permissions policy.');
            } else if (err.name === 'NotAllowedError') {
                setError('Authentication was cancelled.');
            } else {
                setError('Biometric access denied.');
            }
        } else {
            setError('No biometric credential found. Please use your password.');
        }
    } finally {
        setIsLoading(false);
    }
  }, [isBiometricSupported]);

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!recoveryEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recoveryEmail)) {
        setError('Please enter a valid email address.');
        return;
    }
    setIsLoading(true);
    
    const { subject, body } = generatePasswordResetEmail(USER_NAME, recoveryEmail);
    const emailResult = await sendTransactionalEmail(recoveryEmail, subject, body);
    const smsResult = await sendSmsNotification(USER_PHONE, generatePasswordResetSms());

    if (!emailResult.success || !smsResult.success) {
        setError("We couldn't send a reset link at this time. Please try again later.");
        setIsLoading(false);
        return;
    }
    
    setIsLoading(false);
    setView('forgot_password_confirmation');
  };

  const inputClasses = "w-full bg-slate-700/50 border-0 text-slate-100 placeholder-slate-400 focus:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-400 p-3 rounded-md shadow-digital-inset transition-colors";

  const renderUsernameStep = () => (
    <div className="animate-fade-in-up space-y-8">
        <div className="text-center">
            <div className="inline-block p-1 rounded-full bg-gradient-to-tr from-white/10 to-transparent mb-4">
                 <ICreditUnionLogo />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Secure Login</h2>
            <p className="text-slate-400 text-sm mt-2">Access your personal and business accounts.</p>
        </div>

        <form onSubmit={handleUsernameSubmit} className="space-y-6">
            <div className="group relative">
                <label htmlFor="username" className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider ml-1">User ID</label>
                <div className="relative flex items-center">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                         <UserCircleIcon className="h-6 w-6 text-slate-500 group-focus-within:text-primary-400 transition-colors" />
                    </div>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="block w-full pl-12 pr-4 py-4 bg-slate-900/60 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all shadow-inner text-lg"
                        placeholder="Enter your User ID"
                        aria-label="User ID"
                        autoFocus
                    />
                </div>
            </div>

            <div className="flex items-center justify-between px-1">
                 <label className="flex items-center cursor-pointer group">
                    <div className="relative">
                        <input
                            type="checkbox"
                            className="sr-only"
                            checked={rememberMe}
                            onChange={e => setRememberMe(e.target.checked)}
                        />
                        <div className={`block w-10 h-6 rounded-full transition-colors duration-300 ${rememberMe ? 'bg-primary-600' : 'bg-slate-700'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 shadow-sm ${rememberMe ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </div>
                    <span className="ml-3 text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Save User ID</span>
                </label>
                <button type="button" onClick={() => setView('forgot_password')} className="text-sm font-semibold text-primary-400 hover:text-primary-300 transition-colors">
                    Forgot ID?
                </button>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center py-4 px-6 rounded-xl text-base font-bold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 shadow-lg shadow-primary/25 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
                {isLoading ? <SpinnerIcon className="w-6 h-6" /> : <span className="flex items-center">Continue <ArrowRightIcon className="ml-2 w-5 h-5"/></span>}
            </button>
        </form>

        <div className="border-t border-slate-700/50 pt-6 mt-6 text-center">
            <p className="text-slate-400 text-sm">
                New to iCredit Union?{' '}
                <button onClick={onStartCreateAccount} className="font-bold text-white hover:text-primary-400 transition-colors hover:underline decoration-2 underline-offset-4">
                    Enroll now
                </button>
            </p>
            <div className="mt-8 flex justify-center gap-6 text-xs font-medium text-slate-500 uppercase tracking-wide">
                <button className="hover:text-slate-300 transition-colors flex items-center gap-1.5"><ShieldCheckIcon className="w-4 h-4"/> Security</button>
                <button className="hover:text-slate-300 transition-colors">Privacy Policy</button>
                <button className="hover:text-slate-300 transition-colors">Locations</button>
            </div>
            <p className="mt-4 text-[10px] text-slate-600">© {new Date().getFullYear()} iCredit Union®. Member FDIC.</p>
        </div>
    </div>
  );
  
  const renderPasswordStep = () => (
     <div className="animate-fade-in-up space-y-8">
        <div className="text-center">
            <button onClick={() => { setStep('username'); setPassword(''); }} className="absolute top-6 left-6 text-slate-400 hover:text-white transition-colors flex items-center text-sm font-medium">
                &larr; Back
            </button>
             <div className="inline-block p-1 rounded-full bg-gradient-to-tr from-white/10 to-transparent mb-4">
                 <ICreditUnionLogo />
            </div>
            <div className="flex flex-col items-center justify-center mb-6">
                 <div className="w-20 h-20 rounded-full bg-gradient-to-b from-slate-700 to-slate-800 flex items-center justify-center text-3xl font-bold text-white shadow-inner border-4 border-slate-800">
                    {username.charAt(0).toUpperCase()}
                </div>
                <h3 className="mt-3 text-xl font-bold text-white">{username}</h3>
                <button onClick={() => { setStep('username'); setPassword(''); }} className="text-xs text-primary-400 hover:text-primary-300 mt-1 font-medium">Not you? Switch user</button>
            </div>
        </div>
        
        <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div className="group relative">
                 <label htmlFor="password" className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider ml-1">Password</label>
                <div className="relative flex items-center">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                         <LockClosedIcon className="h-6 w-6 text-slate-500 group-focus-within:text-primary-400 transition-colors" />
                    </div>
                    <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="block w-full pl-12 pr-12 py-4 bg-slate-900/60 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all shadow-inner text-lg tracking-wide"
                        placeholder="Enter your password"
                        aria-label="Password"
                        autoFocus
                    />
                    <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                </div>
                <div className="text-right mt-2">
                     <button type="button" onClick={() => setView('forgot_password')} className="text-sm font-semibold text-primary-400 hover:text-primary-300 transition-colors">
                        Forgot Password?
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                 <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center py-4 px-6 rounded-xl text-base font-bold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 shadow-lg shadow-primary/25 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed">
                    {isLoading ? <SpinnerIcon className="w-6 h-6" /> : <span className="flex items-center">Secure Sign In <ArrowRightIcon className="ml-2 w-5 h-5"/></span>}
                </button>

                {isBiometricSupported && (
                    <button type="button" onClick={handleBiometricLogin} className="w-full flex items-center justify-center py-4 px-6 rounded-xl text-base font-semibold text-slate-300 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all">
                        {typeof window.ontouchstart !== 'undefined' ? <FaceIdIcon className="w-6 h-6 mr-2 text-primary-400"/> : <FingerprintIcon className="w-6 h-6 mr-2 text-primary-400"/>}
                        <span>{biometricSupportMessage}</span>
                    </button>
                )}
            </div>
        </form>
        
        <div className="border-t border-slate-700/50 pt-6 text-center">
             <div className="flex items-center justify-center space-x-2 text-slate-500 text-xs">
                <ShieldCheckIcon className="w-4 h-4 text-green-500"/>
                <span>Your session is encrypted and secure.</span>
             </div>
        </div>
    </div>
  );
  
  const renderRecaptchaStep = () => (
    <div className="animate-fade-in-up text-center space-y-6">
        <h3 className="text-xl font-bold text-slate-100">Security Verification</h3>
        <p className="text-sm text-slate-400">Please complete the security check to continue to your account.</p>
        <div className="flex justify-center py-4">
            <ReCaptcha onVerified={() => setStep('security_check')} />
        </div>
        <button onClick={() => setStep('password')} className="text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors">
            &larr; Back to password
        </button>
    </div>
  );

  const renderSecurityCheckStep = () => (
    <div className="animate-fade-in-up text-center p-8 space-y-6">
        <div className="relative inline-block">
            <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-xl animate-pulse"></div>
            <SpinnerIcon className="w-16 h-16 text-primary-400 relative z-10" />
        </div>
        <h3 className="text-xl font-bold text-slate-100 transition-opacity duration-300 min-h-[28px]" role="status" aria-live="assertive" key={securityMessageIndex}>
            {securityCheckMessages[securityMessageIndex]}
        </h3>
        <div className="w-full max-w-xs mx-auto bg-slate-800 rounded-full h-1.5 mt-4 overflow-hidden">
            <div 
                className="bg-primary-500 h-1.5 rounded-full transition-all duration-300 ease-out" 
                style={{ width: `${((securityMessageIndex + 1) / securityCheckMessages.length) * 100}%` }}
            ></div>
        </div>
    </div>
  );

  const renderMfaStep = () => (
    <div className="animate-fade-in-up text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-800/50 rounded-full ring-1 ring-white/10 shadow-inner">
            <DevicePhoneMobileIcon className="w-10 h-10 text-primary-400"/>
        </div>
        <div>
            <h2 className="text-2xl font-bold text-slate-100">Check your phone</h2>
            <p className="text-sm text-slate-400 mt-2 max-w-xs mx-auto" id="mfa-description">We've sent a 6-digit verification code via SMS to your registered phone number ending in <strong>...1234</strong>.</p>
        </div>
        <form onSubmit={handleMfaSubmit}>
            <input
                type="text"
                value={mfaCode}
                onChange={e => setMfaCode(e.target.value.replace(/\D/g, ''))}
                className="w-64 mx-auto bg-slate-900/50 border border-slate-600 text-center text-3xl tracking-[.5em] rounded-xl p-4 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-mono shadow-inner"
                maxLength={6}
                placeholder="------"
                aria-label="6-digit verification code"
                aria-describedby="mfa-description"
                autoFocus
            />
            {error && <p className="mt-4 text-sm text-red-400 bg-red-500/10 py-2 px-4 rounded-lg inline-block">{error}</p>}
            
            <div className="mt-8 space-y-4">
                <button type="submit" disabled={isLoading} className="w-full py-3.5 px-6 rounded-xl text-base font-bold text-white bg-primary-600 hover:bg-primary-500 shadow-lg shadow-primary/25 transition-all disabled:opacity-70">
                    {isLoading ? <SpinnerIcon className="w-6 h-6 mx-auto" /> : 'Verify Identity'}
                </button>
                <button type="button" className="text-sm text-slate-400 hover:text-white transition-colors">Resend Code</button>
            </div>
        </form>
    </div>
  );
  
  const renderForgotPassword = () => (
    <div className="animate-fade-in-up space-y-6">
        <button onClick={() => setView('signin')} className="text-sm font-semibold text-slate-400 hover:text-white transition-colors flex items-center mb-2">
            <ArrowRightIcon className="w-4 h-4 mr-1 transform rotate-180"/> Back to Sign In
        </button>
        <h2 className="text-2xl font-bold text-slate-100">Reset Password</h2>
        <p className="text-sm text-slate-400">Enter your registered email address. We'll send you secure instructions to reset your password.</p>
        <form onSubmit={handleForgotPasswordSubmit} className="space-y-6 mt-4">
             <div className="group relative">
                 <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider ml-1">Email Address</label>
                 <div className="relative flex items-center">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <EnvelopeIcon className="w-6 h-6 text-slate-500 group-focus-within:text-primary-400 transition-colors" />
                    </div>
                    <input
                        type="email"
                        value={recoveryEmail}
                        onChange={e => setRecoveryEmail(e.target.value)}
                        className="block w-full pl-12 pr-4 py-4 bg-slate-900/60 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all shadow-inner text-lg"
                        placeholder="name@example.com"
                        aria-label="Email Address"
                        autoFocus
                    />
                </div>
            </div>
            {error && <p className="text-sm text-red-400 bg-red-500/10 py-2 px-4 rounded-lg text-center">{error}</p>}
             <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center py-4 px-6 rounded-xl text-base font-bold text-white bg-primary-600 hover:bg-primary-500 shadow-lg shadow-primary/25 transition-all disabled:opacity-70">
                {isLoading ? <SpinnerIcon className="w-6 h-6" /> : 'Send Reset Link'}
            </button>
        </form>
        <div className="text-center pt-4">
             <button onClick={() => setActiveView('support')} className="text-sm text-primary-400 hover:text-primary-300 font-medium">Need more help?</button>
        </div>
    </div>
  );

  const renderForgotPasswordConfirmation = () => (
    <div className="animate-fade-in-up text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full ring-1 ring-green-500/50 mb-2">
            <EnvelopeIcon className="w-10 h-10 text-green-400"/>
        </div>
        <h2 className="text-2xl font-bold text-slate-100">Check Your Email</h2>
        <p className="text-sm text-slate-300 max-w-xs mx-auto leading-relaxed">We've sent a secure password reset link to <strong className="text-white block mt-1 text-base">{recoveryEmail}</strong></p>
        <p className="text-xs text-slate-500">Please check your inbox and spam folder. The link expires in 30 minutes.</p>
        <button onClick={() => setView('signin')} className="w-full py-3.5 text-sm font-bold text-white bg-slate-700 hover:bg-slate-600 rounded-xl shadow-md transition-all mt-4">
            Return to Sign In
        </button>
    </div>
  );

  // Not used in the main flow but kept for type safety if needed elsewhere
  const setActiveView = (v: any) => { console.log(v); }; 

  const renderContent = () => {
    switch (view) {
        case 'signin':
            switch(step) {
                case 'username': return renderUsernameStep();
                case 'password': return renderPasswordStep();
                case 'recaptcha': return renderRecaptchaStep();
                case 'security_check': return renderSecurityCheckStep();
                case 'mfa': return renderMfaStep();
            }
        case 'forgot_password':
            return renderForgotPassword();
        case 'forgot_password_confirmation':
            return renderForgotPasswordConfirmation();
        default:
            return null;
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
        <LoginBackground />
        
        {/* Professional Floating Card Container */}
        <div className="relative z-10 w-full max-w-[440px]">
            <div className="bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8 sm:p-10 transition-all duration-500">
                {renderContent()}
            </div>
            
            {/* Help Link Outside Card */}
            <div className="text-center mt-8 relative z-10 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                <button className="inline-flex items-center space-x-2 text-slate-400 hover:text-white transition-colors text-sm font-medium bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <QuestionMarkCircleIcon className="w-4 h-4"/>
                    <span>Need help logging in?</span>
                </button>
            </div>
        </div>
    </div>
  );
};
