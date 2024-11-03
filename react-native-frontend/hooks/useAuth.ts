import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { authenticatedState } from '@/store/Authentication';
import { pb } from '@/api/pocketbase';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useRecoilState(authenticatedState);

  useEffect(() => {
    const unsubscribeFromAuthStoreChanges = pb.authStore.onChange((token) => {
      setIsAuthenticated(Boolean(token));
    }, true);

    return unsubscribeFromAuthStoreChanges;
  }, [setIsAuthenticated]);

  return { isAuthenticated };
}