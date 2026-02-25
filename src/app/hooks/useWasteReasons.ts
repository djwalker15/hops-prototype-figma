import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWasteReasons, addWasteReason, updateWasteReason, deleteWasteReason } from '../data/storage';
import { WasteReason } from '../data/mockData';

export const WASTE_REASONS_QUERY_KEY = ['wasteReasons'] as const;

export function useWasteReasons() {
  return useQuery({
    queryKey: WASTE_REASONS_QUERY_KEY,
    queryFn: getWasteReasons,
  });
}

export function useAddWasteReason() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reason: Omit<WasteReason, 'id' | 'createdAt'>) => addWasteReason(reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: WASTE_REASONS_QUERY_KEY }),
  });
}

export function useUpdateWasteReason() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<WasteReason> }) =>
      updateWasteReason(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: WASTE_REASONS_QUERY_KEY }),
  });
}

export function useDeleteWasteReason() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteWasteReason(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: WASTE_REASONS_QUERY_KEY }),
  });
}
