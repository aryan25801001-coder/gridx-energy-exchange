'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useStore } from '@/lib/store';

export function withAuth(Component: any) {
  return function ProtectedComponent(props: any) {
    const router = useRouter();
    const { token, user } = useStore();

    useEffect(() => {
      if (!token || !user) {
        router.push('/login');
      }
    }, [token, user, router]);

    if (!token || !user) {
      return null;
    }

    return <Component {...props} />;
  };
}
