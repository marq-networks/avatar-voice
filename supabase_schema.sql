-- Create the table for storing intake submissions
create table public.intake_submissions (
  id uuid primary key,
  version integer,
  submission_date timestamp with time zone,
  product_name text,
  marq_notes text,
  avatar_type text,
  avatar_gender text,
  avatar_age text,
  appearance_style text,
  visual_constraints text,
  voice_gender text,
  accent text,
  custom_accent text,
  speaking_pace text,
  voice_tone text,
  energy_level text,
  speech_quirks text,
  pronunciation_notes text,
  response_style text,
  response_length text,
  allow_interruption text,
  sensitive_topics text,
  avatar_framing text,
  background_style text,
  session_mode text,
  latency_priority text,
  concurrent_users text,
  facial_expression text,
  head_movement text,
  eye_contact text,
  lip_sync text,
  noise_handling text,
  microphone_type text,
  loudness text,
  filler_words text,
  video_failure text,
  video_retries integer,
  voice_failure text,
  voice_retries integer,
  network_drop text,
  store_audio boolean,
  audio_days integer,
  store_video boolean,
  video_days integer,
  store_transcripts boolean,
  transcript_days integer,
  allow_export boolean,
  like_links text[],
  dislike_links text[],
  ezri_feeling text,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security (RLS)
alter table public.intake_submissions enable row level security;

-- Create a policy to allow anyone to insert data (since it's a public form)
-- You might want to restrict this if you have authentication
create policy "Allow anonymous inserts"
  on public.intake_submissions
  for insert
  to anon
  with check (true);

-- Create a policy to allow reading own data? Or maybe just admins.
-- For now, we'll leave reading restricted to service role or authenticated users if needed.
