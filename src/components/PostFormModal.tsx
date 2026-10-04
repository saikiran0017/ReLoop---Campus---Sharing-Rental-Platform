import React, { useState, useEffect } from 'react';
import { Item, Category, Mode, Condition, UserProfile, WantedRequest } from '../types';
import { CAMPUS_PICKUP_SPOTS, getTrustTier } from '../seedData';

interface PostFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  prefill?: {
    title?: string;
    category?: Category;
    notes?: string;
    wantedId?: string;
  };
  wantedRequests: WantedRequest[];
  onAddItem: (newItem: Item, matchedWantedId?: string) => void;
  onShowToast: (msg: string) => void;
}

const EMOJI_BY_CATEGORY: Record<Category, string[]> = {
  Stationery: ['📐', '📏', '✏️', '📎', '📋', '🖊️'],
  Books: ['📚', '📖', '📕', '📓', '📑', '📘'],
  Electronics: ['⚡', '🧮', '💻', '🔌', '🎧', '🔋'],
  Sports: ['🏸', '⚽', '🏀', '🏏', '🎾', '🏓'],
  Hostel: ['🧊', '💡', '🛏️', '🪑', '🫖', '🧺'],
  Lab: ['🥼', '🔬', '🧪', '🧤', '🥽', '⚖️'],
};

export const PostFormModal: React.FC<PostFormModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  prefill,
  wantedRequests,
  onAddItem,
  onShowToast,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('Stationery');
  const [emoji, setEmoji] = useState('📐');
  const [mode, setMode] = useState<Mode>('rent');
  const [rentPerDay, setRentPerDay] = useState<number>(15);
  const [deposit, setDeposit] = useState<number>(300);
  const [condition, setCondition] = useState<Condition>('Good');
  const [pickupSpot, setPickupSpot] = useState<string>(CAMPUS_PICKUP_SPOTS[0]);
  const [contactPhone, setContactPhone] = useState<string>(currentUser.mobile || '+91 ');
  const [details, setDetails] = useState('');
  const [retailPrice, setRetailPrice] = useState<number>(1000);

  // Sync prefill or reset when opened
  useEffect(() => {
    if (isOpen) {
      if (prefill) {
        if (prefill.title) setTitle(prefill.title);
        if (prefill.category) {
          setCategory(prefill.category);
          setEmoji(EMOJI_BY_CATEGORY[prefill.category][0] || '📦');
        }
        if (prefill.notes) {
          setDetails(prefill.notes);
        }
      }
      if (currentUser.mobile) {
        setContactPhone(currentUser.mobile);
      }
    }
  }, [isOpen, prefill, currentUser.mobile]);

  if (!isOpen) return null;

  const handleCategoryChange = (newCat: Category) => {
    setCategory(newCat);
    setEmoji(EMOJI_BY_CATEGORY[newCat][0] || '📦');
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    if (newMode === 'giveaway') {
      setRentPerDay(0);
      setDeposit(0);
    } else if (newMode === 'borrow') {
      setRentPerDay(0);
      if (deposit === 0) setDeposit(150);
    } else {
      if (rentPerDay === 0) setRentPerDay(15);
      if (deposit === 0) setDeposit(300);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      onShowToast('Please enter an item title.');
      return;
    }

    if (!details.trim()) {
      onShowToast('Please provide details about the item.');
      return;
    }

    if (!contactPhone.trim()) {
      onShowToast('Please provide a contact number for this item listing.');
      return;
    }

    // Check if matches a wanted request
    const matchedWanted = prefill?.wantedId
      ? wantedRequests.find(w => w.id === prefill.wantedId && w.status === 'active')
      : wantedRequests.find(
          w =>
            w.status === 'active' &&
            w.category === category &&
            (title.toLowerCase().includes(w.title.toLowerCase()) ||
              w.title.toLowerCase().includes(title.toLowerCase()))
        );

    const userTier = getTrustTier(currentUser.trustScore);

    const newItem: Item = {
      id: `item-${Date.now()}`,
      title: title.trim(),
      emoji,
      category,
      mode,
      rentPerDay: mode === 'rent' ? Number(rentPerDay) : 0,
      deposit: mode === 'giveaway' ? 0 : Number(deposit),
      condition,
      pickupSpot,
      details: details.trim(),
      contactPhone: contactPhone.trim(),
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      ownerTrustTier: userTier,
      ownerTrustScore: currentUser.trustScore,
      ownerPhone: currentUser.mobile,
      ownerEmail: currentUser.email,
      ownerVerifiedId: currentUser.emailVerified,
      ownerTotalLoans: currentUser.loansCompleted,
      ownerOnTimePct: currentUser.onTimeRate,
      isLent: false,
      waitlist: [],
      approxRetailPrice: Number(retailPrice) || 500,
    };

    onAddItem(newItem, matchedWanted?.id);

    if (matchedWanted) {
      onShowToast(`🎯 Item listed! Matched & fulfilled "${matchedWanted.title}" for ${matchedWanted.studentName}.`);
    } else {
      onShowToast(`Listing created! Your item is now live in the campus catalog.`);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl my-6 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              Post an Item to Campus
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Lend, rent, or giveaway gear to fellow students
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xl font-mono leading-none p-1 cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {prefill?.wantedId && (
          <div className="p-3 mx-5 mt-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded text-xs text-blue-800 dark:text-blue-300">
            Prefilled from Wanted Board request: <span className="font-semibold">{prefill.title}</span>.
            Publishing this will notify the requester and resolve the request.
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Name & Emoji */}
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-3">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Item Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Mini Drafter with 360° protractor"
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100 focus:outline-zinc-900 dark:focus:outline-zinc-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Icon
              </label>
              <select
                value={emoji}
                onChange={e => setEmoji(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-center text-zinc-900 dark:text-zinc-100"
              >
                {EMOJI_BY_CATEGORY[category].map(em => (
                  <option key={em} value={em}>{em}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category & Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={e => handleCategoryChange(e.target.value as Category)}
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100"
              >
                <option value="Stationery">Stationery (Drafters, Kits)</option>
                <option value="Books">Books (Textbooks, Notes)</option>
                <option value="Electronics">Electronics (Calculators, Arduino)</option>
                <option value="Sports">Sports (Rackets, Balls)</option>
                <option value="Hostel">Hostel (Lamps, Fridges, Kettles)</option>
                <option value="Lab">Lab (Coats, Goggles, Kits)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Condition *
              </label>
              <select
                value={condition}
                onChange={e => setCondition(e.target.value as Condition)}
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100"
              >
                <option value="Like new">Like new (Flawless, barely used)</option>
                <option value="Good">Good (Minor wear, fully functional)</option>
                <option value="Worn">Worn (Cosmetic scuffs, works fine)</option>
              </select>
            </div>
          </div>

          {/* How to Share: Mode segmented buttons */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              How do you want to share? *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleModeChange('borrow')}
                className={`py-2 px-3 text-xs font-medium rounded border transition-colors cursor-pointer text-center ${
                  mode === 'borrow'
                    ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                    : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100'
                }`}
              >
                Lend Free
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('rent')}
                className={`py-2 px-3 text-xs font-medium rounded border transition-colors cursor-pointer text-center ${
                  mode === 'rent'
                    ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                    : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100'
                }`}
              >
                Rent per Day
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('giveaway')}
                className={`py-2 px-3 text-xs font-medium rounded border transition-colors cursor-pointer text-center ${
                  mode === 'giveaway'
                    ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                    : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100'
                }`}
              >
                Give Away
              </button>
            </div>
          </div>

          {/* Pricing & Refundable Deposit (Disabled when not applicable) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-zinc-50 dark:bg-zinc-800/40 rounded border border-zinc-200 dark:border-zinc-800">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Rent per Day (₹)
              </label>
              <input
                type="number"
                min={0}
                max={500}
                disabled={mode === 'borrow' || mode === 'giveaway'}
                value={rentPerDay}
                onChange={e => setRentPerDay(Math.max(0, Number(e.target.value)))}
                className={`w-full px-3 py-2 text-sm bg-white dark:bg-zinc-900 border rounded font-mono ${
                  mode === 'borrow' || mode === 'giveaway'
                    ? 'opacity-50 cursor-not-allowed bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-400'
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100'
                }`}
              />
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 block">
                {mode === 'borrow' ? 'Free (₹0/day)' : mode === 'giveaway' ? 'Free giveaway' : 'Typically ₹10 - ₹40/day'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Refundable Deposit (₹)
              </label>
              <input
                type="number"
                min={0}
                max={5000}
                disabled={mode === 'giveaway'}
                value={deposit}
                onChange={e => setDeposit(Math.max(0, Number(e.target.value)))}
                className={`w-full px-3 py-2 text-sm bg-white dark:bg-zinc-900 border rounded font-mono ${
                  mode === 'giveaway'
                    ? 'opacity-50 cursor-not-allowed bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-400'
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100'
                }`}
              />
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 block">
                {mode === 'giveaway'
                  ? 'No deposit needed for giveaways'
                  : 'Refunded on return. Star users get 0% deposit.'}
              </span>
            </div>
          </div>

          {/* Public Campus Pickup Spot & Contact Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Campus Handover Spot (Public spots only) *
              </label>
              <select
                value={pickupSpot}
                onChange={e => setPickupSpot(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100"
              >
                {CAMPUS_PICKUP_SPOTS.map(spot => (
                  <option key={spot} value={spot}>📍 {spot}</option>
                ))}
              </select>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                For safety, handovers occur in well-lit public hubs.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Contact Number for this Listing *
              </label>
              <input
                type="tel"
                required
                value={contactPhone}
                onChange={e => setContactPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100 font-mono"
              />
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                Displayed in the item list. Need not be the same as your account number.
              </p>
            </div>
          </div>

          {/* Details */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Description & Course Suitability *
            </label>
            <textarea
              required
              rows={3}
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder="Mention what's included (cables, case, edition), courses it helps with, and any minor cosmetic wear..."
              className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100 focus:outline-zinc-900 dark:focus:outline-zinc-100"
            />
          </div>

          {/* Approx Retail Price (for campus savings metric) */}
          <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 pt-1">
            <span>Approx original store price (for savings counter):</span>
            <div className="flex items-center gap-1 font-mono">
              <span>₹</span>
              <input
                type="number"
                min={100}
                value={retailPrice}
                onChange={e => setRetailPrice(Number(e.target.value))}
                className="w-20 px-2 py-1 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 rounded transition-colors cursor-pointer"
            >
              Publish Listing
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
