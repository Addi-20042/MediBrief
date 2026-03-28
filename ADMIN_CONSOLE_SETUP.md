# Admin Console Setup

The admin console is protected by the `public.admin_users` table. There is no public UI for granting the first admin account on purpose.

## 1. Apply the migration

Run the new migration so the admin tables, RPCs, audit log, and moderation fields exist:

```bash
supabase db push
```

## 2. Grant the first admin

After the target user has signed up once, insert their auth user id into `public.admin_users`.

Example SQL:

```sql
insert into public.admin_users (user_id, role, is_active, notes)
values (
  'REPLACE_WITH_AUTH_USER_ID',
  'admin',
  true,
  'Initial admin bootstrap'
);
```

You can find the auth user id in Supabase Auth or by running:

```sql
select id, email
from auth.users
order by created_at desc;
```

## 3. Verify access

Sign in with that account and open `/admin`.

The admin console supports:

- viewing overview metrics
- searching users
- reviewing a user's predictions and medication reminders
- deactivating or reactivating user accounts
- hiding or unhiding predictions with a reason
- deactivating or reactivating medication reminders with a reason
- reviewing the admin audit log

## 4. Safety model

- admin access is enforced in database RPCs, not only in the UI
- every moderation action writes an audit log entry
- user accounts are deactivated instead of deleted
- predictions are hidden instead of deleted by admins
- medication reminders are deactivated instead of deleted by admins
