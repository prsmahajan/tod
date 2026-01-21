"use client";

import React, { useState, useRef, useEffect } from 'react';
import Icon from './Icon';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [hasPlayedSound, setHasPlayedSound] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { id: 'initial', text: "Hello! I'm tod; your assistant. How can I help you learn about our initiative for stray animals?", sender: 'bot' }
      ]);
    }
  }, [isOpen, messages.length]);

  const playClinkSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const audioContext = audioContextRef.current;

      // Create two tones for a "clink" effect
      const playTone = (frequency: number, startTime: number, duration: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'triangle';

        // Envelope for natural sound
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.005);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      const currentTime = audioContext.currentTime;
      playTone(1200, currentTime, 0.08);
      playTone(1800, currentTime + 0.04, 0.08);
    } catch (error) {
      console.log('Audio play failed:', error);
    }
  };

  // Initialize audio and play sound on mount
  useEffect(() => {
    const initAndPlayAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // Play sound after a short delay
      setTimeout(() => {
        if (!hasPlayedSound) {
          playClinkSound();
          setHasPlayedSound(true);
          // Show tooltip after sound
          setShowTooltip(true);
        }
      }, 1500);
    };

    // Initialize on any user interaction
    document.addEventListener('click', initAndPlayAudio, { once: true });
    document.addEventListener('touchstart', initAndPlayAudio, { once: true });

    return () => {
      document.removeEventListener('click', initAndPlayAudio);
      document.removeEventListener('touchstart', initAndPlayAudio);
    };
  }, [hasPlayedSound]);

  // Handle scroll to hide tooltip
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setHasScrolled(true);
        setShowTooltip(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call the Gemini API via your backend API route
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response ?? "Sorry, I'm having trouble with that request.",
        sender: 'bot'
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error fetching response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
        sender: 'bot'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleToggleChatbot = () => {
    playClinkSound();
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50">
        {/* Tooltip */}
        {!hasScrolled && (
          <div
            className={`absolute bottom-full right-0 mb-2 px-3 py-2 bg-[var(--color-text-primary)] text-[var(--color-bg)] text-sm rounded-lg shadow-lg whitespace-nowrap transition-all duration-500 ease-out ${showTooltip ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
          >
            confused? ask me here
            <div className="absolute top-full right-4 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-[var(--color-text-primary)]"></div>
          </div>
        )}

        <button
          onClick={handleToggleChatbot}
          onMouseEnter={() => !hasScrolled && setShowTooltip(true)}
          onMouseLeave={() => !hasScrolled && setShowTooltip(false)}
          className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[var(--color-text-primary)] text-[var(--color-bg)] flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          aria-label="Toggle chatbot"
        >
          <Icon name={isOpen ? 'close' : 'logo'} className={`w-6 h-6 md:w-7 md:h-7 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
        </button>
      </div>

      <div className={`fixed bottom-20 right-4 md:bottom-24 md:right-6 z-50 w-[calc(100%-2rem)] max-w-sm h-[60vh] md:h-[60vh] bg-[var(--color-card-bg)] rounded-lg shadow-2xl border border-[var(--color-border)] flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <header className="p-4 border-b border-[var(--color-border)]">
          <h2 className="font-heading font-bold text-lg">Chat with tod;</h2>
          <p className="text-xs text-[var(--color-text-secondary)]">tod; will guide you</p>
        </header>

        <div className="flex-1 p-4 overflow-y-auto">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex my-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`px-3 py-2 rounded-lg max-w-[80%] text-sm ${msg.sender === 'user' ? 'bg-[var(--color-text-primary)] text-[var(--color-bg)]' : 'bg-[var(--color-border)]'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
             <div className="flex my-2 justify-start">
              <div className="px-3 py-2 rounded-lg bg-[var(--color-border)] text-sm">
                <span className="animate-pulse">...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-[var(--color-border)] flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question..."
            className="flex-1 w-full p-2 text-sm bg-transparent rounded-md border border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-accent)] focus:outline-none"
            disabled={isLoading}
          />
          <button onClick={handleSend} className="ml-2 p-2 rounded-full bg-[var(--color-text-primary)] text-[var(--color-bg)] hover:opacity-80 disabled:opacity-50" disabled={isLoading}>
            <Icon name="send" className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );
};

export default Chatbot;
