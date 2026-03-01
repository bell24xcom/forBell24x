# Bell24h Architecture Freeze

## Status: LOCKED as of March 2026

## Homepage Structure (DO NOT CHANGE)
- Header
- Hero (demo section — minimal, clean)
- 3-Column Grid: Categories | Live RFQs | Most Demanded
- Footer

## Dashboard Structure (DO NOT CHANGE)
- Single unified dashboard
- Top toggle: Buyer | Supplier
- Left navigation panel changes based on role
- No separate buyer/supplier URLs

## Core User Model — FROZEN
- Every user = Buyer + Supplier (dual role by default)
- Registration creates one account with access to both modes
- All users land on Buyer dashboard by default
- Dashboard toggle = view mode switch only, NOT permission control
- No feature is locked behind buyer-only or supplier-only role
- APIs must NOT block actions based on role field
- Role field in DB = default view preference only
- Voice RFQ, Text RFQ, Video RFQ — any authenticated user can post
- Browse RFQs, Submit Quotes — any authenticated user can do this
- "Every buyer can be a supplier. Every supplier can be a buyer."

## Rules
- No structural layout changes without explicit founder approval
- No new sections added to homepage without approval
- No dashboard architecture changes without approval
- Bug fixes and data fixes are always allowed
- Icon, text, color fixes are always allowed
- Adding new API routes is always allowed
