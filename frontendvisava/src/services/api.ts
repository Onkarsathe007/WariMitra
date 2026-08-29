import type { Service } from '../types';

const API_BASE = 'http://localhost:3000/api/v1';

export const fetchServices = async (): Promise<Service[]> => {
  try {
    const res = await fetch(`${API_BASE}/services`);
    if (!res.ok) throw new Error('Failed to fetch services');
    const data = await res.json();
    return data.services || [];
  } catch (error) {
    console.error('Error fetching services (using fallback):', error);
    return [];
  }
};

export const fetchCamps = async (): Promise<Service[]> => {
  try {
    const res = await fetch(`${API_BASE}/camps`);
    if (!res.ok) throw new Error('Failed to fetch camps');
    const data = await res.json();
    // Assuming backend might return 'camps' or reuse 'services' format
    return data.camps || data.services || [];
  } catch (error) {
    console.error('Error fetching camps (using fallback):', error);
    return [];
  }
};

export const submitHelperService = async (serviceData: any): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    // Note: In a real app, you would retrieve the JWT token from state/localStorage here.
    // const token = localStorage.getItem('token');
    
    const res = await fetch(`${API_BASE}/services`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(serviceData)
    });
    
    if (!res.ok) {
      throw new Error(`Failed to submit: ${res.statusText}`);
    }
    
    const data = await res.json();
    return { success: true, data };
  } catch (error: any) {
    console.error('Error submitting service:', error);
    return { success: false, error: error.message };
  }
};
