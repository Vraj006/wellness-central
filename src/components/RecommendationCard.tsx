import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { motion } from "framer-motion";
import { Check, ChevronDown, Clock, Info } from "lucide-react";
import { useMutation } from "convex/react";
import { toast } from "sonner";

interface Recommendation {
  _id: Id<"recommendations">;
  type: "diet" | "exercise" | "medication" | "lifestyle";
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  explanation: string;
  completed?: boolean;
  dueDate?: number;
}

interface RecommendationCardProps {
  recommendation: Recommendation;
  showActions?: boolean;
}

export function RecommendationCard({ recommendation, showActions = true }: RecommendationCardProps) {
  const completeRecommendation = useMutation(api.recommendations.completeRecommendation);

  const handleComplete = async () => {
    try {
      await completeRecommendation({ recommendationId: recommendation._id });
      toast.success("Recommendation completed!");
    } catch (error) {
      toast.error("Failed to complete recommendation");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "default";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "diet": return "🥗";
      case "exercise": return "🏃";
      case "medication": return "💊";
      case "lifestyle": return "🌱";
      default: return "📋";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`${recommendation.completed ? 'opacity-60' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getTypeIcon(recommendation.type)}</span>
              <div>
                <CardTitle className="text-base font-semibold">
                  {recommendation.title}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={getPriorityColor(recommendation.priority)} className="text-xs">
                    {recommendation.priority}
                  </Badge>
                  <Badge variant="outline" className="text-xs capitalize">
                    {recommendation.type}
                  </Badge>
                </div>
              </div>
            </div>
            {recommendation.completed && (
              <Check className="h-5 w-5 text-green-500" />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {recommendation.description}
          </p>
          
          {recommendation.dueDate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Due: {new Date(recommendation.dueDate).toLocaleDateString()}
            </div>
          )}

          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-2 text-sm text-primary hover:text-primary/80">
              <Info className="h-4 w-4" />
              Why this recommendation?
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 p-3 bg-muted/50 rounded-lg text-sm">
              {recommendation.explanation}
            </CollapsibleContent>
          </Collapsible>

          {showActions && !recommendation.completed && (
            <Button 
              onClick={handleComplete}
              size="sm" 
              className="w-full"
            >
              <Check className="h-4 w-4 mr-2" />
              Mark Complete
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
