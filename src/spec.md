# Specification

## Summary
**Goal:** Automatically assign administrator role to users who register with the username 'admin'.

**Planned changes:**
- Modify the user registration function in backend/main.mo to check if the username is 'admin' (case-insensitive)
- Automatically assign the 'administrator' role to users with username 'admin', overriding any role selection from the registration form

**User-visible outcome:** Users who register with the username 'admin' (case-insensitive) will automatically receive administrator privileges and have immediate access to the admin dashboard at /admin route after registration.
