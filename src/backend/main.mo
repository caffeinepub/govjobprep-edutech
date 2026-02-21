import List "mo:core/List";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Migration "migration";

import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";

// Use migration to persist state and handle upgrades.
(with migration = Migration.run)
actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();

  // Use the prefabricated storage component and its persistent actor state.
  include MixinStorage();
  include MixinAuthorization(accessControlState);

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

  public type UserProfileV2 = {
    username : Text;
    displayName : Text;
    profilePhotoUrl : ?Text;
    verified : Bool;
    savedPosts : [PostId];
    role : UserRole;
    registrationTimestamp : Int;
  };

  public type UserRole = {
    #commonUser;
    #author;
    #groupHead;
    #contentCreator;
    #subscriber;
    #administrator;
  };

  type UserProfileInput = {
    username : Text;
    displayName : Text;
    profilePhotoUrl : ?Text;
  };

  public type UserProfileSummary = {
    principal : Principal;
    username : Text;
    displayName : Text;
    profilePhotoUrl : ?Text;
    verified : Bool;
    role : UserRole;
    registrationTimestamp : Int;
  };

  let userProfiles = Map.empty<Principal, UserProfileV2>();
  let posts = Map.empty<PostId, NewsPost>();
  let comments = Map.empty<CommentId, Comment>();
  let postLikes = Map.empty<PostId, List.List<Principal>>();
  var nextPostId = 0;
  var nextCommentId = 0;

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfileV2 {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfileV2 {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profileInput : UserProfileInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    let existingProfile = userProfiles.get(caller);

    let verified = switch (existingProfile) {
      case (?profile) { profile.verified };
      case (null) { false };
    };

    let savedPosts = switch (existingProfile) {
      case (?profile) { profile.savedPosts };
      case (null) { [] };
    };

    // Role assignment: preserve existing role or default to commonUser
    // SECURITY: Role changes must be done through setUserRole/updateUserRole by admins only
    let role = switch (existingProfile) {
      case (?profile) { profile.role };
      case (null) { #commonUser };
    };

    // Check for username uniqueness
    for ((principal, existingProfile) in userProfiles.entries()) {
      if (principal != caller and existingProfile.username.toLower() == profileInput.username.toLower()) {
        Runtime.trap("Username already exists");
      };
    };

    let registrationTimestamp = switch (existingProfile) {
      case (?profile) { profile.registrationTimestamp };
      case (null) { Time.now() };
    };

    let profile : UserProfileV2 = {
      username = profileInput.username;
      displayName = profileInput.displayName;
      profilePhotoUrl = profileInput.profilePhotoUrl;
      verified = verified;
      savedPosts = savedPosts;
      role = role;
      registrationTimestamp = registrationTimestamp;
    };

    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func verifyUser(user : Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can verify users");
    };

    let profile = switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?p) { p };
    };

    if (profile.verified) {
      Runtime.trap("User is already verified");
    };

    let updatedProfile = { profile with verified = true };
    userProfiles.add(user, updatedProfile);
  };

  public shared ({ caller }) func unverifyUser(user : Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can unverify users");
    };

    let profile = switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?p) { p };
    };

    if (not profile.verified) {
      Runtime.trap("User is not verified");
    };

    let updatedProfile = { profile with verified = false };
    userProfiles.add(user, updatedProfile);
  };

  public shared ({ caller }) func savePost(postId : PostId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save posts");
    };

    let profile = switch (userProfiles.get(caller)) {
      case (?p) { p };
      case (null) { Runtime.trap("User profile not found") };
    };

    let alreadySaved = profile.savedPosts.any(
      func(id) { id == postId }
    );

    if (alreadySaved) {
      return;
    };

    let updatedProfile = {
      profile with savedPosts = profile.savedPosts.concat([postId]);
    };

    userProfiles.add(caller, updatedProfile);
  };

  public shared ({ caller }) func unsavePost(postId : PostId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unsave posts");
    };

    let profile = switch (userProfiles.get(caller)) {
      case (?p) { p };
      case (null) { Runtime.trap("User profile not found") };
    };

    let filteredPosts = List.empty<PostId>();
    for (id in profile.savedPosts.values()) {
      if (id != postId) {
        filteredPosts.add(id);
      };
    };

    let updatedProfile = {
      profile with savedPosts = filteredPosts.toArray();
    };

    userProfiles.add(caller, updatedProfile);
  };

  public query ({ caller }) func getSavedPosts() : async [NewsPost] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can retrieve saved posts");
    };

    let profile = switch (userProfiles.get(caller)) {
      case (?p) { p };
      case (null) { Runtime.trap("User profile not found") };
    };

    let savedPosts = List.empty<NewsPost>();
    for (postId in profile.savedPosts.values()) {
      switch (posts.get(postId)) {
        case (?post) { savedPosts.add(post) };
        case (null) {};
      };
    };

    savedPosts.toArray();
  };

  // Helper function to get author info
  private func getAuthorInfo(author : Principal) : (Text, Bool) {
    switch (userProfiles.get(author)) {
      case (?profile) { (profile.displayName, profile.verified) };
      case (null) { ("Unknown", false) };
    };
  };

  // News post functions
  public shared ({ caller }) func createPost(
    title : Text,
    content : Text,
    imageUrl : ?Storage.ExternalBlob,
  ) : async NewsPost {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create posts");
    };

    let (authorName, authorVerified) = getAuthorInfo(caller);

    let post : NewsPost = {
      id = nextPostId;
      author = caller;
      authorName = authorName;
      authorVerified = authorVerified;
      title;
      content;
      imageUrl;
      timestamp = Time.now();
      likes = 0;
      commentsCount = 0;
      shares = 0;
    };

    posts.add(nextPostId, post);
    nextPostId += 1;
    post;
  };

  public query ({ caller }) func getAllPosts() : async [NewsPost] {
    let postList = List.empty<NewsPost>();
    for ((_, post) in posts.entries()) {
      // Refresh author info in case verification status changed
      let (authorName, authorVerified) = getAuthorInfo(post.author);
      let updatedPost = {
        post with
        authorName = authorName;
        authorVerified = authorVerified;
      };
      postList.add(updatedPost);
    };

    let postArray = postList.toArray();
    let sorted = postArray.sort(
      func(a, b) {
        Nat.compare(b.id, a.id);
      }
    );
    sorted;
  };

  public query ({ caller }) func getPostById(id : PostId) : async ?NewsPost {
    switch (posts.get(id)) {
      case (?post) {
        // Refresh author info in case verification status changed
        let (authorName, authorVerified) = getAuthorInfo(post.author);
        let updatedPost = {
          post with
          authorName = authorName;
          authorVerified = authorVerified;
        };
        ?updatedPost;
      };
      case (null) { null };
    };
  };

  public shared ({ caller }) func deletePost(postId : PostId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete posts");
    };

    let post = switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?p) { p };
    };

    if (post.author != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only the author or an admin can delete this post");
    };

    posts.remove(postId);
  };

  // Comment functions
  public shared ({ caller }) func addComment(postId : PostId, text : Text) : async Comment {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add comments");
    };

    ignore switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (_) {};
    };

    let (authorName, authorVerified) = getAuthorInfo(caller);

    let comment : Comment = {
      id = nextCommentId;
      postId;
      author = caller;
      authorName = authorName;
      authorVerified = authorVerified;
      text;
      timestamp = Time.now();
    };

    comments.add(nextCommentId, comment);
    nextCommentId += 1;

    comment;
  };

  public query ({ caller }) func getCommentsForPost(postId : PostId) : async [Comment] {
    let commentList = List.empty<Comment>();
    for ((_, comment) in comments.entries()) {
      if (comment.postId == postId) {
        // Refresh author info in case verification status changed
        let (authorName, authorVerified) = getAuthorInfo(comment.author);
        let updatedComment = {
          comment with
          authorName = authorName;
          authorVerified = authorVerified;
        };
        commentList.add(updatedComment);
      };
    };
    let commentArray = commentList.toArray();
    let sorted = commentArray.sort(
      func(a, b) {
        Nat.compare(b.id, a.id);
      }
    );
    sorted;
  };

  public query ({ caller }) func getAllComments() : async [Comment] {
    let commentList = List.empty<Comment>();
    for ((_, comment) in comments.entries()) {
      // Refresh author info in case verification status changed
      let (authorName, authorVerified) = getAuthorInfo(comment.author);
      let updatedComment = {
        comment with
        authorName = authorName;
        authorVerified = authorVerified;
      };
      commentList.add(updatedComment);
    };
    commentList.toArray();
  };

  // Like and share functions
  public shared ({ caller }) func likePost(postId : PostId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like posts");
    };

    let post = switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?p) { p };
    };

    let currentLikes : List.List<Principal> = switch (postLikes.get(postId)) {
      case (null) {
        let newLikes = List.empty<Principal>();
        newLikes;
      };
      case (?likes) { likes };
    };

    let alreadyLiked = currentLikes.any(
      func(user) {
        Principal.equal(user, caller);
      }
    );

    if (alreadyLiked) {
      Runtime.trap("You have already liked this post");
    };

    currentLikes.add(caller);

    let updatedPost = {
      post with likes = post.likes + 1;
    };

    posts.add(postId, updatedPost);
    postLikes.add(postId, currentLikes);
  };

  public shared ({ caller }) func sharePost(postId : PostId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can share posts");
    };

    let post = switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?p) { p };
    };

    let updatedPost = {
      post with shares = post.shares + 1;
    };
    posts.add(postId, updatedPost);
  };

  public shared ({ caller }) func setUserRole(target : Principal, role : UserRole) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can set user roles");
    };

    switch (userProfiles.get(target)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) {
        let updatedProfile = { profile with role };
        userProfiles.add(target, updatedProfile);
      };
    };
  };

  public query ({ caller }) func getUserRole(user : Principal) : async UserRole {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own role");
    };

    switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) { profile.role };
    };
  };

  public query ({ caller }) func getAllUsers() : async [UserProfileSummary] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can access all users");
    };

    let userList = List.empty<UserProfileSummary>();
    for ((principal, profile) in userProfiles.entries()) {
      let summary : UserProfileSummary = {
        principal;
        username = profile.username;
        displayName = profile.displayName;
        profilePhotoUrl = profile.profilePhotoUrl;
        verified = profile.verified;
        role = profile.role;
        registrationTimestamp = profile.registrationTimestamp;
      };
      userList.add(summary);
    };

    userList.toArray();
  };

  public shared ({ caller }) func updateUserRole(target : Principal, newRole : UserRole) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update user roles");
    };

    switch (userProfiles.get(target)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) {
        let updatedProfile = { profile with role = newRole };
        userProfiles.add(target, updatedProfile);
      };
    };
  };
};
