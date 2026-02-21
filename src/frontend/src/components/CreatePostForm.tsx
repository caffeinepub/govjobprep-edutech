import { useState } from 'react';
import { useCreatePost } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { PenSquare, Loader2 } from 'lucide-react';
import { ExternalBlob } from '../backend';

export default function CreatePostForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const createPost = useCreatePost();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      const imageBlob = imageUrl.trim() ? ExternalBlob.fromURL(imageUrl.trim()) : null;
      
      createPost.mutate(
        { title: title.trim(), content: content.trim(), imageUrl: imageBlob },
        {
          onSuccess: () => {
            setTitle('');
            setContent('');
            setImageUrl('');
          },
        }
      );
    }
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <PenSquare className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle>Create a Post</CardTitle>
            <CardDescription>Share news, updates, or insights with the community</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              type="text"
              placeholder="Enter post title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={createPost.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Write your post content..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={6}
              disabled={createPost.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL (optional)</Label>
            <Input
              id="imageUrl"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              disabled={createPost.isPending}
            />
            <p className="text-xs text-muted-foreground">
              Add an image URL to include a visual with your post
            </p>
          </div>

          {createPost.isError && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              Failed to create post. Please try again.
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={createPost.isPending || !title.trim() || !content.trim()}
          >
            {createPost.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Post...
              </>
            ) : (
              'Create Post'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
