import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'https://api.staging.integratedtech.ca';
const LOCAL_DOCS_KEY = 'vault_local_documents';

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

export async function scanRateCon(file, api = API_BASE) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${api}/api/driver-mobile/rate-con/parse`, {
    method: 'POST',
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

  const res = await fetch(`${api}/api/driver-mobile/receipt/parse`, {
    method: 'POST',
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

  const res = await fetch(`${api}/api/driver-mobile/scan/identify`, {
    method: 'POST',
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

export async function getDocument(docId, api = API_BASE) {
  try {
    const res = await fetch(`${api}/api/documents/${docId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.ok) {
      return await res.json();
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
    const res = await fetch(`${api}/api/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
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
    docType: data.docType || 'Other',
    expiryDate: data.expiryDate || null,
    description: data.description || '',
    uploadedAt: data.uploadedAt || new Date().toISOString(),
    status: 'active',
  };
  localDocs.unshift(fallbackDoc);
  await saveLocalDocuments(localDocs);
  return fallbackDoc;
}

export async function updateDocument(docId, data, api = API_BASE) {
  try {
    const res = await fetch(`${api}/api/documents/${docId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const updated = await res.json();
      const localDocs = await getLocalDocuments();
      const idx = localDocs.findIndex(d => d.id === docId);
      if (idx !== -1) {
        localDocs[idx] = { ...localDocs[idx], ...updated };
        await saveLocalDocuments(localDocs);
      }
      return updated;
    }
  } catch (err) {
    console.warn('Failed to update document on server, updating locally', err);
  }

  // Fallback: update locally
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
    await fetch(`${api}/api/documents/${docId}`, {
      method: 'DELETE',
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
    const res = await fetch(`${api}/api/documents`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.ok) {
      const resData = await res.json();
      // Handle both flat array and { documents: [...] } object
      const serverDocs = Array.isArray(resData) ? resData : (resData && Array.isArray(resData.documents) ? resData.documents : []);
      
      const localDocs = await getLocalDocuments();
      const merged = [...serverDocs];
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

export async function getExpenses(filters = {}, api = API_BASE) {
  const params = new URLSearchParams();

  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.category) params.append('category', filters.category);

  const queryString = params.toString();
  const url = queryString
    ? `${api}/api/driver-mobile/expenses?${queryString}`
    : `${api}/api/driver-mobile/expenses`;

  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) throw new Error('Failed to fetch expenses');
  return res.json();
}

export async function createExpense(expenseData, api = API_BASE) {
  const res = await fetch(`${api}/api/driver-mobile/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expenseData),
  });

  if (!res.ok) throw new Error('Failed to create expense');
  return res.json();
}

export async function deleteExpense(expenseId, api = API_BASE) {
  const res = await fetch(`${api}/api/driver-mobile/expenses/${expenseId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) throw new Error('Failed to delete expense');
  return res.json();
}

export async function getLoads(filters = {}, api = API_BASE) {
  const params = new URLSearchParams();

  if (filters.status) params.append('status', filters.status);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.carrier) params.append('carrier', filters.carrier);

  const queryString = params.toString();
  const url = queryString
    ? `${api}/api/driver-mobile/loads?${queryString}`
    : `${api}/api/driver-mobile/loads`;

  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) throw new Error('Failed to fetch loads');
  return res.json();
}

export async function getLoad(loadId, api = API_BASE) {
  const res = await fetch(`${api}/api/driver-mobile/loads/${loadId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) throw new Error('Failed to fetch load');
  return res.json();
}

export async function createLoad(loadData, api = API_BASE) {
  const res = await fetch(`${api}/api/driver-mobile/loads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(loadData),
  });

  if (!res.ok) throw new Error('Failed to create load');
  return res.json();
}

export async function updateLoad(loadId, loadData, api = API_BASE) {
  const res = await fetch(`${api}/api/driver-mobile/loads/${loadId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(loadData),
  });

  if (!res.ok) throw new Error('Failed to update load');
  return res.json();
}

export async function deleteLoad(loadId, api = API_BASE) {
  const res = await fetch(`${api}/api/driver-mobile/loads/${loadId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) throw new Error('Failed to delete load');
  return res.json();
}

export async function uploadFileToVault(fileData, api = API_BASE) {
  const formData = new FormData();
  formData.append('file', {
    uri: fileData.file.uri,
    type: fileData.file.type,
    name: fileData.file.name,
  });
  formData.append('category', fileData.category);
  if (fileData.expiryDate) {
    formData.append('expiryDate', fileData.expiryDate);
  }
  if (fileData.notes) {
    formData.append('notes', fileData.notes);
  }

  const res = await fetch(`${api}/api/documents/upload`, {
    method: 'POST',
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