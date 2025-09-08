import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, queryKeys, ApiError } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Types (these should ideally be imported from shared types)
export interface Animal {
  id: number;
  name: string;
  species: string;
  breed?: string;
  dateOfBirth?: string;
  gender: string;
  weight?: number;
  healthStatus: string;
  location?: string;
  notes?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface HealthRecord {
  id: number;
  animalId: number;
  date: string;
  type: string;
  description: string;
  veterinarian?: string;
  cost?: number;
  nextDueDate?: string;
  notes?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BreedingRecord {
  id: number;
  femaleId: number;
  maleId?: number;
  breedingDate: string;
  expectedDueDate?: string;
  actualBirthDate?: string;
  offspring?: number;
  notes?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Animal hooks
export function useAnimals() {
  return useQuery({
    queryKey: queryKeys.animals(),
    queryFn: () => api.get<Animal[]>('/animals'),
  });
}

export function useAnimal(id: number) {
  return useQuery({
    queryKey: queryKeys.animal(id),
    queryFn: () => api.get<Animal>(`/animals/${id}`),
    enabled: !!id,
  });
}

export function useCreateAnimal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Partial<Animal>) => api.post<Animal>('/animals', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.animals() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats() });
      toast({
        title: 'Success',
        description: 'Animal created successfully',
      });
    },
    onError: (error: ApiError) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create animal',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateAnimal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Animal> }) =>
      api.put<Animal>(`/animals/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.animals() });
      queryClient.invalidateQueries({ queryKey: queryKeys.animal(id) });
      toast({
        title: 'Success',
        description: 'Animal updated successfully',
      });
    },
    onError: (error: ApiError) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update animal',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteAnimal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => api.delete(`/animals/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.animals() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats() });
      toast({
        title: 'Success',
        description: 'Animal deleted successfully',
      });
    },
    onError: (error: ApiError) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete animal',
        variant: 'destructive',
      });
    },
  });
}

// Health record hooks
export function useHealthRecords(animalId: number) {
  return useQuery({
    queryKey: queryKeys.healthRecords(animalId),
    queryFn: () => api.get<HealthRecord[]>(`/animals/${animalId}/health-records`),
    enabled: !!animalId,
  });
}

export function useCreateHealthRecord() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Partial<HealthRecord>) => api.post<HealthRecord>('/health-records', data),
    onSuccess: (_, data) => {
      if (data.animalId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.healthRecords(data.animalId) });
      }
      toast({
        title: 'Success',
        description: 'Health record created successfully',
      });
    },
    onError: (error: ApiError) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create health record',
        variant: 'destructive',
      });
    },
  });
}

// Breeding record hooks
export function useBreedingRecords() {
  return useQuery({
    queryKey: queryKeys.breedingRecords(),
    queryFn: () => api.get<BreedingRecord[]>('/breeding-records'),
  });
}

export function useCreateBreedingRecord() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Partial<BreedingRecord>) => api.post<BreedingRecord>('/breeding-records', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.breedingRecords() });
      toast({
        title: 'Success',
        description: 'Breeding record created successfully',
      });
    },
    onError: (error: ApiError) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create breeding record',
        variant: 'destructive',
      });
    },
  });
}