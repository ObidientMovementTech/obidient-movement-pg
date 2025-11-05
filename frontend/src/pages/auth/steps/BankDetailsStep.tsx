import React, { useMemo, useState } from 'react';
import { Banknote } from 'lucide-react';

interface Props {
  data: any;
  updateData: (data: any) => void;
  nextStep: (stepIncrement?: number) => void;
  prevStep: (stepDecrement?: number) => void;
}

const NIGERIAN_BANKS = [
  'Access Bank',
  'Fidelity Bank',
  'First Bank of Nigeria',
  'Guaranty Trust Bank (GTB)',
  'Union Bank',
  'United Bank for Africa (UBA)',
  'Zenith Bank',
  'Citibank Nigeria',
  'Ecobank Nigeria',
  'Heritage Bank',
  'Keystone Bank',
  'Polaris Bank',
  'Stanbic IBTC Bank',
  'Standard Chartered Bank',
  'Sterling Bank',
  'Unity Bank',
  'Wema Bank',
  'Opay',
  'Palmpay',
  'Kuda Bank',
  'Moniepoint',
  'Other',
].sort();

const BankDetailsStep: React.FC<Props> = ({ data, updateData, nextStep, prevStep }) => {
  const [accountNumber, setAccountNumber] = useState(data.accountNumber || '');
  const [bankName, setBankName] = useState(data.bankName || '');
  const [accountName, setAccountName] = useState(data.accountName || '');
  const [skipBankDetails, setSkipBankDetails] = useState(false);
  const hasExistingBankDetails = Boolean(data.accountNumber || data.bankName || data.accountName);

  const bankOptions = useMemo(() => {
    const uniqueBanks = new Set<string>(NIGERIAN_BANKS);
    if (bankName && !uniqueBanks.has(bankName)) {
      uniqueBanks.add(bankName);
    }
    return Array.from(uniqueBanks).sort();
  }, [bankName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (skipBankDetails) {
      updateData({
        accountNumber: null,
        bankName: null,
        accountName: null,
      });
      nextStep();
      return;
    }

    // Validate account number
    if (accountNumber && !/^\d{10}$/.test(accountNumber)) {
      alert('Account number must be exactly 10 digits');
      return;
    }

    if (!skipBankDetails && (!accountNumber || !bankName || !accountName)) {
      alert('Please fill all bank details or choose to skip');
      return;
    }

    updateData({
      accountNumber,
      bankName,
      accountName,
    });

    nextStep();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-green-100 p-3 rounded-full">
          <Banknote className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bank Account Details</h2>
          <p className="text-gray-600 mt-1">For allowances and reimbursements</p>
        </div>
      </div>

      {hasExistingBankDetails && !skipBankDetails && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6 text-sm text-emerald-900">
          We've loaded your previously saved bank details. Review and update anything that has changed.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {!skipBankDetails ? (
          <>
            {/* Bank Name */}
            <div>
              <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-2">
                Bank Name <span className="text-red-500">*</span>
              </label>
              <select
                id="bankName"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required={!skipBankDetails}
              >
                <option value="">Select your bank</option>
                {bankOptions.map((bank) => (
                  <option key={bank} value={bank}>
                    {bank}
                  </option>
                ))}
              </select>
            </div>

            {/* Account Number */}
            <div>
              <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Account Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="accountNumber"
                value={accountNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 10) {
                    setAccountNumber(value);
                  }
                }}
                placeholder="1234567890"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required={!skipBankDetails}
              />
              <p className="text-sm text-gray-500 mt-2">
                Enter your 10-digit account number
              </p>
            </div>

            {/* Account Name */}
            <div>
              <label htmlFor="accountName" className="block text-sm font-medium text-gray-700 mb-2">
                Account Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="accountName"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value.toUpperCase())}
                placeholder="JOHN DOE"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent uppercase"
                required={!skipBankDetails}
              />
              <p className="text-sm text-gray-500 mt-2">
                Enter name exactly as it appears on your bank account
              </p>
            </div>
          </>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-900 mb-2">
              You've chosen to skip bank details for now.
            </p>
            <p className="text-sm text-yellow-800">
              You can add this information later in your profile settings.
            </p>
          </div>
        )}

        {/* Skip Option */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            id="skipBankDetails"
            checked={skipBankDetails}
            onChange={(e) => setSkipBankDetails(e.target.checked)}
            className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
          />
          <label htmlFor="skipBankDetails" className="text-sm text-gray-700">
            Skip bank details for now (I'll add them later)
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => prevStep()}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            ← Back
          </button>
          <button
            type="submit"
            className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default BankDetailsStep;
