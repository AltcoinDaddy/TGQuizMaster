-- Function to get random questions by category
CREATE OR REPLACE FUNCTION get_random_questions(p_category TEXT, p_count INT)
RETURNS SETOF questions AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM questions
  WHERE (p_category = 'all' OR p_category = 'general' OR category = p_category)
  ORDER BY RANDOM()
  LIMIT p_count;
END;
$$ LANGUAGE plpgsql;
