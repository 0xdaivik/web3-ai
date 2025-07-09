import { useState } from "react";
import { QuestionCard } from "@/components/QuestionCard";
import { ChatInterface } from "@/components/ChatInterface";
import { LiveBlockHeight } from "@/components/LiveBlockHeight";
import { openAIService } from "@/lib/openai";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async (message: string) => {
    console.log('Sending message:', message);
    setIsLoading(true);
    
    const newUserMessage: Message = { role: 'user', content: message };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      console.log('Calling openAI service with messages:', messages);
      const response = await openAIService.sendMessage([
        ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        { role: 'user', content: message }
      ]);
      
      console.log('Received response:', response);
      const assistantMessage: Message = { role: 'assistant', content: response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const predefinedQuestions = [
    {
      title: "Explain this transaction hash",
      description: "0xe197198c760226b2d339d48bc2a9638b143928c32d21688c13c510db2d617d38",
      icon: <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center text-primary-foreground text-xs font-bold">⛏️</div>,
      prompt: "explain this hash 0xe197198c760226b2d339d48bc2a9638b143928c32d21688c13c510db2d617d38"
    },
    {
      title: "Explore this wallet",
      description: "0x3e6c717bf161f4a170cdf63cfcbe90fef219ceed",
      icon: <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-accent-foreground text-xs">Ξ</div>,
      prompt: "explore this wallet 0x3e6c717bf161f4a170cdf63cfcbe90fef219ceed"
    },
    {
      title: "Learn about Web3",
      description: "Can you explain Web3 in a few sentences?",
      icon: <div className="w-6 h-6 bg-gradient-primary rounded-lg flex items-center justify-center text-white text-xs font-bold">🎓</div>,
      prompt: "Can you explain Web3 in simple terms? What makes it different from Web2 and what are its main benefits?"
    },
    {
      title: "Interact with a blockchain",
      description: "How do I submit a blockchain transaction?",
      icon: <div className="w-6 h-6 bg-secondary rounded flex items-center justify-center text-secondary-foreground text-xs">⚡</div>,
      prompt: "How do I submit a blockchain transaction?"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-background bg-dot-pattern bg-dots bg-fixed">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16 space-y-6">
          <h1 className="text-6xl font-bold text-foreground">
            Hello, Web3
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Explore the blockchain with me.
          </p>
        </div>

        {/* Question Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {predefinedQuestions.map((question, index) => (
            <QuestionCard
              key={index}
              title={question.title}
              description={question.description}
              icon={question.icon}
              onClick={() => handleSendMessage(question.prompt)}
            />
          ))}
        </div>

        {/* Live Block Heights */}
        <div className="max-w-2xl mx-auto mb-12">
          <LiveBlockHeight />
        </div>

        {/* Chat Interface */}
        <ChatInterface
          onSendMessage={handleSendMessage}
          messages={messages}
          isLoading={isLoading}
        />

        {/* Beta Notice */}
        <div className="text-center mt-8 text-sm text-muted-foreground max-w-2xl mx-auto">
          <p>This product is in BETA. It may display inaccurate info about Web3, so double-check its responses.</p>
          <p>Do not enter any sensitive, confidential or personal information.</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
