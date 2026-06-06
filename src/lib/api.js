const API_BASE = 'https://api.staging.integratedtech.ca';

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
  const res = await fetch(`${api}/api/documents/${docId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) throw new Error('Failed to fetch document');
  return res.json();
}

export async function saveDocument(data, api = API_BASE) {
  const res = await fetch(`${api}/api/documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Failed to save document');
  return res.json();
}

export async function updateDocument(docId, data, api = API_BASE) {
  const res = await fetch(`${api}/api/documents/${docId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Failed to update document');
  return res.json();
}

export async function deleteDocument(docId, api = API_BASE) {
  const res = await fetch(`${api}/api/documents/${docId}`, {
    method: 'DELETE',
  });

  if (!res.ok) throw new Error('Failed to delete document');
  return res.json();
}

export async function listDocuments(api = API_BASE) {
  const res = await fetch(`${api}/api/documents`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) throw new Error('Failed to fetch documents');
  return res.json();
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