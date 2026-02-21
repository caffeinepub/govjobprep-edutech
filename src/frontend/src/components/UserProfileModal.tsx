import { useQuery } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Loader2, Calendar, Bookmark, FileText } from 'lucide-react';
import type { Principal } from '@icp-sdk/core/principal';
import type { UserProfileV2, NewsPost } from '../backend';
import { UserRole } from '../backend';

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

interface UserProfileModalProps {
  userPrincipal: Principal;
  open: boolean;
  onClose: () => void;
}

export default function UserProfileModal({ userPrincipal, open, onClose }: UserProfileModalProps) {
  const { actor, isFetching: actorFetching } = useActor();

  const { data: profile, isLoading: profileLoading } = useQuery<UserProfileV2 | null>({
    queryKey: ['userProfile', userPrincipal.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getUserProfile(userPrincipal);
    },
    enabled: !!actor && !actorFetching && open,
  });

  const { data: allPosts, isLoading: postsLoading } = useQuery<NewsPost[]>({
    queryKey: ['allPosts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPosts();
    },
    enabled: !!actor && !actorFetching && open,
  });

  const userPosts = allPosts?.filter(
    (post) => post.author.toString() === userPrincipal.toString()
  ) || [];

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isLoading = profileLoading || postsLoading;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Profile Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !profile ? (
          <div className="text-center py-8 text-muted-foreground">
            Profile not found
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-start gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={profile.profilePhotoUrl} />
                <AvatarFallback className="text-2xl">
                  {profile.displayName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold">{profile.displayName}</h3>
                  {profile.verified && (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">@{profile.username}</p>
                <div className="mt-2">
                  <Badge className={roleColors[profile.role]}>
                    {roleLabels[profile.role]}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <FileText className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{userPosts.length}</div>
                <div className="text-sm text-muted-foreground">Posts</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <Bookmark className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{profile.savedPosts.length}</div>
                <div className="text-sm text-muted-foreground">Saved</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <Calendar className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-sm font-medium">Registered</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {formatDate(profile.registrationTimestamp)}
                </div>
              </div>
            </div>

            {/* Recent Posts */}
            {userPosts.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Recent Posts</h4>
                <div className="space-y-3">
                  {userPosts.slice(0, 5).map((post) => (
                    <div key={post.id.toString()} className="border rounded-lg p-3">
                      <h5 className="font-medium mb-1">{post.title}</h5>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>{Number(post.likes)} likes</span>
                        <span>{Number(post.commentsCount)} comments</span>
                        <span>{Number(post.shares)} shares</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Principal ID */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Principal ID</h4>
              <code className="text-xs bg-muted px-2 py-1 rounded break-all">
                {userPrincipal.toString()}
              </code>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
