import AsyncStorage from '@react-native-async-storage/async-storage';

let SecureStore;
try {
  SecureStore = require('expo-secure-store');
} catch {
  SecureStore = null;
}

// ============== CONFIGURATION ==============

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://api.staging.integratedtech.ca';
const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';
const LOCAL_DOCS_KEY = 'vault_local_documents';

// ============== AUTH TOKEN HELPERS ==============

export async function getAuthToken() {
  try {
    if (SecureStore && typeof SecureStore.getItemAsync === 'function') {
      const secureToken = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      if (secureToken) return secureToken;
    }
  } catch {}
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function getAuthUser() {
  try {
    const val = await AsyncStorage.getItem(AUTH_USER_KEY);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
}

async function authHeaders() {
  const token = await getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function authHeadersNoContentType() {
  const token = await getAuthToken();
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// ============== AUTH ENDPOINTS ==============

export async function login(email, password, api = API_BASE) {
  const res = await fetch(`${api}/api/driver-mobile/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const status = res.status;
    if (status === 401) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || 'Invalid email or password');
    }
    if (status === 403) throw new Error('Account is deactivated');
    throw new Error('Login failed');
  }

  const data = await res.json();
  const token = data.token || data.access_token;
  if (token) {
    try {
      if (SecureStore && typeof SecureStore.setItemAsync === 'function') {
        await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
      }
    } catch {}
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  }
  if (data.user) {
    await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
  }
  return data;
}

export async function validateInvite(token, api = API_BASE) {
  const res = await fetch(`${api}/api/driver-mobile/signup/validate-invite?token=${token}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || 'This invite link is invalid or has expired.');
  }

  return res.json();
}

export async function signup(token, phone, password, api = API_BASE) {
  const res = await fetch(`${api}/api/driver-mobile/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, phone, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || 'Signup failed');
  }

  return res.json();
}

export async function signupOpen(payload, api = API_BASE) {
  const formBody = [];
  for (const property in payload) {
    const encodedKey = encodeURIComponent(property);
    const encodedValue = encodeURIComponent(payload[property]);
    formBody.push(encodedKey + "=" + encodedValue);
  }
  const body = formBody.join("&");

  const res = await fetch(`${api}/api/driver-mobile/signup/open`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || 'Signup failed');
  }

  const data = await res.json();
  const authToken = data.token || data.access_token;
  if (authToken) {
    try {
      if (SecureStore && typeof SecureStore.setItemAsync === 'function') {
        await SecureStore.setItemAsync(AUTH_TOKEN_KEY, authToken);
      }
    } catch {}
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, authToken);
  }
  if (data.user) {
    await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
  }
  return data;
}

export async function logout() {
  try {
    if (SecureStore && typeof SecureStore.deleteItemAsync === 'function') {
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    }
  } catch (err) {
    console.warn('SecureStore delete failed during logout:', err);
  }
  try {
    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, AUTH_USER_KEY]);
  } catch (err) {
    console.warn('AsyncStorage clear failed during logout:', err);
  }
}

export async function isAuthenticated() {
  const token = await getAuthToken();
  return !!token;
}

export async function getMe(api = API_BASE) {
  const headers = await authHeaders();
  const res = await fetch(`${api}/api/driver-mobile/me`, {
    method: 'GET',
    headers,
  });

  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
}

// ============== LOCAL DOCUMENT CACHE ==============

async function getLocalDocuments() {
  try {
    const val = await AsyncStorage.getItem(LOCAL_DOCS_KEY);
    return val ? JSON.parse(val) : [];
  } catch (e) {
    console.error('Error reading local documents', e);
    return [];
  }
}

async function saveLocalDocuments(docs) {
  try {
    await AsyncStorage.setItem(LOCAL_DOCS_KEY, JSON.stringify(docs));
  } catch (e) {
    console.error('Error saving local documents', e);
  }
}

// ============== DOCUMENT SCANNING ==============

export async function scanRateCon(file, api = API_BASE) {
  const formData = new FormData();
  formData.append('file', file);

  const headers = await authHeadersNoContentType();
  const res = await fetch(`${api}/api/driver-mobile/rate-con/parse`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    const status = res.status;
    if (status === 415) throw new Error('Unsupported file type');
    if (status === 413) throw new Error('File too large');
    if (status === 503) throw new Error('Scanner not configured');
    if (status === 422) throw new Error('Cannot read document');
    throw new Error(`Failed to scan: ${status}`);
  }

  return res.json();
}

export async function scanReceipt(file, api = API_BASE) {
  const formData = new FormData();
  formData.append('file', file);

  const headers = await authHeadersNoContentType();
  const res = await fetch(`${api}/api/driver-mobile/receipt/parse`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    const status = res.status;
    if (status === 415) throw new Error('Unsupported file type');
    if (status === 413) throw new Error('File too large');
    if (status === 503) throw new Error('Scanner not configured');
    if (status === 422) throw new Error('Cannot read document');
    throw new Error(`Failed to scan: ${status}`);
  }

  return res.json();
}

export async function scanIdentify(file, api = API_BASE) {
  const formData = new FormData();
  formData.append('file', file);

  const headers = await authHeadersNoContentType();
  const res = await fetch(`${api}/api/driver-mobile/scan/identify`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    const status = res.status;
    if (status === 415) throw new Error('Unsupported file type');
    if (status === 413) throw new Error('File too large');
    if (status === 503) throw new Error('Scanner not configured');
    if (status === 422) throw new Error('Cannot read document');
    throw new Error(`Failed to identify: ${status}`);
  }

  return res.json();
}

// ============== VAULT DOCUMENTS ==============
// Backend path: /api/driver-mobile/vault/documents

export async function getDocument(docId, api = API_BASE) {
  // The backend doesn't have a single-doc GET on vault,
  // so we fetch the list and find by ID, falling back to local cache.
  try {
    const headers = await authHeaders();
    const res = await fetch(`${api}/api/driver-mobile/vault/documents`, {
      method: 'GET',
      headers,
    });

    if (res.ok) {
      const docs = await res.json();
      const found = docs.find(d => d.id === docId);
      if (found) return found;
    }
  } catch (err) {
    console.warn('Failed to fetch document from server, checking local cache', err);
  }

  const localDocs = await getLocalDocuments();
  const found = localDocs.find(d => d.id === docId);
  if (!found) throw new Error('Document not found');
  return found;
}

export async function saveDocument(data, api = API_BASE) {
  try {
    // Backend expects multipart/form-data with specific fields
    const formData = new FormData();
    formData.append('doc_type', data.docType || data.doc_type || 'other');
    if (data.label || data.description) {
      formData.append('label', data.label || data.description || '');
    }
    if (data.expiryDate || data.expiry_date) {
      formData.append('expiry_date', data.expiryDate || data.expiry_date);
    }
    if (data.notes) {
      formData.append('notes', data.notes);
    }
    if (data.file) {
      formData.append('file', data.file);
    }

    const headers = await authHeadersNoContentType();
    const res = await fetch(`${api}/api/driver-mobile/vault/documents`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (res.ok) {
      const saved = await res.json();
      // Cache server document locally too
      const localDocs = await getLocalDocuments();
      if (!localDocs.some(d => d.id === saved.id)) {
        localDocs.unshift(saved);
        await saveLocalDocuments(localDocs);
      }
      return saved;
    }
  } catch (err) {
    console.warn('Network call failed, saving document locally', err);
  }

  // Fallback: save to AsyncStorage
  const localDocs = await getLocalDocuments();
  const fallbackDoc = {
    id: data.id || `doc_local_${Date.now()}`,
    doc_type: data.docType || data.doc_type || 'other',
    label: data.label || data.description || '',
    expiry_date: data.expiryDate || data.expiry_date || null,
    notes: data.notes || '',
    created_at: data.uploadedAt || new Date().toISOString(),
    // Keep backward compat fields for screens that read these
    docType: data.docType || data.doc_type || 'other',
    description: data.description || data.label || '',
    expiryDate: data.expiryDate || data.expiry_date || null,
    uploadedAt: data.uploadedAt || new Date().toISOString(),
    status: 'active',
  };
  localDocs.unshift(fallbackDoc);
  await saveLocalDocuments(localDocs);
  return fallbackDoc;
}

export async function updateDocument(docId, data, api = API_BASE) {
  // The backend vault doesn't have a PUT/PATCH endpoint.
  // Update locally only.
  const localDocs = await getLocalDocuments();
  const idx = localDocs.findIndex(d => d.id === docId);
  if (idx === -1) throw new Error('Document not found locally');
  const updatedDoc = { ...localDocs[idx], ...data, updatedAt: new Date().toISOString() };
  localDocs[idx] = updatedDoc;
  await saveLocalDocuments(localDocs);
  return updatedDoc;
}

export async function deleteDocument(docId, api = API_BASE) {
  try {
    const headers = await authHeaders();
    await fetch(`${api}/api/driver-mobile/vault/documents/${docId}`, {
      method: 'DELETE',
      headers,
    });
    // Even if server returns 404 or fails, we proceed with local delete
  } catch (err) {
    console.warn('Failed to delete document on server, deleting locally', err);
  }

  // Always delete locally if present
  const localDocs = await getLocalDocuments();
  const filtered = localDocs.filter(d => d.id !== docId);
  await saveLocalDocuments(filtered);
  return { id: docId, status: 'deleted' };
}

export async function listDocuments(api = API_BASE) {
  try {
    const headers = await authHeaders();
    const res = await fetch(`${api}/api/driver-mobile/vault/documents`, {
      method: 'GET',
      headers,
    });

    if (res.ok) {
      const serverDocs = await res.json();
      // Backend returns a flat array of vault documents
      const docs = Array.isArray(serverDocs) ? serverDocs : [];

      const localDocs = await getLocalDocuments();
      const merged = [...docs];
      for (const local of localDocs) {
        if (!merged.some(d => d.id === local.id)) {
          merged.unshift(local); // Place local items at the top
        }
      }
      return merged;
    }
  } catch (err) {
    console.warn('Failed to fetch documents from server, returning local ones', err);
  }

  // Fallback: return AsyncStorage docs
  return await getLocalDocuments();
}

// ============== EXPENSES ==============
// Backend path: /api/driver-mobile/expenses

export async function getExpenses(filters = {}, api = API_BASE) {
  const params = new URLSearchParams();

  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.category) params.append('category', filters.category);

  const queryString = params.toString();
  const url = queryString
    ? `${api}/api/driver-mobile/expenses?${queryString}`
    : `${api}/api/driver-mobile/expenses`;

  const headers = await authHeaders();
  const res = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (!res.ok) throw new Error('Failed to fetch expenses');
  // Backend returns a flat array, normalize for compatibility
  const data = await res.json();
  return Array.isArray(data) ? data : (data.expenses || []);
}

export async function createExpense(expenseData, api = API_BASE) {
  const headers = await authHeaders();
  const res = await fetch(`${api}/api/driver-mobile/expenses`, {
    method: 'POST',
    headers,
    body: JSON.stringify(expenseData),
  });

  if (!res.ok) throw new Error('Failed to create expense');
  return res.json();
}

export async function updateExpense(expenseId, expenseData, api = API_BASE) {
  const headers = await authHeaders();
  const res = await fetch(`${api}/api/driver-mobile/expenses/${expenseId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(expenseData),
  });

  if (!res.ok) throw new Error('Failed to update expense');
  return res.json();
}

export async function deleteExpense(expenseId, api = API_BASE) {
  const headers = await authHeaders();
  const res = await fetch(`${api}/api/driver-mobile/expenses/${expenseId}`, {
    method: 'DELETE',
    headers,
  });

  if (!res.ok) throw new Error('Failed to delete expense');
  // Backend returns 204 No Content — don't try to parse JSON
  return { id: expenseId, status: 'deleted' };
}

// ============== LOADS (MY-LOADS for CRUD, /loads for TMS read) ==============

export async function getLoads(filters = {}, api = API_BASE) {
  const params = new URLSearchParams();

  if (filters.status) params.append('status', filters.status);
  // Note: the backend /my-loads only supports ?status= filter
  // Date/carrier filters are not supported on /my-loads

  const queryString = params.toString();
  const url = queryString
    ? `${api}/api/driver-mobile/my-loads?${queryString}`
    : `${api}/api/driver-mobile/my-loads`;

  const headers = await authHeaders();
  const res = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (!res.ok) throw new Error('Failed to fetch loads');
  const data = await res.json();
  const loadsArray = Array.isArray(data) ? data : (data.loads || []);
  return { loads: loadsArray };
}

export async function getLoad(loadId, api = API_BASE) {
  // Try TMS loads first (has single-load GET), fallback to finding in my-loads
  const headers = await authHeaders();
  try {
    const res = await fetch(`${api}/api/driver-mobile/loads/${loadId}`, {
      method: 'GET',
      headers,
    });
    if (res.ok) return res.json();
  } catch {
    // Fall through
  }

  // Fallback: fetch from my-loads list and find by ID
  const response = await getLoads({}, api);
  const loadsList = Array.isArray(response) ? response : (response.loads || []);
  const found = loadsList.find(l => l.id === loadId);
  if (!found) throw new Error('Load not found');
  return found;
}

export async function createLoad(loadData, api = API_BASE) {
  const headers = await authHeaders();
  const res = await fetch(`${api}/api/driver-mobile/my-loads`, {
    method: 'POST',
    headers,
    body: JSON.stringify(loadData),
  });

  if (!res.ok) throw new Error('Failed to create load');
  return res.json();
}

export async function updateLoad(loadId, loadData, api = API_BASE) {
  const headers = await authHeaders();
  const res = await fetch(`${api}/api/driver-mobile/my-loads/${loadId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(loadData),
  });

  if (!res.ok) throw new Error('Failed to update load');
  return res.json();
}

export async function deleteLoad(loadId, api = API_BASE) {
  const headers = await authHeaders();
  const res = await fetch(`${api}/api/driver-mobile/my-loads/${loadId}`, {
    method: 'DELETE',
    headers,
  });

  if (!res.ok) throw new Error('Failed to delete load');
  return res.json();
}

export async function getLoadHistory(api = API_BASE) {
  const headers = await authHeaders();
  const res = await fetch(`${api}/api/driver-mobile/my-loads/history`, {
    method: 'GET',
    headers,
  });

  if (!res.ok) throw new Error('Failed to fetch load history');
  return res.json();
}

// ============== FILE UPLOAD ==============

export async function uploadFileToVault(fileData, api = API_BASE) {
  const formData = new FormData();
  formData.append('file', {
    uri: fileData.file.uri,
    type: fileData.file.type,
    name: fileData.file.name,
  });
  formData.append('doc_type', fileData.category || 'other');
  if (fileData.label) {
    formData.append('label', fileData.label);
  }
  if (fileData.expiryDate) {
    formData.append('expiry_date', fileData.expiryDate);
  }
  if (fileData.notes) {
    formData.append('notes', fileData.notes);
  }

  const headers = await authHeadersNoContentType();
  const res = await fetch(`${api}/api/driver-mobile/vault/documents`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    const status = res.status;
    if (status === 413) throw new Error('File too large (max 10MB)');
    if (status === 415) throw new Error('Unsupported file type');
    throw new Error('Failed to upload file');
  }

  return await res.json();
}