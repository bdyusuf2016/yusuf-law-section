// Frontend API client to communicate with the Node.js / PostgreSQL backend

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const isServerAvailable = async (): Promise<boolean> => {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
};

// Cases API
export const apiFetchCases = async () => {
  const res = await fetch(`${API_BASE_URL}/cases`);
  if (!res.ok) throw new Error('Failed to fetch cases from server');
  return res.json();
};

export const apiCreateCase = async (caseData: any) => {
  const res = await fetch(`${API_BASE_URL}/cases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(caseData)
  });
  if (!res.ok) throw new Error('Failed to create case');
  return res.json();
};

export const apiUpdateCase = async (id: string, caseData: any) => {
  const res = await fetch(`${API_BASE_URL}/cases/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(caseData)
  });
  if (!res.ok) throw new Error('Failed to update case');
  return res.json();
};

export const apiDeleteCase = async (id: string) => {
  const res = await fetch(`${API_BASE_URL}/cases/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete case');
  return res.json();
};

// Companies API
export const apiFetchCompanies = async () => {
  const res = await fetch(`${API_BASE_URL}/companies`);
  if (!res.ok) throw new Error('Failed to fetch companies');
  return res.json();
};

export const apiCreateCompany = async (company: any) => {
  const res = await fetch(`${API_BASE_URL}/companies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(company)
  });
  if (!res.ok) throw new Error('Failed to create company');
  return res.json();
};

export const apiUpdateCompany = async (id: string, company: any) => {
  const res = await fetch(`${API_BASE_URL}/companies/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(company)
  });
  if (!res.ok) throw new Error('Failed to update company');
  return res.json();
};

export const apiBulkAssignOfficersToCompanies = async (companyIds: string[], officersData: any) => {
  const res = await fetch(`${API_BASE_URL}/companies/bulk-assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ companyIds, officersData })
  });
  if (!res.ok) throw new Error('Failed to bulk assign officers');
  return res.json();
};

export const apiDeleteCompany = async (id: string) => {
  const res = await fetch(`${API_BASE_URL}/companies/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete company');
  return res.json();
};

// Officers API
export const apiFetchOfficers = async (designation?: string) => {
  const url = designation && designation !== 'all'
    ? `${API_BASE_URL}/officers?designation=${encodeURIComponent(designation)}`
    : `${API_BASE_URL}/officers`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch officers');
  return res.json();
};

export const apiCreateOfficer = async (officer: any) => {
  const res = await fetch(`${API_BASE_URL}/officers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(officer)
  });
  if (!res.ok) throw new Error('Failed to create officer');
  return res.json();
};

export const apiAssignOfficerCirclesAndCompanies = async (
  officerIds: string[],
  assignedCircles: string[],
  assignedCompanyIds: string[],
  assignedCompanyNames: string[],
  syncToCompanies: boolean
) => {
  const res = await fetch(`${API_BASE_URL}/officers/assign-bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      officerIds,
      assignedCircles,
      assignedCompanyIds,
      assignedCompanyNames,
      syncToCompanies
    })
  });
  if (!res.ok) throw new Error('Failed to assign officers');
  return res.json();
};
