const BASE_URL = 'https://admin-backend-vj3t6ewmoa-uc.a.run.app';

export async function fetchActors() {
  const response = await fetch(`${BASE_URL}/Actors`);
  if (!response.ok) {
    throw new Error('Error fetching actors');
  }
  return response.json();
}

export async function postWorkflow(data: any) {
  const response = await fetch(`${BASE_URL}/Workflows/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error posting workflow data');
  }
  
  return response.json();
}

