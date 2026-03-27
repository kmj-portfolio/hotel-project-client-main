import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Plus, Pencil, Trash2, X, Star, Camera } from 'lucide-react';

import { getProviderProfile } from '@/service/api/auth';
import { geocodeAddress, geocodeInternationalAddress, toErrorMessage } from '@/service/api/geocode';
import {
  createHotel,
  getProviderHotelDetail,
  updateHotel,
  deleteHotel,
  getRoomsByHotel,
  createRoom,
  updateRoom,
  deleteRoom,
  uploadHotelPhoto,
  uploadRoomPhoto,
  uploadRoomPhotos,
  deletePhoto,
} from '@/service/api/hotelManage';
import useAuthStore from '@/stores/useAuthStore';
import { PrimaryButton } from '@/component/common/button/PrimaryButton';
import RHFInput from '@/component/common/input/RHFInput';
import KakaoAddressInput from '@/component/common/input/KakaoAddressInput';
import type { HotelDetail } from '@/types/hotel';
import type { RoomInfo } from '@/types/room/room';

/* ── Zod Schemas ─────────────────────────────────────────────── */

const HotelSchema = z.object({
  name: z.string().min(2, '호텔명은 2자 이상이어야 합니다.'),
  address: z.string().min(5, '주소를 입력해주세요.'),
  description: z.string().min(10, '설명은 10자 이상이어야 합니다.'),
  starLevel: z.coerce
    .number({ invalid_type_error: '성급을 선택해주세요.' })
    .int()
    .min(1)
    .max(5),
});
type HotelFormData = z.infer<typeof HotelSchema>;

const RoomSchema = z.object({
  roomType: z.string().min(1, '객실 유형을 입력해주세요.'),
  description: z.string().min(5, '설명은 5자 이상이어야 합니다.'),
  price: z.coerce.number({ invalid_type_error: '가격을 입력해주세요.' }).int().min(1),
  occupancy: z.coerce.number({ invalid_type_error: '인원을 입력해주세요.' }).int().min(1),
  totalQuantity: z.coerce.number({ invalid_type_error: '수량을 입력해주세요.' }).int().min(1),
});
type RoomFormData = z.infer<typeof RoomSchema>;

/* ── Helpers ─────────────────────────────────────────────────── */


/* ── Sub-component: Address Type Toggle ─────────────────────── */

interface AddressTypeToggleProps {
  isOverseas: boolean;
  onChange: (overseas: boolean) => void;
}

const AddressTypeToggle = ({ isOverseas, onChange }: AddressTypeToggleProps) => (
  <div className="flex overflow-hidden rounded-lg border border-gray-200 text-sm w-fit">
    <button
      type="button"
      onClick={() => onChange(false)}
      className={`px-4 py-1.5 transition-colors ${
        !isOverseas ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
      }`}
    >
      국내
    </button>
    <button
      type="button"
      onClick={() => onChange(true)}
      className={`px-4 py-1.5 transition-colors ${
        isOverseas ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
      }`}
    >
      해외
    </button>
  </div>
);

/* ── Sub-component: Hotel Photo Input ───────────────────────── */

interface HotelPhotoInputProps {
  currentPhotoUrl?: string;
  onChange: (file: File | null) => void;
}

const HotelPhotoInput = ({ currentPhotoUrl, onChange }: HotelPhotoInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      onChange(file);
    } else {
      setPreviewUrl(null);
      onChange(null);
    }
  };

  const displayUrl = previewUrl ?? currentPhotoUrl ?? null;

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">대표 사진</label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50 transition-colors"
      >
        {displayUrl ? (
          <img src={displayUrl} alt="호텔 대표 사진" className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <Camera className="h-8 w-8" />
            <span className="text-sm">클릭하여 사진 업로드</span>
          </div>
        )}
        {displayUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
            <Camera className="h-8 w-8 text-white" />
            <span className="ml-2 text-sm font-medium text-white">사진 변경</span>
          </div>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

/* ── Sub-component: Room Form ──────────────────────────────── */

interface RoomPhotos {
  main: File | null;
  additional: File[];
}

interface RoomFormProps {
  defaultValues?: Partial<RoomFormData>;
  onSubmit: (data: RoomFormData, photos: RoomPhotos) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
  showPhotoUpload?: boolean;
}

const RoomForm = ({ defaultValues, onSubmit, onCancel, submitLabel, showPhotoUpload }: RoomFormProps) => {
  const { control, handleSubmit, formState } = useForm<RoomFormData>({
    resolver: zodResolver(RoomSchema),
    defaultValues,
    mode: 'onSubmit',
  });
  const [submitting, setSubmitting] = useState(false);
  const [mainPhoto, setMainPhoto] = useState<File | null>(null);
  const [mainPreview, setMainPreview] = useState<string | null>(null);
  const [additionalPhotos, setAdditionalPhotos] = useState<File[]>([]);
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([]);
  const mainInputRef = useRef<HTMLInputElement>(null);
  const additionalInputRef = useRef<HTMLInputElement>(null);

  const handleMainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (mainPreview) URL.revokeObjectURL(mainPreview);
    if (file) {
      setMainPhoto(file);
      setMainPreview(URL.createObjectURL(file));
    } else {
      setMainPhoto(null);
      setMainPreview(null);
    }
  };

  const handleAdditionalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const previews = files.map((f) => URL.createObjectURL(f));
    setAdditionalPhotos((prev) => [...prev, ...files]);
    setAdditionalPreviews((prev) => [...prev, ...previews]);
    if (additionalInputRef.current) additionalInputRef.current.value = '';
  };

  const removeAdditional = (idx: number) => {
    URL.revokeObjectURL(additionalPreviews[idx]);
    setAdditionalPhotos((prev) => prev.filter((_, i) => i !== idx));
    setAdditionalPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleFormSubmit = async (data: RoomFormData) => {
    setSubmitting(true);
    try {
      await onSubmit(data, { main: mainPhoto, additional: additionalPhotos });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3">
      {formState.errors.root?.message && (
        <p className="text-sm text-red-500">{formState.errors.root.message}</p>
      )}

      {showPhotoUpload && (
        <div className="space-y-3">
          {/* Main photo */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">대표 사진</label>
            <button
              type="button"
              onClick={() => mainInputRef.current?.click()}
              className="relative flex h-36 w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              {mainPreview ? (
                <img src={mainPreview} alt="대표 사진 미리보기" className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <Camera className="h-7 w-7" />
                  <span className="text-sm">클릭하여 대표 사진 업로드</span>
                </div>
              )}
              {mainPreview && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                  <Camera className="h-6 w-6 text-white" />
                  <span className="ml-2 text-sm font-medium text-white">사진 변경</span>
                </div>
              )}
            </button>
            <input ref={mainInputRef} type="file" accept="image/*" className="hidden" onChange={handleMainChange} />
          </div>

          {/* Additional photos */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">추가 사진</label>
            {additionalPreviews.length > 0 && (
              <div className="mb-2 grid grid-cols-4 gap-2">
                {additionalPreviews.map((url, idx) => (
                  <div key={url} className="relative overflow-hidden rounded-lg">
                    <img src={url} alt={`추가 사진 ${idx + 1}`} className="h-20 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeAdditional(idx)}
                      className="absolute right-0.5 top-0.5 rounded-full bg-red-500 p-0.5 text-white hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => additionalInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-2 text-sm text-gray-500 hover:bg-gray-50"
            >
              <Plus className="h-4 w-4" />
              추가 사진 업로드
            </button>
            <input ref={additionalInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleAdditionalChange} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <RHFInput name="roomType" label="객실 유형" placeholder="디럭스, 스위트 등" control={control} />
        <RHFInput name="price" label="1박 가격 (원)" type="number" placeholder="100000" control={control} />
        <RHFInput name="occupancy" label="최대 인원" type="number" placeholder="2" control={control} />
        <RHFInput name="totalQuantity" label="객실 수량" type="number" placeholder="5" control={control} />
      </div>
      <RHFInput name="description" label="설명" placeholder="객실 설명을 입력해주세요" control={control} />

      <div className="flex gap-2">
        <PrimaryButton size="sm" disabled={submitting}>
          {submitLabel}
        </PrimaryButton>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-gray-200 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
        >
          취소
        </button>
      </div>
    </form>
  );
};

/* ── Sub-component: Room Photo Modal ──────────────────────── */

interface RoomPhotoModalProps {
  room: RoomInfo;
  onClose: () => void;
  onUpdate: (updates: Partial<Pick<RoomInfo, 'mainImageUrl' | 'additionalPhotoUrls'>>) => void;
}

const RoomPhotoModal = ({ room, onClose, onUpdate }: RoomPhotoModalProps) => {
  const mainInputRef = useRef<HTMLInputElement>(null);
  const additionalInputRef = useRef<HTMLInputElement>(null);
  const [mainUrl, setMainUrl] = useState<string | undefined>(room.mainImageUrl);
  const [additionalUrls, setAdditionalUrls] = useState<string[]>(room.additionalPhotoUrls ?? []);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleUploadMain = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const result = await uploadRoomPhoto(room.roomId, file, 'MAIN');
      const newUrl = result.photoUrl;
      setMainUrl(newUrl);
      onUpdate({ mainImageUrl: newUrl });
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setUploading(false);
      if (mainInputRef.current) mainInputRef.current.value = '';
    }
  };

  const handleDeleteMain = async () => {
    if (!mainUrl) return;
    const filename = mainUrl.split('/').pop();
    if (!filename) return;
    setUploading(true);
    setError('');
    try {
      await deletePhoto(filename);
      setMainUrl(undefined);
      onUpdate({ mainImageUrl: undefined });
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const handleUploadAdditional = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    setError('');
    try {
      const displayTypes = files.map(() => 'ADDITIONAL' as const);
      const results = await uploadRoomPhotos(room.roomId, files, displayTypes);
      const newUrls = results.map((r) => r.photoUrl);
      const updated = [...additionalUrls, ...newUrls];
      setAdditionalUrls(updated);
      onUpdate({ additionalPhotoUrls: updated });
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setUploading(false);
      if (additionalInputRef.current) additionalInputRef.current.value = '';
    }
  };

  const handleDeleteAdditional = async (url: string) => {
    const filename = url.split('/').pop();
    if (!filename) return;
    setUploading(true);
    setError('');
    try {
      await deletePhoto(filename);
      const updated = additionalUrls.filter((u) => u !== url);
      setAdditionalUrls(updated);
      onUpdate({ additionalPhotoUrls: updated });
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">{room.roomType} — 사진 관리</h3>
          <button onClick={onClose} disabled={uploading}>
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {error && <p className="mb-3 rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</p>}

        {/* Main Photo */}
        <div className="mb-5">
          <p className="mb-2 text-sm font-medium text-gray-700">대표 사진</p>
          {mainUrl ? (
            <div className="relative overflow-hidden rounded-xl">
              <img src={mainUrl} alt="대표 사진" className="h-48 w-full object-cover" />
              <div className="absolute bottom-2 right-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => mainInputRef.current?.click()}
                  disabled={uploading}
                  className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-white disabled:opacity-50"
                >
                  변경
                </button>
                <button
                  type="button"
                  onClick={handleDeleteMain}
                  disabled={uploading}
                  className="rounded-lg bg-red-500/90 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500 disabled:opacity-50"
                >
                  삭제
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => mainInputRef.current?.click()}
              disabled={uploading}
              className="flex h-32 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-sm text-gray-400 hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50"
            >
              <Camera className="h-5 w-5" />
              대표 사진 업로드
            </button>
          )}
          <input
            ref={mainInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUploadMain}
          />
        </div>

        {/* Additional Photos */}
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">추가 사진</p>
          {additionalUrls.length > 0 && (
            <div className="mb-3 grid grid-cols-3 gap-2">
              {additionalUrls.map((url) => (
                <div key={url} className="relative overflow-hidden rounded-xl">
                  <img src={url} alt="추가 사진" className="h-24 w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleDeleteAdditional(url)}
                    disabled={uploading}
                    className="absolute right-1 top-1 rounded-full bg-red-500 p-0.5 text-white hover:bg-red-600 disabled:opacity-50"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => additionalInputRef.current?.click()}
            disabled={uploading}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-2 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            추가 사진 업로드
          </button>
          <input
            ref={additionalInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleUploadAdditional}
          />
        </div>

        {uploading && <p className="mt-3 text-center text-sm text-blue-500">처리 중...</p>}
      </div>
    </div>
  );
};

/* ── Sub-component: Room Card ──────────────────────────────── */

interface RoomCardProps {
  room: RoomInfo;
  onEdit: (room: RoomInfo) => void;
  onDelete: (roomId: number) => void;
  onManagePhotos: (room: RoomInfo) => void;
}

const RoomCard = ({ room, onEdit, onDelete, onManagePhotos }: RoomCardProps) => (
  <div className="rounded-xl border border-gray-200 bg-white p-4">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        {room.mainImageUrl && (
          <img
            src={room.mainImageUrl}
            alt={room.roomType}
            className="mb-3 h-32 w-full rounded-lg object-cover"
          />
        )}
        <p className="font-semibold text-gray-800">{room.roomType}</p>
        <p className="mt-1 text-sm text-gray-500">{room.description}</p>
        <div className="mt-2 flex gap-4 text-sm text-gray-600">
          <span>{room.price.toLocaleString()}원/박</span>
          <span>최대 {room.maxOccupancy}인</span>
          <span>총 {room.totalQuantity}실</span>
        </div>
      </div>
      <div className="ml-3 flex gap-2">
        <button
          onClick={() => onManagePhotos(room)}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-500"
          title="사진 관리"
        >
          <Camera className="h-4 w-4" />
        </button>
        <button
          onClick={() => onEdit(room)}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-500"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(room.roomId)}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
);

/* ── Main Page ─────────────────────────────────────────────── */

const HotelManagePage = () => {
  const { providerHotelId, setProviderHotelId, setUserNickName } = useAuthStore();

  const [hotel, setHotel] = useState<HotelDetail | null>(null);
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // UI state
  const [isOverseas, setIsOverseas] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomInfo | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionError, setActionError] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoRoom, setPhotoRoom] = useState<RoomInfo | null>(null);

  /* Hotel create form */
  const {
    control: hotelControl,
    handleSubmit: handleHotelSubmit,
    formState: hotelFormState,
    reset: resetHotelForm,
    setValue: setHotelValue,
    setError: setHotelError,
  } = useForm<HotelFormData>({
    resolver: zodResolver(HotelSchema),
    mode: 'onSubmit',
  });

  /* Hotel edit form */
  const {
    control: editControl,
    handleSubmit: handleEditSubmit,
    formState: editFormState,
    reset: resetEditForm,
    setValue: setEditValue,
    setError: setEditError,
  } = useForm<HotelFormData>({
    resolver: zodResolver(HotelSchema),
    mode: 'onSubmit',
  });

  /* ── On mount: resolve hotel ──────────────────────────────── */
  useEffect(() => {
    const resolveHotel = async () => {
      setLoading(true);
      try {
        if (providerHotelId) {
          const detail = await getProviderHotelDetail(providerHotelId);
          setHotel(detail);
          setUserNickName(detail.name);
          await loadRooms(providerHotelId);
          return;
        }

        const profile = await getProviderProfile();
        if (!profile.hotelId) return;

        setProviderHotelId(profile.hotelId);
        const detail = await getProviderHotelDetail(profile.hotelId);
        setHotel(detail);
        setUserNickName(detail.name);
        await loadRooms(profile.hotelId);
      } catch {
        setError('호텔 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    resolveHotel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadRooms = async (hotelId: number) => {
    try {
      const result = await getRoomsByHotel(hotelId);
      setRooms(result.content);
    } catch {
      setRooms([]);
    }
  };

  /* ── 국내/해외 전환 ────────────────────────────────────────── */

  const handleAddressTypeChange = (overseas: boolean) => {
    setIsOverseas(overseas);
    setHotelValue('address', '');
    setEditValue('address', '');
  };

  /* ── Geocoding ────────────────────────────────────────────── */

  const getCoords = (address: string) =>
    isOverseas ? geocodeInternationalAddress(address) : geocodeAddress(address);

  /* ── Hotel CRUD ───────────────────────────────────────────── */

  const onCreateHotel = async (data: HotelFormData) => {
    try {
      const coords = await getCoords(data.address);
      const created = await createHotel({ ...data, ...coords });
      setProviderHotelId(created.hotelId);
      if (selectedPhoto) {
        try {
          await uploadHotelPhoto(created.hotelId, selectedPhoto);
        } catch {
          setActionError('호텔은 등록되었으나 사진 업로드에 실패했습니다.');
        }
      }
      const detail = await getProviderHotelDetail(created.hotelId);
      setHotel(detail);
      setUserNickName(detail.name);
      setSelectedPhoto(null);
      resetHotelForm();
    } catch (err) {
      setHotelError('root', { message: toErrorMessage(err) });
    }
  };

  const onUpdateHotel = async (data: HotelFormData) => {
    if (!hotel) return;
    try {
      const coords = await getCoords(data.address);
      const updated = await updateHotel(hotel.hotelId, { ...data, ...coords });
      if (selectedPhoto) {
        try {
          await uploadHotelPhoto(hotel.hotelId, selectedPhoto);
        } catch {
          setActionError('호텔 정보는 저장되었으나 사진 업로드에 실패했습니다.');
        }
        const detail = await getProviderHotelDetail(hotel.hotelId);
        setHotel(detail);
        setUserNickName(detail.name);
        setSelectedPhoto(null);
      } else {
        setHotel(updated);
        setUserNickName(updated.name);
      }
      setIsEditing(false);
    } catch (err) {
      setEditError('root', { message: toErrorMessage(err) });
    }
  };

  const onDeleteHotel = async () => {
    if (!hotel) return;
    try {
      await deleteHotel(hotel.hotelId);
      setHotel(null);
      setRooms([]);
      setProviderHotelId(null);
      setShowDeleteConfirm(false);
    } catch (err) {
      setActionError(toErrorMessage(err));
      setShowDeleteConfirm(false);
    }
  };

  const startEdit = () => {
    if (!hotel) return;
    resetEditForm({
      name: hotel.name,
      address: hotel.address,
      description: hotel.description,
      starLevel: hotel.starLevel,
    });
    setIsEditing(true);
  };

  /* ── Room CRUD ────────────────────────────────────────────── */

  const onAddRoom = async (data: RoomFormData, photos: RoomPhotos) => {
    const created = await createRoom({
      description: data.description,
      roomType: data.roomType,
      price: data.price,
      occupancy: data.occupancy,
      totalQuantity: data.totalQuantity,
    });
    let updatedRoom = created;
    if (photos.main || photos.additional.length > 0) {
      try {
        const files: File[] = [];
        const displayTypes: ('MAIN' | 'ADDITIONAL')[] = [];
        if (photos.main) {
          files.push(photos.main);
          displayTypes.push('MAIN');
        }
        photos.additional.forEach((f) => {
          files.push(f);
          displayTypes.push('ADDITIONAL');
        });
        const results = await uploadRoomPhotos(created.roomId, files, displayTypes);
        const mainResult = results.find((r) => r.displayType === 'MAIN');
        const additionalResults = results.filter((r) => r.displayType === 'ADDITIONAL');
        updatedRoom = {
          ...created,
          ...(mainResult ? { mainImageUrl: mainResult.photoUrl } : {}),
          additionalPhotoUrls: additionalResults.map((r) => r.photoUrl),
        };
      } catch {
        setActionError('객실은 등록되었으나 사진 업로드에 실패했습니다.');
      }
    }
    setRooms((prev) => [...prev, updatedRoom]);
    setShowAddRoom(false);
  };

  const onUpdateRoom = async (data: RoomFormData, _photos: RoomPhotos) => {
    if (!editingRoom) return;
    const updated = await updateRoom(editingRoom.roomId, {
      roomId: editingRoom.roomId,
      description: data.description,
      roomType: data.roomType,
      price: data.price,
      maxOccupancy: data.occupancy,
      totalQuantity: data.totalQuantity,
    });
    setRooms((prev) => prev.map((r) => (r.roomId === updated.roomId ? updated : r)));
    setEditingRoom(null);
  };

  const handleRoomPhotoUpdate = (
    updates: Partial<Pick<RoomInfo, 'mainImageUrl' | 'additionalPhotoUrls'>>,
  ) => {
    if (!photoRoom) return;
    const updated = { ...photoRoom, ...updates };
    setPhotoRoom(updated);
    setRooms((prev) => prev.map((r) => (r.roomId === photoRoom.roomId ? updated : r)));
  };

  const onDeleteRoom = async (roomId: number) => {
    try {
      await deleteRoom(roomId);
      setRooms((prev) => prev.filter((r) => r.roomId !== roomId));
    } catch (err) {
      setActionError(toErrorMessage(err));
    }
  };

  /* ── Address input 분기 렌더 ──────────────────────────────── */

  const renderAddressInput = (control: typeof hotelControl) =>
    isOverseas ? (
      <RHFInput
        key="overseas"
        name="address"
        label="주소"
        placeholder="123 Main St, New York, NY, USA"
        control={control}
      />
    ) : (
      <KakaoAddressInput key="domestic" name="address" label="주소" control={control} />
    );

  /* ── Render ───────────────────────────────────────────────── */

  if (loading) {
    return <div className="py-16 text-center text-gray-400">불러오는 중...</div>;
  }

  /* No hotel yet — show registration form */
  if (!hotel) {
    return (
      <div className="max-w-lg">
        <h1 className="mb-2 text-3xl font-bold text-gray-800">호텔 등록</h1>
        <p className="mb-8 text-sm text-gray-500">아직 등록된 호텔이 없습니다. 호텔 정보를 입력해주세요.</p>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>
        )}

        <section className="rounded-xl border border-gray-200 bg-white p-6">
          {hotelFormState.errors.root?.message && (
            <p className="mb-4 text-sm text-red-500">{hotelFormState.errors.root.message}</p>
          )}
          <form onSubmit={handleHotelSubmit(onCreateHotel)} className="space-y-4">
            <HotelPhotoInput onChange={setSelectedPhoto} />
            <RHFInput name="name" label="호텔명" placeholder="호텔 이름을 입력해주세요" control={hotelControl} />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">주소 유형</label>
                <AddressTypeToggle isOverseas={isOverseas} onChange={handleAddressTypeChange} />
              </div>
              {renderAddressInput(hotelControl)}
            </div>
            <RHFInput name="starLevel" label="성급 (1~5)" type="number" placeholder="3" control={hotelControl} />
            <RHFInput name="description" label="호텔 소개" placeholder="호텔에 대한 설명을 입력해주세요 (10자 이상)" control={hotelControl} />
            <PrimaryButton full>호텔 등록하기</PrimaryButton>
          </form>
        </section>
      </div>
    );
  }

  /* Hotel exists — show management UI */
  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">내 호텔 관리</h1>
      </div>

      {actionError && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{actionError}</p>
      )}

      {/* ── Hotel Info Section ── */}
      <section className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-700">호텔 정보</h2>
          </div>
          {!isEditing && (
            <div className="flex gap-2">
              <button
                onClick={startEdit}
                className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
              >
                <Pencil className="h-3.5 w-3.5" />
                수정
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                삭제
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <>
            {editFormState.errors.root?.message && (
              <p className="mb-4 text-sm text-red-500">{editFormState.errors.root.message}</p>
            )}
            <form onSubmit={handleEditSubmit(onUpdateHotel)} className="space-y-4">
              <HotelPhotoInput currentPhotoUrl={hotel.mainPhotoUrl} onChange={setSelectedPhoto} />
              <RHFInput name="name" label="호텔명" control={editControl} />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">주소 유형</label>
                  <AddressTypeToggle isOverseas={isOverseas} onChange={handleAddressTypeChange} />
                </div>
                {renderAddressInput(editControl)}
              </div>
              <RHFInput name="starLevel" label="성급 (1~5)" type="number" control={editControl} />
              <RHFInput name="description" label="호텔 소개" control={editControl} />
              <div className="flex gap-2">
                <PrimaryButton size="sm">저장</PrimaryButton>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-xl border border-gray-200 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                >
                  취소
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="space-y-6">
            <div className="overflow-hidden rounded-xl bg-gray-100">
              {hotel.mainPhotoUrl ? (
                <img src={hotel.mainPhotoUrl} alt="호텔 대표 사진" className="h-48 w-full object-cover" />
              ) : (
                <div className="flex h-48 items-center justify-center">
                  <Building2 className="h-14 w-14 text-gray-300" />
                </div>
              )}
            </div>
            <div>
              <p className="mb-1 text-sm text-gray-500">호텔명</p>
              <p className="font-semibold text-gray-800">{hotel.name}</p>
            </div>
            <div>
              <p className="mb-1 text-sm text-gray-500">주소</p>
              <p className="text-gray-800">{hotel.address}</p>
            </div>
            <div className="flex gap-16">
              <div>
                <p className="mb-1 text-sm text-gray-500">성급</p>
                <div className="flex items-center gap-1">
                  {Array.from({ length: hotel.starLevel }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="ml-1 text-sm text-gray-600">{hotel.starLevel}성급</span>
                </div>
              </div>
              <div>
                <p className="mb-1 text-sm text-gray-500">평점</p>
                <p className="text-gray-800">{hotel.rating?.toFixed(1) ?? '-'} / 5.0</p>
              </div>
              <div>
                <p className="mb-1 text-sm text-gray-500">리뷰 수</p>
                <p className="text-gray-800">{hotel.reviewCount ?? 0}개</p>
              </div>
            </div>
            <div>
              <p className="mb-1 text-sm text-gray-500">호텔 소개</p>
              <p className="text-gray-700">{hotel.description}</p>
            </div>
          </div>
        )}
      </section>

      {/* ── Delete Confirm Modal ── */}
      {photoRoom && (
        <RoomPhotoModal
          room={photoRoom}
          onClose={() => setPhotoRoom(null)}
          onUpdate={handleRoomPhotoUpdate}
        />
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">호텔 삭제</h3>
              <button onClick={() => setShowDeleteConfirm(false)}>
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <p className="mb-6 text-sm text-gray-600">
              <span className="font-semibold">{hotel.name}</span>을(를) 삭제하시겠습니까?<br />
              이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-xl border border-gray-200 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={onDeleteHotel}
                className="flex-1 rounded-xl bg-red-500 py-2 text-sm font-semibold text-white hover:bg-red-600"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Rooms Section ── */}
      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-700">객실 관리</h2>
          {!showAddRoom && (
            <PrimaryButton size="sm" onClick={() => setShowAddRoom(true)}>
              <Plus className="mr-1 inline h-4 w-4" />
              객실 추가
            </PrimaryButton>
          )}
        </div>

        {showAddRoom && (
          <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">새 객실 추가</h3>
            <RoomForm
              onSubmit={onAddRoom}
              onCancel={() => setShowAddRoom(false)}
              submitLabel="추가"
              showPhotoUpload
            />
          </div>
        )}

        {rooms.length === 0 && !showAddRoom ? (
          <div className="py-10 text-center text-gray-400">
            <Building2 className="mx-auto mb-3 h-10 w-10 opacity-30" />
            <p>등록된 객실이 없습니다.</p>
            <p className="mt-1 text-sm">객실 추가 버튼을 눌러 객실을 등록해주세요.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rooms.map((room) =>
              editingRoom?.roomId === room.roomId ? (
                <div key={room.roomId} className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <h3 className="mb-3 text-sm font-semibold text-gray-700">객실 수정</h3>
                  <RoomForm
                    defaultValues={{
                      roomType: room.roomType,
                      description: room.description,
                      price: room.price,
                      occupancy: room.maxOccupancy,
                      totalQuantity: room.totalQuantity,
                    }}
                    onSubmit={onUpdateRoom}
                    onCancel={() => setEditingRoom(null)}
                    submitLabel="저장"
                  />
                </div>
              ) : (
                <RoomCard
                  key={room.roomId}
                  room={room}
                  onEdit={(r) => setEditingRoom(r)}
                  onDelete={onDeleteRoom}
                  onManagePhotos={(r) => setPhotoRoom(r)}
                />
              ),
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default HotelManagePage;
