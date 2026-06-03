-- Run this in your Supabase SQL Editor to force old users through the new Taste Profile onboarding
UPDATE profiles 
SET onboarding_completed = false 
WHERE generated_taste_headline IS NULL;
