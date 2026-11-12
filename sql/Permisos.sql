SELECT
    table_name,
    grantee,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
AND table_name LIKE 'vw_%'
AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee, privilege_type;