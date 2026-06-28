import { getAuthToken } from './api';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://api.staging.integratedtech.ca';

/**
 * Retrieve authorization headers
 * @param {string} [passedToken] 
 */
async function getHeaders(passedToken) {
  const token = passedToken || await getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Fetch available loads from the TMS server
 * @param {string} [token] 
 * @param {object} [filters] 
 */
export async function getAvailableLoads(token, filters = {}) {
  try {
    const headers = await getHeaders(token);
    const params = new URLSearchParams();
    for (const key in filters) {
      if (filters[key] !== undefined && filters[key] !== null) {
        params.append(key, filters[key]);
      }
    }
    
    // Target the correct backend carrier fleet endpoint for pending offers
    if (!params.has('status')) {
      params.append('status', 'pending');
    }
    const queryString = params.toString();
    const url = `${API_BASE}/api/driver-mobile/fleet/loads?${queryString}`;

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      // If carrier fleet fails or returns 403 (e.g. for drivers), fallback to driver-specific loads
      if (response.status === 403) {
        const driverRes = await fetch(`${API_BASE}/api/driver-mobile/loads`, {
          method: 'GET',
          headers,
        });
        if (driverRes.ok) {
          const driverData = await driverRes.json();
          return Array.isArray(driverData) ? driverData : (driverData.loads || []);
        }
      }
      const data = await response.json().catch(() => ({}));
      throw new Error(data.detail || data.error || 'Failed to fetch loads');
    }

    const data = await response.json();
    return Array.isArray(data) ? data : (data.loads || []);
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch loads');
  }
}

/**
 * Get detailed information for a specific load
 * @param {string} loadId 
 * @param {string} [token] 
 */
export async function getLoadDetail(loadId, token) {
  try {
    const headers = await getHeaders(token);
    const response = await fetch(`${API_BASE}/api/driver-mobile/loads/${loadId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.detail || data.error || 'Failed to fetch load details');
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch load details');
  }
}

/**
 * Accept an available load
 * @param {string} loadId 
 * @param {string} driverId 
 * @param {string} [token] 
 */
export async function acceptLoad(loadId, driverId, token) {
  try {
    const headers = await getHeaders(token);
    const response = await fetch(`${API_BASE}/api/driver-mobile/loads/${loadId}/accept`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ driverId }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.detail || data.error || 'Failed to accept load');
    }

    const data = await response.json();
    return {
      success: true,
      load: data,
    };
  } catch (error) {
    throw new Error(error.message || 'Failed to accept load');
  }
}

/**
 * Reject an available load with a specified reason
 * @param {string} loadId 
 * @param {string} [token] 
 * @param {string} [reason] 
 */
export async function rejectLoad(loadId, token, reason = '') {
  try {
    const headers = await getHeaders(token);
    const response = await fetch(`${API_BASE}/api/driver-mobile/loads/${loadId}/reject`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.detail || data.error || 'Failed to reject load');
    }

    const data = await response.json();
    return {
      success: true,
      message: data.message,
    };
  } catch (error) {
    throw new Error(error.message || 'Failed to reject load');
  }
}

/**
 * Fetch loads assigned to the current driver or carrier
 * @param {string} [token] 
 */
export async function getMyLoads(token) {
  try {
    const headers = await getHeaders(token);
    // Fetch custom loads created directly by driver/carrier
    const response = await fetch(`${API_BASE}/api/driver-mobile/my-loads`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.detail || data.error || 'Failed to fetch your loads');
    }

    const data = await response.json();
    return Array.isArray(data) ? data : (data.loads || []);
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch your loads');
  }
}

/**
 * Update the status of an assigned load
 * @param {string} loadId 
 * @param {string} status 
 * @param {string} [token] 
 */
export async function updateLoadStatus(loadId, status, token) {
  try {
    const headers = await getHeaders(token);
    // Target correct POST endpoint on backend
    const response = await fetch(`${API_BASE}/api/driver-mobile/loads/${loadId}/status`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.detail || data.error || 'Failed to update load status');
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message || 'Failed to update load status');
  }
}

/**
 * Fetch loads assigned to the authenticated driver
 * @param {string} [token]
 */
export async function getDriverLoads(token) {
  try {
    const headers = await getHeaders(token);
    const response = await fetch(`${API_BASE}/api/driver-mobile/loads`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.detail || data.error || 'Failed to fetch driver loads');
    }

    const data = await response.json();
    return Array.isArray(data) ? data : (data.loads || []);
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch driver loads');
  }
}
