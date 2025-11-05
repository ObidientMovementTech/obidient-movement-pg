import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import axios from 'axios';
import { Loader2, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function JoinRedirect() {
  const { shortCode } = useParams<{ shortCode: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isResolving, setIsResolving] = useState(true);

  useEffect(() => {
    const resolveShortCode = async () => {
      if (!shortCode) {
        setError('No short code provided');
        setIsResolving(false);
        return;
      }

      try {
        const response = await axios.get(
          `${API_URL}/auth/onboarding/resolve/${shortCode.toUpperCase()}`,
          { withCredentials: true }
        );

        if (response.data.success) {
          // Redirect to onboarding page with full token
          const token = response.data.data.token;
          navigate(`/onboarding?token=${token}`, { replace: true });
        }
      } catch (err: any) {
        console.error('Error resolving short code:', err);
        setError(
          err.response?.data?.message ||
          'Failed to resolve short code. Please check the code and try again.'
        );
        setIsResolving(false);
      }
    };

    resolveShortCode();
  }, [shortCode, navigate]);

  if (isResolving) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <Loader2 className="w-16 h-16 text-green-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Redirecting...
          </h2>
          <p className="text-gray-600">
            Please wait while we verify your code: <span className="font-mono font-bold text-green-600">{shortCode?.toUpperCase()}</span>
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Invalid Code
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700 mb-2">You entered:</p>
            <p className="font-mono font-bold text-xl text-gray-900">{shortCode?.toUpperCase()}</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition w-full"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return null;
}
