import React, { useState, useEffect } from 'react';
import { UserProfile, Item, WantedRequest, LoanRequest, Category, ChatConversation, ChatMessage } from './types';
import {
  INITIAL_USER,
  INITIAL_ITEMS,
  INITIAL_WANTED,
  INITIAL_REQUESTS,
  INITIAL_CONVERSATIONS,
} from './seedData';
import { loadFromLocalStorage, saveToLocalStorage } from './utils';
import { Header } from './components/Header';
import { ImpactBar } from './components/ImpactBar';
import { BrowseView } from './components/BrowseView';
import { WantedBoard } from './components/WantedBoard';
import { ItemDetailModal } from './components/ItemDetailModal';
import { PostFormModal } from './components/PostFormModal';
import { MyStuffView } from './components/MyStuffView';
import { AccountModal } from './components/AccountModal';
import { ChatModal } from './components/ChatModal';
import { AuthScreen } from './components/AuthScreen';
import { Toast } from './components/Toast';

export default function App() {
  // 1. Theme State
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return loadFromLocalStorage<boolean>('reloop_darkmode', false);
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    saveToLocalStorage('reloop_darkmode', darkMode);
  }, [darkMode]);

  // 2. Authentication & Security Lock State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return loadFromLocalStorage<boolean>('reloop_is_authenticated', false);
  });

  // 3. Core Persistent Data State
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = loadFromLocalStorage<any>('reloop_user', INITIAL_USER);
    return {
      ...INITIAL_USER,
      ...saved,
      educationType: saved.educationType || (saved.isEngineering === false ? 'PUC' : 'Engineering'),
      yearOfStudy: saved.yearOfStudy || '2nd Year',
      major: saved.major || 'Computer Science & Engineering',
      securityPin: saved.securityPin || '1234',
      biometricEnabled: saved.biometricEnabled ?? true,
    };
  });

  const [items, setItems] = useState<Item[]>(() => {
    const saved = loadFromLocalStorage<Item[]>('reloop_items', INITIAL_ITEMS);
    if (!Array.isArray(saved) || saved.length < 25) {
      return INITIAL_ITEMS;
    }
    return saved.map(item => ({
      ...item,
      contactPhone: item.contactPhone || item.ownerPhone || '+91 98765 43210',
    }));
  });

  const [wantedList, setWantedList] = useState<WantedRequest[]>(() =>
    loadFromLocalStorage<WantedRequest[]>('reloop_wanted', INITIAL_WANTED)
  );

  const [requests, setRequests] = useState<LoanRequest[]>(() =>
    loadFromLocalStorage<LoanRequest[]>('reloop_requests', INITIAL_REQUESTS)
  );

  // 4. In-App Account-to-Account Chat State
  const [conversations, setConversations] = useState<ChatConversation[]>(() =>
    loadFromLocalStorage<ChatConversation[]>('reloop_chats', INITIAL_CONVERSATIONS)
  );
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    saveToLocalStorage('reloop_user', user);
  }, [user]);

  useEffect(() => {
    saveToLocalStorage('reloop_items', items);
  }, [items]);

  useEffect(() => {
    saveToLocalStorage('reloop_wanted', wantedList);
  }, [wantedList]);

  useEffect(() => {
    saveToLocalStorage('reloop_requests', requests);
  }, [requests]);

  useEffect(() => {
    saveToLocalStorage('reloop_chats', conversations);
  }, [conversations]);

  // 5. UI Navigation & Modal State
  const [activeTab, setActiveTab] = useState<'browse' | 'wanted' | 'post' | 'mystuff'>('browse');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isPostOpen, setIsPostOpen] = useState(false);
  const [postPrefill, setPostPrefill] = useState<{
    title?: string;
    category?: Category;
    notes?: string;
    wantedId?: string;
  } | undefined>(undefined);

  // 6. Toast Message Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // 7. Impact Metrics
  const totalItemsShared = items.length;
  const completedLoansCount = 28 + requests.filter(r => r.status === 'Returned').length;
  const totalRupeesSaved = items.reduce((acc, curr) => acc + (curr.approxRetailPrice || 800), 24600);
  const unreadChatCount = conversations.filter(c => c.unread).length;

  // 8. Request Subsets
  const incomingRequests = requests.filter(r => r.ownerId === user.id);
  const outgoingRequests = requests.filter(r => r.requesterId === user.id);
  const myListings = items.filter(i => i.ownerId === user.id);

  // 9. Handlers

  // Open Chat from Item Card or Item Detail
  const handleOpenChat = (item: Item) => {
    // Check if conversation already exists for this item or owner
    let existing = conversations.find(
      c => (c.itemId === item.id || c.participantId === item.ownerId)
    );

    if (!existing) {
      const newConv: ChatConversation = {
        id: `chat-${Date.now()}`,
        itemId: item.id,
        itemTitle: item.title,
        itemEmoji: item.emoji,
        participantId: item.ownerId,
        participantName: item.ownerName,
        participantPhone: item.contactPhone || item.ownerPhone,
        participantTrustTier: item.ownerTrustTier,
        lastMessage: `Inquiry about ${item.title}`,
        lastMessageTime: 'Just now',
        unread: false,
        messages: [
          {
            id: `msg-${Date.now()}`,
            senderId: user.id,
            senderName: user.name,
            text: `Hi ${item.ownerName.split(' ')[0]}! I'm interested in your ${item.title}. Is it available for handover?`,
            timestamp: 'Just now',
            isCurrentUser: true,
          },
        ],
      };
      setConversations(prev => [newConv, ...prev]);
      setActiveChatId(newConv.id);
    } else {
      setActiveChatId(existing.id);
    }
    setIsChatOpen(true);
  };

  // Open Chat with Peer directly (from My Stuff loan requests)
  const handleOpenChatWithPeer = (peerId: string, peerName: string, itemTitle?: string, itemEmoji?: string) => {
    let existing = conversations.find(c => c.participantId === peerId);
    if (!existing) {
      const newConv: ChatConversation = {
        id: `chat-${Date.now()}`,
        itemTitle: itemTitle || 'Campus Exchange',
        itemEmoji: itemEmoji || '📦',
        participantId: peerId,
        participantName: peerName,
        lastMessage: 'Let us coordinate the handover spot.',
        lastMessageTime: 'Just now',
        unread: false,
        messages: [
          {
            id: `msg-${Date.now()}`,
            senderId: user.id,
            senderName: user.name,
            text: `Hi ${peerName.split(' ')[0]}! Looking forward to the handover. What time works best for you?`,
            timestamp: 'Just now',
            isCurrentUser: true,
          },
        ],
      };
      setConversations(prev => [newConv, ...prev]);
      setActiveChatId(newConv.id);
    } else {
      setActiveChatId(existing.id);
    }
    setIsChatOpen(true);
  };

  // Send message inside conversation
  const handleSendMessage = (conversationId: string, text: string) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: user.id,
      senderName: user.name,
      text,
      timestamp: 'Just now',
      isCurrentUser: true,
    };

    setConversations(prev =>
      prev.map(c => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessage: text,
            lastMessageTime: 'Just now',
            unread: false,
            messages: [...c.messages, newMessage],
          };
        }
        return c;
      })
    );

    // Simulate realistic campus peer reply after 1.5 seconds
    setTimeout(() => {
      const peerResponses = [
        "Sounds great! I'll be near the Central Library foyer. See you there!",
        "Yes, absolutely! The item is in top shape. Let me know when you arrive.",
        "Perfect, thanks for confirming! I'll bring it along.",
      ];
      const randomReply = peerResponses[Math.floor(Math.random() * peerResponses.length)];
      const replyMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        senderId: 'peer',
        senderName: 'Peer',
        text: randomReply,
        timestamp: 'Just now',
        isCurrentUser: false,
      };

      setConversations(prev =>
        prev.map(c => {
          if (c.id === conversationId) {
            return {
              ...c,
              lastMessage: randomReply,
              lastMessageTime: 'Just now',
              messages: [...c.messages, replyMessage],
            };
          }
          return c;
        })
      );
    }, 1200);
  };

  // Item detail click
  const handleSelectItem = (item: Item) => {
    setSelectedItem(item);
  };

  // Submit loan/borrow/giveaway request
  const handleSubmitRequest = (newReqData: Partial<LoanRequest>) => {
    const newReq: LoanRequest = {
      id: `req-${Date.now()}`,
      itemId: newReqData.itemId || '',
      itemTitle: newReqData.itemTitle || '',
      itemEmoji: newReqData.itemEmoji || '📦',
      requesterId: user.id,
      requesterName: user.name,
      requesterTrustScore: user.trustScore,
      requesterTrustTier: user.trustScore >= 80 ? 'Campus Star' : user.trustScore >= 55 ? 'Trusted' : 'New',
      requesterPhone: user.mobile,
      ownerId: newReqData.ownerId || '',
      ownerName: newReqData.ownerName || '',
      ownerPhone: newReqData.ownerPhone || '',
      mode: newReqData.mode || 'rent',
      durationLabel: newReqData.durationLabel || '1 week',
      durationDays: newReqData.durationDays || 7,
      message: newReqData.message || '',
      calculatedRent: newReqData.calculatedRent || 0,
      depositPaid: newReqData.depositPaid || 0,
      depositDiscountPercent: newReqData.depositDiscountPercent || 0,
      totalPayable: newReqData.totalPayable || 0,
      pickupSpot: newReqData.pickupSpot || 'Central Library Foyer',
      status: 'Pending',
      createdAt: 'Just now',
      dueDate: newReqData.dueDate,
      conditionCheckedRequester: false,
      conditionCheckedOwner: false,
    };

    setRequests(prev => [newReq, ...prev]);
    setActiveTab('mystuff');
  };

  // Join waitlist
  const handleJoinWaitlist = (itemId: string) => {
    setItems(prev =>
      prev.map(it => {
        if (it.id === itemId) {
          const wl = it.waitlist || [];
          if (!wl.includes(user.name)) {
            return { ...it, waitlist: [...wl, user.name] };
          }
        }
        return it;
      })
    );
  };

  // Post form trigger with prefill (e.g. from Wanted Board "I have this")
  const handleIHaveThis = (wanted: WantedRequest) => {
    setPostPrefill({
      title: wanted.title,
      category: wanted.category,
      notes: wanted.notes,
      wantedId: wanted.id,
    });
    setIsPostOpen(true);
  };

  // Add Item to Catalog
  const handleAddItem = (newItem: Item, matchedWantedId?: string) => {
    setItems(prev => [newItem, ...prev]);

    if (matchedWantedId) {
      setWantedList(prev =>
        prev.map(w => (w.id === matchedWantedId ? { ...w, status: 'fulfilled' } : w))
      );
    }
  };

  // Wanted request add
  const handleAddWanted = (newWanted: WantedRequest) => {
    setWantedList(prev => [newWanted, ...prev]);
  };

  // Request status transitions
  const handleAcceptRequest = (reqId: string) => {
    setRequests(prev =>
      prev.map(r => (r.id === reqId ? { ...r, status: 'Accepted', acceptedAt: 'Just now' } : r))
    );
    showToast('Request accepted! Contact information & in-app chat are now unlocked for pickup.');
  };

  const handleDeclineRequest = (reqId: string) => {
    setRequests(prev =>
      prev.map(r => (r.id === reqId ? { ...r, status: 'Declined' } : r))
    );
    showToast('Request declined.');
  };

  // Simulate owner acceptance for outgoing demo
  const handleSimulateOwnerAccept = (reqId: string) => {
    setRequests(prev =>
      prev.map(r => (r.id === reqId ? { ...r, status: 'Accepted', acceptedAt: 'Just now' } : r))
    );
    showToast('Demo simulated: The owner accepted your request! In-app chat and contact unlocked.');
  };

  // Safer handover confirmation
  const handleConfirmHandover = (reqId: string, role: 'owner' | 'requester') => {
    setRequests(prev =>
      prev.map(r => {
        if (r.id === reqId) {
          return {
            ...r,
            status: 'In use',
            inUseAt: 'Today',
            conditionCheckedOwner: true,
            conditionCheckedRequester: true,
          };
        }
        return r;
      })
    );

    const targetReq = requests.find(r => r.id === reqId);
    if (targetReq) {
      setItems(prev =>
        prev.map(it => (it.id === targetReq.itemId ? { ...it, isLent: true } : it))
      );
    }

    showToast('Handover confirmed! Loan is now Active. Reminder set for due date.');
  };

  // Mark item returned
  const handleCompleteReturn = (reqId: string, role: 'owner' | 'requester') => {
    const targetReq = requests.find(r => r.id === reqId);

    setRequests(prev =>
      prev.map(r => (r.id === reqId ? { ...r, status: 'Returned' } : r))
    );

    if (targetReq) {
      setItems(prev =>
        prev.map(it => (it.id === targetReq.itemId ? { ...it, isLent: false } : it))
      );
    }

    if (role === 'owner') {
      setUser(prev => ({
        ...prev,
        trustScore: Math.min(100, prev.trustScore + 5),
        loansCompleted: prev.loansCompleted + 1,
      }));
      showToast('Return confirmed! You earned +5 Trust Score for completing the loan.');
    } else {
      showToast('Return submitted! Please rate your experience with the owner.');
    }
  };

  // Submit Rating after return
  const handleSubmitRating = (reqId: string, rating: number, review: string) => {
    setRequests(prev =>
      prev.map(r => (r.id === reqId ? { ...r, rating, review } : r))
    );

    setUser(prev => ({
      ...prev,
      trustScore: Math.min(100, prev.trustScore + 8),
      loansCompleted: prev.loansCompleted + 1,
    }));

    showToast('Rating submitted! 🎉 You earned +8 Trust Score for on-time return.');
  };

  // Remove my listing
  const handleRemoveListing = (itemId: string) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
    showToast('Listing removed from campus catalog.');
  };

  // Authentication Handlers
  const handleLoginSuccess = (authenticatedUser: UserProfile) => {
    setUser(authenticatedUser);
    setIsAuthenticated(true);
    saveToLocalStorage('reloop_is_authenticated', true);
    saveToLocalStorage('reloop_user', authenticatedUser);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    saveToLocalStorage('reloop_is_authenticated', false);
    showToast('🔒 ReLoop locked. Use your Security PIN or Biometric to re-open.');
  };

  // If not authenticated, show Security PIN & Biometric Unlock Screen / Onboarding
  if (!isAuthenticated) {
    return (
      <>
        <AuthScreen
          existingUser={user}
          onLoginSuccess={handleLoginSuccess}
          onClearAccount={() => {
            setUser(INITIAL_USER);
            saveToLocalStorage('reloop_user', INITIAL_USER);
            showToast('Account cleared. You can register a new student account.');
          }}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(prev => !prev)}
          onShowToast={showToast}
        />
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* 1. Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={tab => {
          if (tab === 'post') {
            setPostPrefill(undefined);
            setIsPostOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        user={user}
        onOpenProfile={() => setIsAccountOpen(true)}
        onOpenMessages={() => {
          setActiveChatId(conversations[0]?.id || null);
          setIsChatOpen(true);
        }}
        unreadChatCount={unreadChatCount}
        onLogout={handleLogout}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(prev => !prev)}
        incomingCount={incomingRequests.filter(r => r.status === 'Pending').length}
      />

      {/* 2. Top Impact Bar */}
      <ImpactBar
        totalItemsShared={totalItemsShared}
        totalLoansCompleted={completedLoansCount}
        totalRupeesSaved={totalRupeesSaved}
      />

      {/* 3. Main Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'browse' && (
          <BrowseView
            items={items}
            onSelectItem={handleSelectItem}
            onOpenChat={handleOpenChat}
          />
        )}

        {activeTab === 'wanted' && (
          <WantedBoard
            wantedList={wantedList}
            onIHaveThis={handleIHaveThis}
            onAddWanted={handleAddWanted}
            currentUser={user}
            onBackToHome={() => setActiveTab('browse')}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'mystuff' && (
          <MyStuffView
            user={user}
            incomingRequests={incomingRequests}
            outgoingRequests={outgoingRequests}
            myListings={myListings}
            onAcceptRequest={handleAcceptRequest}
            onDeclineRequest={handleDeclineRequest}
            onSimulateOwnerAccept={handleSimulateOwnerAccept}
            onConfirmHandover={handleConfirmHandover}
            onCompleteReturn={handleCompleteReturn}
            onSubmitRating={handleSubmitRating}
            onRemoveListing={handleRemoveListing}
            onOpenProfileVerification={() => setIsAccountOpen(true)}
            onOpenChatWithPeer={handleOpenChatWithPeer}
            onBackToHome={() => setActiveTab('browse')}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* 4. Modals */}

      {/* Item Detail & Request Modal */}
      <ItemDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        currentUser={user}
        onSubmitRequest={handleSubmitRequest}
        onJoinWaitlist={handleJoinWaitlist}
        onOpenChat={handleOpenChat}
        onShowToast={showToast}
      />

      {/* Post an Item Modal */}
      <PostFormModal
        isOpen={isPostOpen}
        onClose={() => setIsPostOpen(false)}
        currentUser={user}
        prefill={postPrefill}
        wantedRequests={wantedList}
        onAddItem={handleAddItem}
        onShowToast={showToast}
      />

      {/* Student Account & Verification Modal */}
      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        user={user}
        onSaveUser={updated => setUser(updated)}
        onLogout={handleLogout}
        onShowToast={showToast}
      />

      {/* In-App Account-to-Account Chat Modal */}
      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentUser={user}
        conversations={conversations}
        activeConversationId={activeChatId}
        onSelectConversation={id => setActiveChatId(id)}
        onSendMessage={handleSendMessage}
        onShowToast={showToast}
      />

      {/* 5. Toast Feedback */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      {/* 6. Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 py-6 px-4 sm:px-6 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">ReLoop</span> · Campus Student Sharing Network
            <span className="mx-2 hidden sm:inline">·</span>
            <span className="block sm:inline mt-1 sm:mt-0">All transactions in Indian Rupees (₹)</span>
          </div>
          <p className="max-w-md text-[11px] leading-relaxed">
            Secured with master Security PIN, Biometric recognition, and in-app account-to-account encrypted messaging.
          </p>
        </div>
      </footer>
    </div>
  );
}
