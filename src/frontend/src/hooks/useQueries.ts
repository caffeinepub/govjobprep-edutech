import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfileInput, NewsPost, Comment, PostId, UserRole } from '../backend';

export function useGetUserProfile() {
  const { actor, isFetching } = useActor();

  return useQuery<any>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useRegisterUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfileInput & { role?: UserRole }) => {
      if (!actor) throw new Error('Actor not available');
      
      const profileInput: UserProfileInput = {
        username: profile.username,
        displayName: profile.displayName,
        profilePhotoUrl: profile.profilePhotoUrl,
      };
      
      await actor.saveCallerUserProfile(profileInput);
      
      if (profile.role) {
        const callerPrincipal = await actor.getCallerUserProfile();
        if (callerPrincipal) {
          // Note: setUserRole requires admin privileges, so this will only work
          // if the backend allows users to set their own role during registration
          // For now, the role is set via the backend migration to commonUser by default
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useUpdateProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfileInput) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetAllPosts() {
  const { actor, isFetching } = useActor();

  return useQuery<NewsPost[]>({
    queryKey: ['posts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPosts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPostById(postId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<NewsPost | null>({
    queryKey: ['post', postId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getPostById(BigInt(postId));
    },
    enabled: !!actor && !isFetching && !!postId,
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (post: { title: string; content: string; imageUrl: any }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createPost(post.title, post.content, post.imageUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useDeletePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: PostId) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deletePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useGetCommentsForPost(postId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Comment[]>({
    queryKey: ['comments', postId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCommentsForPost(BigInt(postId));
    },
    enabled: !!actor && !isFetching && !!postId,
  });
}

export function useAddComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, text }: { postId: PostId; text: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addComment(postId, text);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', variables.postId.toString()] });
    },
  });
}

export function useLikePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: PostId) => {
      if (!actor) throw new Error('Actor not available');
      await actor.likePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post'] });
    },
  });
}

export function useSharePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: PostId) => {
      if (!actor) throw new Error('Actor not available');
      await actor.sharePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post'] });
    },
  });
}

export function useSavePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: PostId) => {
      if (!actor) throw new Error('Actor not available');
      await actor.savePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['savedPosts'] });
    },
  });
}

export function useUnsavePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: PostId) => {
      if (!actor) throw new Error('Actor not available');
      await actor.unsavePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['savedPosts'] });
    },
  });
}

export function useGetSavedPosts() {
  const { actor, isFetching } = useActor();

  return useQuery<NewsPost[]>({
    queryKey: ['savedPosts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSavedPosts();
    },
    enabled: !!actor && !isFetching,
  });
}
