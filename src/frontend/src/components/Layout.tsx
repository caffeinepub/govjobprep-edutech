import { Link, useRouterState } from '@tanstack/react-router';
import { Home, Newspaper, BookOpen, User, Shield } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import { useQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from './ui/button';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const { data: isAdmin, isLoading: checkingAdmin } = useQuery({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });

  const handleAuth = async () => {
    if (identity) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const isActive = (path: string) => currentPath === path;

  const showAdminNav = !checkingAdmin && isAdmin && identity;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold">Sanchaari</span>
            </Link>

            <Button
              onClick={handleAuth}
              disabled={loginStatus === 'logging-in'}
              variant={identity ? 'outline' : 'default'}
              size="sm"
            >
              {loginStatus === 'logging-in' ? 'Logging in...' : identity ? 'Logout' : 'Login'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center ${showAdminNav ? 'justify-between' : 'justify-around'} h-16`}>
            <Link
              to="/"
              className={`flex flex-col items-center justify-center space-y-1 px-4 py-2 rounded-lg transition-colors ${
                isActive('/') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-xs font-medium">Home</span>
            </Link>

            <Link
              to="/news"
              className={`flex flex-col items-center justify-center space-y-1 px-4 py-2 rounded-lg transition-colors ${
                isActive('/news') || currentPath.startsWith('/news/')
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Newspaper className="w-5 h-5" />
              <span className="text-xs font-medium">Updates</span>
            </Link>

            <Link
              to="/resources"
              className={`flex flex-col items-center justify-center space-y-1 px-4 py-2 rounded-lg transition-colors ${
                isActive('/resources') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-xs font-medium">Resources</span>
            </Link>

            <Link
              to="/profile"
              className={`flex flex-col items-center justify-center space-y-1 px-4 py-2 rounded-lg transition-colors ${
                isActive('/profile') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-xs font-medium">Profile</span>
            </Link>

            {showAdminNav && (
              <Link
                to="/admin"
                className={`flex flex-col items-center justify-center space-y-1 px-4 py-2 rounded-lg transition-colors ${
                  isActive('/admin') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Shield className="w-5 h-5" />
                <span className="text-xs font-medium">Admin</span>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-6 mt-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()} Sanchaari. Built with ❤️ using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  typeof window !== 'undefined' ? window.location.hostname : 'sanchaari'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
