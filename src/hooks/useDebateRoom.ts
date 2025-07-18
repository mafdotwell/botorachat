import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export type DebateMode = 'ai_vs_ai' | 'ai_vs_user' | 'user_vs_user';
export type TopicSource = 'trending' | 'custom' | 'user_input';
export type RoundType = 'opening' | 'rebuttal' | 'closing';
export type VoterType = 'ai' | 'user' | 'viewer';
export type Side = 'pro' | 'con';

export interface DebateRoom {
  id: string;
  title: string;
  topic: string;
  topic_source: TopicSource;
  mode: DebateMode;
  room_type: 'public' | 'private';
  status: 'waiting' | 'active' | 'completed';
  creator_id: string;
  structure: {
    rounds: RoundType[];
    timer_per_round: boolean;
    round_duration: number;
  };
  settings: {
    chat_enabled: boolean;
    voice_enabled: boolean;
    voting_enabled: boolean;
    feedback_enabled: boolean;
  };
  created_at: string;
  started_at?: string;
  ended_at?: string;
}

export interface DebateParticipant {
  id: string;
  debate_room_id: string;
  user_id?: string;
  participant_type: 'ai' | 'user';
  side: Side;
  ai_bot_id?: string;
  joined_at: string;
}

export interface DebateMessage {
  id: string;
  debate_room_id: string;
  participant_id: string;
  round_type: RoundType;
  content: string;
  message_type: 'text' | 'audio';
  audio_url?: string;
  timestamp: string;
  duration_seconds?: number;
}

export interface DebateVote {
  id: string;
  debate_room_id: string;
  voter_id?: string;
  voter_type: VoterType;
  side_voted: Side | 'tie';
  reasoning?: string;
  created_at: string;
}

export const useDebateRoom = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<DebateRoom | null>(null);
  const [participants, setParticipants] = useState<DebateParticipant[]>([]);
  const [messages, setMessages] = useState<DebateMessage[]>([]);
  const [votes, setVotes] = useState<DebateVote[]>([]);

  const createDebateRoom = async (roomData: {
    title: string;
    topic: string;
    topic_source: TopicSource;
    mode: DebateMode;
    room_type: 'public' | 'private';
    settings?: Partial<DebateRoom['settings']>;
  }) => {
    try {
      setLoading(true);
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('debate_rooms')
        .insert({
          ...roomData,
          creator_id: user.user.id,
          settings: {
            chat_enabled: true,
            voice_enabled: false,
            voting_enabled: true,
            feedback_enabled: true,
            ...roomData.settings
          }
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentRoom(data as DebateRoom);
      toast({
        title: "Debate Room Created",
        description: "Your debate room has been created successfully.",
      });

      return data;
    } catch (error) {
      console.error('Error creating debate room:', error);
      toast({
        title: "Error",
        description: "Failed to create debate room.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const joinDebateRoom = async (roomId: string, side: Side, botId?: string) => {
    try {
      setLoading(true);
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('debate_participants')
        .insert({
          debate_room_id: roomId,
          user_id: user.user.id,
          participant_type: 'user',
          side,
          ai_bot_id: botId
        })
        .select()
        .single();

      if (error) throw error;

      setParticipants(prev => [...prev, data as DebateParticipant]);
      toast({
        title: "Joined Debate",
        description: `You joined as the ${side} side.`,
      });

      return data;
    } catch (error) {
      console.error('Error joining debate room:', error);
      toast({
        title: "Error",
        description: "Failed to join debate room.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string, roundType: RoundType, participantId: string) => {
    try {
      const { data, error } = await supabase
        .from('debate_messages')
        .insert({
          debate_room_id: currentRoom!.id,
          participant_id: participantId,
          round_type: roundType,
          content,
          message_type: 'text'
        })
        .select()
        .single();

      if (error) throw error;

      setMessages(prev => [...prev, data as DebateMessage]);
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const generateAIResponse = async (side: Side, roundType: RoundType) => {
    try {
      const { data, error } = await supabase.functions.invoke('debate-ai-response', {
        body: {
          debateRoomId: currentRoom!.id,
          side,
          roundType,
          topic: currentRoom!.topic,
          previousMessages: messages.filter(m => m.round_type === roundType)
        }
      });

      if (error) throw error;

      return data.response;
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw error;
    }
  };

  const submitVote = async (sideVoted: Side | 'tie', reasoning?: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('debate_votes')
        .insert({
          debate_room_id: currentRoom!.id,
          voter_id: user.user.id,
          voter_type: 'user',
          side_voted: sideVoted,
          reasoning
        })
        .select()
        .single();

      if (error) throw error;

      setVotes(prev => [...prev, data as DebateVote]);
      toast({
        title: "Vote Submitted",
        description: "Your vote has been recorded.",
      });

      return data;
    } catch (error) {
      console.error('Error submitting vote:', error);
      toast({
        title: "Error",
        description: "Failed to submit vote.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const fetchDebateRoom = async (roomId: string) => {
    try {
      setLoading(true);

      const { data: room, error: roomError } = await supabase
        .from('debate_rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (roomError) throw roomError;

      const { data: participantsData, error: participantsError } = await supabase
        .from('debate_participants')
        .select('*')
        .eq('debate_room_id', roomId);

      if (participantsError) throw participantsError;

      const { data: messagesData, error: messagesError } = await supabase
        .from('debate_messages')
        .select('*')
        .eq('debate_room_id', roomId)
        .order('timestamp', { ascending: true });

      if (messagesError) throw messagesError;

      const { data: votesData, error: votesError } = await supabase
        .from('debate_votes')
        .select('*')
        .eq('debate_room_id', roomId);

      if (votesError) throw votesError;

      setCurrentRoom(room as DebateRoom);
      setParticipants(participantsData as DebateParticipant[] || []);
      setMessages(messagesData as DebateMessage[] || []);
      setVotes(votesData as DebateVote[] || []);

    } catch (error) {
      console.error('Error fetching debate room:', error);
      toast({
        title: "Error",
        description: "Failed to load debate room.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getAvailableTopics = () => {
    return [
      "Artificial Intelligence should replace human teachers",
      "Social media does more harm than good",
      "Climate change is the most pressing issue of our time",
      "Universal Basic Income should be implemented globally",
      "Space exploration is a waste of resources",
      "Remote work is better than office work",
      "Cryptocurrency will replace traditional currency",
      "Nuclear energy is the solution to climate change"
    ];
  };

  return {
    loading,
    currentRoom,
    participants,
    messages,
    votes,
    createDebateRoom,
    joinDebateRoom,
    sendMessage,
    generateAIResponse,
    submitVote,
    fetchDebateRoom,
    getAvailableTopics
  };
};