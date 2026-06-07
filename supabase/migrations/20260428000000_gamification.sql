-- Add columns to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS reputation INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS badges JSONB DEFAULT '[]'::jsonb;

-- Create function to award reputation
CREATE OR REPLACE FUNCTION public.award_debate_reputation()
RETURNS TRIGGER AS $$
DECLARE
    participant RECORD;
    avg_score FLOAT;
    total_args INT;
    rep_earned INT;
    new_badge TEXT;
BEGIN
    -- Only trigger if status changed to 'finished'
    IF NEW.status = 'finished' AND OLD.status != 'finished' THEN
        -- Loop through all unique participants in this debate
        FOR participant IN 
            SELECT user_id, COUNT(*) as arg_count, AVG(fact_check_score) as avg_score 
            FROM public.debate_arguments 
            WHERE debate_id = NEW.id 
            GROUP BY user_id
        LOOP
            rep_earned := 0;
            new_badge := NULL;
            avg_score := COALESCE(participant.avg_score, 0);
            total_args := participant.arg_count;

            -- Base reputation for participating
            rep_earned := rep_earned + (total_args * 2);

            -- Bonus for high fact-check score
            IF avg_score >= 0.8 AND total_args >= 2 THEN
                rep_earned := rep_earned + 20;
                new_badge := 'Source Master';
            ELSIF avg_score >= 0.5 THEN
                rep_earned := rep_earned + (avg_score * 10)::INT;
            END IF;

            -- If they don't get Source Master but participated well
            IF total_args >= 3 AND new_badge IS NULL THEN
                new_badge := 'Debater';
            END IF;

            -- Update profile
            UPDATE public.profiles
            SET 
                reputation = reputation + rep_earned,
                badges = CASE 
                            WHEN new_badge IS NOT NULL AND NOT (badges @> to_jsonb(new_badge)) 
                            THEN badges || to_jsonb(new_badge)
                            ELSE badges
                         END
            WHERE id = participant.user_id;

        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS award_debate_reputation_trigger ON public.debates;
CREATE TRIGGER award_debate_reputation_trigger
AFTER UPDATE ON public.debates
FOR EACH ROW
EXECUTE FUNCTION public.award_debate_reputation();
