'use client';

import * as React from 'react';
import { useAuth } from '@/lib/auth-context';
import { UsersView } from '../components/users-view';

export default function AdminUsersPage() {
  const { user } = useAuth();
  return <UsersView currentAdminUsername={user?.username ?? ''} />;
}
