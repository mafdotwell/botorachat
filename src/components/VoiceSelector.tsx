
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, Volume2 } from "lucide-react";

interface Voice {
  id: string;
  name: string;
  gender: string;
  description: string;
  accent: string;
}

const elevenLabsVoices: Voice[] = [
  { id: "9BWtsMINqrJLrRacOk9x", name: "Aria", gender: "Female", description: "Expressive and warm", accent: "American" },
  { id: "CwhRBWXzGAHq8TQ4Fs17", name: "Roger", gender: "Male", description: "Confident and clear", accent: "American" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah", gender: "Female", description: "Professional and articulate", accent: "American" },
  { id: "FGY2WhTYpPnrIDTdsKH5", name: "Laura", gender: "Female", description: "Friendly and approachable", accent: "American" },
  { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie", gender: "Male", description: "Casual and conversational", accent: "Australian" },
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "George", gender: "Male", description: "Mature and authoritative", accent: "British" },
  { id: "N2lVS1w4EtoT3dr4eOWO", name: "Callum", gender: "Male", description: "Young and energetic", accent: "American" },
  { id: "SAz9YHcvj6GT2YYXdXww", name: "River", gender: "Non-binary", description: "Calm and soothing", accent: "American" },
  { id: "TX3LPaxmHKxFdv7VOQHJ", name: "Liam", gender: "Male", description: "Deep and resonant", accent: "American" },
  { id: "XB0fDUnXU5powFXDhCwa", name: "Charlotte", gender: "Female", description: "Sophisticated and elegant", accent: "British" },
  { id: "Xb7hH8MSUJpSbSDYk0k2", name: "Alice", gender: "Female", description: "Bright and cheerful", accent: "British" },
  { id: "XrExE9yKIg1WjnnlVkGX", name: "Matilda", gender: "Female", description: "Dramatic and expressive", accent: "American" },
  { id: "bIHbv24MWmeRgasZH58o", name: "Will", gender: "Male", description: "Friendly and reliable", accent: "American" },
  { id: "cgSgspJ2msm6clMCkdW9", name: "Jessica", gender: "Female", description: "Warm and engaging", accent: "American" },
  { id: "cjVigY5qzO86Huf0OWal", name: "Eric", gender: "Male", description: "Professional and clear", accent: "American" },
  { id: "iP95p4xoKVk53GoZ742B", name: "Chris", gender: "Male", description: "Casual and friendly", accent: "American" },
  { id: "nPczCjzI2devNBz1zQrb", name: "Brian", gender: "Male", description: "Authoritative and confident", accent: "American" },
  { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel", gender: "Male", description: "Deep and commanding", accent: "British" },
  { id: "pFZP5JQG7iQjIQuC4Bku", name: "Lily", gender: "Female", description: "Sweet and gentle", accent: "British" },
  { id: "pqHfZKP75CvOlQylNhV4", name: "Bill", gender: "Male", description: "Mature and wise", accent: "American" }
];

interface VoiceSelectorProps {
  selectedVoiceId?: string;
  onVoiceChange: (voiceId: string) => void;
}

const VoiceSelector = ({ selectedVoiceId, onVoiceChange }: VoiceSelectorProps) => {
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);

  const selectedVoice = elevenLabsVoices.find(voice => voice.id === selectedVoiceId);

  const handleVoicePreview = async (voiceId: string, voiceName: string) => {
    if (playingVoice === voiceId) {
      setPlayingVoice(null);
      return;
    }

    setPlayingVoice(voiceId);
    
    // Simulate audio preview - in a real implementation, you would call ElevenLabs API
    // For now, we'll just show the playing state briefly
    setTimeout(() => {
      setPlayingVoice(null);
    }, 2000);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-white">Voice Selection</Label>
        <Select value={selectedVoiceId} onValueChange={onVoiceChange}>
          <SelectTrigger className="bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Choose a voice for your bot" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-white/20">
            {elevenLabsVoices.map((voice) => (
              <SelectItem key={voice.id} value={voice.id} className="text-white hover:bg-white/10">
                <div className="flex items-center justify-between w-full">
                  <div>
                    <span className="font-medium">{voice.name}</span>
                    <span className="text-sm text-slate-400 ml-2">({voice.gender}, {voice.accent})</span>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedVoice && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="text-white font-medium flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  {selectedVoice.name}
                </h4>
                <p className="text-sm text-slate-400">{selectedVoice.description}</p>
                <p className="text-xs text-slate-500">{selectedVoice.gender} • {selectedVoice.accent} accent</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleVoicePreview(selectedVoice.id, selectedVoice.name)}
                className="border-white/20 text-white hover:bg-white/10"
                disabled={!selectedVoice.id}
              >
                {playingVoice === selectedVoice.id ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Playing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Preview
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VoiceSelector;
