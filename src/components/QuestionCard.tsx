import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface QuestionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

export const QuestionCard = ({ title, description, icon, onClick }: QuestionCardProps) => {
  return (
    <Card className="bg-gradient-card border border-border hover:border-primary/50 transition-all duration-300 shadow-glow-card hover:shadow-glow-primary cursor-pointer group" onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              {icon}
            </div>
            <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed break-all">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};