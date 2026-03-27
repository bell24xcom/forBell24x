import { useAuth } from '@/hooks/use-auth';
import { Redirect, Route } from 'wouter';
<<<<<<< HEAD
=======
import { Loader2 } from 'lucide-react';
>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className='flex items-center justify-center min-h-screen'>
          <Loader2 className='h-8 w-8 animate-spin text-border' />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to='/auth' />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}
