import React, { useState } from 'react';
import { UserProfile, LoanRequest, Item } from '../types';
import { getTrustTier, getDepositMultiplier } from '../seedData';
import { formatCurrency } from '../utils';

interface MyStuffViewProps {
  user: UserProfile;
  incomingRequests: LoanRequest[];
  outgoingRequests: LoanRequest[];
  myListings: Item[];
  onAcceptRequest: (reqId: string) => void;
  onDeclineRequest: (reqId: string) => void;
  onSimulateOwnerAccept: (reqId: string) => void;
  onConfirmHandover: (reqId: string, role: 'owner' | 'requester') => void;
  onCompleteReturn: (reqId: string, role: 'owner' | 'requester') => void;
  onSubmitRating: (reqId: string, rating: number, review: string) => void;
  onRemoveListing: (itemId: string) => void;
  onOpenProfileVerification: () => void;
  onOpenChatWithPeer?: (peerId: string, peerName: string, itemTitle?: string, itemEmoji?: string) => void;
  onBackToHome?: () => void;
  onShowToast: (msg: string) => void;
}

export const MyStuffView: React.FC<MyStuffViewProps> = ({
  user,
  incomingRequests,
  outgoingRequests,
  myListings,
  onAcceptRequest,
  onDeclineRequest,
  onSimulateOwnerAccept,
  onConfirmHandover,
  onCompleteReturn,
  onSubmitRating,
  onRemoveListing,
  onOpenProfileVerification,
  onOpenChatWithPeer,
  onBackToHome,
  onShowToast,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'requests' | 'outgoing' | 'listings'>('requests');
  const [ratingInputs, setRatingInputs] = useState<Record<string, { stars: number; text: string }>>({});
  const [handoverChecks, setHandoverChecks] = useState<Record<string, boolean>>({});

  const trustTier = getTrustTier(user.trustScore);
  const depositMult = getDepositMultiplier(user.trustScore);
  const depositDiscountLabel =
    depositMult === 0
      ? '0% deposit (Star waiver)'
      : depositMult === 0.5
      ? '50% deposit discount'
      : '100% standard deposit';

  const nextTierInfo =
    user.trustScore < 55
      ? { nextTier: 'Trusted', pointsNeeded: 55 - user.trustScore, perk: '50% deposit discount' }
      : user.trustScore < 80
      ? { nextTier: 'Campus Star', pointsNeeded: 80 - user.trustScore, perk: '0% deposit on all campus rentals' }
      : null;

  const handleChatClick = (personName: string, phone: string, spot: string, peerId?: string, itemTitle?: string, itemEmoji?: string) => {
    if (onOpenChatWithPeer && peerId) {
      onOpenChatWithPeer(peerId, personName, itemTitle, itemEmoji);
    } else {
      onShowToast(`💬 Chat opened with ${personName} (${phone}): "Meet at ${spot} for handover!"`);
    }
  };

  const handleRatingSubmit = (reqId: string) => {
    const data = ratingInputs[reqId] || { stars: 5, text: '' };
    onSubmitRating(reqId, data.stars, data.text || 'Great campus exchange! Item was in excellent condition.');
  };

  return (
    <div className="space-y-6">
      {/* 1. TRUST SCORE CARD */}
      <section 
        aria-label="Trust Score Breakdown"
        className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xs space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              {onBackToHome && (
                <button
                  onClick={onBackToHome}
                  className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <span>🏠</span>
                  <span>Exit to Home</span>
                </button>
              )}
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                Campus Trust Score
              </h2>
              <span className="text-xs px-2 py-0.5 font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded">
                {trustTier} Tier
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Verified campus reputation reduces refundable deposit requirements for rentals
            </p>
          </div>

          <div className="text-right self-start sm:self-auto">
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
              {user.trustScore}
              <span className="text-xs font-normal text-zinc-400">/100</span>
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              Perk: {depositDiscountLabel}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, user.trustScore)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-zinc-500 dark:text-zinc-400 mt-1.5 tabular-nums">
            <span>New (0–54)</span>
            <span>Trusted (55–79)</span>
            <span>Campus Star (80–100)</span>
          </div>
        </div>

        {/* Next Tier target */}
        {nextTierInfo && (
          <div className="text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/40 p-2.5 rounded border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <span>
              🎯 <strong className="text-zinc-800 dark:text-zinc-200">{nextTierInfo.pointsNeeded} more points</strong> to reach{' '}
              <strong className="text-zinc-800 dark:text-zinc-200">{nextTierInfo.nextTier}</strong> ({nextTierInfo.perk})
            </span>
          </div>
        )}

        {/* Ways to grow trust */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-2">
            Ways to Grow Your Trust Score
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800/40 rounded border border-zinc-100 dark:border-zinc-800 flex flex-col justify-between">
              <div>
                <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
                  <span>Verify College Email</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">+20 pts</span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                  Authenticate your .ac.in / .edu institutional address.
                </p>
              </div>
              <div className="mt-2">
                {user.emailVerified ? (
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    ✓ Verified
                  </span>
                ) : (
                  <button
                    onClick={onOpenProfileVerification}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Verify Now (Demo OTP) →
                  </button>
                )}
              </div>
            </div>

            <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800/40 rounded border border-zinc-100 dark:border-zinc-800">
              <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
                <span>Return On-Time</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">+8 pts</span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                Hand back borrowed or rented items on or before the due date.
              </p>
            </div>

            <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800/40 rounded border border-zinc-100 dark:border-zinc-800">
              <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
                <span>Successfully Lend</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">+5 pts</span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                Complete a peer loan smoothly from accepted to returned.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SUB-NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveSubTab('requests')}
          className={`px-3 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'requests'
              ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
          }`}
        >
          Requests on My Items ({incomingRequests.length})
        </button>

        <button
          onClick={() => setActiveSubTab('outgoing')}
          className={`px-3 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'outgoing'
              ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
          }`}
        >
          Requests I Sent ({outgoingRequests.length})
        </button>

        <button
          onClick={() => setActiveSubTab('listings')}
          className={`px-3 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'listings'
              ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
          }`}
        >
          My Listings ({myListings.length})
        </button>
      </div>

      {/* 3. SUB-TAB CONTENT */}

      {/* A. REQUESTS ON MY ITEMS */}
      {activeSubTab === 'requests' && (
        <div className="space-y-4">
          {incomingRequests.length === 0 ? (
            <div className="text-center py-12 px-4 bg-zinc-50/50 dark:bg-zinc-900/30 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-500 dark:text-zinc-400">
              No incoming requests on your items at this time.
            </div>
          ) : (
            incomingRequests.map(req => {
              const checked = !!handoverChecks[req.id];
              return (
                <div
                  key={req.id}
                  className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{req.itemEmoji}</span>
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {req.itemTitle}
                        </h4>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                          Requested by <span className="font-semibold text-zinc-800 dark:text-zinc-200">{req.requesterName}</span> ({req.requesterTrustTier}, Score: {req.requesterTrustScore}) · {req.durationLabel}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs font-semibold px-2.5 py-1 rounded self-start sm:self-auto bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                      Status: {req.status}
                    </div>
                  </div>

                  <p className="text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/40 p-2.5 rounded border border-zinc-100 dark:border-zinc-800">
                    "{req.message}"
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400 pt-1">
                    <div>
                      Pickup Spot: <span className="font-semibold text-zinc-800 dark:text-zinc-200">📍 {req.pickupSpot}</span>
                    </div>
                    <div className="tabular-nums font-medium text-zinc-800 dark:text-zinc-200">
                      Deposit: {formatCurrency(req.depositPaid)} · Rent: {formatCurrency(req.calculatedRent)}
                    </div>
                  </div>

                  {/* Pending State Actions */}
                  {req.status === 'Pending' && (
                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2">
                      <button
                        onClick={() => onDeclineRequest(req.id)}
                        className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 font-medium cursor-pointer"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => onAcceptRequest(req.id)}
                        className="px-4 py-1.5 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 rounded transition-colors cursor-pointer"
                      >
                        Accept Request
                      </button>
                    </div>
                  )}

                  {/* Accepted State: Contact Unlocked & Safer Handover */}
                  {req.status === 'Accepted' && (
                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-md">
                        <div className="text-xs font-bold text-emerald-900 dark:text-emerald-300 mb-1 flex items-center justify-between">
                          <span>✓ Contact Unlocked</span>
                          <span className="font-normal font-mono text-[11px]">{req.requesterPhone}</span>
                        </div>
                        <p className="text-xs text-emerald-800 dark:text-emerald-400 mb-2">
                          Arrange physical handover with {req.requesterName} at {req.pickupSpot}.
                        </p>
                        <button
                          onClick={() => handleChatClick(req.requesterName, req.requesterPhone, req.pickupSpot, req.requesterId, req.itemTitle, req.itemEmoji)}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded transition-colors cursor-pointer"
                        >
                          💬 In-App Chat with {req.requesterName.split(' ')[0]}
                        </button>
                      </div>

                      {/* Safer Handover Checklist */}
                      <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-md space-y-2">
                        <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                          Handover Safety Checklist
                        </div>
                        <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={e =>
                              setHandoverChecks({ ...handoverChecks, [req.id]: e.target.checked })
                            }
                            className="w-4 h-4 rounded text-zinc-900 cursor-pointer"
                          />
                          <span>We checked the condition together (take a photo of the item).</span>
                        </label>

                        <div className="flex justify-end pt-1">
                          <button
                            disabled={!checked}
                            onClick={() => onConfirmHandover(req.id, 'owner')}
                            className={`px-4 py-1.5 text-xs font-semibold rounded transition-colors ${
                              checked
                                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 cursor-pointer'
                                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
                            }`}
                          >
                            Confirm Handover & Start Loan
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* In Use State */}
                  {req.status === 'In use' && (
                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="text-xs text-blue-700 dark:text-blue-400">
                        ⏰ Item currently with borrower. Due by {req.dueDate || 'end of loan'}. Reminder set!
                      </div>
                      <button
                        onClick={() => onCompleteReturn(req.id, 'owner')}
                        className="px-4 py-1.5 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 rounded cursor-pointer self-end sm:self-auto"
                      >
                        Confirm Return Received (+5 pts)
                      </button>
                    </div>
                  )}

                  {/* Returned State */}
                  {req.status === 'Returned' && (
                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      ✓ Loan completed & deposit returned. Peer rating recorded.
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* B. REQUESTS I SENT */}
      {activeSubTab === 'outgoing' && (
        <div className="space-y-4">
          {outgoingRequests.length === 0 ? (
            <div className="text-center py-12 px-4 bg-zinc-50/50 dark:bg-zinc-900/30 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-500 dark:text-zinc-400">
              You haven't requested any items yet. Browse items and borrow or rent gear you need!
            </div>
          ) : (
            outgoingRequests.map(req => {
              const checked = !!handoverChecks[req.id];
              const curRating = ratingInputs[req.id] || { stars: 5, text: '' };

              return (
                <div
                  key={req.id}
                  className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{req.itemEmoji}</span>
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {req.itemTitle}
                        </h4>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                          Owner: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{req.ownerName}</span> · Duration: {req.durationLabel}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs font-semibold px-2.5 py-1 rounded self-start sm:self-auto bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                      Status: {req.status}
                    </div>
                  </div>

                  <p className="text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/40 p-2.5 rounded border border-zinc-100 dark:border-zinc-800">
                    Your message: "{req.message}"
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <div>
                      Handover Spot: <span className="font-semibold text-zinc-800 dark:text-zinc-200">📍 {req.pickupSpot}</span>
                    </div>
                    <div className="tabular-nums font-medium text-zinc-800 dark:text-zinc-200">
                      Total Payable: {formatCurrency(req.totalPayable)}
                      {req.depositDiscountPercent > 0 && (
                        <span className="text-emerald-600 dark:text-emerald-400 ml-1">
                          ({req.depositDiscountPercent}% deposit savings)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pending State & Demo Accept Button */}
                  {req.status === 'Pending' && (
                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        Owner contact details remain hidden until accepted.
                      </div>
                      <button
                        onClick={() => onSimulateOwnerAccept(req.id)}
                        className="px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 rounded transition-colors cursor-pointer self-end sm:self-auto"
                        title="Simulate the owner accepting this request"
                      >
                        ⚡ Demo: Owner Accepts
                      </button>
                    </div>
                  )}

                  {/* Accepted State: Contact Unlocked Panel & Handover Checklist */}
                  {req.status === 'Accepted' && (
                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-md">
                        <div className="text-xs font-bold text-emerald-900 dark:text-emerald-300 mb-1 flex items-center justify-between">
                          <span>✓ Contact Details Unlocked</span>
                          <span className="font-mono text-[11px] font-normal">{req.ownerPhone}</span>
                        </div>
                        <p className="text-xs text-emerald-800 dark:text-emerald-400 mb-2">
                          Meet {req.ownerName} at {req.pickupSpot} to inspect and collect the item.
                        </p>
                        <button
                          onClick={() => handleChatClick(req.ownerName, req.ownerPhone, req.pickupSpot, req.ownerId, req.itemTitle, req.itemEmoji)}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded transition-colors cursor-pointer"
                        >
                          💬 In-App Chat with {req.ownerName.split(' ')[0]}
                        </button>
                      </div>

                      {/* Handover Safety Checklist */}
                      <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-md space-y-2">
                        <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                          Handover Safety Checklist
                        </div>
                        <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={e =>
                              setHandoverChecks({ ...handoverChecks, [req.id]: e.target.checked })
                            }
                            className="w-4 h-4 rounded text-zinc-900 cursor-pointer"
                          />
                          <span>We checked the condition together (take a photo).</span>
                        </label>

                        <div className="flex justify-end pt-1">
                          <button
                            disabled={!checked}
                            onClick={() => onConfirmHandover(req.id, 'requester')}
                            className={`px-4 py-1.5 text-xs font-semibold rounded transition-colors ${
                              checked
                                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 cursor-pointer'
                                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
                            }`}
                          >
                            Confirm Handover & Start Loan
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* In Use State */}
                  {req.status === 'In use' && (
                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                          Due Date: {req.dueDate || 'In 14 days'}
                        </div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          ⏰ Reminder set. Return on time to earn +8 Trust Score!
                        </div>
                      </div>

                      <button
                        onClick={() => onCompleteReturn(req.id, 'requester')}
                        className="px-4 py-1.5 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 rounded cursor-pointer self-end sm:self-auto"
                      >
                        Return Item to Owner
                      </button>
                    </div>
                  )}

                  {/* Returned State: 1-5 Star Rating Prompt */}
                  {req.status === 'Returned' && (
                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                      {req.rating ? (
                        <div className="text-xs text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                          <span className="text-amber-500 font-bold">
                            {'★'.repeat(req.rating)}{'☆'.repeat(5 - req.rating)}
                          </span>
                          <span>Rating submitted: "{req.review || 'Great loan!'}"</span>
                        </div>
                      ) : (
                        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded border border-zinc-200 dark:border-zinc-800 space-y-2">
                          <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                            Rate your experience with {req.ownerName}
                          </div>
                          <div className="flex items-center gap-1 text-lg cursor-pointer">
                            {[1, 2, 3, 4, 5].map(star => (
                              <button
                                key={star}
                                type="button"
                                onClick={() =>
                                  setRatingInputs({
                                    ...ratingInputs,
                                    [req.id]: { ...curRating, stars: star },
                                  })
                                }
                                className={`cursor-pointer ${
                                  star <= curRating.stars ? 'text-amber-500' : 'text-zinc-300 dark:text-zinc-700'
                                }`}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                          <input
                            type="text"
                            placeholder="Optional feedback (e.g. Item in top condition, smooth handover)..."
                            value={curRating.text}
                            onChange={e =>
                              setRatingInputs({
                                ...ratingInputs,
                                [req.id]: { ...curRating, text: e.target.value },
                              })
                            }
                            className="w-full px-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100"
                          />
                          <div className="flex justify-end pt-1">
                            <button
                              onClick={() => handleRatingSubmit(req.id)}
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 rounded cursor-pointer"
                            >
                              Submit Rating & Claim +8 Pts
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* C. MY LISTINGS */}
      {activeSubTab === 'listings' && (
        <div className="space-y-4">
          {myListings.length === 0 ? (
            <div className="text-center py-12 px-4 bg-zinc-50/50 dark:bg-zinc-900/30 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-500 dark:text-zinc-400">
              You haven't listed any items yet. Tap "+ Post Item" to share spare gear with students.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myListings.map(item => (
                <div
                  key={item.id}
                  className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-2xl p-1.5 bg-zinc-50 dark:bg-zinc-800 rounded border border-zinc-100 dark:border-zinc-800">
                        {item.emoji}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                        {item.isLent ? 'Currently Lent' : 'Available'}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1 mb-1">
                      {item.title}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-2">
                      {item.details}
                    </p>
                    <div className="text-[11px] text-zinc-600 dark:text-zinc-400 mb-3 font-mono">
                      📞 Contact: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{item.contactPhone || item.ownerPhone}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 tabular-nums">
                      {item.mode === 'giveaway'
                        ? 'Giveaway'
                        : item.mode === 'borrow'
                        ? 'Free Borrow'
                        : `${formatCurrency(item.rentPerDay)}/day`}
                    </span>

                    <button
                      onClick={() => onRemoveListing(item.id)}
                      className="text-xs font-medium text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
