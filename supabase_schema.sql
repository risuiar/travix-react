-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.activity_preferences (
  travel_id bigint,
  preference_date date NOT NULL,
  travel_style text,
  budget_level text,
  start_time time without time zone,
  interests ARRAY,
  premium_experiences ARRAY,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT activity_preferences_pkey PRIMARY KEY (id),
  CONSTRAINT activity_preferences_trip_id_fkey FOREIGN KEY (travel_id) REFERENCES public.travels(id)
);
CREATE TABLE public.collaborators (
  travel_id integer,
  user_id uuid,
  role text DEFAULT 'viewer'::text,
  id bigint NOT NULL DEFAULT nextval('collaborators_id_seq'::regclass),
  CONSTRAINT collaborators_pkey PRIMARY KEY (id),
  CONSTRAINT collaborators_trip_id_fkey FOREIGN KEY (travel_id) REFERENCES public.travels(id),
  CONSTRAINT collaborators_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.itinerary_templates (
  user_id uuid,
  travel_id integer,
  style text,
  budget_level text,
  start_time time without time zone,
  interests ARRAY,
  premium_experiences ARRAY,
  created_at timestamp with time zone DEFAULT now(),
  id bigint NOT NULL DEFAULT nextval('itinerary_templates_id_seq'::regclass),
  CONSTRAINT itinerary_templates_pkey PRIMARY KEY (id),
  CONSTRAINT itinerary_templates_travel_id_fkey FOREIGN KEY (travel_id) REFERENCES public.travels(id),
  CONSTRAINT itinerary_templates_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT itinerary_templates_trip_id_fkey FOREIGN KEY (travel_id) REFERENCES public.travels(id)
);
CREATE TABLE public.profiles (
  premium_status text CHECK (premium_status IS NULL OR (premium_status = ANY (ARRAY['premium'::text, 'ultimate'::text]))),
  premium_until timestamp with time zone,
  accepted_terms boolean,
  email_verified boolean DEFAULT false,
  id uuid NOT NULL,
  full_name text,
  avatar_url text,
  language text CHECK (length(language) = 2),
  default_currency text,
  budget_alerts boolean,
  last_login timestamp with time zone,
  theme text,
  created_at timestamp without time zone DEFAULT now(),
  trip_reminders boolean DEFAULT false,
  activity_reminders boolean DEFAULT false,
  login_count smallint DEFAULT '0'::smallint,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.settlements (
  trip_id bigint,
  from_user uuid,
  to_user uuid,
  amount numeric NOT NULL,
  note text,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  paid_at timestamp without time zone DEFAULT now(),
  is_synced boolean DEFAULT true,
  CONSTRAINT settlements_pkey PRIMARY KEY (id),
  CONSTRAINT settlements_to_user_fkey FOREIGN KEY (to_user) REFERENCES auth.users(id),
  CONSTRAINT settlements_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.travels(id),
  CONSTRAINT settlements_from_user_fkey FOREIGN KEY (from_user) REFERENCES auth.users(id)
);
CREATE TABLE public.travel_activities (
  currency text,
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL UNIQUE,
  location text,
  lat double precision,
  lng double precision,
  place_id text,
  rating numeric,
  reviews_count integer,
  google_category text,
  address text,
  url text,
  travel_id bigint,
  user_id uuid,
  preference_id uuid,
  title text NOT NULL,
  description text,
  time time without time zone,
  category text,
  priority text,
  cost numeric,
  generated_by_ai boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_done boolean DEFAULT false,
  is_synced boolean DEFAULT true,
  date date,
  itinerary_id bigint,
  CONSTRAINT travel_activities_pkey PRIMARY KEY (id),
  CONSTRAINT travel_activities_itinerary_id_fkey FOREIGN KEY (itinerary_id) REFERENCES public.travel_itineraries(id),
  CONSTRAINT activities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT activities_preference_id_fkey FOREIGN KEY (preference_id) REFERENCES public.activity_preferences(id),
  CONSTRAINT activities_trip_id_fkey FOREIGN KEY (travel_id) REFERENCES public.travels(id)
);
CREATE TABLE public.travel_expenses (
  place_id text,
  address text,
  itinerary_id bigint,
  lat double precision,
  lng double precision,
  cost numeric NOT NULL CHECK (cost >= 0::numeric),
  user_id uuid,
  travel_id integer,
  date date,
  title text NOT NULL,
  location text,
  category text,
  notes text,
  paid_by uuid,
  currency text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_synced boolean DEFAULT true,
  start_date date,
  end_date date,
  lodging_type text,
  id bigint NOT NULL DEFAULT nextval('expenses_id_seq'::regclass),
  CONSTRAINT travel_expenses_pkey PRIMARY KEY (id),
  CONSTRAINT expenses_paid_by_fkey FOREIGN KEY (paid_by) REFERENCES auth.users(id),
  CONSTRAINT expenses_trip_id_fkey FOREIGN KEY (travel_id) REFERENCES public.travels(id),
  CONSTRAINT travel_expenses_itinerary_id_fkey FOREIGN KEY (itinerary_id) REFERENCES public.travel_itineraries(id),
  CONSTRAINT expenses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.travel_itineraries (
  lat double precision,
  lng double precision,
  place_id text,
  bbox ARRAY,
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  travel_id bigint,
  name text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  notes text,
  created_at timestamp without time zone DEFAULT now(),
  place_type text,
  CONSTRAINT travel_itineraries_pkey PRIMARY KEY (id),
  CONSTRAINT travel_itineraries_travel_id_fkey FOREIGN KEY (travel_id) REFERENCES public.travels(id)
);
CREATE TABLE public.travel_participants (
  travel_id bigint,
  user_id uuid,
  share_percent numeric CHECK (share_percent >= 0::numeric AND share_percent <= 100::numeric),
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  role text DEFAULT 'member'::text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT travel_participants_pkey PRIMARY KEY (id),
  CONSTRAINT trip_participants_trip_id_fkey FOREIGN KEY (travel_id) REFERENCES public.travels(id),
  CONSTRAINT trip_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT travel_participants_travel_id_fkey FOREIGN KEY (travel_id) REFERENCES public.travels(id)
);
CREATE TABLE public.travel_pois (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  title text,
  description text,
  lat double precision,
  lng double precision,
  position integer,
  source text DEFAULT 'user'::text,
  itinerary_id bigint,
  CONSTRAINT travel_pois_pkey PRIMARY KEY (id),
  CONSTRAINT travel_pois_itinerary_id_fkey FOREIGN KEY (itinerary_id) REFERENCES public.travel_itineraries(id)
);
CREATE TABLE public.travels (
  name text,
  budget numeric,
  start_date date,
  end_date date,
  updated_at timestamp with time zone,
  user_id uuid DEFAULT uid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  is_closed boolean DEFAULT false,
  is_synced boolean DEFAULT true,
  bbox ARRAY,
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  country_codes jsonb,
  CONSTRAINT travels_pkey PRIMARY KEY (id),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_daily_calls (
  user_id uuid NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  calls_count integer NOT NULL DEFAULT 0,
  calls_date date NOT NULL DEFAULT CURRENT_DATE,
  CONSTRAINT user_daily_calls_pkey PRIMARY KEY (id),
  CONSTRAINT user_daily_calls_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_verifications (
  user_id uuid NOT NULL,
  email text NOT NULL,
  verification_token text,
  token_expires_at timestamp with time zone,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email_verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_verifications_pkey PRIMARY KEY (id)
);
CREATE TABLE public.waiting_list (
  email text NOT NULL UNIQUE,
  name text,
  interests text,
  language text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  has_access boolean NOT NULL DEFAULT false,
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  CONSTRAINT waiting_list_pkey PRIMARY KEY (id)
);
