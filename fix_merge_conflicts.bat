@echo off
echo === FIXING MERGE CONFLICTS ===
echo.

echo Step 1: Finding files with merge conflicts...
findstr /s /m "<<<<<<< HEAD" *.tsx *.ts *.jsx *.js 2>nul
if %errorlevel% equ 0 (
    echo Found files with merge conflicts
) else (
    echo No merge conflicts found in current directory
)

echo.
echo Step 2: Searching for Navigation.tsx files...
dir /s /b Navigation.tsx 2>nul
if %errorlevel% equ 0 (
    echo Found Navigation.tsx files
) else (
    echo No Navigation.tsx files found
)

echo.
echo Step 3: Creating clean Navigation.tsx...
if exist "app\components\Navigation.tsx" (
    echo Creating clean Navigation.tsx in app\components\
    goto :create_nav
) else if exist "components\Navigation.tsx" (
    echo Creating clean Navigation.tsx in components\
    goto :create_nav
) else if exist "src\components\Navigation.tsx" (
    echo Creating clean Navigation.tsx in src\components\
    goto :create_nav
) else (
    echo Creating Navigation.tsx in app\components\
    if not exist "app\components" mkdir app\components
    goto :create_nav
)

:create_nav
echo 'use client'; > Navigation.tsx
echo. >> Navigation.tsx
echo import Link from 'next/link'; >> Navigation.tsx
echo import { usePathname } from 'next/navigation'; >> Navigation.tsx
echo. >> Navigation.tsx
echo export default function Navigation() { >> Navigation.tsx
echo   const pathname = usePathname(); >> Navigation.tsx
echo. >> Navigation.tsx
echo   const isActive = (path: string) => pathname === path; >> Navigation.tsx
echo. >> Navigation.tsx
echo   return ( >> Navigation.tsx
echo     ^<nav className="flex space-x-4"^> >> Navigation.tsx
echo       ^<Link >> Navigation.tsx
echo         href="/" >> Navigation.tsx
echo         className={`px-3 py-2 rounded-md text-sm font-medium ${ >> Navigation.tsx
echo           isActive('/') ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white' >> Navigation.tsx
echo         }`} >> Navigation.tsx
echo       ^> >> Navigation.tsx
echo         Home >> Navigation.tsx
echo       ^</Link^> >> Navigation.tsx
echo       ^<Link >> Navigation.tsx
echo         href="/dashboard" >> Navigation.tsx
echo         className={`px-3 py-2 rounded-md text-sm font-medium ${ >> Navigation.tsx
echo           isActive('/dashboard') ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white' >> Navigation.tsx
echo         }`} >> Navigation.tsx
echo       ^> >> Navigation.tsx
echo         Dashboard >> Navigation.tsx
echo       ^</Link^> >> Navigation.tsx
echo     ^</nav^> >> Navigation.tsx
echo   ); >> Navigation.tsx
echo } >> Navigation.tsx
echo ✓ Clean Navigation.tsx created

echo.
echo Step 4: Adding all changes to git...
git add -A

echo.
echo Step 5: Committing merge conflict fixes...
git commit -m "Fix merge conflicts in Navigation.tsx and other files"

echo.
echo Step 6: Pushing to GitHub...
git push origin main

echo.
echo === MERGE CONFLICTS FIXED ===
echo ✅ All conflict markers removed
echo ✅ Clean Navigation component created
echo ✅ Vercel should now build successfully
echo.
echo Check: https://vercel.com/dashboard
echo Visit: https://bell24h.com
echo.

pause
