import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Mail, AlertCircle, CheckCircle } from 'lucide-react';
import logoImg from '../images/logo.png';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email.trim().toLowerCase());
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <img src={logoImg} alt="Ghumfir" className="h-12 w-auto object-contain mb-6" />

        <h1 className="font-display text-2xl font-bold text-brand-text mb-1">Forgot Password</h1>
        <p className="text-brand-muted text-sm mb-6">
          Enter your registered email address and we'll send you a password reset link.
        </p>

        {success ? (
          <div className="flex flex-col items-center text-center gap-3 py-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
            <p className="text-gray-700 font-medium">Check your inbox</p>
            <p className="text-sm text-gray-500">
              If that email is registered, a password reset link has been sent. It expires in 1 hour.
            </p>
            <Link to="/login" className="mt-4 text-primary-600 text-sm hover:underline">
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl mb-5 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input pl-9"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-base disabled:opacity-60"
              >
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>

            <p className="text-center text-sm text-brand-muted mt-6">
              Remembered your password?{' '}
              <Link to="/login" className="text-primary-600 font-semibold hover:text-accent-500">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
