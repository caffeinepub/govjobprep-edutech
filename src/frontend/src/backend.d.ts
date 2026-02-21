import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type CommentId = bigint;
export interface Comment {
    id: CommentId;
    authorVerified: boolean;
    text: string;
    authorName: string;
    author: Principal;
    timestamp: bigint;
    postId: PostId;
}
export type PostId = bigint;
export interface UserProfileV2 {
    verified: boolean;
    username: string;
    displayName: string;
    role: UserRole;
    savedPosts: Array<PostId>;
    registrationTimestamp: bigint;
    profilePhotoUrl?: string;
}
export interface UserProfileSummary {
    principal: Principal;
    verified: boolean;
    username: string;
    displayName: string;
    role: UserRole;
    registrationTimestamp: bigint;
    profilePhotoUrl?: string;
}
export interface UserProfileInput {
    username: string;
    displayName: string;
    profilePhotoUrl?: string;
}
export interface NewsPost {
    id: PostId;
    authorVerified: boolean;
    title: string;
    content: string;
    shares: bigint;
    authorName: string;
    author: Principal;
    likes: bigint;
    imageUrl?: ExternalBlob;
    timestamp: bigint;
    commentsCount: bigint;
}
export enum UserRole {
    author = "author",
    contentCreator = "contentCreator",
    commonUser = "commonUser",
    groupHead = "groupHead",
    subscriber = "subscriber",
    administrator = "administrator"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addComment(postId: PostId, text: string): Promise<Comment>;
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    createPost(title: string, content: string, imageUrl: ExternalBlob | null): Promise<NewsPost>;
    deletePost(postId: PostId): Promise<void>;
    getAllComments(): Promise<Array<Comment>>;
    getAllPosts(): Promise<Array<NewsPost>>;
    getAllUsers(): Promise<Array<UserProfileSummary>>;
    getCallerUserProfile(): Promise<UserProfileV2 | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getCommentsForPost(postId: PostId): Promise<Array<Comment>>;
    getPostById(id: PostId): Promise<NewsPost | null>;
    getSavedPosts(): Promise<Array<NewsPost>>;
    getUserProfile(user: Principal): Promise<UserProfileV2 | null>;
    getUserRole(user: Principal): Promise<UserRole>;
    isCallerAdmin(): Promise<boolean>;
    likePost(postId: PostId): Promise<void>;
    saveCallerUserProfile(profileInput: UserProfileInput): Promise<void>;
    savePost(postId: PostId): Promise<void>;
    setUserRole(target: Principal, role: UserRole): Promise<void>;
    sharePost(postId: PostId): Promise<void>;
    unsavePost(postId: PostId): Promise<void>;
    unverifyUser(user: Principal): Promise<void>;
    updateUserRole(target: Principal, newRole: UserRole): Promise<void>;
    verifyUser(user: Principal): Promise<void>;
}
