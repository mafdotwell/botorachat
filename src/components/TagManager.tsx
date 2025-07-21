
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Hash } from "lucide-react";

interface TagManagerProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

const predefinedTags = [
  // Industry/Domain
  "Education", "Entertainment", "Productivity", "Business", "Healthcare", "Finance", "Technology", "Marketing", "Sales", "Customer Service",
  // Skills/Capabilities
  "Writing", "Coding", "Design", "Analytics", "Research", "Translation", "Tutoring", "Coaching", "Consulting", "Support",
  // Personality Traits
  "Friendly", "Professional", "Creative", "Analytical", "Empathetic", "Enthusiastic", "Patient", "Humorous", "Motivational", "Calm",
  // Use Cases
  "Learning", "Gaming", "Cooking", "Travel", "Fitness", "Mental Health", "Productivity", "Innovation", "Strategy", "Operations",
  // Content Types
  "Text Generation", "Image Analysis", "Data Processing", "Code Review", "Content Creation", "Storytelling", "Q&A", "Brainstorming"
];

const TagManager = ({ selectedTags, onTagsChange }: TagManagerProps) => {
  const [customTag, setCustomTag] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const addTag = (tag: string) => {
    if (tag && !selectedTags.includes(tag)) {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const addCustomTag = () => {
    if (customTag.trim()) {
      addTag(customTag.trim());
      setCustomTag("");
    }
  };

  const filteredPredefinedTags = predefinedTags.filter(tag => 
    tag.toLowerCase().includes(searchTerm.toLowerCase()) && 
    !selectedTags.includes(tag)
  );

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-white text-lg font-semibold mb-4 block flex items-center gap-2">
          <Hash className="w-5 h-5" />
          Tags
        </Label>
        <p className="text-slate-400 text-sm mb-4">
          Add relevant tags to help users discover your bot. You can select from popular tags or create custom ones.
        </p>
      </div>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="space-y-2">
          <Label className="text-white text-sm">Selected Tags ({selectedTags.length})</Label>
          <div className="flex flex-wrap gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
            {selectedTags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-purple-600/20 text-purple-300 border-purple-500/30 hover:bg-purple-600/30 transition-colors"
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-2 hover:bg-red-500/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Search and Add Custom Tag */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-white text-sm">Search Tags</Label>
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search existing tags..."
            className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-white text-sm">Create Custom Tag</Label>
          <div className="flex gap-2">
            <Input
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              placeholder="Enter custom tag..."
              className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
              onKeyPress={(e) => e.key === 'Enter' && addCustomTag()}
            />
            <Button
              type="button"
              onClick={addCustomTag}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Predefined Tags */}
      <div className="space-y-4">
        <Label className="text-white text-sm">Popular Tags</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto p-3 bg-white/5 rounded-lg border border-white/10">
          {filteredPredefinedTags.map((tag) => (
            <Button
              key={tag}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addTag(tag)}
              className="justify-start text-left border-white/20 text-white hover:bg-white/10 hover:border-purple-500/50"
            >
              {tag}
            </Button>
          ))}
        </div>
      </div>

      {selectedTags.length === 0 && (
        <div className="text-center py-8 border border-dashed border-white/20 rounded-lg">
          <Hash className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-400">No tags selected yet</p>
          <p className="text-sm text-slate-500 mt-1">Add tags to help users discover your bot</p>
        </div>
      )}
    </div>
  );
};

export default TagManager;
