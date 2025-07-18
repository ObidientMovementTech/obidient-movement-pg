/**
 * Formats a phone number for database storage by adding leading zero for Nigerian numbers
 * @param phone - The phone number string
 * @param countryCode - The country code (e.g., "+234", "234", "Nigeria")
 * @returns Formatted phone number for database storage
 */
export const formatPhoneForStorage = (phone: string, countryCode?: string): string => {
  if (!phone) return '';

  // Clean the phone number (remove spaces, dashes, parentheses)
  let cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

  // Remove any leading + sign from the phone number
  cleanPhone = cleanPhone.replace(/^\+/, '');

  // Handle Nigerian phone numbers specifically
  if (countryCode === '+234' || countryCode === '234' || countryCode?.toLowerCase() === 'nigeria') {
    // Remove country code if it's already in the phone number
    if (cleanPhone.startsWith('234')) {
      cleanPhone = cleanPhone.substring(3);
    }

    // Add leading zero if not present and the number looks like a Nigerian mobile number
    if (!cleanPhone.startsWith('0') && cleanPhone.length >= 10) {
      cleanPhone = '0' + cleanPhone;
    }
  }

  return cleanPhone;
};

/**
 * Formats a phone number for WhatsApp by handling country codes and leading zeros
 * @param phone - The phone number string
 * @param countryCode - The country code (e.g., "+234", "234", "Nigeria")
 * @returns Formatted phone number for WhatsApp URL
 */
export const formatPhoneForWhatsApp = (phone: string, countryCode?: string): string => {
  if (!phone) return '';

  // Clean the phone number (remove spaces, dashes, parentheses)
  let cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

  // Remove any leading + sign from the phone number
  cleanPhone = cleanPhone.replace(/^\+/, '');

  // Handle country code
  let finalCountryCode = '';
  if (countryCode) {
    // If countryCode is a country name like "Nigeria", convert to code
    if (countryCode.toLowerCase() === 'nigeria') {
      finalCountryCode = '234';
    } else {
      // Remove + sign and spaces from country code
      finalCountryCode = countryCode.replace(/[\s\+]/g, '');
    }
  }

  // Default to Nigeria if no country code provided
  if (!finalCountryCode) {
    finalCountryCode = '234';
  }

  // Handle Nigerian phone numbers specifically
  if (finalCountryCode === '234') {
    // Remove leading 0 if present (common in Nigerian numbers)
    if (cleanPhone.startsWith('0')) {
      cleanPhone = cleanPhone.substring(1);
    }
    // If phone already starts with 234, don't add it again
    if (cleanPhone.startsWith('234')) {
      return cleanPhone;
    }
    // Add 234 prefix
    return `234${cleanPhone}`;
  }

  // For other countries, check if country code is already present
  if (cleanPhone.startsWith(finalCountryCode)) {
    return cleanPhone;
  }

  // Add country code
  return `${finalCountryCode}${cleanPhone}`;
};

/**
 * Validates if a phone number is valid for WhatsApp
 * @param phone - The phone number string
 * @returns boolean indicating if the phone number is valid
 */
export const isValidPhoneForWhatsApp = (phone: string): boolean => {
  if (!phone) return false;

  // Basic validation: should be at least 10 digits after formatting
  const formatted = formatPhoneForWhatsApp(phone);
  return formatted.length >= 10 && /^\d+$/.test(formatted);
};
