# Supabase Migrations

This folder contains SQL files for database migrations. Apply them using the Supabase CLI or SQL editor to keep your database schema in sync.

## Applying Migrations

1. Install the Supabase CLI if you haven't already.
2. Run `supabase db apply` to execute all migration files, or copy the SQL into the online SQL editor.

The `20240101_create_meal_profiles.sql` migration adds the `meal_profiles` table with appropriate row-level security so that each user can only access their own profile.
