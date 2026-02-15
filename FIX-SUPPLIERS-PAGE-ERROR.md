# 🔧 **FIX: Suppliers Page Client-Side Error**

**Issue:** "Application error: a client-side exception has occurred" when clicking Suppliers button

**Root Cause:** 
- Suppliers page is a **server component** (uses `async`, `prisma`)
- But it's wrapped in `RoleProvider` (client component) in layout
- This causes hydration mismatch or client-side rendering issues

**Solution:** Make Suppliers page handle both server and client rendering properly

