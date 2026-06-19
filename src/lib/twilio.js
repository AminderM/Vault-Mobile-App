import AsyncStorage from '@react-native-async-storage/async-storage';

let SecureStore;
try {
  SecureStore = require('expo-secure-store');
} catch {
  SecureStore = null;
}

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://api.staging.integratedtech.ca';

/**
 * Send OTP via SMS to the driver's phone number
 * @param {string} phoneNumber 
 */
export async function sendOTP(phoneNumber) {
  try {
    const res = await fetch(`${API_BASE}/api/driver-mobile/auth/phone/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phoneNumber }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || data.error || 'Failed to send OTP');
    }

    const data = await res.json();
    return {
      success: true,
      sessionId: phoneNumber, // Use phone number as the sessionId for verify-otp step
      message: data.status || 'Verification code sent',
    };
  } catch (error) {
    throw new Error(error.message || 'Failed to send OTP');
  }
}

/**
 * Verify OTP entered by the driver
 * @param {string} sessionId 
 * @param {string} otp 
 * @param {string} firstName 
 * @param {string} lastName 
 * @param {string} email 
 */
export async function verifyOTP(sessionId, otp, firstName, lastName, email) {
  try {
    const res = await fetch(`${API_BASE}/api/driver-mobile/auth/phone/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: sessionId,
        otp: otp,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || data.error || 'Failed to verify OTP');
    }

    const data = await res.json();
    const token = data.token || data.access_token;
    
    if (token) {
      try {
        if (SecureStore && typeof SecureStore.setItemAsync === 'function') {
          await SecureStore.setItemAsync('auth_token', token);
        }
      } catch {}
      await AsyncStorage.setItem('auth_token', token);
    }

    const userObj = data.user || data.driver || null;
    if (userObj) {
      await AsyncStorage.setItem('auth_user', JSON.stringify(userObj));
    }

    return {
      success: true,
      token: token,
      driver: userObj,
    };
  } catch (error) {
    throw new Error(error.message || 'Failed to verify OTP');
  }
}

/**
 * Format phone number to E.164 standard (e.g. +14155552671)
 * @param {string} phone 
 */
export function formatPhoneNumber(phone) {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }
  if (cleaned.length >= 11 && cleaned.length <= 15) {
    return `+${cleaned}`;
  }
  throw new Error('Invalid phone number format. Please enter a 10-digit number.');
}

/**
 * Basic check for phone number length
 * @param {string} phone 
 */
export function validatePhoneNumber(phone) {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
}
