-- Create debate rooms table
CREATE TABLE public.debate_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  topic TEXT NOT NULL,
  topic_source TEXT NOT NULL CHECK (topic_source IN ('trending', 'custom', 'user_input')),
  mode TEXT NOT NULL CHECK (mode IN ('ai_vs_ai', 'ai_vs_user', 'user_vs_user')),
  room_type TEXT NOT NULL CHECK (room_type IN ('public', 'private')) DEFAULT 'public',
  structure JSONB NOT NULL DEFAULT '{"rounds": ["opening", "rebuttal", "closing"], "timer_per_round": true, "round_duration": 120}',
  status TEXT NOT NULL CHECK (status IN ('waiting', 'active', 'completed')) DEFAULT 'waiting',
  creator_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  settings JSONB DEFAULT '{"chat_enabled": true, "voice_enabled": false, "voting_enabled": true, "feedback_enabled": true}'
);

-- Create debate participants table
CREATE TABLE public.debate_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  debate_room_id UUID NOT NULL REFERENCES public.debate_rooms(id) ON DELETE CASCADE,
  user_id UUID,
  participant_type TEXT NOT NULL CHECK (participant_type IN ('ai', 'user')),
  side TEXT NOT NULL CHECK (side IN ('pro', 'con')),
  ai_bot_id UUID REFERENCES public.bots(id),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(debate_room_id, side)
);

-- Create debate messages table
CREATE TABLE public.debate_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  debate_room_id UUID NOT NULL REFERENCES public.debate_rooms(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.debate_participants(id) ON DELETE CASCADE,
  round_type TEXT NOT NULL CHECK (round_type IN ('opening', 'rebuttal', 'closing')),
  content TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('text', 'audio')) DEFAULT 'text',
  audio_url TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  duration_seconds INTEGER
);

-- Create debate votes table
CREATE TABLE public.debate_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  debate_room_id UUID NOT NULL REFERENCES public.debate_rooms(id) ON DELETE CASCADE,
  voter_id UUID,
  voter_type TEXT NOT NULL CHECK (voter_type IN ('ai', 'user', 'viewer')),
  side_voted TEXT NOT NULL CHECK (side_voted IN ('pro', 'con', 'tie')),
  reasoning TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(debate_room_id, voter_id, voter_type)
);

-- Create debate feedback table
CREATE TABLE public.debate_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  debate_room_id UUID NOT NULL REFERENCES public.debate_rooms(id) ON DELETE CASCADE,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('ai_summary', 'scoring', 'tone_analysis')),
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.debate_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debate_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debate_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debate_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debate_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for debate_rooms
CREATE POLICY "Public debates are viewable by everyone" 
ON public.debate_rooms 
FOR SELECT 
USING (room_type = 'public' OR creator_id = auth.uid());

CREATE POLICY "Users can create debate rooms" 
ON public.debate_rooms 
FOR INSERT 
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their debate rooms" 
ON public.debate_rooms 
FOR UPDATE 
USING (auth.uid() = creator_id);

-- RLS Policies for debate_participants
CREATE POLICY "Participants viewable in accessible debates" 
ON public.debate_participants 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.debate_rooms dr 
    WHERE dr.id = debate_room_id 
    AND (dr.room_type = 'public' OR dr.creator_id = auth.uid() OR user_id = auth.uid())
  )
);

CREATE POLICY "Users can join as participants" 
ON public.debate_participants 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.debate_rooms dr 
    WHERE dr.id = debate_room_id 
    AND (dr.room_type = 'public' OR dr.creator_id = auth.uid())
  )
);

-- RLS Policies for debate_messages
CREATE POLICY "Messages viewable in accessible debates" 
ON public.debate_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.debate_rooms dr 
    WHERE dr.id = debate_room_id 
    AND (dr.room_type = 'public' OR dr.creator_id = auth.uid())
  ) OR
  EXISTS (
    SELECT 1 FROM public.debate_participants dp 
    WHERE dp.id = participant_id AND dp.user_id = auth.uid()
  )
);

CREATE POLICY "Participants can create messages" 
ON public.debate_messages 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.debate_participants dp 
    WHERE dp.id = participant_id AND dp.user_id = auth.uid()
  )
);

-- RLS Policies for debate_votes
CREATE POLICY "Votes viewable in accessible debates" 
ON public.debate_votes 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.debate_rooms dr 
    WHERE dr.id = debate_room_id 
    AND (dr.room_type = 'public' OR dr.creator_id = auth.uid())
  )
);

CREATE POLICY "Users can vote in accessible debates" 
ON public.debate_votes 
FOR INSERT 
WITH CHECK (
  auth.uid() = voter_id AND
  EXISTS (
    SELECT 1 FROM public.debate_rooms dr 
    WHERE dr.id = debate_room_id 
    AND (dr.room_type = 'public' OR dr.creator_id = auth.uid())
  )
);

-- RLS Policies for debate_feedback
CREATE POLICY "Feedback viewable in accessible debates" 
ON public.debate_feedback 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.debate_rooms dr 
    WHERE dr.id = debate_room_id 
    AND (dr.room_type = 'public' OR dr.creator_id = auth.uid())
  )
);

-- Create indexes for better performance
CREATE INDEX idx_debate_rooms_status ON public.debate_rooms(status);
CREATE INDEX idx_debate_rooms_mode ON public.debate_rooms(mode);
CREATE INDEX idx_debate_rooms_room_type ON public.debate_rooms(room_type);
CREATE INDEX idx_debate_participants_debate_room_id ON public.debate_participants(debate_room_id);
CREATE INDEX idx_debate_messages_debate_room_id ON public.debate_messages(debate_room_id);
CREATE INDEX idx_debate_votes_debate_room_id ON public.debate_votes(debate_room_id);
CREATE INDEX idx_debate_feedback_debate_room_id ON public.debate_feedback(debate_room_id);