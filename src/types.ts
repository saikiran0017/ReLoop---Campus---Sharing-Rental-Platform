export type Category = 'Stationery' | 'Books' | 'Electronics' | 'Sports' | 'Hostel' | 'Lab';

export type Mode = 'borrow' | 'rent' | 'giveaway';

export type Condition = 'Like new' | 'Good' | 'Worn';

export type TrustTier = 'New' | 'Trusted' | 'Campus Star';

export type EducationType = 'Engineering' | 'PUC';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  mobile: string;
  educationType: EducationType;
  yearOfStudy: string;
  major: string; // Engineering Department or PUC Stream
  emailVerified: boolean;
  phoneVerified: boolean;
  trustScore: number;
  loansCompleted: number;
  onTimeRate: number;
  securityPin?: string; // 4-to-6 digit security PIN
  biometricEnabled?: boolean; // Touch ID / Face ID
}

export interface Item {
  id: string;
  title: string;
  emoji: string;
  category: Category;
  mode: Mode;
  rentPerDay: number;
  deposit: number;
  condition: Condition;
  pickupSpot: string;
  details: string;
  contactPhone: string; // Custom contact number for this item
  ownerId: string;
  ownerName: string;
  ownerTrustTier: TrustTier;
  ownerTrustScore: number;
  ownerPhone: string;
  ownerEmail: string;
  ownerVerifiedId: boolean;
  ownerTotalLoans: number;
  ownerOnTimePct: number;
  isLent: boolean;
  lentUntil?: string;
  waitlist: string[];
  approxRetailPrice: number;
}

export type RequestStatus = 'Pending' | 'Accepted' | 'In use' | 'Returned' | 'Declined';

export interface LoanRequest {
  id: string;
  itemId: string;
  itemTitle: string;
  itemEmoji: string;
  requesterId: string;
  requesterName: string;
  requesterTrustScore: number;
  requesterTrustTier: TrustTier;
  requesterPhone: string;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  mode: Mode;
  durationLabel: string;
  durationDays: number;
  message: string;
  calculatedRent: number;
  depositPaid: number;
  depositDiscountPercent: number;
  totalPayable: number;
  pickupSpot: string;
  status: RequestStatus;
  createdAt: string;
  acceptedAt?: string;
  inUseAt?: string;
  dueDate?: string;
  conditionCheckedRequester: boolean;
  conditionCheckedOwner: boolean;
  rating?: number;
  review?: string;
}

export interface WantedRequest {
  id: string;
  title: string;
  category: Category;
  notes: string;
  studentName: string;
  studentMajor?: string;
  postedDate: string;
  status: 'active' | 'fulfilled';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isCurrentUser: boolean;
}

export interface ChatConversation {
  id: string;
  itemId?: string;
  itemTitle?: string;
  itemEmoji?: string;
  participantId: string; // Other party's user ID
  participantName: string;
  participantPhone?: string;
  participantTrustTier?: TrustTier;
  lastMessage: string;
  lastMessageTime: string;
  unread: boolean;
  messages: ChatMessage[];
}
