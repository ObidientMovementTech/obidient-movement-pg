import React, { useState } from 'react';
import axios from 'axios';
import { Phone, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface Props {
  data: any;
  updateData: (data: any) => void;
  nextStep: (stepIncrement?: number) => void;
}

const PhoneStep: React.FC<Props> = ({ data, updateData, nextStep }) => {
  const [phone, setPhone] = useState(data.phone || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [reconciliationInfo, setReconciliationInfo] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setReconciliationInfo(null);

    try {
      // Validate phone format
      const cleanPhone = phone.replace(/\s/g, '');
      if (!/^(0|\+234)[7-9][0-1]\d{8}$/.test(cleanPhone)) {
        setError('Please enter a valid Nigerian phone number');
        setIsLoading(false);
        return;
      }

      // Verify phone with backend
      const response = await axios.post(
        `${API_URL}/auth/onboarding/verify-phone`,
        { phone: cleanPhone },
        { headers: { 'x-onboarding-token': data.token } }
      );

      const { reconciliation, existingUser, voterData, skipGoogle = false } = response.data;

      const updates: Record<string, any> = {
        phone: cleanPhone,
        reconciliation,
        existingUser,
        voterData,
        skipGoogle,
        bypassGoogle: false, // Don't set bypassGoogle here - it should only be set from GoogleAuthStep
        googleData: null,
      };

      if (existingUser) {
        updates.name = existingUser.name || data.name;
        updates.votingState = existingUser.votingState || '';
        updates.votingLGA = existingUser.votingLGA || '';
        updates.votingWard = existingUser.votingWard || '';
        updates.votingPU = existingUser.votingPU || '';
        updates.supportGroup = existingUser.supportGroup || data.supportGroup;
        if (existingUser.profileImage) {
          updates.profileImage = existingUser.profileImage;
        }
        if (existingUser.bankAccountNumber) {
          updates.accountNumber = existingUser.bankAccountNumber;
        }
        if (existingUser.bankName) {
          updates.bankName = existingUser.bankName;
        }
        if (existingUser.bankAccountName) {
          updates.accountName = existingUser.bankAccountName;
        }
      }

      updateData(updates);

      if (reconciliation === 'account_exists') {
        setReconciliationInfo(response.data);
        setError(response.data?.message || 'This phone number is already registered. Please contact support.');
      } else {
        setReconciliationInfo(response.data);
        nextStep(1);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to verify phone number');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhoneInput = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    let base = '';

    if (cleaned.startsWith('234')) {
      base = `0${cleaned.slice(3, 13)}`;
    } else if (cleaned.startsWith('0')) {
      base = cleaned.slice(0, 11);
    } else if (cleaned.length === 10) {
      base = `0${cleaned}`;
    } else {
      base = cleaned.slice(0, 11);
    }

    const trimmed = base.slice(0, 11);

    if (trimmed.length <= 4) return trimmed;
    if (trimmed.length <= 7) {
      return `${trimmed.slice(0, 4)} ${trimmed.slice(4)}`;
    }

    return `${trimmed.slice(0, 4)} ${trimmed.slice(4, 7)} ${trimmed.slice(7)}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-green-100 p-3 rounded-full">
          <Phone className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Enter Your Phone Number</h2>
          <p className="text-gray-600 mt-1">We'll use this to verify your identity</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
            placeholder="0801 234 5678"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
          <p className="text-sm text-gray-500 mt-2">
            Enter your Nigerian phone number (e.g., 08012345678)
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {reconciliationInfo && reconciliationInfo.reconciliation === 'update_required' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Account Found</p>
                <p className="text-sm text-blue-700 mt-1">
                  We found an existing account. We'll update it with your Google information.
                </p>
              </div>
            </div>
          </div>
        )}

        {reconciliationInfo && reconciliationInfo.reconciliation === 'existing_user' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-emerald-900">Verified Account Detected</p>
                <p className="text-sm text-emerald-700 mt-1">
                  Great news! We found a verified email on this account so you can skip Google sign-in and continue updating your profile.
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !phone}
          className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Verifying...
            </>
          ) : (
            'Continue'
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t">
        <h3 className="font-medium text-gray-900 mb-3">Why we need your phone number:</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            To verify your identity and prevent duplicate registrations
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            To send you important updates about election monitoring
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            To connect you with your coordinator and support team
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PhoneStep;
