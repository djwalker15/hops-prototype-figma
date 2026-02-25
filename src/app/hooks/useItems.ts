import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getItems, addItem, updateItem } from '../data/storage';
import { Item } from '../data/mockData';

export const ITEMS_QUERY_KEY = ['items'] as const;

export function useItems() {
  return useQuery({
    queryKey: ITEMS_QUERY_KEY,
    queryFn: getItems,
  });
}

export function useAddItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (item: Item) => addItem(item),
    onSuccess: () => qc.invalidateQueries({ queryKey: ITEMS_QUERY_KEY }),
  });
}

export function useUpdateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Item> }) =>
      updateItem(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ITEMS_QUERY_KEY }),
  });
}
