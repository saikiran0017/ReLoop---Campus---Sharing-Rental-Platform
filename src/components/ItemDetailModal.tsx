import React, { useState } from 'react';
import { Item, UserProfile, LoanRequest } from '../types';
import { DURATION_OPTIONS, getTrustTier, getDepositMultiplier } from '../seedData';
import { formatCurrency, calculateReturnDate } from '../utils';

interface ItemDetailModalProps {
  item: Item | null;
  onClose: () => void;
  currentUser: UserProfile;
  onSubmitRequest: (request: Partial<LoanRequest>) => void;
  onJoinWaitlist: (itemId: string) => void;
  onOpenChat?: (item: Item) => void;
  onShowToast: (msg: string) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  currentUser,
  onSubmitRequest,
  onJoinWaitlist,
  onOpenChat,
  onShowToast,
}) => {
  if (!item) return null;

  const [selectedDuration, setSelectedDuration] = useState(DURATION_OPTIONS[1]); // 1 week default
  const [message, setMessage] = useState('');
  const isOwner = item.ownerId === currentUser.id;

  const borrowerTier = getTrustTier(currentUser.trustScore);
  const depositMultiplier = getDepositMultiplier(currentUser.trustScore);

  // Live Cost Calculations
  const durationDays = selectedDuration.days;
  const calculatedRent = item.mode === 'rent' ? item.rentPerDay * durationDays : 0;
  const baseDeposit = item.mode === 'giveaway' ? 0 : item.deposit;
  const actualDeposit = Math.round(baseDeposit * depositMultiplier);
  const depositSavings = baseDeposit - actualDeposit;
  const totalPayable = calculatedRent + actualDeposit;

  const handleAction = (e: React.FormEvent) => {
    e.preventDefault();

    if (isOwner) {
      onShowToast('This is your own listing.');
      return;
    }

    if (item.isLent) {
      onJoinWaitlist(item.id);
      onShowToast(`Joined the waitlist for "${item.title}". You will be notified when returned!`);
      onClose();
      return;
    }

    if (item.mode === 'giveaway') {
      if (!message.trim()) {
        onShowToast('Please include a brief note to claim this giveaway.');
        return;
      }
      onSubmitRequest({
        itemId: item.id,
        itemTitle: item.title,
        itemEmoji: item.emoji,
        requesterId: currentUser.id,
        requesterName: currentUser.name,
        requesterTrustScore: currentUser.trustScore,
        requesterTrustTier: borrowerTier,
        requesterPhone: currentUser.mobile,
        ownerId: item.ownerId,
        ownerName: item.ownerName,
        ownerPhone: item.ownerPhone,
        mode: 'giveaway',
        durationLabel: 'Giveaway Claim',
        durationDays: 0,
        message,
        calculatedRent: 0,
        depositPaid: 0,
        depositDiscountPercent: 100,
        totalPayable: 0,
        pickupSpot: item.pickupSpot,
        status: 'Pending',
        createdAt: 'Just now',
        conditionCheckedRequester: false,
        conditionCheckedOwner: false,
      });
      onShowToast(`Claim request sent to ${item.ownerName}!`);
      onClose();
      return;
    }

    // Rent / Borrow
    if (!message.trim()) {
      onShowToast('Please include a message for the owner.');
      return;
    }

    const discountPct = (1 - depositMultiplier) * 100;

    onSubmitRequest({
      itemId: item.id,
      itemTitle: item.title,
      itemEmoji: item.emoji,
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      requesterTrustScore: currentUser.trustScore,
      requesterTrustTier: borrowerTier,
      requesterPhone: currentUser.mobile,
      ownerId: item.ownerId,
      ownerName: item.ownerName,
      ownerPhone: item.ownerPhone,
      mode: item.mode,
      durationLabel: selectedDuration.label,
      durationDays: selectedDuration.days,
      message,
      calculatedRent,
      depositPaid: actualDeposit,
      depositDiscountPercent: discountPct,
      totalPayable,
      pickupSpot: item.pickupSpot,
      status: 'Pending',
      createdAt: 'Just now',
      dueDate: calculateReturnDate(selectedDuration.days),
      conditionCheckedRequester: false,
      conditionCheckedOwner: false,
    });

    onShowToast(`Request sent to ${item.ownerName}! View status under "My Stuff".`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl my-6 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="text-3xl p-2 bg-zinc-50 dark:bg-zinc-800 rounded-md border border-zinc-100 dark:border-zinc-800 shrink-0">
              {item.emoji}
            </span>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 line-clamp-2">
                {item.title}
              </h2>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-2">
                <span>{item.category}</span>
                <span aria-hidden="true">·</span>
                <span>Condition: {item.condition}</span>
                <span aria-hidden="true">·</span>
                <span className="capitalize">{item.mode === 'borrow' ? 'Free Borrow' : item.mode}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xl font-mono leading-none p-1 cursor-pointer"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleAction} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Details & Specs */}
          <div className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded border border-zinc-100 dark:border-zinc-800">
            {item.details}
          </div>

          {/* Owner Trust Breakdown */}
          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/30 rounded border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                Owner: {item.ownerName}
              </span>
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">
                {item.ownerTrustTier} ({item.ownerTrustScore}/100)
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1 border-t border-zinc-200 dark:border-zinc-700/60">
              <div>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">College ID</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  {item.ownerVerifiedId ? '✓ Verified' : 'Unverified'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">Total Loans</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200 tabular-nums">
                  {item.ownerTotalLoans} completed
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">On-Time Return</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200 tabular-nums">
                  {item.ownerOnTimePct}% rate
                </span>
              </div>
            </div>
          </div>

          {/* Two Ways to Approach the Owner: Direct Call & In-App Account Message */}
          <div className="space-y-2 p-3.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs">
            <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
              <span>Public Campus Pickup Spot:</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                📍 {item.pickupSpot}
              </span>
            </div>

            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700/60 space-y-2">
              <div className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                Ways to Contact {item.ownerName}:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Method 1: Contact Phone */}
                <a
                  href={`tel:${item.contactPhone || item.ownerPhone}`}
                  className="flex items-center justify-center gap-1.5 p-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:border-zinc-400 transition-colors"
                  title="Direct Phone Call / WhatsApp"
                >
                  <span>📞 Call:</span>
                  <span>{item.contactPhone || item.ownerPhone}</span>
                </a>

                {/* Method 2: In-App Message (Account-to-Account) */}
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenChat) {
                      onOpenChat(item);
                      onClose();
                    }
                  }}
                  className="flex items-center justify-center gap-1.5 p-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-white rounded-md text-xs font-semibold transition-colors cursor-pointer"
                  title="Send In-App Message (ReLoop Account-to-Account)"
                >
                  <span>💬 Message Owner</span>
                  <span className="text-[10px] opacity-80">(In-App)</span>
                </button>
              </div>

              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight">
                ℹ️ In-app messaging connects directly to the owner's ReLoop account and does not require phone network.
              </p>
            </div>
          </div>

          {/* Lent Alert / Waitlist banner */}
          {item.isLent ? (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded text-xs text-amber-900 dark:text-amber-300">
              <div className="font-bold mb-1">Item is currently out on loan</div>
              <p>
                Estimated return: {item.lentUntil || 'in a few days'}. {item.waitlist?.length || 0} students on waitlist.
              </p>
            </div>
          ) : item.mode === 'giveaway' ? (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded text-xs text-emerald-900 dark:text-emerald-300">
              <span className="font-semibold">Permanent Giveaway:</span> Owner is giving this away for free. No deposit or rent required!
            </div>
          ) : (
            /* Duration Picker */
            <div>
              <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                Borrow Duration
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {DURATION_OPTIONS.map(opt => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setSelectedDuration(opt)}
                    className={`py-1.5 px-2 text-xs font-medium rounded border transition-colors cursor-pointer text-center ${
                      selectedDuration.label === opt.label
                        ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                        : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Live Cost Summary (When not lent and not giveaway) */}
          {!item.isLent && item.mode !== 'giveaway' && (
            <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded space-y-1.5 text-xs">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>
                  Rent ({item.mode === 'borrow' ? 'Free borrow' : `${formatCurrency(item.rentPerDay)}/day × ${durationDays} days`}):
                </span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200 tabular-nums">
                  {formatCurrency(calculatedRent)}
                </span>
              </div>

              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span className="flex items-center gap-1">
                  <span>Refundable Deposit:</span>
                  {depositMultiplier < 1.0 && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      ({depositMultiplier === 0 ? 'Campus Star 0% deposit' : 'Trusted 50% off'})
                    </span>
                  )}
                </span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200 tabular-nums">
                  {formatCurrency(actualDeposit)}
                  {depositSavings > 0 && (
                    <span className="line-through text-zinc-400 ml-1">
                      {formatCurrency(baseDeposit)}
                    </span>
                  )}
                </span>
              </div>

              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 flex justify-between font-bold text-sm text-zinc-900 dark:text-zinc-100">
                <span>Total Due at Handover:</span>
                <span className="tabular-nums">{formatCurrency(totalPayable)}</span>
              </div>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 pt-0.5">
                Deposit is 100% refunded when item is returned in agreed condition.
              </p>
            </div>
          )}

          {/* Required Message to Owner */}
          {!item.isLent && (
            <div>
              <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
                Message to {item.ownerName} *
              </label>
              <textarea
                required
                rows={2}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={
                  item.mode === 'giveaway'
                    ? 'Why do you need this item, and when can you collect it from the pickup spot?'
                    : 'Hi! I need this for my upcoming semester coursework/exams. I will keep it clean and return on time.'
                }
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100 focus:outline-zinc-900 dark:focus:outline-zinc-100"
              />
            </div>
          )}

          {/* Footer Submit Button */}
          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
            >
              Cancel
            </button>

            {isOwner ? (
              <span className="px-4 py-2 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                (Your listing)
              </span>
            ) : item.isLent ? (
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded transition-colors cursor-pointer"
              >
                Join Waitlist
              </button>
            ) : item.mode === 'giveaway' ? (
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded transition-colors cursor-pointer"
              >
                Claim This Item
              </button>
            ) : (
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 rounded transition-colors cursor-pointer"
              >
                Request Item · {formatCurrency(totalPayable)}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
