import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useRegisterUser } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Loader2, UserPlus } from 'lucide-react';
import { UserRole } from '../backend';

export default function RegisterPage() {
  const navigate = useNavigate();
  const registerUser = useRegisterUser();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.commonUser);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !displayName.trim()) {
      setError('Both username and display name are required');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    if (displayName.length < 2) {
      setError('Display name must be at least 2 characters long');
      return;
    }

    registerUser.mutate(
      { username: username.trim(), displayName: displayName.trim(), role },
      {
        onSuccess: () => {
          navigate({ to: '/profile' });
        },
        onError: (error: any) => {
          setError(error.message || 'Failed to create profile. Please try again.');
        },
      }
    );
  };

  const roleLabels: Record<UserRole, string> = {
    [UserRole.commonUser]: 'Common User',
    [UserRole.author]: 'Author',
    [UserRole.groupHead]: 'Group Head',
    [UserRole.contentCreator]: 'Content Creator',
    [UserRole.subscriber]: 'Subscriber',
    [UserRole.administrator]: 'Administrator',
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md mx-auto">
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Create Your Profile</CardTitle>
                <CardDescription>Set up your Sanchaari account</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={registerUser.isPending}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Your unique identifier (lowercase, no spaces)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="John Doe"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={registerUser.isPending}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  How your name will appear to others
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={role}
                  onValueChange={(value) => setRole(value as UserRole)}
                  disabled={registerUser.isPending}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserRole.commonUser}>{roleLabels[UserRole.commonUser]}</SelectItem>
                    <SelectItem value={UserRole.author}>{roleLabels[UserRole.author]}</SelectItem>
                    <SelectItem value={UserRole.groupHead}>{roleLabels[UserRole.groupHead]}</SelectItem>
                    <SelectItem value={UserRole.contentCreator}>{roleLabels[UserRole.contentCreator]}</SelectItem>
                    <SelectItem value={UserRole.subscriber}>{roleLabels[UserRole.subscriber]}</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Choose the role that best describes you
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={registerUser.isPending}
              >
                {registerUser.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create Profile
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
