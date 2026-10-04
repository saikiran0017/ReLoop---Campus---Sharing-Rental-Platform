import React, { useState, useEffect, useRef } from 'react';
import { ChatConversation, ChatMessage, UserProfile } from '../types';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  conversations: ChatConversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onSendMessage: (conversationId: string, text: string) => void;
  onShowToast: (msg: string) => void;
}

const QUICK_CAMPUS_PROMPTS = [
  'Is this still available today?',
  'Can we meet at the Central Library foyer?',
  'Can I pick it up tomorrow morning?',
  'Does it include all accessories/cables?',
];

export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  conversations,
  activeConversationId,
  onSelectConversation,
  onSendMessage,
  onShowToast,
}) => {
  const [inputText, setInputText] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChat = conversations.find(c => c.id === activeConversationId);

  useEffect(() => {
    if (activeChat && isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChat?.messages.length, isOpen, activeConversationId]);

  if (!isOpen) return null;

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text || !activeConversationId) return;

    onSendMessage(activeConversationId, text);
    setInputText('');
  };

  const handleQuickPrompt = (prompt: string) => {
    if (!activeConversationId) return;
    onSendMessage(activeConversationId, prompt);
  };

  const filteredConversations = conversations.filter(c =>
    c.participantName.toLowerCase().includes(searchFilter.toLowerCase()) ||
    (c.itemTitle && c.itemTitle.toLowerCase().includes(searchFilter.toLowerCase())) ||
    c.lastMessage.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-hidden">
      <div className="relative w-full max-w-3xl h-[88vh] max-h-[680px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl flex overflow-hidden flex-col md:flex-row">
        
        {/* LEFT PANEL: CONVERSATIONS LIST */}
        <div className={`w-full md:w-80 border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-zinc-50/50 dark:bg-zinc-900/50 ${
          activeChat ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Inbox Header with Exit to Home */}
          <div className="p-3.5 sm:p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5 truncate">
                <span>💬</span>
                <span>Campus Messages</span>
              </h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                Account-to-Account secure chat
              </p>
            </div>
            
            {/* Exit to Home Button */}
            <button
              onClick={onClose}
              title="Exit to Home"
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-200/80 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-md transition-colors cursor-pointer shrink-0"
            >
              <span>🏠</span>
              <span>Exit</span>
            </button>
          </div>

          {/* Search inbox */}
          <div className="p-2.5 sm:p-3 border-b border-zinc-200/60 dark:border-zinc-800/60">
            <input
              type="text"
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              placeholder="Search chats by peer or item..."
              className="w-full px-3 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-zinc-900"
            />
          </div>

          {/* Conversations Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-400">
                No active conversations found. Click "💬 Message Owner" on any item to start a chat!
              </div>
            ) : (
              filteredConversations.map(conv => {
                const isSelected = conv.id === activeConversationId;
                return (
                  <button
                    key={conv.id}
                    onClick={() => onSelectConversation(conv.id)}
                    className={`w-full text-left p-3 transition-colors flex items-start gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-200/70 dark:bg-zinc-800'
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-sm font-semibold shrink-0 text-zinc-800 dark:text-zinc-200">
                      {conv.participantName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {conv.participantName}
                        </span>
                        <span className="text-[10px] text-zinc-400 shrink-0 ml-1 font-mono">
                          {conv.lastMessageTime}
                        </span>
                      </div>

                      {conv.itemTitle && (
                        <div className="text-[11px] text-zinc-600 dark:text-zinc-300 font-medium truncate flex items-center gap-1 mb-0.5">
                          <span className="shrink-0">{conv.itemEmoji || '📦'}</span>
                          <span className="truncate">{conv.itemTitle}</span>
                        </div>
                      )}

                      <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                        {conv.lastMessage}
                      </div>
                    </div>
                    {conv.unread && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PANEL: ACTIVE CHAT THREAD */}
        <div className={`flex-1 flex flex-col bg-white dark:bg-zinc-900 min-w-0 ${
          !activeChat ? 'hidden md:flex items-center justify-center' : 'flex'
        }`}>
          {activeChat ? (
            <>
              {/* Active Chat Header */}
              <div className="p-3 sm:p-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/80 dark:bg-zinc-900 gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <button
                    onClick={() => onSelectConversation('')}
                    className="md:hidden text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 px-1.5 py-1 rounded bg-zinc-100 dark:bg-zinc-800 cursor-pointer shrink-0"
                  >
                    ← Chats
                  </button>
                  <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-800 dark:text-zinc-200 shrink-0">
                    {activeChat.participantName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-50 truncate">
                        {activeChat.participantName}
                      </h3>
                      {activeChat.participantTrustTier && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold shrink-0">
                          {activeChat.participantTrustTier}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0" />
                      <span className="truncate">Verified Student Member</span>
                    </div>
                  </div>
                </div>

                {/* Exit to Home / Close Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={onClose}
                    title="Exit to Home"
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-md border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
                  >
                    <span>🏠</span>
                    <span className="hidden sm:inline">Exit to Home</span>
                  </button>
                  <button
                    onClick={onClose}
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-base p-1 cursor-pointer font-mono leading-none"
                    aria-label="Close modal"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Linked Item Banner with overflow safety */}
              {activeChat.itemTitle && (
                <div className="px-3 sm:px-4 py-2 bg-blue-50/80 dark:bg-blue-950/40 border-b border-blue-100 dark:border-blue-900/60 flex items-center justify-between text-xs gap-2 min-w-0">
                  <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200 truncate min-w-0">
                    <span className="text-base shrink-0">{activeChat.itemEmoji || '📦'}</span>
                    <span className="font-semibold truncate">{activeChat.itemTitle}</span>
                  </div>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 shrink-0 font-medium whitespace-nowrap">
                    Item Inquiry
                  </span>
                </div>
              )}

              {/* Messages Scroll Area with break-words */}
              <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 bg-zinc-50/30 dark:bg-zinc-950/30">
                <div className="text-center py-1">
                  <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-700 inline-block max-w-full truncate">
                    🔒 Account-to-Account Secure Channel · No phone number required
                  </span>
                </div>

                {activeChat.messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.isCurrentUser ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl px-3.5 py-2 text-xs leading-relaxed shadow-2xs break-words overflow-hidden ${
                        msg.isCurrentUser
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-br-xs'
                          : 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-bl-xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                    </div>
                    <span className="text-[10px] text-zinc-400 mt-1 px-1 font-mono">
                      {msg.timestamp}
                    </span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Suggestions */}
              <div className="p-2 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-1.5 overflow-x-auto scrollbar-none min-w-0">
                <span className="text-[10px] text-zinc-400 font-medium shrink-0 ml-1">Quick:</span>
                {QUICK_CAMPUS_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickPrompt(prompt)}
                    className="px-2.5 py-1 text-[11px] bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded whitespace-nowrap transition-colors cursor-pointer shrink-0"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Bar */}
              <form onSubmit={handleSend} className="p-2.5 sm:p-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2 bg-white dark:bg-zinc-900">
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder={`Message ${activeChat.participantName.split(' ')[0]}...`}
                  className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-zinc-900 min-w-0"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors shrink-0 ${
                    inputText.trim()
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 cursor-pointer'
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
                  }`}
                >
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="p-8 text-center text-zinc-400 space-y-3">
              <span className="text-3xl">💬</span>
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Select a message thread
              </p>
              <p className="text-xs max-w-xs mx-auto">
                Communicate directly with campus peers securely inside ReLoop without sharing private numbers.
              </p>
              <button
                onClick={onClose}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-md border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 cursor-pointer"
              >
                <span>🏠</span>
                <span>Exit to Home Page</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
