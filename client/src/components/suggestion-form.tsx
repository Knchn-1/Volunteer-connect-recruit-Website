import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, SendHorizontal } from "lucide-react";

interface SuggestionFormProps {
  ngoId: number;
  onClose: () => void;
}

export function SuggestionForm({ ngoId, onClose }: SuggestionFormProps) {
  const [suggestion, setSuggestion] = useState("");
  const { toast } = useToast();

  const suggestionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/suggestions", {
        ngoId,
        content: suggestion,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Suggestion submitted",
        description: "Thank you for your feedback!",
      });
      setSuggestion("");
      queryClient.invalidateQueries({ queryKey: ["/api/suggestions"] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestion.trim()) {
      toast({
        title: "Empty suggestion",
        description: "Please enter your suggestion.",
        variant: "destructive",
      });
      return;
    }
    suggestionMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div>
        <label className="text-sm font-medium mb-1 block">
          Your Suggestion
        </label>
        <Textarea
          placeholder="Share your ideas on how this NGO could improve their volunteer program or opportunities..."
          value={suggestion}
          onChange={(e) => setSuggestion(e.target.value)}
          className="min-h-[150px]"
          required
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={suggestionMutation.isPending || !suggestion.trim()}
        >
          {suggestionMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <SendHorizontal className="mr-2 h-4 w-4" />
          )}
          Submit Suggestion
        </Button>
      </div>
    </form>
  );
}
