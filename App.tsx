
import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage as ChatMessageType } from './types';
import { ChatInput } from './components/ChatInput';
import { ChatMessage } from './components/ChatMessage';
import { generateOrEditImage } from './services/geminiService';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSendMessage = async (prompt: string, imageFile?: File) => {
    if (isGenerating || (!prompt && !imageFile)) return;

    setIsGenerating(true);

    const userMessageId = Date.now().toString();
    const aiMessageId = (Date.now() + 1).toString();

    const userMessage: ChatMessageType = {
      id: userMessageId,
      sender: 'user',
      text: prompt,
      ...(imageFile && { image: { name: imageFile.name, url: URL.createObjectURL(imageFile) } })
    };

    const aiMessagePlaceholder: ChatMessageType = {
      id: aiMessageId,
      sender: 'ai',
      isLoading: true,
    };
    
    setMessages(prev => [...prev, userMessage, aiMessagePlaceholder]);

    try {
      const imageUrl = await generateOrEditImage(prompt, imageFile);
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId ? { ...msg, sender: 'ai', imageUrl, isLoading: false } : msg
      ));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId ? { ...msg, sender: 'ai', error: errorMessage, isLoading: false } : msg
      ));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 p-4 shadow-md text-center">
        <h1 className="text-xl font-bold">AI Image Generator and Editor</h1>
      </header>
      
      <main className="flex-grow p-4 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-10">
                <p className="text-lg">Welcome!</p>
                <p>Describe an image to generate, or upload an image and describe how to edit it.</p>
            </div>
          )}
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <ChatInput onSendMessage={handleSendMessage} isGenerating={isGenerating} />
    </div>
  );
};

export default App;
