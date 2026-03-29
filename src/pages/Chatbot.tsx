import { useState, useRef, useEffect } from "react";
import { withTimeout, withRetry } from "@/lib/fetchWithTimeout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { ProfileRow } from "@/lib/healthData";
import { buildHealthProfilePrompt } from "@/lib/healthData";
import Layout from "@/components/layout/Layout";
import PageTransition from "@/components/animations/PageTransition";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Loader2, Bot, User, Trash2, AlertCircle, LogIn,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatStreamChunk {
  choices?: Array<{
    delta?: {
      content?: string;
    };
  }>;
}

const FREE_MESSAGE_LIMIT = 3;

const Chatbot = () => {
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm your Medical AI Assistant. I can help you with health-related questions, explain medical terms, and provide general wellness guidance. How can I assist you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userMessageCount, setUserMessageCount] = useState(0);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickQuestions = [
    "What are common symptoms of the flu?",
    "How can I improve my sleep quality?",
    "What should I eat for a healthy heart?",
    "How do I manage stress effectively?",
  ];

  const isLimitReached = !user && userMessageCount >= FREE_MESSAGE_LIMIT;

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [messages]);

  const streamChat = async (userMessages: Message[]) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !publishableKey) {
      throw new Error("Supabase environment variables are missing. Check your project configuration.");
    }

    const CHAT_URL = `${supabaseUrl}/functions/v1/medical-chat`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      apikey: publishableKey,
    };
    
    // Add auth header if user is logged in, but don't require it
    const { data: { session } } = await supabase.auth.getSession();
    headers.Authorization = `Bearer ${session?.access_token ?? publishableKey}`;
    
    const response = await withRetry(
      () => withTimeout(
        fetch(CHAT_URL, {
          method: "POST",
          headers,
          body: JSON.stringify({ messages: userMessages }),
        }),
        45_000,
        "chat"
      ),
      1,
      "chat"
    );
    if (response.status === 404) throw new Error("Chat service is not deployed yet. Deploy the Supabase edge functions for this project.");
    if (response.status === 429) throw new Error("Rate limit exceeded. Please try again in a moment.");
    if (response.status === 402) throw new Error("Service temporarily unavailable. Please try again later.");
    if (!response.ok) { const errorData = await response.json().catch(() => ({})); throw new Error(errorData.error || "Failed to get response"); }
    if (!response.body) throw new Error("No response body");
    return response;
  };

  const sendingRef = useRef(false);

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading || sendingRef.current) return;
    sendingRef.current = true;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setUserMessageCount((c) => c + 1);
    setInput("");
    setIsLoading(true);
    let assistantContent = "";
    try {
      // Enrich first message with health profile context
      let enrichedMessages = [...messages, userMessage];
      if (user && messages.length <= 1) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        const profileContext = buildHealthProfilePrompt(profile as ProfileRow | null, {
          prefix: "[Patient Context - do not repeat this back, just use it to personalize advice]",
        });

        if (profileContext) {
          enrichedMessages = [
            { role: "user" as const, content: profileContext },
            { role: "assistant" as const, content: "Understood, I'll keep your health profile in mind." },
            ...enrichedMessages.slice(1),
          ];
        }
      }
      const response = await streamChat(enrichedMessages);
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr) as ChatStreamChunk;
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = { role: "assistant", content: assistantContent };
                return newMessages;
              });
            }
          } catch { textBuffer = line + "\n" + textBuffer; break; }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => {
        if (prev[prev.length - 1]?.role === "assistant" && prev[prev.length - 1]?.content === "") return prev.slice(0, -1);
        return prev;
      });
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to get response", variant: "destructive" });
    } finally { setIsLoading(false); sendingRef.current = false; inputRef.current?.focus(); }
  };

  const clearChat = () => {
    setMessages([{ role: "assistant", content: "Hello! I'm your Medical AI Assistant. I can help you with health-related questions, explain medical terms, and provide general wellness guidance. How can I assist you today?" }]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  return (
    <Layout showFooter={false}>
      <PageTransition>
        <div className="container py-4 md:py-8 flex flex-col h-[calc(100vh-4rem)]">
          <div className="max-w-3xl mx-auto w-full flex flex-col flex-1">
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-md">
                  <Bot className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Medical AI Chatbot</h1>
                  <p className="text-sm text-muted-foreground">Ask health questions</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={clearChat}><Trash2 className="h-4 w-4 mr-2" />Clear</Button>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, duration: 0.3 }} className="flex-1 flex flex-col">
              <Card className="flex-1 flex flex-col border-border/50 shadow-lg overflow-hidden">
                <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 chat-scrollbar">
                  <div className="space-y-4">
                    <AnimatePresence initial={false}>
                      {messages.map((message, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25 }}
                          className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                        >
                          <div className={`flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0 ${
                            message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          }`}>
                            {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                          </div>
                          <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                            message.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted rounded-tl-sm"
                          }`}>
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">
                              {message.content}
                              {isLoading && index === messages.length - 1 && message.role === "assistant" && message.content === "" && (
                                <span className="inline-flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" />Thinking...</span>
                              )}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </ScrollArea>

                {/* Login prompt for unauthenticated users */}
                {!user && !authLoading && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 border-t border-border bg-primary/5">
                    <div className="flex items-center gap-3">
                      <LogIn className="h-5 w-5 text-primary flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Sign in to chat with the AI</p>
                        <p className="text-xs text-muted-foreground">Create a free account to get personalized health guidance.</p>
                      </div>
                      <Link to="/login">
                        <Button size="sm" className="gradient-primary text-primary-foreground">Sign In</Button>
                      </Link>
                    </div>
                  </motion.div>
                )}

                {messages.length <= 2 && user && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="p-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Quick questions:</p>
                    <div className="flex flex-wrap gap-2">
                      {quickQuestions.map((question) => (
                        <Button key={question} variant="outline" size="sm" onClick={() => sendMessage(question)} disabled={isLoading} className="text-xs h-auto py-1.5 hover:border-primary/50 transition-colors">
                          {question}
                        </Button>
                      ))}
                    </div>
                  </motion.div>
                )}

                <div className="p-4 border-t border-border bg-muted/30">
                  <div className="flex gap-2">
                    <Input ref={inputRef} placeholder={user ? "Ask a health question..." : "Sign in to start chatting..."} value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={handleKeyPress} disabled={isLoading || !user} className="flex-1" />
                    <Button onClick={() => sendMessage()} disabled={isLoading || !input.trim() || !user} className="gradient-primary text-primary-foreground">
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>

            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <AlertCircle className="h-3 w-3 flex-shrink-0" />
              <p>This chatbot provides general information only. Always consult a healthcare professional for medical advice.</p>
            </div>
          </div>
        </div>
      </PageTransition>
    </Layout>
  );
};

export default Chatbot;
