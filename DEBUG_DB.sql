-- Debug script to see exactly what is in the database for groups and group members

-- 1. Show the most recent groups created
SELECT id, name, created_at, created_by 
FROM public.groups 
ORDER BY created_at DESC 
LIMIT 3;

-- 2. Show the most recent members added to any group, along with their username
SELECT gm.group_id, g.name as group_name, p.username as member_username, gm.role 
FROM public.group_members gm
JOIN public.groups g ON g.id = gm.group_id
JOIN public.profiles p ON p.id = gm.user_id
ORDER BY gm.joined_at DESC 
LIMIT 10;
