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