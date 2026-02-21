# Specification

## Summary
**Goal:** Implement role-based user system with six user roles, separate Home and Updates feeds with verification filtering, and file upload functionality for profile photos.

**Planned changes:**
- Add role field to user profiles with six possible values: common_user, author, group_head, content_creator, subscriber, administrator
- Add role selection dropdown to signup form for user-selectable roles (excluding administrator)
- Create hardcoded administrator account with unique credentials
- Split feeds: Home page displays all posts, Updates page shows only verified user posts
- Restrict post creation on Updates page to verified users only
- Replace profile photo URL input with drag-and-drop file upload dropbox
- Implement image file upload handling with client-side processing and backend storage
- Update backend to return user role in profile data
- Add migration logic for role field defaulting existing users to common_user

**User-visible outcome:** Users can select their role during signup, see all posts on the Home page, see only verified posts on the Updates page (where only verified users can post), and upload profile photos by dragging and dropping image files from their device.
