@echo off
REM 将 admin@fincrm.com 升级为管理员

echo Upgrading admin@fincrm.com to Admin role...

set PGPASSWORD=postgres
psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -c "UPDATE public.profiles SET role = 'Admin', first_name = 'System', last_name = 'Admin', company = 'FinCRM' WHERE email = 'admin@fincrm.com'; SELECT email, first_name, last_name, role FROM public.profiles WHERE email = 'admin@fincrm.com';"

echo.
echo Done! admin@fincrm.com is now an Admin.
pause

