import { auth } from './firebase';

// Base API configuration
const API_BASE_URL = '/api';

// API response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

// API error class
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Get authentication token
async function getAuthToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    return await user.getIdToken();
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
}

// Base fetch wrapper with authentication
async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, config);
    
    // Handle non-JSON responses (like 204 No Content)
    if (response.status === 204) {
      return null as T;
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new ApiError(
        data.message || data.error || 'Request failed',
        response.status,
        data
      );
    }
    
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or parsing errors
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0
    );
  }
}

// HTTP method helpers
export const api = {
  get: <T = any>(endpoint: string, options?: RequestInit): Promise<T> =>
    apiFetch<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, data?: any, options?: RequestInit): Promise<T> =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T = any>(endpoint: string, data?: any, options?: RequestInit): Promise<T> =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T = any>(endpoint: string, data?: any, options?: RequestInit): Promise<T> =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T = any>(endpoint: string, options?: RequestInit): Promise<T> =>
    apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),

  // File upload helper
  upload: <T = any>(endpoint: string, formData: FormData, options?: RequestInit): Promise<T> => {
    const uploadOptions = {
      ...options,
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let browser set it with boundary
        ...options?.headers,
      },
    };
    
    // Remove Content-Type header for file uploads
    if (uploadOptions.headers && 'Content-Type' in uploadOptions.headers) {
      delete (uploadOptions.headers as any)['Content-Type'];
    }
    
    return apiFetch<T>(endpoint, uploadOptions);
  },
};

// Query key factory for React Query
export const queryKeys = {
  // User
  user: () => ['user'] as const,
  userProfile: () => ['user', 'profile'] as const,
  userNotifications: () => ['user', 'notifications'] as const,
  
  // Dashboard
  dashboard: () => ['dashboard'] as const,
  dashboardStats: () => ['dashboard', 'stats'] as const,
  
  // Animals
  animals: () => ['animals'] as const,
  animal: (id: number) => ['animals', id] as const,
  healthRecords: (animalId: number) => ['animals', animalId, 'health-records'] as const,
  breedingRecords: () => ['breeding-records'] as const,
  
  // Finances
  transactions: () => ['transactions'] as const,
  budgets: () => ['budgets'] as const,
  accounts: () => ['accounts'] as const,
  journalEntries: () => ['journal-entries'] as const,
  financialSummary: (startDate?: Date, endDate?: Date) => 
    ['financial-summary', startDate?.toISOString(), endDate?.toISOString()] as const,
  budgetStatus: (period?: string) => ['budget-status', period] as const,
  trialBalance: () => ['trial-balance'] as const,
  
  // Inventory
  inventory: () => ['inventory'] as const,
  lowStockItems: () => ['inventory', 'low-stock'] as const,
  equipment: () => ['equipment'] as const,
  maintenanceRecords: (equipmentId: number) => ['equipment', equipmentId, 'maintenance-records'] as const,
  
  // Documents
  documents: () => ['documents'] as const,
  documentStats: () => ['documents', 'stats'] as const,
  
  // Weather
  weather: (lat: number, lon: number) => ['weather', lat, lon] as const,
  
  // Admin
  allUsers: () => ['admin', 'users'] as const,
} as const;