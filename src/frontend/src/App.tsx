import { StrictMode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import NewsPage from './pages/NewsPage';
import PostDetailPage from './pages/PostDetailPage';
import ResourcesPage from './pages/ResourcesPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import { InternetIdentityProvider } from './hooks/useInternetIdentity';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetUserProfile } from './hooks/useQueries';
import { Loader2 } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      refetchOnWindowFocus: false,
    },
  },
});

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { identity, isInitializing, login } = useInternetIdentity();

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!identity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-muted-foreground mb-6">
            Please log in to access this page
          </p>
          <button
            onClick={login}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function ProfileGuard({ children }: { children: React.ReactNode }) {
  const { data: profile, isLoading, isFetched } = useGetUserProfile();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isFetched && profile === null) {
    return <RegisterPage />;
  }

  return <>{children}</>;
}

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <AuthGuard>
      <ProfileGuard>
        <HomePage />
      </ProfileGuard>
    </AuthGuard>
  ),
});

const newsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/news',
  component: () => (
    <AuthGuard>
      <ProfileGuard>
        <NewsPage />
      </ProfileGuard>
    </AuthGuard>
  ),
});

const postDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/news/$postId',
  component: () => (
    <AuthGuard>
      <ProfileGuard>
        <PostDetailPage />
      </ProfileGuard>
    </AuthGuard>
  ),
});

const resourcesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/resources',
  component: ResourcesPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: () => (
    <AuthGuard>
      <ProfileGuard>
        <ProfilePage />
      </ProfileGuard>
    </AuthGuard>
  ),
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: () => (
    <AuthGuard>
      <ProfileGuard>
        <AdminDashboardPage />
      </ProfileGuard>
    </AuthGuard>
  ),
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: () => (
    <AuthGuard>
      <RegisterPage />
    </AuthGuard>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  newsRoute,
  postDetailRoute,
  resourcesRoute,
  profileRoute,
  adminRoute,
  registerRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <InternetIdentityProvider>
          <RouterProvider router={router} />
        </InternetIdentityProvider>
      </QueryClientProvider>
    </StrictMode>
  );
}
