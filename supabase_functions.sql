-- Function to get daily plan for a travel with activity and expense counters
CREATE OR REPLACE FUNCTION get_travel_daily_plan(_travel_id bigint)
RETURNS TABLE (
  day date,
  name text,
  name_with_notes text,
  activities_counter bigint,
  expenses_counter bigint,
  total_spent numeric
) AS $$
BEGIN
  RETURN QUERY
  WITH travel_dates AS (
    -- Generate all dates between start_date and end_date
    SELECT generate_series(
      (SELECT start_date FROM travels WHERE id = _travel_id),
      (SELECT end_date FROM travels WHERE id = _travel_id),
      '1 day'::interval
    )::date AS day
  ),
  daily_activities AS (
    -- Count activities per day
    SELECT
      date,
      COUNT(*) as activities_count
    FROM travel_activities
    WHERE travel_id = _travel_id
    GROUP BY date
  ),
  daily_expenses AS (
    -- Count expenses and sum amounts per day
    SELECT
      date,
      COUNT(*) as expenses_count,
      SUM(cost) as total_amount
    FROM travel_expenses
    WHERE travel_id = _travel_id
    GROUP BY date
  ),
  daily_activities_cost AS (
    -- Sum activity costs per day
    SELECT
      date,
      SUM(cost) as total_activity_cost
    FROM travel_activities
    WHERE travel_id = _travel_id
    GROUP BY date
  ),
  daily_itineraries AS (
    -- Get all itineraries for each day with notes
    SELECT
      td.day,
      STRING_AGG(ti.name, ', ' ORDER BY ti.start_date) as names,
      STRING_AGG(
        CASE
          WHEN ti.notes IS NOT NULL AND ti.notes != ''
          THEN ti.name || ': ' || ti.notes
          ELSE ti.name
        END,
        ' | ' ORDER BY ti.start_date
      ) as names_with_notes
    FROM travel_dates td
    LEFT JOIN travel_itineraries ti ON td.day >= ti.start_date AND td.day <= ti.end_date AND ti.travel_id = _travel_id
    GROUP BY td.day
  )
  SELECT
    td.day,
    di.names,
    di.names_with_notes,
    COALESCE(da.activities_count, 0) as activities_counter,
    COALESCE(de.expenses_count, 0) as expenses_counter,
    COALESCE(de.total_amount, 0) + COALESCE(dac.total_activity_cost, 0) as total_spent
  FROM travel_dates td
  LEFT JOIN daily_activities da ON td.day = da.date
  LEFT JOIN daily_expenses de ON td.day = de.date
  LEFT JOIN daily_activities_cost dac ON td.day = dac.date
  LEFT JOIN daily_itineraries di ON td.day = di.day
  ORDER BY td.day;
END;
$$ LANGUAGE plpgsql;

-- Function to get detailed daily plan for a user with activities and expenses
CREATE OR REPLACE FUNCTION get_user_daily_plan(uid text, trip_id bigint, day date)
RETURNS TABLE (
  date date,
  title text,
  description text,
  time text,
  location text,
  is_done boolean,
  type text,
  source_id text,
  travel_id bigint,
  user_id text,
  city_id bigint,
  day_id bigint,
  cost numeric
) AS $$
BEGIN
  RETURN QUERY
    -- Get activities for the day
  SELECT
    ta.date,
    ta.title,
    ta.description,
    CASE
      WHEN ta.time IS NOT NULL THEN
        TO_CHAR(ta.time, 'HH24:MI')
      ELSE ''
    END as time,
    COALESCE(ta.location, '') as location,
    ta.is_done,
    'activity' as type,
    ta.id::text as source_id,
    ta.travel_id,
    ta.user_id,
    NULL::bigint as city_id,
    NULL::bigint as day_id,
    ta.cost
  FROM travel_activities ta
  WHERE ta.travel_id = trip_id
    AND ta.date = day
    AND ta.user_id = uid

  UNION ALL

    -- Get expenses for the day
  SELECT
    te.date,
    te.title,
    COALESCE(te.notes, '') as description,
    CASE
      WHEN te.time IS NOT NULL THEN
        TO_CHAR(te.time, 'HH24:MI')
      ELSE ''
    END as time,
    COALESCE(te.location, '') as location,
    false as is_done,
    'expense' as type,
    te.id::text as source_id,
    te.travel_id,
    te.user_id,
    NULL::bigint as city_id,
    NULL::bigint as day_id,
    te.cost
  FROM travel_expenses te
  WHERE te.travel_id = trip_id
    AND te.date = day
    AND te.user_id = uid

  ORDER BY
    CASE
      WHEN time IS NOT NULL AND time != '' THEN 0
      ELSE 1
    END,
    time;
END;
$$ LANGUAGE plpgsql;

-- Nueva función optimizada para obtener datos de múltiples días de una vez
CREATE OR REPLACE FUNCTION get_user_daily_plan_multiple_days(uid text, trip_id bigint, days date[])
RETURNS TABLE (
  date date,
  title text,
  description text,
  time text,
  location text,
  is_done boolean,
  type text,
  source_id text,
  travel_id bigint,
  user_id text,
  city_id bigint,
  day_id bigint,
  cost numeric
) AS $$
BEGIN
  RETURN QUERY
    -- Get activities for multiple days
  SELECT
    ta.date,
    ta.title,
    ta.description,
    CASE
      WHEN ta.time IS NOT NULL THEN
        TO_CHAR(ta.time, 'HH24:MI')
      ELSE ''
    END as time,
    COALESCE(ta.location, '') as location,
    ta.is_done,
    'activity' as type,
    ta.id::text as source_id,
    ta.travel_id,
    ta.user_id,
    NULL::bigint as city_id,
    NULL::bigint as day_id,
    ta.cost
  FROM travel_activities ta
  WHERE ta.travel_id = trip_id
    AND ta.date = ANY(days)
    AND ta.user_id = uid

  UNION ALL

    -- Get expenses for multiple days
  SELECT
    te.date,
    te.title,
    COALESCE(te.notes, '') as description,
    CASE
      WHEN te.time IS NOT NULL THEN
        TO_CHAR(te.time, 'HH24:MI')
      ELSE ''
    END as time,
    COALESCE(te.location, '') as location,
    false as is_done,
    'expense' as type,
    te.id::text as source_id,
    te.travel_id,
    te.user_id,
    NULL::bigint as city_id,
    NULL::bigint as day_id,
    te.cost
  FROM travel_expenses te
  WHERE te.travel_id = trip_id
    AND te.date = ANY(days)
    AND te.user_id = uid

  ORDER BY
    date,
    CASE
      WHEN time IS NOT NULL AND time != '' THEN 0
      ELSE 1
    END,
    time;
END;
$$ LANGUAGE plpgsql;

-- Function to get detailed daily plan with activities and expenses data
CREATE OR REPLACE FUNCTION get_travel_daily_plan_detailed(_travel_id bigint)
RETURNS TABLE (
  day date,
  name text,
  activities_counter bigint,
  expenses_counter bigint,
  total_spent numeric,
  activities_data jsonb,
  expenses_data jsonb,
  itineraries_data jsonb
) AS $$
BEGIN
  RETURN QUERY
  WITH travel_dates AS (
    -- Generate all dates between start_date and end_date
    SELECT generate_series(
      (SELECT start_date FROM travels WHERE id = _travel_id),
      (SELECT end_date FROM travels WHERE id = _travel_id),
      '1 day'::interval
    )::date AS day
  ),
  daily_activities AS (
    -- Get activities with full data
    SELECT
      date,
      COUNT(*) as activities_count,
      jsonb_agg(
        jsonb_build_object(
          'id', id,
          'title', title,
          'description', description,
          'time', time,
          'cost', cost,
          'category', category,
          'priority', priority,
          'is_done', is_done,
          'location', location,
          'travel_id', travel_id,
          'user_id', user_id
        )
      ) as activities_data
    FROM travel_activities
    WHERE travel_id = _travel_id
    GROUP BY date
  ),
  daily_expenses AS (
    -- Get expenses with full data
    SELECT
      date,
      COUNT(*) as expenses_count,
      SUM(cost) as total_amount,
      jsonb_agg(
        jsonb_build_object(
          'id', id,
          'title', title,
          'cost', cost,
          'currency', currency,
          'category', category,
          'date', date,
          'location', location,
          'notes', notes,
          'travel_id', travel_id,
          'user_id', user_id
        )
      ) as expenses_data
    FROM travel_expenses
    WHERE travel_id = _travel_id
    GROUP BY date
  ),
  daily_itineraries AS (
    -- Get itineraries with full data
    SELECT
      td.day,
      STRING_AGG(ti.name, ', ' ORDER BY ti.start_date) as names,
      jsonb_agg(
        jsonb_build_object(
          'id', ti.id,
          'name', ti.name,
          'start_date', ti.start_date,
          'end_date', ti.end_date,
          'notes', ti.notes,
          'place_type', ti.place_type,
          'travel_id', ti.travel_id
        )
      ) as itineraries_data
    FROM travel_dates td
    LEFT JOIN travel_itineraries ti ON td.day >= ti.start_date AND td.day <= ti.end_date AND ti.travel_id = _travel_id
    GROUP BY td.day
  )
  SELECT
    td.day,
    di.names,
    COALESCE(da.activities_count, 0) as activities_counter,
    COALESCE(de.expenses_count, 0) as expenses_counter,
    COALESCE(de.total_amount, 0) as total_spent,
    COALESCE(da.activities_data, '[]'::jsonb) as activities_data,
    COALESCE(de.expenses_data, '[]'::jsonb) as expenses_data,
    COALESCE(di.itineraries_data, '[]'::jsonb) as itineraries_data
  FROM travel_dates td
  LEFT JOIN daily_activities da ON td.day = da.date
  LEFT JOIN daily_expenses de ON td.day = de.date
  LEFT JOIN daily_itineraries di ON td.day = di.day
  ORDER BY td.day;
END;
$$ LANGUAGE plpgsql;

-- Nueva función optimizada para obtener datos de un rango de fechas
CREATE OR REPLACE FUNCTION get_user_daily_plan_date_range(uid text, trip_id bigint, start_date date, end_date date)
RETURNS TABLE (
  date date,
  title text,
  description text,
  time text,
  location text,
  is_done boolean,
  type text,
  source_id text,
  travel_id bigint,
  user_id text,
  city_id bigint,
  day_id bigint,
  cost numeric,
  category text,
  priority text
) AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM (
    -- Get activities for the date range
    SELECT
      ta.date,
      ta.title,
      ta.description,
      CASE
        WHEN ta.time IS NOT NULL THEN
          TO_CHAR(ta.time, 'HH24:MI')
        ELSE ''
      END as time,
      '' as location, -- Activities don't have location column
      ta.is_done,
      'activity' as type,
      ta.id::text as source_id,
      ta.travel_id,
      ta.user_id::text,
      ta.city_id,
      NULL::bigint as day_id,
      ta.cost,
      COALESCE(ta.category, 'other') as category,
      COALESCE(ta.priority, 'medium') as priority
    FROM travel_activities ta
    WHERE ta.travel_id = trip_id
      AND ta.date >= start_date
      AND ta.date <= end_date
      AND ta.user_id::text = uid

    UNION ALL

      -- Get expenses for the date range
    SELECT
      te.date,
      te.title,
      COALESCE(te.notes, '') as description,
      '' as time, -- Expenses don't have time column
      COALESCE(te.location, '') as location,
      false as is_done,
      'expense' as type,
      te.id::text as source_id,
      te.travel_id,
      te.user_id::text,
      NULL::bigint as city_id,
      NULL::bigint as day_id,
      te.cost,
      COALESCE(te.category, 'other') as category,
      NULL::text as priority
    FROM travel_expenses te
    WHERE te.travel_id = trip_id
      AND te.date >= start_date
      AND te.date <= end_date
      AND te.user_id::text = uid
  ) combined_data
  ORDER BY
    date,
    type;
END;
$$ LANGUAGE plpgsql;

-- Nueva función para obtener todos los items del viaje incluyendo accommodation expenses con rangos de fechas
CREATE OR REPLACE FUNCTION get_travel_all_items(trip_id bigint)
RETURNS TABLE (
  id bigint,
  title text,
  description text,
  time text,
  location text,
  completed boolean,
  type text,
  date date,
  cost numeric,
  category text,
  priority text,
  generated_by_ai boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM (
    -- Get activities with dates
    SELECT
      ta.id,
      ta.title,
      ta.description,
      CASE
        WHEN ta.time IS NOT NULL THEN
          TO_CHAR(ta.time, 'HH24:MI')
        ELSE ''
      END as time,
      COALESCE(ta.address, '') as location,
      ta.is_done as completed,
      'activity' as type,
      ta.date,
      ta.cost,
      COALESCE(ta.category, 'other') as category,
      COALESCE(ta.priority, 'medium') as priority,
      COALESCE(ta.generated_by_ai, false) as generated_by_ai
    FROM travel_activities ta
    WHERE ta.travel_id = trip_id

    UNION ALL

    -- Get expenses with dates (including accommodation expenses)
    SELECT
      te.id,
      te.title,
      COALESCE(te.notes, '') as description,
      '' as time,
      COALESCE(te.location, '') as location,
      false as completed,
      'expense' as type,
      te.date,
      te.cost,
      COALESCE(te.category, 'other') as category,
      NULL::text as priority,
      NULL::boolean as generated_by_ai
    FROM travel_expenses te
    WHERE te.travel_id = trip_id
      AND te.date IS NOT NULL

    UNION ALL

    -- Get accommodation expenses distributed across all days in their range
    SELECT
      te.id,
      te.title,
      COALESCE(te.notes, '') as description,
      '' as time,
      COALESCE(te.location, '') as location,
      false as completed,
      'expense' as type,
      generate_series(te.start_date, te.end_date, '1 day'::interval)::date as date,
      te.cost,
      COALESCE(te.category, 'other') as category,
      NULL::text as priority,
      NULL::boolean as generated_by_ai
    FROM travel_expenses te
    WHERE te.travel_id = trip_id
      AND te.date IS NULL
      AND te.start_date IS NOT NULL
      AND te.end_date IS NOT NULL
      AND te.category = 'accommodation'
  ) combined_data
  ORDER BY
    date,
    type;
END;
$$ LANGUAGE plpgsql;

-- Función de debug para ver todos los accommodation expenses
CREATE OR REPLACE FUNCTION debug_all_accommodation_expenses()
RETURNS TABLE (
  id bigint,
  title text,
  category text,
  date date,
  start_date date,
  end_date date,
  travel_id bigint,
  cost numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    te.id,
    te.title,
    te.category,
    te.date,
    te.start_date,
    te.end_date,
    te.travel_id,
    te.cost
  FROM travel_expenses te
  WHERE te.category = 'accommodation'
  ORDER BY te.travel_id, te.id;
END;
$$ LANGUAGE plpgsql;
