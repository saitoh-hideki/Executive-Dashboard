'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Array<{
    kpi: string;
    period: string;
    value: number;
  }>;
  timestamp: Date;
}

interface AiChatProps {
  orgId: string;
  period: string;
  mode: 'kpi' | 'advice';
  departmentId: string | undefined;
}

export function AiChat({ orgId, period, mode, departmentId }: AiChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    // モード変更時に初期メッセージを表示
    const initialMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: mode === 'kpi' 
        ? `KPIモードが選択されました。${period}のデータを参照して、利益、成約率、離職率、採用コスト、学習進捗、モチベ指数について質問してください。具体的な数値とトレンドをお答えします。`
        : '相談モードが選択されました。経営に関するお悩みやご質問をお聞かせください。KPI改善、組織運営、業績向上施策、人材管理などについてアドバイスいたします。',
      timestamp: new Date()
    };
    setMessages([initialMessage]);
    setSessionId(null);
  }, [mode, period]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || !orgId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-chat`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            org_id: orgId,
            session_id: sessionId,
            mode,
            question: input.trim(),
            filters: {
              period,
              department_id: departmentId
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const result = await response.json();
      
      if (!sessionId) {
        setSessionId(result.session_id);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.answer,
        citations: result.citations,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '申し訳ございませんが、一時的にサービスが利用できません。しばらく時間をおいてから再度お試しください。',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-full" role="log" aria-label="チャット履歴">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 min-h-0" aria-live="polite" aria-label="メッセージ一覧">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            role="article"
            aria-label={`${message.role === 'user' ? 'ユーザー' : 'AIアシスタント'}のメッセージ`}
          >
            <div
              className={`flex space-x-3 max-w-[85%] ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
              }`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-200 text-slate-600'
              }`} aria-hidden="true">
                {message.role === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>
              
              <div className={`rounded-lg px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-black'
              }`}>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </div>
                
                {message.citations && message.citations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-300 text-xs opacity-75">
                    <div className="font-medium mb-1">参照データ:</div>
                    {message.citations.map((citation, index) => (
                      <div key={index}>
                        {citation.kpi} ({citation.period}): {citation.value}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className={`text-xs mt-2 opacity-75 ${
                  message.role === 'user' ? 'text-blue-100' : 'text-slate-500'
                }`}>
                  {message.timestamp.toLocaleTimeString('ja-JP', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start" aria-live="polite" aria-label="AIが考え中">
            <div className="flex space-x-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center" aria-hidden="true">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-100 rounded-lg px-4 py-3">
                <div className="flex items-center space-x-2 text-slate-600">
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span className="text-sm">考え中...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <div className="flex-1">
            <label htmlFor="chat-input" className="sr-only">
              {mode === 'kpi' ? 'KPIに関する質問を入力' : '経営相談の内容を入力'}
            </label>
            <textarea
              id="chat-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={mode === 'kpi' 
                ? "例: 今月の利益/人はどうですか？" 
                : "例: 離職率を改善するにはどうすればよいですか？"
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black"
              rows={2}
              disabled={loading}
              aria-describedby="input-help"
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="メッセージを送信"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
          </button>
        </form>
        
        <div id="input-help" className="mt-2 text-xs text-slate-500">
          Enter で送信、Shift+Enter で改行
        </div>
      </div>
    </div>
  );
}