import { Link } from '@tanstack/react-router';
import { useGetAllPosts, useGetUserProfile, useSavePost, useUnsavePost } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import CreatePostForm from '../components/CreatePostForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Skeleton } from '../components/ui/skeleton';
import { Home, Heart, MessageCircle, Share2, Clock, Bookmark } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible';
import { useState } from 'react';

export default function HomePage() {
  const { data: posts, isLoading } = useGetAllPosts();
  const { data: profile } = useGetUserProfile();
  const { identity } = useInternetIdentity();
  const [createFormOpen, setCreateFormOpen] = useState(false);
  const savePost = useSavePost();
  const unsavePost = useUnsavePost();

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

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const isPostSaved = (postId: bigint) => {
    if (!profile?.savedPosts) return false;
    return profile.savedPosts.some((id) => id === postId);
  };

  const handleToggleSave = (postId: bigint) => {
    if (isPostSaved(postId)) {
      unsavePost.mutate(postId);
    } else {
      savePost.mutate(postId);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Home className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Home</h1>
              <p className="text-muted-foreground">All posts from the community</p>
            </div>
          </div>
        </div>

        {/* Create Post Form - Only for authenticated users */}
        {identity && (
          <div className="mb-8">
            <Collapsible open={createFormOpen} onOpenChange={setCreateFormOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full mb-4">
                  {createFormOpen ? 'Hide Create Post' : 'Create New Post'}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CreatePostForm />
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

        {/* Posts Feed */}
        <div className="space-y-6">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-2">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full mb-4" />
                    <div className="flex space-x-4">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : posts && posts.length > 0 ? (
            posts.map((post) => (
              <Card key={post.id.toString()} className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{post.title}</CardTitle>
                      <CardDescription className="flex items-center space-x-2">
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-5 h-5">
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
                                className="w-4 h-4 inline-block"
                              />
                            )}
                          </span>
                        </div>
                        <span>•</span>
                        <Clock className="w-3 h-3" />
                        <span>{formatTimestamp(post.timestamp)}</span>
                      </CardDescription>
                    </div>
                    {identity && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleSave(post.id)}
                        disabled={savePost.isPending || unsavePost.isPending}
                      >
                        <Bookmark
                          className={`w-5 h-5 ${
                            isPostSaved(post.id) ? 'fill-primary text-primary' : 'text-muted-foreground'
                          }`}
                        />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 whitespace-pre-wrap">
                    {truncateContent(post.content)}
                  </p>

                  {post.imageUrl && (
                    <div className="mb-4 rounded-lg overflow-hidden">
                      <img
                        src={post.imageUrl.getDirectURL()}
                        alt={post.title}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Heart className="w-4 h-4" />
                        <span>{post.likes.toString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.commentsCount.toString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Share2 className="w-4 h-4" />
                        <span>{post.shares.toString()}</span>
                      </div>
                    </div>
                    <Link to="/news/$postId" params={{ postId: post.id.toString() }}>
                      <Button variant="outline" size="sm">
                        Read More
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-2">
              <CardContent className="py-12 text-center">
                <Home className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No posts yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Be the first to create a post!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
