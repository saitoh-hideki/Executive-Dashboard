'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, X, Send, BarChart3, MessageSquare } from 'lucide-react';
import { AiChat } from './AiChat';

interface AiChatFabProps {
  orgId: string;
  period: string;
  departmentId?: string;
}

export function AiChatFab({ orgId, period, departmentId }: AiChatFabProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'kpi' | 'advice'>('kpi');

  // チャットが開いているときに背景のスクロールを防ぐ
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // クリーンアップ
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleModeChange = (newMode: 'kpi' | 'advice') => {
    setMode(newMode);
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-105 z-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="AIチャットを開く"
          aria-expanded="false"
        >
          <MessageCircle className="w-6 h-6" aria-hidden="true" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div 
          className="fixed bottom-6 right-6 w-96 max-h-[80vh] h-[600px] bg-white rounded-lg shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="chat-title"
          aria-describedby="chat-description"
        >
          {/* Header */}
          <header className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-blue-600" aria-hidden="true" />
              <h3 id="chat-title" className="font-semibold text-slate-900">AIアシスタント</h3>
            </div>
            <button
              onClick={toggleChat}
              className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              aria-label="チャットを閉じる"
              aria-expanded="true"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </header>

          {/* Mode Toggle */}
          <div className="p-3 border-b border-slate-200 bg-white">
            <div className="flex space-x-1 bg-slate-100 rounded-lg p-1" role="tablist" aria-label="チャットモード選択">
              <button
                onClick={() => handleModeChange('kpi')}
                className={`flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-md text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  mode === 'kpi'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                role="tab"
                aria-selected={mode === 'kpi'}
                aria-controls="chat-content"
              >
                <BarChart3 className="w-4 h-4" aria-hidden="true" />
                <span>KPIモード</span>
              </button>
              <button
                onClick={() => handleModeChange('advice')}
                className={`flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-md text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  mode === 'advice'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                role="tab"
                aria-selected={mode === 'advice'}
                aria-controls="chat-content"
              >
                <MessageSquare className="w-4 h-4" aria-hidden="true" />
                <span>相談モード</span>
              </button>
            </div>
            <div id="chat-description" className="mt-2 text-xs text-slate-500">
              {mode === 'kpi' 
                ? 'KPIデータを参照して具体的な数値に基づく回答をします'
                : '経営に関する一般的なアドバイスを提供します'
              }
            </div>
          </div>

          {/* Chat Content */}
          <div id="chat-content" className="flex-1 min-h-0 overflow-hidden" role="tabpanel" aria-label={`${mode === 'kpi' ? 'KPI' : '相談'}モードのチャット`}>
            <AiChat
              orgId={orgId}
              period={period}
              mode={mode}
              departmentId={departmentId || undefined}
            />
          </div>
        </div>
      )}
    </>
  );
}