import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";

module {
  type PostId = Nat;
  type CommentId = Nat;

  type NewsPost = {
    id : PostId;
    author : Principal;
    authorName : Text;
    authorVerified : Bool;
    title : Text;
    content : Text;
    imageUrl : ?Storage.ExternalBlob;
    timestamp : Int;
    likes : Nat;
    commentsCount : Nat;
    shares : Nat;
  };

  type Comment = {
    id : CommentId;
    postId : PostId;
    author : Principal;
    authorName : Text;
    authorVerified : Bool;
    text : Text;
    timestamp : Int;
  };

  type UserProfileV2 = {
    username : Text;
    displayName : Text;
    profilePhotoUrl : ?Text;
    verified : Bool;
    savedPosts : [PostId];
    role : UserRole;
    registrationTimestamp : Int;
  };

  type UserRole = {
    #commonUser;
    #author;
    #groupHead;
    #contentCreator;
    #subscriber;
    #administrator;
  };

  type Actor = {
    userProfiles : Map.Map<Principal, UserProfileV2>;
    posts : Map.Map<PostId, NewsPost>;
    comments : Map.Map<CommentId, Comment>;
    postLikes : Map.Map<PostId, List.List<Principal>>;
    nextPostId : Nat;
    nextCommentId : Nat;
  };

  public func run(old : Actor) : Actor {
    old;
  };
};
