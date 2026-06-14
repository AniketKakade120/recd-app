-- 1. Fix recommendation_targets
DO $$ 
DECLARE constraint_name text; 
BEGIN 
  SELECT tc.constraint_name INTO constraint_name 
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
  WHERE tc.table_name = 'recommendation_targets' AND kcu.column_name = 'recommendation_id' AND tc.constraint_type = 'FOREIGN KEY' LIMIT 1; 

  IF constraint_name IS NOT NULL THEN 
    EXECUTE 'ALTER TABLE public.recommendation_targets DROP CONSTRAINT ' || constraint_name; 
    EXECUTE 'ALTER TABLE public.recommendation_targets ADD CONSTRAINT ' || constraint_name || ' FOREIGN KEY (recommendation_id) REFERENCES public.recommendations(id) ON DELETE CASCADE'; 
  END IF; 
END $$;

-- 2. Fix ratings
DO $$ 
DECLARE constraint_name text; 
BEGIN 
  SELECT tc.constraint_name INTO constraint_name 
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
  WHERE tc.table_name = 'ratings' AND kcu.column_name = 'recommendation_id' AND tc.constraint_type = 'FOREIGN KEY' LIMIT 1; 

  IF constraint_name IS NOT NULL THEN 
    EXECUTE 'ALTER TABLE public.ratings DROP CONSTRAINT ' || constraint_name; 
    EXECUTE 'ALTER TABLE public.ratings ADD CONSTRAINT ' || constraint_name || ' FOREIGN KEY (recommendation_id) REFERENCES public.recommendations(id) ON DELETE CASCADE'; 
  END IF; 
END $$;

-- 3. Fix activity
DO $$ 
DECLARE constraint_name text; 
BEGIN 
  SELECT tc.constraint_name INTO constraint_name 
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
  WHERE tc.table_name = 'activity' AND kcu.column_name = 'recommendation_id' AND tc.constraint_type = 'FOREIGN KEY' LIMIT 1; 

  IF constraint_name IS NOT NULL THEN 
    EXECUTE 'ALTER TABLE public.activity DROP CONSTRAINT ' || constraint_name; 
    EXECUTE 'ALTER TABLE public.activity ADD CONSTRAINT ' || constraint_name || ' FOREIGN KEY (recommendation_id) REFERENCES public.recommendations(id) ON DELETE CASCADE'; 
  END IF; 
END $$;

-- 4. Fix watchlist_items
DO $$ 
DECLARE constraint_name text; 
BEGIN 
  SELECT tc.constraint_name INTO constraint_name 
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
  WHERE tc.table_name = 'watchlist_items' AND kcu.column_name = 'added_from_recommendation_id' AND tc.constraint_type = 'FOREIGN KEY' LIMIT 1; 

  IF constraint_name IS NOT NULL THEN 
    EXECUTE 'ALTER TABLE public.watchlist_items DROP CONSTRAINT ' || constraint_name; 
    EXECUTE 'ALTER TABLE public.watchlist_items ADD CONSTRAINT ' || constraint_name || ' FOREIGN KEY (added_from_recommendation_id) REFERENCES public.recommendations(id) ON DELETE SET NULL'; 
  END IF; 
END $$;
