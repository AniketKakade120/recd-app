# Legal / Trust Launch Checklist

## Google OAuth
- [ ] Add `/privacy` URL to Google OAuth consent screen
- [ ] Make sure app only requests required Google scopes (email, profile)
- [ ] Use Google only for sign-in/profile creation
- [ ] Do not request Gmail/Drive/Calendar scopes

## Supabase
- [ ] RLS (Row Level Security) enabled on all tables
- [ ] Service role key not exposed to client
- [ ] Profile data properly protected

## TMDB
- [x] Credits page added (`/credits`)
- [x] TMDB attribution included on credits page and footer

## Age & Consent
- [x] 13+ intended use clearly stated
- [x] Under 18 parent/guardian permission stated
- [x] Lightweight age acknowledgement added to onboarding
- [x] No exact DOB collection in MVP
- [ ] Note: If Rec'd Club actively targets users under 18 in India or other regulated regions, stronger parental/guardian consent handling may be required later.

## Deletion
- [x] Data deletion contact exists (`/contact`)
- [x] Settings page includes instructions for data deletion

## Footer & Legal Pages
- [x] Privacy Policy is live (`/privacy`)
- [x] Terms of Use is live (`/terms`)
- [x] Credits page is live (`/credits`)
- [x] Contact page is live (`/contact`)
- [x] Community Guidelines is live (`/community-guidelines`)
- [x] Footer links added to all public pages
- [x] Login page includes Terms + Privacy consent line
