# Firebase Permission Fix Guide

## The Problem
You're getting `PERMISSION_DENIED: Permission denied` because your Firebase Realtime Database security rules are blocking write operations.

## Solution: Update Firebase Security Rules

### Step 1: Go to Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Realtime Database** in the left sidebar
4. Click on the **Rules** tab

### Step 2: Update Security Rules

Replace your current rules with these **development-friendly** rules:

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": true,
        "users": {
          "$userId": {
            ".read": true,
            ".write": true
          }
        },
        "swipes": {
          "$swipeId": {
            ".read": true,
            ".write": true
          }
        },
        "matches": {
          "$matchId": {
            ".read": true,
            ".write": true
          }
        }
      }
    }
  }
}
```

### Step 3: For Production (More Secure Rules)

When you're ready for production, use these more secure rules:

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": "auth != null",
        "users": {
          "$userId": {
            ".read": true,
            ".write": "auth != null && auth.uid == $userId"
          }
        },
        "swipes": {
          "$swipeId": {
            ".read": true,
            ".write": "auth != null"
          }
        },
        "matches": {
          "$matchId": {
            ".read": true,
            ".write": "auth != null"
          }
        }
      }
    }
  }
}
```

### Step 4: Publish Rules
1. Click **Publish** button in the Firebase console
2. The changes will take effect immediately

## Quick Test Rules (Very Permissive - Use Only for Testing)

If you want to quickly test everything works, you can temporarily use these rules:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

⚠️ **Warning**: These rules allow anyone to read/write your database. Only use for testing!

## Verify the Fix

After updating the rules:
1. Go to `http://localhost:8082/firebase-test`
2. Try creating a room
3. The "Permission denied" error should be gone

## Current Database Structure

Your app creates this structure in Firebase:
```
rooms/
  ├── ROOM_CODE_1/
  │   ├── name: "Room Name"
  │   ├── createdAt: timestamp
  │   ├── users/
  │   │   └── USER_ID/
  │   │       ├── id: "user123"
  │   │       ├── name: "User Name"
  │   │       └── joinedAt: timestamp
  │   ├── swipes/
  │   │   └── SWIPE_ID/
  │   │       ├── userId: "user123"
  │   │       ├── movieId: 123
  │   │       ├── liked: true/false
  │   │       └── timestamp: timestamp
  │   └── matches/
  │       └── MATCH_ID/
  │           ├── movieId: 123
  │           ├── likedByUsers: ["user1", "user2"]
  │           └── matchedAt: timestamp
```

The security rules above allow read/write access to this structure.
