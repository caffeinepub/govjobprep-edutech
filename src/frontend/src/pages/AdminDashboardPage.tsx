import { useActor } from '../hooks/useActor';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Shield } from 'lucide-react';
import UserManagementTable from '../components/UserManagementTable';

export default function AdminDashboardPage() {
  const { actor, isFetching: actorFetching } = useActor();

  const { data: isAdmin, isLoading: checkingAdmin } = useQuery({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
  });

  if (actorFetching || checkingAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">
            You do not have administrator privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">User Management Dashboard</h1>
        <p className="text-muted-foreground">
          Manage users, roles, and verification status
        </p>
      </div>

      <UserManagementTable />
    </div>
  );
}
