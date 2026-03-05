import client from '../instance/client';
import handleApiReqeust from './handleApiReqeust';

// ─── Response types ───────────────────────────────────────────────────────────

/** GET /api/likes/my  – one item per list */
export interface LikeListSummary {
  likeListId: number;
  listName: string;
  ownerNickname: string;
  numberOfParticipants: number;
}

/** GET /api/likes/{listId}  – full detail including hotels & participants */
export interface HotelInList {
  hotelId: number;
  name: string;
  address: string;
  starLevel: number;
  rating: number;
  reviewCount: number;
  mainImageUrl: string;
}

export interface LikeListDetail {
  listName: string;
  ownerNickname: string;
  participantUsernames: string[];
  hotels: {
    content: HotelInList[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
    last: boolean;
    empty: boolean;
  };
}

/** POST /api/likes */
export interface CreateLikeListResponse {
  listId: number;
  customerId: number;
  listName: string;
}

// ─── API functions ────────────────────────────────────────────────────────────

interface PageResult<T> {
  content: T[];
}

/** My like lists (owned + participating) */
export const getMyLikeLists = async (): Promise<LikeListSummary[]> => {
  const data = await handleApiReqeust<PageResult<LikeListSummary>>(() => client.get('/api/likes/my'));
  return data.content;
};

/** Full detail of one list (hotels + participants) */
export const getLikeListDetail = async (listId: number) =>
  handleApiReqeust<LikeListDetail>(() => client.get(`/api/likes/${listId}`));

/** Create a new like list */
export const createLikeList = async (listName: string) =>
  handleApiReqeust<CreateLikeListResponse>(() =>
    client.post('/api/likes', undefined, { params: { listName } }),
  );

/** Rename a like list (owner only) */
export const updateLikeList = async (listId: number, listName: string) =>
  handleApiReqeust<string>(() =>
    client.put(`/api/likes/${listId}`, undefined, { params: { listName } }),
  );

/** Delete a like list (owner only) */
export const deleteLikeList = async (listId: number) =>
  handleApiReqeust<string>(() => client.delete(`/api/likes/${listId}`));

/** Add hotel to list – hotelId in path, no request body */
export const addHotelToLikeList = async (listId: number, hotelId: number) =>
  handleApiReqeust<unknown>(() =>
    client.post(`/api/likes/${listId}/hotels/${hotelId}`),
  );

/** Remove hotel from list */
export const removeHotelFromLikeList = async (listId: number, hotelId: number) =>
  handleApiReqeust<unknown>(() =>
    client.delete(`/api/likes/${listId}/hotels/${hotelId}`),
  );

/** Invite participant by email (owner only) */
export const addParticipant = async (listId: number, invitedEmail: string) =>
  handleApiReqeust<string>(() =>
    client.post(`/api/likes/${listId}/owners/participants`, { invitedEmail }),
  );

/** Remove participant by email (owner only) */
export const removeParticipant = async (listId: number, invitedEmail: string) =>
  handleApiReqeust<string>(() =>
    client.delete(`/api/likes/${listId}/owners/participants`, {
      data: { invitedEmail },
    }),
  );

/** Leave a list you were invited to (participant only) */
export const leaveList = async (listId: number) =>
  handleApiReqeust<string>(() =>
    client.delete(`/api/likes/${listId}/participants`),
  );
