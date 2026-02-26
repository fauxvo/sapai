import { useQuery } from '@tanstack/react-query';
import { getIntents } from '../api';
import { useAuthToken } from './useAuthToken';

export function useIntents() {
  const getToken = useAuthToken();
  return useQuery({
    queryKey: ['intents'],
    queryFn: async () => {
      const token = await getToken();
      return getIntents(token);
    },
    staleTime: 5 * 60 * 1000, // intents rarely change
  });
}
