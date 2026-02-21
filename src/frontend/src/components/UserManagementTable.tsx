import { useState, useMemo } from 'react';
import { useGetAllUsers, useUpdateUserRole, useGrantVerification, useRevokeVerification } from '../hooks/useQueries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Loader2, Eye, ShieldCheck, ShieldX, Search } from 'lucide-react';
import { UserRole } from '../backend';
import { toast } from 'sonner';
import UserProfileModal from './UserProfileModal';
import type { Principal } from '@icp-sdk/core/principal';

const roleLabels: Record<UserRole, string> = {
  [UserRole.commonUser]: 'Common User',
  [UserRole.author]: 'Author',
  [UserRole.groupHead]: 'Group Head',
  [UserRole.contentCreator]: 'Content Creator',
  [UserRole.subscriber]: 'Subscriber',
  [UserRole.administrator]: 'Administrator',
};

const roleColors: Record<UserRole, string> = {
  [UserRole.commonUser]: 'bg-gray-100 text-gray-800',
  [UserRole.author]: 'bg-blue-100 text-blue-800',
  [UserRole.groupHead]: 'bg-purple-100 text-purple-800',
  [UserRole.contentCreator]: 'bg-green-100 text-green-800',
  [UserRole.subscriber]: 'bg-yellow-100 text-yellow-800',
  [UserRole.administrator]: 'bg-red-100 text-red-800',
};

export default function UserManagementTable() {
  const { data: users, isLoading } = useGetAllUsers();
  const updateRole = useUpdateUserRole();
  const grantVerification = useGrantVerification();
  const revokeVerification = useRevokeVerification();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<Principal | null>(null);

  const filteredUsers = useMemo(() => {
    if (!users) return [];

    return users.filter((user) => {
      const matchesSearch =
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.displayName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === 'all' || user.role === roleFilter;

      const matchesVerification =
        verificationFilter === 'all' ||
        (verificationFilter === 'verified' && user.verified) ||
        (verificationFilter === 'unverified' && !user.verified);

      return matchesSearch && matchesRole && matchesVerification;
    });
  }, [users, searchQuery, roleFilter, verificationFilter]);

  const handleRoleChange = async (userPrincipal: Principal, newRole: UserRole) => {
    try {
      await updateRole.mutateAsync({ principal: userPrincipal, role: newRole });
      toast.success('Role updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update role');
    }
  };

  const handleGrantVerification = async (userPrincipal: Principal) => {
    try {
      await grantVerification.mutateAsync(userPrincipal);
      toast.success('Verification granted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to grant verification');
    }
  };

  const handleRevokeVerification = async (userPrincipal: Principal) => {
    try {
      await revokeVerification.mutateAsync(userPrincipal);
      toast.success('Verification revoked successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to revoke verification');
    }
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by username or display name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {Object.entries(roleLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={verificationFilter} onValueChange={setVerificationFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by verification" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="unverified">Unverified</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No users found matching your filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.principal.toString()}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={user.profilePhotoUrl} />
                          <AvatarFallback>
                            {user.displayName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.displayName}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">@{user.username}</span>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(value) => handleRoleChange(user.principal, value as UserRole)}
                        disabled={updateRole.isPending}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue>
                            <Badge className={roleColors[user.role]}>{roleLabels[user.role]}</Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(roleLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.verified ? (
                          <>
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              Verified
                            </Badge>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRevokeVerification(user.principal)}
                              disabled={revokeVerification.isPending}
                            >
                              {revokeVerification.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <ShieldX className="w-4 h-4 mr-1" />
                                  Revoke
                                </>
                              )}
                            </Button>
                          </>
                        ) : (
                          <>
                            <Badge variant="secondary">Unverified</Badge>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleGrantVerification(user.principal)}
                              disabled={grantVerification.isPending}
                            >
                              {grantVerification.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <ShieldCheck className="w-4 h-4 mr-1" />
                                  Grant
                                </>
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(user.registrationTimestamp)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedUser(user.principal)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* User Profile Modal */}
      {selectedUser && (
        <UserProfileModal
          userPrincipal={selectedUser}
          open={!!selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}
