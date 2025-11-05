import React, { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle2, XCircle, ArrowRight, AlertCircle, User } from 'lucide-react';

interface Props {
  data: any;
  updateData: (data: any) => void;
  nextStep: (stepIncrement?: number) => void;
  prevStep: (stepDecrement?: number) => void;
}

const PasswordStep: React.FC<Props> = ({ data, updateData, nextStep, prevStep }) => {
  const [fullName, setFullName] = useState(data.fullName || '');
  const [password, setPassword] = useState(data.password || '');
  const [confirmPassword, setConfirmPassword] = useState(data.confirmPassword || '');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState({ fullName: false, password: false, confirmPassword: false });

  // Password strength validation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, text: 'No password', color: 'text-gray-600', bgColor: 'bg-gray-500' };

    let score = 0;

    // Length check
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;

    // Character diversity checks
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score, text: 'Weak', color: 'text-red-600', bgColor: 'bg-red-500' };
    if (score <= 4) return { score, text: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-500' };
    if (score <= 5) return { score, text: 'Good', color: 'text-green-600', bgColor: 'bg-green-500' };
    return { score, text: 'Strong', color: 'text-green-600', bgColor: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(password);

  const passwordValidation = {
    minLength: password.length >= 8,
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
    matches: password.length > 0 && password === confirmPassword,
  };

  // Name validation
  const nameValidation = {
    minLength: fullName.trim().length >= 3,
    hasSpace: fullName.trim().includes(' '),
    isValid: function () {
      const trimmed = fullName.trim();
      if (trimmed.length < 3) return false;
      const parts = trimmed.split(/\s+/);
      return parts.length >= 2 && parts.every((part: string) => part.length > 0);
    }
  };

  const isValid =
    nameValidation.isValid() &&
    passwordValidation.minLength &&
    passwordValidation.hasLowercase &&
    passwordValidation.hasNumber &&
    passwordValidation.matches;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({ fullName: true, password: true, confirmPassword: true });

    if (!isValid) {
      return;
    }

    // Store fullName as 'name' to match what Google OAuth provides
    updateData({
      name: fullName.trim(),
      fullName: fullName.trim(),
      password,
      confirmPassword
    });
    nextStep();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-green-100 p-3 rounded-full">
          <Lock className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Create Your Account</h2>
          <p className="text-gray-600 mt-1">Provide your name and create a secure password</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Account Information:</p>
            <p>Please provide your full name and create a secure password. Your password must be at least 8 characters long and include lowercase letters, uppercase letters, and numbers.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onBlur={() => setTouched({ ...touched, fullName: true })}
              className={`w-full pl-10 pr-4 py-3 border ${touched.fullName && !nameValidation.isValid()
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                } rounded-lg focus:outline-none focus:ring-2`}
              placeholder="Enter your full name (First and Last)"
              required
            />
          </div>

          {touched.fullName && !nameValidation.isValid() && (
            <div className="mt-2 space-y-1">
              {!nameValidation.minLength && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <XCircle className="w-4 h-4" />
                  Name must be at least 3 characters
                </p>
              )}
              {!nameValidation.hasSpace && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <XCircle className="w-4 h-4" />
                  Please enter both first and last name
                </p>
              )}
            </div>
          )}

          {touched.fullName && nameValidation.isValid() && (
            <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              <span>Valid full name</span>
            </div>
          )}
        </div>

        {/* Password Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched({ ...touched, password: true })}
              className={`w-full pl-10 pr-12 py-3 border ${touched.password && (!passwordValidation.minLength || passwordStrength.score <= 2)
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                } rounded-lg focus:outline-none focus:ring-2`}
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {password && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">Password Strength:</span>
                <span className={`text-xs font-medium ${passwordStrength.color}`}>
                  {passwordStrength.text}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.bgColor}`}
                  style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Password Requirements Checklist */}
          <div className="mt-4 space-y-2">
            <PasswordRequirement
              met={passwordValidation.minLength}
              text="At least 8 characters"
              touched={touched.password}
            />
            <PasswordRequirement
              met={passwordValidation.hasLowercase}
              text="Contains lowercase letter (a-z)"
              touched={touched.password}
            />
            <PasswordRequirement
              met={passwordValidation.hasUppercase}
              text="Contains uppercase letter (A-Z)"
              touched={touched.password}
            />
            <PasswordRequirement
              met={passwordValidation.hasNumber}
              text="Contains number (0-9)"
              touched={touched.password}
            />
            <PasswordRequirement
              met={passwordValidation.hasSpecial}
              text="Contains special character (!@#$%^&*)"
              touched={touched.password}
              optional
            />
          </div>
        </div>

        {/* Confirm Password Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => setTouched({ ...touched, confirmPassword: true })}
              className={`w-full pl-10 pr-12 py-3 border ${touched.confirmPassword && !passwordValidation.matches
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                } rounded-lg focus:outline-none focus:ring-2`}
              placeholder="Re-enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {touched.confirmPassword && confirmPassword && (
            <div className="mt-2">
              {passwordValidation.matches ? (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Passwords match</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <XCircle className="w-4 h-4" />
                  <span>Passwords do not match</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={() => prevStep()}
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            ← Back
          </button>
          <button
            type="submit"
            disabled={!isValid}
            className={`flex items-center gap-2 px-8 py-3 rounded-lg font-medium transition ${isValid
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            Continue
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>

      {/* Security Note */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-600 flex items-start gap-2">
          <Lock className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>
            Your password is encrypted and stored securely. We never share your password with anyone.
            Make sure to remember your password as it will be required to log in to your account.
          </span>
        </p>
      </div>
    </div>
  );
};

// Helper component for password requirement items
const PasswordRequirement: React.FC<{
  met: boolean;
  text: string;
  touched: boolean;
  optional?: boolean;
}> = ({ met, text, touched, optional = false }) => {
  return (
    <div className={`flex items-center gap-2 text-sm ${optional ? 'opacity-60' : ''}`}>
      {met ? (
        <CheckCircle2 className="w-4 h-4 text-green-600" />
      ) : (
        <XCircle className={`w-4 h-4 ${touched ? 'text-red-400' : 'text-gray-300'}`} />
      )}
      <span className={met ? 'text-green-700' : touched ? 'text-gray-700' : 'text-gray-500'}>
        {text}
        {optional && ' (optional)'}
      </span>
    </div>
  );
};

export default PasswordStep;
