import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWasteEntries, addWasteEntry, clearWasteEntries } from '../data/storage';
import { WasteEntry } from '../data/mockData';

export const WASTE_ENTRIES_QUERY_KEY = ['wasteEntries'] as const;

export function useWasteEntries() {
  return useQuery({
    queryKey: WASTE_ENTRIES_QUERY_KEY,
    queryFn: getWasteEntries,
  });
}

export function useAddWasteEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (entry: WasteEntry) => addWasteEntry(entry),
    onSuccess: () => qc.invalidateQueries({ queryKey: WASTE_ENTRIES_QUERY_KEY }),
  });
}

export function useClearWasteEntries() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: clearWasteEntries,
    onSuccess: () => qc.invalidateQueries({ queryKey: WASTE_ENTRIES_QUERY_KEY }),
  });
}
