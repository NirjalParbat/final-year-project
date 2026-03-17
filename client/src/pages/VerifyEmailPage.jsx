import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { authAPI } from '../api/index.js';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import logoImg from '../images/logo.png';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();

  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('No verification token found. Please use the link from your email.');
      return;
    }

    verifyEmail(token)
      .then(() => {
        setStatus('success');
        setTimeout(() => navigate('/'), 2500);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. The link may have expired.');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResend = async (e) => {
    e.preventDefault();
    setResendLoading(true);
    setResendMessage('');
    try {
      await authAPI.resendVerification({ email: resendEmail });
      setResendMessage('A new verification link has been sent if that email is registered.');
    } catch {
      setResendMessage('Request failed. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
        <img src={logoImg} alt="Ghumfir" className="h-12 w-auto object-contain mx-auto mb-6" />

        {status === 'verifying' && (
          <>
            <Loader className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
            <h1 className="font-display text-xl font-bold text-gray-900">Verifying your email…</h1>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h1 className="font-display text-xl font-bold text-gray-900 mb-2">Email Verified!</h1>
            <p className="text-gray-500 text-sm">You're now logged in. Redirecting you to the homepage…</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="font-display text-xl font-bold text-gray-900 mb-2">Verification Failed</h1>
            <p className="text-gray-500 text-sm mb-6">{message}</p>

            <p className="text-sm font-medium text-gray-700 mb-3">Request a new verification link:</p>
            <form onSubmit={handleResend} className="space-y-3 text-left">
              <input
                type="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                className="input"
                placeholder="your@email.com"
                required
              />
              <button
                type="submit"
                disabled={resendLoading}
                className="btn-primary w-full disabled:opacity-60"
              >
                {resendLoading ? 'Sending…' : 'Resend Verification Email'}
              </button>
            </form>
            {resendMessage && (
              <p className="text-sm text-green-600 mt-3">{resendMessage}</p>
            )}

            <Link to="/login" className="block mt-6 text-sm text-primary-600 hover:underline">
              Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
