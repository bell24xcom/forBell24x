# EMERGENCY FIX SCRIPT - Onboarding TypeScript Error

## THE PROBLEM
Vercel build fails with:
```
Type error: Argument of type '{ id: string; name: string; ... }' is not assignable to parameter of type 'SetStateAction<null>'
```

## THE ROOT CAUSE
The `selectedProgram` state is typed as `null` but we're trying to set it to a program object.

## THE FIX APPLIED
Changed line 187 from:
```typescript
const [selectedProgram, setSelectedProgram] = useState(null);
```
To:
```typescript
const [selectedProgram, setSelectedProgram] = useState<any>(null);
```

## MANUAL COMMIT STEPS
If terminal commands don't work, manually:

1. **Open VS Code**
2. **Open**: `C:\Users\Sanika\Projects\bell24h\client\src\app\admin\onboarding\page.tsx`
3. **Go to line 187**
4. **Verify the fix is there**: `useState<any>(null)`
5. **Save the file** (Ctrl+S)
6. **Open terminal in VS Code**
7. **Run**:
   ```bash
   cd C:\Users\Sanika\Projects\bell24h\client
   git add src/app/admin/onboarding/page.tsx
   git commit -m "Fix: TypeScript error in onboarding page"
   git push origin main
   ```

## ALTERNATIVE: FORCE EMPTY COMMIT
If the file is already fixed but not committed:
```bash
cd C:\Users\Sanika\Projects\bell24h\client
git commit --allow-empty -m "Force rebuild with onboarding fix"
git push origin main
```

## VERIFICATION
After pushing:
1. Go to: https://vercel.com/dashboard/bell24h-v1
2. Wait for new deployment
3. Check build logs for success

## EXPECTED RESULT
Build should complete successfully and website should deploy.
