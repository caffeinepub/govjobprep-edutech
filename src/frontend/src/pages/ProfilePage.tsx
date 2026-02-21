import { useState } from 'react';
import { useGetUserProfile, useUpdateProfile, useGetSavedPosts } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Skeleton } from '../components/ui/skeleton';
import { User, Edit2, Check, X, Bookmark, Heart, MessageCircle, Share2, Clock } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import ProfilePhotoUpload from '../components/ProfilePhotoUpload';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';

export default function ProfilePage() {
  const { data: profile, isLoading: profileLoading } = useGetUserProfile();
  const { data: savedPosts, isLoading: savedPostsLoading } = useGetSavedPosts();
  const updateProfile = useUpdateProfile();

  const [isEditingName, setIsEditingName] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);

  const handleEditName = () => {
    if (profile) {
      setDisplayName(profile.displayName);
      setIsEditingName(true);
    }
  };

  const handleSaveName = () => {
    if (profile && displayName.trim()) {
      updateProfile.mutate(
        {
          username: profile.username,
          displayName: displayName.trim(),
          profilePhotoUrl: profile.profilePhotoUrl,
        },
        {
          onSuccess: () => {
            setIsEditingName(false);
          },
        }
      );
    }
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setDisplayName('');
  };

  const handlePhotoUpload = (blobUrl: string) => {
    if (profile) {
      updateProfile.mutate(
        {
          username: profile.username,
          displayName: profile.displayName,
          profilePhotoUrl: blobUrl,
        },
        {
          onSuccess: () => {
            setIsPhotoDialogOpen(false);
          },
        }
      );
    }
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (profileLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Skeleton className="w-20 h-20 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2">
            <CardContent className="py-12 text-center">
              <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Profile not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Card */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="w-20 h-20">
                    {profile.profilePhotoUrl && (
                      <AvatarImage src={profile.profilePhotoUrl} alt={profile.displayName} />
                    )}
                    <AvatarFallback className="text-2xl">
                      {profile.displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Update Profile Photo</DialogTitle>
                        <DialogDescription>
                          Upload a new profile photo. Drag and drop or click to browse.
                        </DialogDescription>
                      </DialogHeader>
                      <ProfilePhotoUpload
                        onUpload={handlePhotoUpload}
                        currentPhotoUrl={profile.profilePhotoUrl}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex-1">
                  {isEditingName ? (
                    <div className="flex items-center space-x-2">
                      <Input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="max-w-xs"
                        autoFocus
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleSaveName}
                        disabled={updateProfile.isPending || !displayName.trim()}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={handleCancelEdit}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-2xl flex items-center space-x-2">
                        <span>{profile.displayName}</span>
                        {profile.verified && (
                          <img
                            src="/assets/generated/verified-badge.dim_24x24.png"
                            alt="Verified"
                            className="w-5 h-5"
                          />
                        )}
                      </CardTitle>
                      <Button size="icon" variant="ghost" onClick={handleEditName}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  <CardDescription className="mt-1">@{profile.username}</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Saved Posts Section */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Bookmark className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">Saved Posts</h2>
          </div>

          <div className="space-y-4">
            {savedPostsLoading ? (
              <>
                {[1, 2].map((i) => (
                  <Card key={i} className="border-2">
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/4" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-16 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : savedPosts && savedPosts.length > 0 ? (
              savedPosts.map((post) => (
                <Card key={post.id.toString()} className="border-2 hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-lg">{post.title}</CardTitle>
                    <CardDescription className="flex items-center space-x-2">
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-4 h-4">
                          <AvatarFallback className="text-xs">
                            {post.authorName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="flex items-center space-x-1">
                          <span>By {post.authorName}</span>
                          {post.authorVerified && (
                            <img
                              src="/assets/generated/verified-badge.dim_24x24.png"
                              alt="Verified"
                              className="w-3 h-3 inline-block"
                            />
                          )}
                        </span>
                      </div>
                      <span>•</span>
                      <Clock className="w-3 h-3" />
                      <span>{formatTimestamp(post.timestamp)}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 whitespace-pre-wrap">
                      {truncateContent(post.content)}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Heart className="w-3 h-3" />
                          <span>{post.likes.toString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-3 h-3" />
                          <span>{post.commentsCount.toString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Share2 className="w-3 h-3" />
                          <span>{post.shares.toString()}</span>
                        </div>
                      </div>
                      <Link to="/news/$postId" params={{ postId: post.id.toString() }}>
                        <Button variant="outline" size="sm">
                          View Post
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-2">
                <CardContent className="py-12 text-center">
                  <Bookmark className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No saved posts yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Posts you save will appear here
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
