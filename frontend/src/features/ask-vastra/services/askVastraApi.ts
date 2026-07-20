import type { AskVastraRequest, AskVastraResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const getStylingRecommendations = async (params: AskVastraRequest): Promise<AskVastraResponse> => {
  const response = await fetch(`${API_BASE_URL}/ask-vastra/recommend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch styling recommendations');
  }
  
  return response.json();
};
