import { Match } from "@/types/team";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare } from "lucide-react";

interface CommentaryEvent {
  minute: number;
  text: string;
  type: 'goal' | 'event' | 'whistle';
}

interface MatchCommentaryProps {
  match: Match;
}

const generateCommentary = (match: Match): CommentaryEvent[] => {
  const events: CommentaryEvent[] = [];
  
  events.push({
    minute: 0,
    text: `⚽ Match begins! ${match.homeTeam.name} vs ${match.awayTeam.name}`,
    type: 'whistle'
  });

  if (match.played && match.homeScore !== undefined && match.awayScore !== undefined) {
    const totalGoals = match.homeScore + match.awayScore;
    const goalMinutes = Array.from({ length: totalGoals }, () => Math.floor(Math.random() * 90) + 1).sort((a, b) => a - b);
    
    let homeGoals = 0;
    let awayGoals = 0;
    
    goalMinutes.forEach(minute => {
      if (homeGoals < match.homeScore && (awayGoals >= match.awayScore || Math.random() > 0.5)) {
        homeGoals++;
        events.push({
          minute,
          text: `⚽ GOAL! ${match.homeTeam.name} scores! ${homeGoals}-${awayGoals}`,
          type: 'goal'
        });
      } else if (awayGoals < match.awayScore) {
        awayGoals++;
        events.push({
          minute,
          text: `⚽ GOAL! ${match.awayTeam.name} scores! ${homeGoals}-${awayGoals}`,
          type: 'goal'
        });
      }
    });

    events.push({
      minute: 45,
      text: '⏱️ Half-time',
      type: 'whistle'
    });

    events.push({
      minute: 90,
      text: `🏁 Full-time: ${match.homeTeam.name} ${match.homeScore} - ${match.awayScore} ${match.awayTeam.name}`,
      type: 'whistle'
    });
  }

  return events.sort((a, b) => a.minute - b.minute);
};

const MatchCommentary = ({ match }: MatchCommentaryProps) => {
  const commentary = generateCommentary(match);

  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-5 w-5 text-accent" />
        <h3 className="font-outfit font-semibold text-foreground">Match Commentary</h3>
      </div>
      
      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-3">
          {commentary.map((event, index) => (
            <div 
              key={index} 
              className={`flex gap-3 ${event.type === 'goal' ? 'text-accent font-semibold' : 'text-muted-foreground'}`}
            >
              <span className="text-xs font-mono min-w-[40px] text-muted-foreground">{event.minute}'</span>
              <span className="flex-1">{event.text}</span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default MatchCommentary;
