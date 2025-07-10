import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { authClient } from '~/lib/auth-client';
import { toast } from 'sonner';

export default function UsersLayout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: session } = await authClient.getSession();
        if (!session) {
          toast.error('Authentication required');
          navigate('/login?return_to=/users');
          return;
        }

        const permissionCheck = await authClient.admin.hasPermission({
          permission: {
            user: ['list', 'delete', 'set-role', 'ban']
          }
        });

        if (!permissionCheck.data?.success) {
          toast.error('Insufficient permissions to access user management');
          navigate('/dashboard');
          return;
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        navigate('/login?return_to=/users');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <Outlet />
    </div>
  );
}
