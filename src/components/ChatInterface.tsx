import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  onSendMessage: (message: string) => Promise<void>;
  messages: Message[];
  isLoading: boolean;
}

// Component to format AI responses with proper structure
const FormattedMessage = ({ content }: { content: string }) => {
  const formatContent = (text: string) => {
    // Detect if this is a how-to or step-by-step response
    const isHowTo = text.toLowerCase().includes('how to') || text.toLowerCase().includes('submit') || text.toLowerCase().includes('steps') || /\d+\)\s/.test(text);
    const isWalletExploration = text.toLowerCase().includes('wallet') && (text.toLowerCase().includes('explore') || text.toLowerCase().includes('address'));
    const isWeb3Explanation = text.toLowerCase().includes('web3') && text.toLowerCase().includes('explain');
    const isHashExplanation = text.toLowerCase().includes('hash') && text.toLowerCase().includes('transaction');
    
    // Extract steps from numbered format like "1) Connect wallet, 2) Ensure..."
    const numberedStepsMatch = text.match(/(\d+\)\s[^,]+(?:,\s*\d+\)\s[^,]+)*)/);
    
    if (isHowTo && numberedStepsMatch) {
      // Parse the numbered steps
      const stepsText = numberedStepsMatch[1];
      const steps = stepsText.split(/,\s*(?=\d+\))/).map(step => {
        const match = step.match(/(\d+)\)\s*(.+)/);
        return match ? { number: match[1], text: match[2].trim() } : null;
      }).filter(Boolean);
      
      const title = isWalletExploration ? "Wallet Analysis" :
                   isHashExplanation ? "Transaction Hash Explanation" :
                   "How to Make a Blockchain Transaction";
      
      return {
        type: 'structured',
        title,
        steps,
        additionalInfo: text.replace(numberedStepsMatch[0], '').trim()
      };
    }
    
    // For other content, structure it as sections
    const paragraphs = text.split(/\n\s*\n|\.\s+(?=[A-Z])/).filter(p => p.trim());
    
    return {
      type: 'general',
      title: isWeb3Explanation ? "Web3 Explained" : 
             isWalletExploration ? "Wallet Analysis" :
             isHashExplanation ? "Transaction Details" : "Information",
      content: paragraphs
    };
  };

  const formatted = formatContent(content);
  
  if (formatted.type === 'structured') {
    return (
      <div className="space-y-4">
        <h3 className="flex items-center space-x-2 font-semibold text-card-foreground">
          <span className="text-lg">✅</span>
          <span>{formatted.title}</span>
        </h3>
        
        <div className="space-y-3">
          {formatted.steps.map((step: any, index: number) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                  {step.number}
                </span>
                <span className="font-medium text-card-foreground">
                  {step.text.split(/[.,]|and/)[0].trim()}
                </span>
              </div>
              {step.text.includes(',') && (
                <p className="ml-8 text-sm text-muted-foreground leading-relaxed">
                  {step.text.substring(step.text.indexOf(',') + 1).trim()}
                </p>
              )}
            </div>
          ))}
        </div>
        
        {formatted.additionalInfo && (
          <>
            <div className="border-t border-border/20 my-4"></div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Important:</span> {formatted.additionalInfo}
            </div>
          </>
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h3 className="flex items-center space-x-2 font-semibold text-card-foreground">
        <span className="text-lg">ℹ️</span>
        <span>{formatted.title}</span>
      </h3>
      
      <div className="space-y-3">
        {formatted.content.map((paragraph: string, index: number) => (
          <p key={index} className="leading-relaxed text-card-foreground">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
};

export const ChatInterface = ({ onSendMessage, messages, isLoading }: ChatInterfaceProps) => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const message = input.trim();
    setInput("");
    await onSendMessage(message);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Chat Messages */}
      {messages.length > 0 && (
        <div className="mb-8 space-y-4 max-h-96 overflow-y-auto">
          {messages.map((message, index) => (
            <Card key={index} className={`${
              message.role === 'user' 
                ? 'bg-gradient-primary ml-auto max-w-[80%]' 
                : 'bg-gradient-card mr-auto max-w-[80%]'
            } border border-border shadow-glow-card`}>
              <CardContent className="p-4">
                <div className={`text-sm ${
                  message.role === 'user' 
                    ? 'text-white' 
                    : 'text-card-foreground'
                } whitespace-pre-wrap`}>
                  {message.role === 'assistant' ? (
                    <FormattedMessage content={message.content} />
                  ) : (
                    message.content
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {isLoading && (
            <Card className="bg-gradient-card mr-auto max-w-[80%] border border-border shadow-glow-card">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="animate-pulse flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200"></div>
                  </div>
                  <span className="text-muted-foreground text-sm">AI is thinking...</span>
                </div>
              </CardContent>
            </Card>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Chat Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex space-x-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter a prompt about blockchain here"
            className="flex-1 bg-input border border-border focus:border-primary transition-colors h-14 text-card-foreground placeholder:text-muted-foreground rounded-lg px-4"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            variant="web3" 
            disabled={!input.trim() || isLoading}
            className="px-8 h-14 text-base font-medium"
          >
            Send
          </Button>
        </div>
      </form>
    </div>
  );
};