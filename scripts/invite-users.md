# Inviting Waitlist Users

## How to Invite Users from Waitlist

### Option 1: Using Supabase Dashboard (Easiest)

1. Go to your Supabase project dashboard
2. Navigate to **Table Editor** → **waitlist**
3. Find the user you want to invite
4. Click on their row and edit:
   - Set `invited` to `true`
   - Set `invited_at` to current timestamp (or leave it, it will auto-update)
5. Save

### Option 2: Using SQL Query (Batch Invites)

Run this in the Supabase SQL Editor:

```sql
-- Invite a single user by email
UPDATE waitlist 
SET invited = true, invited_at = NOW() 
WHERE email = 'user@example.com';

-- Invite first 10 users on waitlist
UPDATE waitlist 
SET invited = true, invited_at = NOW() 
WHERE id IN (
  SELECT id FROM waitlist 
  WHERE invited = false 
  ORDER BY created_at ASC 
  LIMIT 10
);

-- Invite all users (full launch)
UPDATE waitlist 
SET invited = true, invited_at = NOW() 
WHERE invited = false;
```

### Option 3: View Waitlist Users

```sql
-- See all waitlist users (newest first)
SELECT name, email, created_at, invited, notified 
FROM waitlist 
ORDER BY created_at DESC;

-- See only uninvited users
SELECT name, email, created_at 
FROM waitlist 
WHERE invited = false 
ORDER BY created_at ASC;

-- See invited users
SELECT name, email, invited_at 
FROM waitlist 
WHERE invited = true 
ORDER BY invited_at DESC;
```

## How It Works

1. **User joins waitlist** → `invited = false`
2. **You mark them as invited** → `invited = true`
3. **They try to sign up** → System checks if their email is invited
4. **If invited** → They can sign up normally
5. **If not invited** → Redirected to `/invite-only` page

## Testing

To test the invite system:

1. Add a test email to waitlist via `/waitlist` page
2. Try to sign up with that email → Should see "invite-only" message
3. Mark email as invited in Supabase
4. Try to sign up again → Should work!
