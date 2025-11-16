import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ThreatAnalysisResponse {
  threat_level: 'low' | 'medium' | 'high' | 'critical' | 'unknown';
  detected_risks: string[];
  recommended_actions: string[];
  confidence: number;
  extra_info: Record<string, any>;
}

export const analyzeImage = async (formData: FormData): Promise<ThreatAnalysisResponse> => {
  const response = await api.post<ThreatAnalysisResponse>('/api/analyze-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const analyzeVideo = async (formData: FormData): Promise<ThreatAnalysisResponse> => {
  const response = await api.post<ThreatAnalysisResponse>('/api/analyze-video', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const analyzeAudio = async (formData: FormData): Promise<ThreatAnalysisResponse> => {
  const response = await api.post<ThreatAnalysisResponse>('/api/analyze-audio', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const analyzeText = async (text: string): Promise<ThreatAnalysisResponse> => {
  const response = await api.post<ThreatAnalysisResponse>('/api/text-analysis', {
    text,
  });
  return response.data;
};

export const analyzeRoute = async (
  origin: string,
  destination: string,
  routeDescription?: string
): Promise<ThreatAnalysisResponse> => {
  const response = await api.post<ThreatAnalysisResponse>('/api/safe-route', {
    origin,
    destination,
    routeDescription,
  });
  return response.data;
};

