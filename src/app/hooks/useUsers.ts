import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../data/storage';

export const USERS_QUERY_KEY = ['users'] as const;

export function useUsers() {
  return useQuery({
    queryKey: USERS_QUERY_KEY,
    queryFn: getUsers,
    staleTime: 1000 * 60 * 30, // 30 minutes — users rarely change
  });
}
