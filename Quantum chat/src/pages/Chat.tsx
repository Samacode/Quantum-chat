import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import MobileFrame from '@/components/MobileFrame';
import { db, Contact, Message } from '@/lib/database';

interface ChatProps {
  contact: Contact;
  onBack: () => void;
}

export default function Chat({ contact, onBack }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
  }, [contact.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const loadedMessages = await db.getMessages(contact.id);
      setMessages(loadedMessages);
    } catch (error) {
      toast.error('Failed to load messages');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: Message = {
      id: crypto.randomUUID(),
      contactId: contact.id,
      content: newMessage.trim(),
      timestamp: new Date(),
      isOutgoing: true,
      encrypted: true
    };

    try {
      await db.saveMessage(message);
      setMessages(prev => [...prev, message]);
      setNewMessage('');

      // Simulate typing indicator and auto-reply
      setIsTyping(true);
      setTimeout(async () => {
        const replies = [
          "Thanks for your message! 👍",
          "Got it, will get back to you soon.",
          "That sounds great!",
          "Let me think about that...",
          "Absolutely! 💯",
          "I agree with you on that.",
          "Interesting point! 🤔"
        ];
        
        const reply: Message = {
          id: crypto.randomUUID(),
          contactId: contact.id,
          content: replies[Math.floor(Math.random() * replies.length)],
          timestamp: new Date(),
          isOutgoing: false,
          encrypted: true
        };

        await db.saveMessage(reply);
        setMessages(prev => [...prev, reply]);
        setIsTyping(false);
      }, 1500);
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const formatTime = (date: Date): string => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getAvatarColor = (name: string): string => {
    const colors = [
      'bg-red-200', 'bg-blue-200', 'bg-green-200', 'bg-yellow-200',
      'bg-purple-200', 'bg-pink-200', 'bg-indigo-200', 'bg-gray-200'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="h-full flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-4 bg-white">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" onClick={onBack} className="p-1">
              ←
            </Button>
            <div className={`w-10 h-10 rounded-full ${getAvatarColor(contact.name)} flex items-center justify-center text-sm font-semibold text-gray-700`}>
              {contact.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-semibold text-gray-900">{contact.name}</h1>
                <div className="text-green-500 text-lg">🔒</div>
              </div>
              <p className="text-xs text-green-600">End-to-end encrypted</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="text-4xl">🔒</div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Secure Chat Started</h3>
                <p className="text-gray-600 text-sm">
                  Messages are protected with quantum-safe encryption
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isOutgoing ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      message.isOutgoing
                        ? 'bg-gray-900 text-white rounded-br-none'
                        : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.isOutgoing ? 'text-gray-300' : 'text-gray-500'
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-900 border border-gray-200 rounded-2xl rounded-bl-none px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Status Line */}
        <div className="px-4 py-1 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-center text-green-600">Keys updated 🔑</p>
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <form onSubmit={sendMessage} className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-full border-2 border-gray-200 focus:border-gray-400"
            />
            <Button
              type="submit"
              disabled={!newMessage.trim()}
              className="rounded-full w-12 h-12 p-0 bg-gray-900 hover:bg-gray-800"
            >
              ➤
            </Button>
          </form>
        </div>
      </div>
  );
}