import { useEffect, useState } from 'react';
import { X, Plus, Hotel, Check, Star } from 'lucide-react';

import {
  getMyLikeLists,
  createLikeList,
  addHotelToLikeList,
  type LikeListSummary,
} from '@/service/api/likeList';

interface Props {
  hotelId: number;
  isOpen: boolean;
  onClose: () => void;
}

const LikeListPickerModal = ({ hotelId, isOpen, onClose }: Props) => {
  const [lists, setLists] = useState<LikeListSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());
  const [error, setError] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    setAddedIds(new Set());
    setShowCreate(false);
    setNewListName('');
    setLoading(true);

    getMyLikeLists()
      .then(setLists)
      .catch(() => setError('목록을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, [isOpen]);

  const handleAdd = async (listId: number) => {
    if (addedIds.has(listId)) return;
    try {
      await addHotelToLikeList(listId, hotelId);
      setAddedIds((prev) => new Set(prev).add(listId));
    } catch {
      setError('호텔 추가에 실패했습니다.');
    }
  };

  const handleCreateAndAdd = async () => {
    if (!newListName.trim() || creating) return;
    setCreating(true);
    try {
      const created = await createLikeList(newListName.trim());
      await addHotelToLikeList(created.listId, hotelId);
      setLists((prev) => [
        {
          likeListId: created.listId,
          listName: created.listName,
          ownerNickname: '',
          numberOfParticipants: 0,
        },
        ...prev,
      ]);
      setAddedIds((prev) => new Set(prev).add(created.listId));
      setNewListName('');
      setShowCreate(false);
    } catch (e) {
      setError(typeof e === 'string' ? e : '목록 생성 또는 호텔 추가에 실패했습니다.');
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="text-base font-semibold text-gray-800">좋아요 목록에 추가</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-80 overflow-y-auto p-4">
          {error && (
            <p className="mb-3 rounded-lg bg-red-50 p-2 text-xs text-red-600">{error}</p>
          )}

          {loading ? (
            <p className="py-8 text-center text-sm text-gray-400">불러오는 중...</p>
          ) : lists.length === 0 && !showCreate ? (
            <div className="py-8 text-center text-sm text-gray-400">
              <Hotel className="mx-auto mb-2 h-8 w-8 opacity-30" />
              <p>아직 목록이 없습니다.</p>
              <p className="mt-0.5 text-xs">새 목록을 만들어보세요.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {lists.map((list) => {
                const added = addedIds.has(list.likeListId);
                return (
                  <button
                    key={list.likeListId}
                    onClick={() => handleAdd(list.likeListId)}
                    disabled={added}
                    className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-colors ${
                      added
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Hotel className="h-4 w-4 text-gray-400" />
                      <div>
                        <span className="block text-sm font-medium text-gray-800">
                          {list.listName}
                        </span>
                        {list.numberOfParticipants > 0 && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Star className="h-3 w-3" />
                            참여자 {list.numberOfParticipants}명
                          </span>
                        )}
                      </div>
                    </div>
                    {added ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Plus className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Create new list */}
          {showCreate ? (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 p-3">
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="새 목록 이름"
                className="flex-1 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-blue-400 disabled:bg-gray-50"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCreateAndAdd();
                  }
                }}
                disabled={creating}
                autoFocus
              />
              <button
                onClick={handleCreateAndAdd}
                disabled={!newListName.trim() || creating}
                className="rounded-lg bg-blue-500 px-3 py-1.5 text-sm text-white hover:bg-blue-600 disabled:opacity-50"
              >
                {creating ? '...' : '만들기'}
              </button>
              <button
                onClick={() => { setShowCreate(false); setNewListName(''); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowCreate(true)}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-gray-300 py-2.5 text-sm text-gray-500 hover:border-blue-300 hover:text-blue-500"
            >
              <Plus className="h-4 w-4" />새 목록 만들기
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-5 py-3">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-gray-100 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default LikeListPickerModal;
