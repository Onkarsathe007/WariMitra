import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const CORE_API_URL = 'http://localhost:3000/api/v1';

interface GoogleLoginProps {
  onSuccess: (user: any, token: string) => void;
  onError: (error: string) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export default function GoogleLogin({ onSuccess, onError }: GoogleLoginProps) {
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    const loadGoogleScript = () => {
      if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
        setScriptLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => setScriptLoaded(true);
      script.onerror = () => onError('Failed to load Google Sign-In');
      document.head.appendChild(script);
    };

    loadGoogleScript();
  }, [onError]);

  useEffect(() => {
    if (!scriptLoaded || !window.google || !googleButtonRef.current) return;

    window.google.accounts.id.initialize({
      client_id: '580458956487-5delsv9j0l1c0apvmg2q08lg0623t8fd.apps.googleusercontent.com',
      callback: handleGoogleResponse,
      auto_select: false,
    });

    window.google.accounts.id.renderButton(googleButtonRef.current, {
      type: 'standard',
      size: 'large',
      theme: 'outline',
      text: 'continue_with',
      shape: 'rectangular',
      width: 300,
    });
  }, [scriptLoaded]);

  const handleGoogleResponse = async (response: { credential: string }) => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${CORE_API_URL}/auth/google`, {
        credential: response.credential,
      });

      const { token, user } = res.data;
      localStorage.setItem('visava_token', token);
      localStorage.setItem('visava_user', JSON.stringify(user));
      onSuccess(user, token);
    } catch (error: any) {
      console.error('Google login error:', error);
      onError(error.response?.data?.message || 'Google login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="google-login-container">
      <div className="google-login-divider">
        <span>or</span>
      </div>
      <div ref={googleButtonRef} className="google-button-wrapper" />
      {isLoading && (
        <div className="google-login-loading">
          <div className="spinner" />
          <span>Signing in...</span>
        </div>
      )}
    </div>
  );
}
