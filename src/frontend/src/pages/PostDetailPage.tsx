import { useParams, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useGetPostById, useGetCommentsForPost, useAddComment, useLikePost, useSharePost, useGetUserProfile, useSavePost, useUnsavePost } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Skeleton } from '../components/ui/skeleton';
import { Separator } from '../components/ui/separator';
import { Heart, MessageCircle, Share2, Clock, ArrowLeft, Send, Loader2, Bookmark } from 'lucide-react';
import type { Comment } from '../backend';

function CommentItem({ comment }: { comment: Comment }) {
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

  return (
    <div className="p-4 rounded-lg bg-muted/30 border border-border">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Avatar className="w-6 h-6">
            <AvatarFallback className="text-xs">
              {comment.authorName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="font-medium text-sm flex items-center space-x-1">
            <span>{comment.authorName}</span>
            {comment.authorVerified && (
              <img
                src="/assets/generated/verified-badge.dim_24x24.png"
                alt="Verified"
                className="w-4 h-4 inline-block"
              />
            )}
          </div>
        </div>
        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{formatTimestamp(comment.timestamp)}</span>
        </div>
      </div>
      <p className="text-sm text-foreground whitespace-pre-wrap">{comment.text}</p>
    </div>
  );
}

export default function PostDetailPage() {
  const { postId } = useParams({ from: '/news/$postId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: profile } = useGetUserProfile();
  const [commentText, setCommentText] = useState('');

  const { data: post, isLoading: postLoading } = useGetPostById(postId);
  const { data: comments, isLoading: commentsLoading } = useGetCommentsForPost(postId);

  const addComment = useAddComment();
  const likePost = useLikePost();
  const sharePost = useSharePost();
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

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim() && postId) {
      const postIdBigInt = BigInt(postId);
      addComment.mutate(
        { postId: postIdBigInt, text: commentText.trim() },
        {
          onSuccess: () => {
            setCommentText('');
          },
        }
      );
    }
  };

  const handleLike = () => {
    if (postId) {
      likePost.mutate(BigInt(postId));
    }
  };

  const handleShare = () => {
    if (postId) {
      sharePost.mutate(BigInt(postId));
    }
  };

  if (postLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-32 mb-8" />
          <Card className="border-2">
            <CardHeader>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full mb-4" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Post not found</h2>
          <Button onClick={() => navigate({ to: '/news' })}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to News Feed
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/news' })}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to News Feed
        </Button>

        {/* Post Content */}
        <Card className="border-2 mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{post.title}</CardTitle>
                <CardDescription className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-6 h-6">
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
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimestamp(post.timestamp)}</span>
                  </div>
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
            {post.imageUrl && (
              <div className="mb-6 rounded-lg overflow-hidden">
                <img
                  src={post.imageUrl.getDirectURL()}
                  alt={post.title}
                  className="w-full max-h-96 object-cover"
                />
              </div>
            )}

            <p className="text-foreground mb-6 whitespace-pre-wrap leading-relaxed">
              {post.content}
            </p>

            <Separator className="my-6" />

            {/* Interaction Buttons */}
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLike}
                disabled={!identity || likePost.isPending}
              >
                {likePost.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Heart className="w-4 h-4 mr-2" />
                )}
                Like ({post.likes.toString()})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                disabled={!identity || sharePost.isPending}
              >
                {sharePost.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Share2 className="w-4 h-4 mr-2" />
                )}
                Share ({post.shares.toString()})
              </Button>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MessageCircle className="w-4 h-4" />
                <span>{comments?.length || 0} Comments</span>
              </div>
            </div>

            {(likePost.isError || sharePost.isError) && (
              <div className="mt-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {likePost.isError && 'Failed to like post. You may have already liked it.'}
                {sharePost.isError && 'Failed to share post. Please try again.'}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-xl">Comments</CardTitle>
            <CardDescription>
              {comments?.length || 0} {comments?.length === 1 ? 'comment' : 'comments'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Add Comment Form - Only for authenticated users */}
            {identity ? (
              <form onSubmit={handleAddComment} className="mb-6">
                <Textarea
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={3}
                  disabled={addComment.isPending}
                  className="mb-2"
                />
                {addComment.isError && (
                  <div className="mb-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    Failed to add comment. Please try again.
                  </div>
                )}
                <Button
                  type="submit"
                  size="sm"
                  disabled={addComment.isPending || !commentText.trim()}
                >
                  {addComment.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Post Comment
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="mb-6 p-4 rounded-lg bg-muted/30 border border-border text-center">
                <p className="text-sm text-muted-foreground">
                  Please log in to comment on this post
                </p>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {commentsLoading ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 rounded-lg bg-muted/30 border border-border">
                      <Skeleton className="h-4 w-1/4 mb-2" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ))}
                </>
              ) : comments && comments.length > 0 ? (
                comments.map((comment) => (
                  <CommentItem key={comment.id.toString()} comment={comment} />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No comments yet. Be the first to comment!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
