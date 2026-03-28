import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Trash2, X, Hotel, Share2, Pencil, Check,
  UserPlus, Star, LogOut, Users,
} from 'lucide-react';

import useAuthStore from '@/stores/useAuthStore';
import {
  getMyLikeLists,
  getLikeListDetail,
  createLikeList,
  updateLikeList,
  deleteLikeList,
  addParticipant,
  removeParticipant,
  leaveList,
  removeHotelFromLikeList,
  type LikeListSummary,
  type HotelInList,
  type LikeListDetail,
} from '@/service/api/likeList';
import { PrimaryButton } from '@/component/common/button/PrimaryButton';

type Tab = 'mine' | 'shared';

interface SelectedList {
  id: number;
  name: string;
  isOwner: boolean;
}

const stripQuotes = (name: string) => name.replace(/^"|"$/g, '');

const StarRating = ({ value }: { value: number }) => (
  <span className="flex items-center gap-1 text-sm text-amber-500">
    <Star className="h-4 w-4 fill-amber-400 stroke-amber-400" />
    {value.toFixed(1)}
  </span>
);

const LikePage = () => {
  const { nickName } = useAuthStore();

  const [tab, setTab] = useState<Tab>('mine');
  const [allLists, setAllLists] = useState<LikeListSummary[]>([]);
  const [selectedList, setSelectedList] = useState<SelectedList | null>(null);
  const [detail, setDetail] = useState<LikeListDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');

  // Create / Rename
  const [showCreate, setShowCreate] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [creating, setCreating] = useState(false);
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Share modal (add / remove participant by email)
  const [showShare, setShowShare] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState('');

  // ─── Init ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    loadLists();
  }, []);

  useEffect(() => {
    if (renamingId !== null) renameInputRef.current?.focus();
  }, [renamingId]);

  const loadLists = async () => {
    setLoading(true);
    try {
      const data = await getMyLikeLists();
      setAllLists(Array.isArray(data) ? data : []);
    } catch {
      setError('목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const myLists = allLists.filter((l) => l.ownerNickname === nickName);
  const sharedLists = allLists.filter((l) => l.ownerNickname !== nickName);
  const visibleLists = tab === 'mine' ? myLists : sharedLists;

  // ─── Select list ─────────────────────────────────────────────────────────

  const handleSelectList = async (summary: LikeListSummary) => {
    const isOwner = summary.ownerNickname === nickName;
    setSelectedList({ id: summary.likeListId, name: summary.listName, isOwner });
    setDetail(null);
    setDetailLoading(true);
    try {
      const d = await getLikeListDetail(summary.likeListId);
      setDetail({
        ...d,
        participantUsernames: d.participantUsernames ?? [],
        hotels: {
          ...d.hotels,
          content: d.hotels?.content ?? [],
        },
      });
    } catch {
      setError('목록 상세를 불러오지 못했습니다.');
    } finally {
      setDetailLoading(false);
    }
  };

  // ─── Create list ─────────────────────────────────────────────────────────

  const handleCreateList = async () => {
    if (!newListName.trim() || creating) return;
    setCreating(true);
    try {
      const created = await createLikeList(newListName.trim());
      setNewListName('');
      setShowCreate(false);
      await loadLists();
      // auto-select the new list
      setSelectedList({ id: created.listId, name: created.listName, isOwner: true });
      const d = await getLikeListDetail(created.listId);
      setDetail({
        ...d,
        participantUsernames: d.participantUsernames ?? [],
        hotels: { ...d.hotels, content: d.hotels?.content ?? [] },
      });
    } catch (e) {
      setError(typeof e === 'string' ? e : '목록 생성에 실패했습니다.');
    } finally {
      setCreating(false);
    }
  };

  // ─── Rename list ─────────────────────────────────────────────────────────

  const handleStartRename = (summary: LikeListSummary, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingId(summary.likeListId);
    setRenameValue(summary.listName);
  };

  const handleConfirmRename = async (listId: number) => {
    if (!renameValue.trim()) { setRenamingId(null); return; }
    try {
      await updateLikeList(listId, renameValue.trim());
      setAllLists((prev) =>
        prev.map((l) => l.likeListId === listId ? { ...l, listName: renameValue.trim() } : l),
      );
      if (selectedList?.id === listId) {
        setSelectedList((prev) => prev && { ...prev, name: renameValue.trim() });
        setDetail((prev) => prev && { ...prev, listName: renameValue.trim() });
      }
    } catch {
      setError('이름 변경에 실패했습니다.');
    } finally {
      setRenamingId(null);
    }
  };

  // ─── Delete list ─────────────────────────────────────────────────────────

  const handleDeleteList = async (listId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('목록을 삭제하시겠습니까?')) return;
    try {
      await deleteLikeList(listId);
      setAllLists((prev) => prev.filter((l) => l.likeListId !== listId));
      if (selectedList?.id === listId) { setSelectedList(null); setDetail(null); }
    } catch {
      setError('목록 삭제에 실패했습니다.');
    }
  };

  // ─── Leave list (participant) ─────────────────────────────────────────────

  const handleLeaveList = async (listId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('목록에서 나가시겠습니까?')) return;
    try {
      await leaveList(listId);
      setAllLists((prev) => prev.filter((l) => l.likeListId !== listId));
      if (selectedList?.id === listId) { setSelectedList(null); setDetail(null); }
    } catch {
      setError('목록 나가기에 실패했습니다.');
    }
  };

  // ─── Participants ─────────────────────────────────────────────────────────

  const handleAddParticipant = async () => {
    if (!selectedList || !shareEmail.trim()) return;
    setShareLoading(true);
    setShareError('');
    try {
      await addParticipant(selectedList.id, shareEmail.trim());
      const d = await getLikeListDetail(selectedList.id);
      setDetail(d);
      setAllLists((prev) =>
        prev.map((l) =>
          l.likeListId === selectedList.id
            ? { ...l, numberOfParticipants: l.numberOfParticipants + 1 }
            : l,
        ),
      );
      setShareEmail('');
      setShowShare(false);
    } catch {
      setShareError('초대에 실패했습니다. 이메일을 확인해주세요.');
    } finally {
      setShareLoading(false);
    }
  };

  const handleRemoveParticipant = async (email: string) => {
    if (!selectedList) return;
    try {
      await removeParticipant(selectedList.id, email);
      setDetail((prev) =>
        prev && {
          ...prev,
          participantUsernames: prev.participantUsernames.filter((u) => u !== email),
        },
      );
    } catch {
      setError('참여자 제거에 실패했습니다.');
    }
  };

  // ─── Remove hotel ─────────────────────────────────────────────────────────

  const handleRemoveHotel = async (hotelId: number) => {
    if (!selectedList) return;
    try {
      await removeHotelFromLikeList(selectedList.id, hotelId);
      setDetail((prev) =>
        prev && {
          ...prev,
          hotels: {
            ...prev.hotels,
            content: prev.hotels.content.filter((h) => h.hotelId !== hotelId),
          },
        },
      );
    } catch {
      setError('호텔 삭제에 실패했습니다.');
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  if (loading) {
    return <div className="py-16 text-center text-gray-400">불러오는 중...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">좋아요 목록</h1>
        {tab === 'mine' && (
          <PrimaryButton size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="mr-1 inline h-4 w-4" />새 목록
          </PrimaryButton>
        )}
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
          <button className="ml-2 text-red-400 hover:text-red-600" onClick={() => setError('')}>
            <X className="inline h-3 w-3" />
          </button>
        </p>
      )}

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl bg-gray-100 p-1">
        {(['mine', 'shared'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setSelectedList(null); setDetail(null); }}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'mine' ? `내 목록 (${myLists.length})` : `공유된 목록 (${sharedLists.length})`}
          </button>
        ))}
      </div>

      {/* New list input */}
      {tab === 'mine' && showCreate && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-4">
          <input
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="새 목록 이름"
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400 disabled:bg-gray-50"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCreateList();
              }
            }}
            disabled={creating}
            autoFocus
          />
          <PrimaryButton
            size="sm"
            onClick={handleCreateList}
            disabled={!newListName.trim() || creating}
          >
            {creating ? '생성 중...' : '만들기'}
          </PrimaryButton>
          <button
            onClick={() => { setShowCreate(false); setNewListName(''); }}
            disabled={creating}
            className="rounded-lg p-2 text-gray-400 hover:text-gray-600 disabled:opacity-40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Empty state */}
      {visibleLists.length === 0 && !(tab === 'mine' && showCreate) && (
        <div className="py-20 text-center text-gray-400">
          <Hotel className="mx-auto mb-3 h-12 w-12 opacity-30" />
          {tab === 'mine'
            ? <><p>좋아요 목록이 없습니다.</p><p className="mt-1 text-sm">새 목록을 만들어 호텔을 저장해보세요!</p></>
            : <p>공유된 목록이 없습니다.</p>}
        </div>
      )}

      {/* Main layout */}
      {visibleLists.length > 0 && (
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-60 flex-shrink-0 space-y-2">
            {visibleLists.map((summary) => {
              const isOwner = summary.ownerNickname === nickName;
              return (
                <div
                  key={summary.likeListId}
                  onClick={() => handleSelectList(summary)}
                  className={`group flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-colors ${
                    selectedList?.id === summary.likeListId
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  {renamingId === summary.likeListId ? (
                    <input
                      ref={renameInputRef}
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleConfirmRename(summary.likeListId);
                        if (e.key === 'Escape') setRenamingId(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="min-w-0 flex-1 rounded border border-blue-300 px-2 py-0.5 text-sm outline-none"
                    />
                  ) : (
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-gray-800">
                        {stripQuotes(summary.listName)}
                      </span>
                      {!isOwner && (
                        <span className="text-xs text-gray-400">{summary.ownerNickname}</span>
                      )}
                      {summary.numberOfParticipants > 0 && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Users className="h-3 w-3" />
                          {summary.numberOfParticipants}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="ml-2 flex flex-shrink-0 items-center gap-1"
                    onClick={(e) => e.stopPropagation()}>
                    {renamingId === summary.likeListId ? (
                      <button onClick={() => handleConfirmRename(summary.likeListId)}
                        className="text-blue-500 hover:text-blue-700">
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    ) : isOwner ? (
                      <>
                        <button
                          onClick={(e) => handleStartRename(summary, e)}
                          className="text-gray-300 opacity-0 transition-opacity group-hover:opacity-100 hover:text-blue-500"
                          title="이름 변경"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteList(summary.likeListId, e)}
                          className="text-gray-300 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-500"
                          title="삭제"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={(e) => handleLeaveList(summary.likeListId, e)}
                        className="text-gray-300 opacity-0 transition-opacity group-hover:opacity-100 hover:text-orange-500"
                        title="목록 나가기"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right panel */}
          {selectedList ? (
            <div className="min-w-0 flex-1">
              {/* Panel header */}
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">{stripQuotes(selectedList.name)}</h2>
                  {detail && !selectedList.isOwner && (
                    <p className="text-xs text-gray-400">소유자: {detail.ownerNickname}</p>
                  )}
                </div>
                {selectedList.isOwner && (
                  <button
                    onClick={() => { setShowShare(true); setShareEmail(''); setShareError(''); }}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    <Share2 className="h-4 w-4" />
                    참여자 관리
                  </button>
                )}
              </div>

              {detailLoading ? (
                <p className="py-10 text-center text-gray-400">불러오는 중...</p>
              ) : !detail ? null : (
                <>
                  {/* Hotel list */}
                  {detail.hotels.content.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center text-gray-400">
                      <Hotel className="mx-auto mb-3 h-10 w-10 opacity-30" />
                      <p>저장된 호텔이 없습니다.</p>
                      <p className="mt-1 text-sm">호텔 상세 페이지에서 좋아요 버튼을 눌러보세요!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {detail.hotels.content.map((hotel: HotelInList) => (
                        <div
                          key={hotel.hotelId}
                          className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5"
                        >
                          <div className="flex min-w-0 items-center gap-5">
                            {hotel.mainImageUrl ? (
                              <img
                                src={hotel.mainImageUrl}
                                alt={hotel.name}
                                className="h-40 w-40 flex-shrink-0 rounded-xl object-cover"
                              />
                            ) : (
                              <div className="flex h-40 w-40 flex-shrink-0 items-center justify-center rounded-xl bg-gray-100">
                                <Hotel className="h-10 w-10 text-gray-400" />
                              </div>
                            )}
                            <div className="min-w-0 space-y-1">
                              <Link
                                to={`/hotels/${hotel.hotelId}`}
                                className="block truncate text-base font-semibold text-blue-600 hover:underline"
                              >
                                {hotel.name}
                              </Link>
                              <p className="truncate text-sm text-gray-500">{hotel.address}</p>
                              <StarRating value={hotel.rating} />
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveHotel(hotel.hotelId)}
                            className="ml-4 flex-shrink-0 rounded-lg p-2 text-gray-300 hover:bg-red-50 hover:text-red-500"
                            title="목록에서 제거"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Participants (owner view) */}
                  {selectedList.isOwner && detail.participantUsernames.length > 0 && (
                    <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50 p-4">
                      <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                        <Users className="h-4 w-4" />
                        참여자 ({detail.participantUsernames.length})
                      </h3>
                      <div className="space-y-2">
                        {detail.participantUsernames.map((username) => (
                          <div key={username}
                            className="flex items-center justify-between rounded-lg bg-white px-3 py-2">
                            <span className="text-sm text-gray-700">{username}</span>
                            <button
                              onClick={() => handleRemoveParticipant(username)}
                              className="text-xs text-gray-400 hover:text-red-500"
                            >
                              제거
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center text-gray-400">
              <p>목록을 선택하세요</p>
            </div>
          )}
        </div>
      )}

      {/* Share / participant modal */}
      {showShare && selectedList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <UserPlus className="h-5 w-5 text-blue-500" />
                참여자 초대
              </h3>
              <button onClick={() => setShowShare(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-4 text-sm text-gray-500">
              초대할 사용자의 이메일을 입력하세요.
              <br />
              초대된 사용자는 호텔을 추가·삭제할 수 있습니다.
            </p>
            <input
              type="email"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              placeholder="example@email.com"
              className="mb-2 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400"
              onKeyDown={(e) => e.key === 'Enter' && handleAddParticipant()}
              autoFocus
            />
            {shareError && <p className="mb-3 text-xs text-red-500">{shareError}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => setShowShare(false)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
              >
                취소
              </button>
              <PrimaryButton
                size="sm" full
                onClick={handleAddParticipant}
                disabled={shareLoading || !shareEmail.trim()}
              >
                {shareLoading ? '처리 중...' : '초대하기'}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LikePage;
