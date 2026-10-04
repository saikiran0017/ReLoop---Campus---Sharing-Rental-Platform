import React, { useState } from 'react';
import { WantedRequest, Category, UserProfile } from '../types';

interface WantedBoardProps {
  wantedList: WantedRequest[];
  onIHaveThis: (wanted: WantedRequest) => void;
  onAddWanted: (newWanted: WantedRequest) => void;
  currentUser: UserProfile;
  onBackToHome?: () => void;
  onShowToast: (msg: string) => void;
}

export const WantedBoard: React.FC<WantedBoardProps> = ({
  wantedList,
  onIHaveThis,
  onAddWanted,
  currentUser,
  onBackToHome,
  onShowToast,
}) => {
  const [showPostModal, setShowPostModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('Stationery');
  const [notes, setNotes] = useState('');

  const activeWanted = wantedList.filter(w => w.status === 'active');

  const handleCreateWanted = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      onShowToast('Please describe what you are looking for.');
      return;
    }

    const newReq: WantedRequest = {
      id: `wanted-${Date.now()}`,
      title: title.trim(),
      category,
      notes: notes.trim(),
      studentName: `${currentUser.name} (${currentUser.yearOfStudy} · ${currentUser.educationType === 'PUC' ? 'PUC' : currentUser.major.split(' ')[0]})`,
      studentMajor: currentUser.major,
      postedDate: 'Just now',
      status: 'active',
    };

    onAddWanted(newReq);
    onShowToast('Wanted request posted! Campus peers will be alerted if they have this.');
    setTitle('');
    setNotes('');
    setShowPostModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header and Call to Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 transition-colors cursor-pointer"
              >
                <span>🏠</span>
                <span>Exit to Home</span>
              </button>
            )}
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              Campus Wanted Board
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Can't find what you need in the catalog? Post a request or help a peer by lending your spare gear.
          </p>
        </div>

        <button
          onClick={() => setShowPostModal(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 rounded-md transition-colors cursor-pointer self-start sm:self-auto shrink-0"
        >
          + Request an Item
        </button>
      </div>

      {/* Wanted Request Cards Grid */}
      {activeWanted.length === 0 ? (
        <div className="text-center py-16 px-4 bg-zinc-50 dark:bg-zinc-900/30 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            No active wanted requests right now.
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mb-4">
            Need a mini drafter, specialized multimeter, textbook, or sports kit? Be the first to post a request!
          </p>
          <button
            onClick={() => setShowPostModal(true)}
            className="px-3 py-1.5 text-xs font-medium text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            Post a Request
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeWanted.map(wanted => (
            <div
              key={wanted.id}
              className="flex flex-col justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xs hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 mb-1.5">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    {wanted.category}
                  </span>
                  <span>{wanted.postedDate}</span>
                </div>

                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                  {wanted.title}
                </h3>

                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4 bg-zinc-50 dark:bg-zinc-800/40 p-2.5 rounded border border-zinc-100 dark:border-zinc-800">
                  "{wanted.notes}"
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate max-w-[130px]">
                  👤 {wanted.studentName}
                </span>

                <button
                  onClick={() => onIHaveThis(wanted)}
                  className="px-3 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded transition-colors cursor-pointer shrink-0"
                >
                  I have this →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post a Wanted Request Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Post What You Need
              </h3>
              <button
                onClick={() => setShowPostModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 font-mono text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateWanted} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  What item do you need? *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Mini drafter for 1st-sem EG, or Multimeter"
                  className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100 focus:outline-zinc-900 dark:focus:outline-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as Category)}
                  className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100"
                >
                  <option value="Stationery">Stationery</option>
                  <option value="Books">Books</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Sports">Sports</option>
                  <option value="Hostel">Hostel</option>
                  <option value="Lab">Lab</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Details & Urgency
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Specify deadline (e.g. need by Friday lab session), specifications, or preferred pickup spot..."
                  className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100 focus:outline-zinc-900 dark:focus:outline-zinc-100"
                />
              </div>

              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 rounded cursor-pointer"
                >
                  Post to Campus Board
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
