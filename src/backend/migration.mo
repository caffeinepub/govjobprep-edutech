import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  type OldUserProfile = {
    username : Text;
    displayName : Text;
    profilePhotoUrl : ?Text;
    verified : Bool;
    savedPosts : [Nat];
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
  };

  type NewUserProfile = {
    username : Text;
    displayName : Text;
    profilePhotoUrl : ?Text;
    verified : Bool;
    savedPosts : [Nat];
    role : {
      #commonUser;
      #author;
      #groupHead;
      #contentCreator;
      #subscriber;
      #administrator;
    };
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, NewUserProfile>;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      userProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
        func(_id, profile) {
          { profile with role = #commonUser };
        }
      );
    };
  };
};
