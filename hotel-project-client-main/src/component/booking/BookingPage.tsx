import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { getCustomerDetails, getUsernameAutocomplete } from '@/service/api/auth';
import { createReservation } from '@/service/api/reservation';
import { formatNumberWithComma, formatDateToISOstring } from '@/utils/format/formatUtil';

import type { RoomInfo } from '@/types/room/room';
import type { CustomerDetails } from '@/types/user';

interface BookingState {
  room: RoomInfo;
  hotelId: number;
  hotelName: string;
  hotelAddress: string;
  checkIn: string;
  checkOut: string;
}

interface ReservationResult {
  reservationId: number;
  reservationNumber: string;
}

type PaymentMode = 'solo' | 'split';

declare global {
  interface Window {
    IMP?: {
      init: (merchantUid: string) => void;
      request_pay: (
        params: object,
        callback: (rsp: { success: boolean; imp_uid: string; merchant_uid: string; error_msg?: string }) => void,
      ) => void;
    };
  }
}

const today = formatDateToISOstring(new Date());

const BookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as BookingState | null;

  const [customer, setCustomer] = useState<CustomerDetails>();
  const [checkIn, setCheckIn] = useState(state?.checkIn ?? '');
  const [checkOut, setCheckOut] = useState(state?.checkOut ?? '');
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('solo');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const [participantError, setParticipantError] = useState<string>();
  const [autocompleteError, setAutocompleteError] = useState<string>();
  const [confirmation, setConfirmation] = useState<ReservationResult>();

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getCustomerDetails()
      .then(setCustomer)
      .catch(() => {});
  }, []);

  // Auto-switch payment mode based on participants
  useEffect(() => {
    if (invitedEmails.length > 0) setPaymentMode('split');
    else setPaymentMode('solo');
  }, [invitedEmails]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setNoResults(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced autocomplete
  useEffect(() => {
    if (emailInput.trim().length === 0) {
      setSuggestions([]);
      setShowDropdown(false);
      setNoResults(false);
      setAutocompleteError(undefined);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setAutocompleteError(undefined);
        const raw = await getUsernameAutocomplete(emailInput.trim());
        const results = Array.isArray(raw) ? raw : [];
        const filtered = results.filter(
          (r) => !invitedEmails.includes(r) && r !== customer?.nickname,
        );
        setSuggestions(filtered);
        setNoResults(filtered.length === 0);
        setShowDropdown(true);
      } catch (err) {
        setSuggestions([]);
        setShowDropdown(false);
        setNoResults(false);
        setAutocompleteError(String(err));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [emailInput, invitedEmails, customer]);

  const addEmail = (email: string) => {
    if (!email) return;
    if (email === customer?.nickname || email === customer?.email) {
      setParticipantError('본인은 참여자로 추가할 수 없습니다.');
      return;
    }
    setParticipantError(undefined);
    if (!invitedEmails.includes(email)) {
      setInvitedEmails((prev) => [...prev, email]);
    }
    setEmailInput('');
    setSuggestions([]);
    setShowDropdown(false);
  };

  const removeEmail = (email: string) => {
    setInvitedEmails((prev) => prev.filter((e) => e !== email));
  };

  if (!state?.room) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <div className="text-5xl">🏨</div>
        <h2 className="text-xl font-bold text-gray-800">예약할 객실을 선택해 주세요</h2>
        <p className="text-gray-500">
          호텔 상세 페이지에서 원하는 객실의 예약하기 버튼을 눌러주세요.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-2 rounded-xl bg-primary-700 px-6 py-3 font-semibold text-white hover:bg-primary-800"
        >
          호텔 둘러보기
        </button>
      </div>
    );
  }

  const { room, hotelId, hotelName, hotelAddress } = state;
  const imageUrl = room.mainImageUrl;

  const nights =
    checkIn && checkOut
      ? Math.max(
          0,
          Math.ceil(
            (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
              (1000 * 60 * 60 * 24),
          ),
        )
      : 0;

  const totalPrice = nights * room.price;
  const participantCount = invitedEmails.length + 1;
  const myPrice =
    paymentMode === 'split' ? Math.ceil(totalPrice / participantCount) : totalPrice;

  const openIamportPayment = (reservationNumber: string, amount: number) => {
    const merchantUid = import.meta.env.VITE_IMP_MERCHANT_UID;
    if (!merchantUid || !window.IMP) {
      setError('결제 모듈이 준비되지 않았습니다. 관리자에게 문의해 주세요.');
      setSubmitting(false);
      return;
    }

    window.IMP.init(merchantUid);
    window.IMP.request_pay(
      {
        pg: import.meta.env.VITE_IMP_PG ?? 'html5_inicis',
        pay_method: 'card',
        merchant_uid: reservationNumber,
        name: `${hotelName} - ${room.roomType}`,
        amount,
        buyer_email: customer?.email,
        buyer_name: customer?.name,
      },
      (rsp) => {
        if (rsp.success) {
          navigate('/mypage/bookings');
        } else {
          setError(rsp.error_msg ?? '결제에 실패했습니다.');
          setSubmitting(false);
        }
      },
    );
  };

  const handleSubmit = async () => {
    if (!checkIn || !checkOut) {
      setError('체크인 및 체크아웃 날짜를 선택해 주세요.');
      return;
    }
    if (nights <= 0) {
      setError('체크아웃은 체크인 이후여야 합니다.');
      return;
    }
    if (paymentMode === 'split' && invitedEmails.length === 0) {
      setError('나누어 결제하려면 참여자를 한 명 이상 추가해 주세요.');
      return;
    }

    setSubmitting(true);
    setError(undefined);
    try {
      const reservation = await createReservation({
        hotelId,
        roomsAndQuantities: [{ roomId: room.roomId, quantity: 1 }],
        checkInDate: checkIn,
        checkOutDate: checkOut,
        invitedEmails,
        isSplitPayment: paymentMode === 'split',
      });

      if (paymentMode === 'split') {
        setConfirmation(reservation);
        setSubmitting(false);
      } else {
        openIamportPayment(reservation.reservationNumber, myPrice);
      }
    } catch (err) {
      setError(String(err));
      setSubmitting(false);
    }
  };

  // ── Split payment confirmation modal ──
  if (confirmation && paymentMode === 'split') {
    return (
      <div className="mx-auto max-w-lg px-6 py-16">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          {/* Header */}
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
              <svg className="h-8 w-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">임시 예약이 완료되었습니다</h2>
            <p className="mt-1 text-sm text-gray-500">
              예약 번호:{' '}
              <span className="font-semibold text-gray-800">{confirmation.reservationNumber}</span>
            </p>
          </div>

          {/* Summary */}
          <div className="mb-6 flex flex-col gap-3 rounded-xl bg-gray-50 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">숙소</span>
              <span className="font-medium text-gray-900">{hotelName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">객실</span>
              <span className="font-medium text-gray-900">{room.roomType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">체크인</span>
              <span className="font-medium text-gray-900">{checkIn}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">체크아웃</span>
              <span className="font-medium text-gray-900">{checkOut}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">참여자</span>
              <span className="font-medium text-gray-900">
                {[customer?.nickname ?? '나', ...invitedEmails].join(', ')}
              </span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-3">
              <span className="text-gray-500">총 요금</span>
              <span className="font-semibold text-gray-900">₩{formatNumberWithComma(totalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-primary-600">내가 낼 금액</span>
              <span className="font-bold text-primary-600">₩{formatNumberWithComma(myPrice)}</span>
            </div>
          </div>

          {/* 30-min warning */}
          <div className="mb-6 flex items-start gap-2 rounded-lg bg-amber-50 px-4 py-3 text-xs text-amber-700">
            <svg className="mt-0.5 h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              <strong>30분</strong> 내에 모든 참여자가 결제를 완료해야 합니다. 시간 내 미결제 시
              예약이 자동으로 취소됩니다.
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => openIamportPayment(confirmation.reservationNumber, myPrice)}
              className="w-full rounded-xl bg-primary-700 py-4 text-base font-bold text-white hover:bg-primary-800"
            >
              내 몫 결제하기 (₩{formatNumberWithComma(myPrice)})
            </button>
            <button
              onClick={() => navigate('/mypage/bookings')}
              className="w-full rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              나중에 결제하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">예약 확인</h1>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* ── Left: hotel & room summary ── */}
        <div className="flex flex-col gap-4 lg:flex-1">
          {/* Hotel */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
              숙소 정보
            </p>
            <h2 className="text-xl font-bold text-gray-900">{hotelName}</h2>
            <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
              <svg className="h-4 w-4 shrink-0 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              {hotelAddress}
            </p>
          </div>

          {/* Room */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {imageUrl ? (
              <div className="h-52 w-full overflow-hidden">
                <img src={imageUrl} alt={room.roomType} className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="flex h-52 items-center justify-center bg-primary-100">
                <svg className="h-12 w-12 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
              </div>
            )}
            <div className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{room.roomType}</h3>
                  <p className="mt-0.5 text-sm text-gray-400">최대 {room.maxOccupancy}인</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">₩{formatNumberWithComma(room.price)}</p>
                  <p className="text-xs text-gray-400">1박 기준</p>
                </div>
              </div>
              {room.description && (
                <p className="mt-3 text-sm leading-relaxed text-gray-500">{room.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Right: booking form ── */}
        <div className="flex flex-col gap-4 lg:w-[380px] lg:shrink-0">
          {/* Dates */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-semibold text-gray-900">날짜 선택</h3>
            <div className="flex flex-col gap-3">
              <div>
                <p className="mb-1 text-sm text-gray-500">체크인</p>
                <input
                  type="date"
                  min={today}
                  value={checkIn}
                  onChange={(e) => {
                    setCheckIn(e.target.value);
                    if (checkOut && e.target.value >= checkOut) setCheckOut('');
                  }}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>
              <div>
                <p className="mb-1 text-sm text-gray-500">체크아웃</p>
                <input
                  type="date"
                  min={checkIn || today}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900">함께 예약하기</h3>
            <p className="mb-4 mt-1 text-sm text-gray-400">
              참여자를 추가하면 비용을 함께 나눌 수 있습니다.
            </p>

            {invitedEmails.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {invitedEmails.map((email) => (
                  <span
                    key={email}
                    className="flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-sm text-primary-700"
                  >
                    {email}
                    <button
                      onClick={() => removeEmail(email)}
                      className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-primary-200"
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="relative" ref={dropdownRef}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (suggestions.length > 0) addEmail(suggestions[0]);
                    }
                  }}
                  onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                  placeholder="닉네임으로 참여자 검색..."
                  className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                />
                <button
                  disabled={!suggestions.includes(emailInput.trim())}
                  onClick={() => addEmail(emailInput.trim())}
                  className="shrink-0 rounded-lg bg-primary-100 px-3 py-2 text-sm font-medium text-primary-700 hover:bg-primary-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  추가
                </button>
              </div>

              {participantError && (
                <p className="mt-1.5 text-xs text-red-500">{participantError}</p>
              )}
              {autocompleteError && (
                <p className="mt-1.5 text-xs text-red-400">검색 실패: {autocompleteError}</p>
              )}

              {showDropdown && (
                <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                  {suggestions.length > 0 ? (
                    suggestions.map((s) => (
                      <button
                        key={s}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          addEmail(s);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-gray-50"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
                          {s.charAt(0).toUpperCase()}
                        </div>
                        {s}
                      </button>
                    ))
                  ) : noResults ? (
                    <p className="px-3 py-2.5 text-sm text-gray-400">검색 결과가 없습니다.</p>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          {/* Payment mode */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 font-semibold text-gray-900">결제 방식</h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setPaymentMode('solo')}
                className={`flex items-start gap-3 rounded-lg border-2 p-4 text-left transition-colors ${
                  paymentMode === 'solo'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                    paymentMode === 'solo' ? 'border-primary-500' : 'border-gray-300'
                  }`}
                >
                  {paymentMode === 'solo' && <span className="h-2 w-2 rounded-full bg-primary-500" />}
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">혼자 결제하기</p>
                  <p className="mt-0.5 text-xs text-gray-500">총 요금을 한 번에 결제합니다.</p>
                </div>
              </button>

              <button
                onClick={() => invitedEmails.length > 0 && setPaymentMode('split')}
                disabled={invitedEmails.length === 0}
                className={`flex items-start gap-3 rounded-lg border-2 p-4 text-left transition-colors ${
                  paymentMode === 'split'
                    ? 'border-primary-500 bg-primary-50'
                    : invitedEmails.length === 0
                      ? 'cursor-not-allowed border-gray-100 opacity-50'
                      : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                    paymentMode === 'split' ? 'border-primary-500' : 'border-gray-300'
                  }`}
                >
                  {paymentMode === 'split' && <span className="h-2 w-2 rounded-full bg-primary-500" />}
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">나누어 결제하기</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {invitedEmails.length === 0
                      ? '참여자를 먼저 추가해 주세요.'
                      : `${participantCount}명이 각자 결제합니다.`}
                  </p>
                  {paymentMode === 'split' && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                      <svg className="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      30분 내 모든 참여자가 결제하지 않으면 예약이 취소됩니다.
                    </p>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Contact info */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-semibold text-gray-900">예약자 정보</h3>
            {customer ? (
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">이름</span>
                  <span className="font-medium text-gray-900">{customer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">이메일</span>
                  <span className="font-medium text-gray-900">{customer.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">닉네임</span>
                  <span className="font-medium text-gray-900">{customer.nickname}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">불러오는 중...</p>
            )}
          </div>

          {/* Price summary */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-semibold text-gray-900">요금 안내</h3>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">객실 요금</span>
                <span className="text-gray-900">₩{formatNumberWithComma(room.price)} / 1박</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">숙박 일수</span>
                <span className="text-gray-900">
                  {nights > 0 ? `${nights}박` : '날짜를 선택하세요'}
                </span>
              </div>
              {paymentMode === 'split' && (
                <div className="flex justify-between text-gray-500">
                  <span>총 인원</span>
                  <span>{participantCount}명</span>
                </div>
              )}
            </div>
            <div className="mt-4 flex flex-col gap-5 border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">총 요금</span>
                <span className="text-xl font-bold text-gray-900">
                  {nights > 0 ? `₩${formatNumberWithComma(totalPrice)}` : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-primary-500">내가 낼 금액</span>
                <span className="text-xl font-bold text-primary-500">
                  {nights > 0 ? `₩${formatNumberWithComma(myPrice)}` : '-'}
                </span>
              </div>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-500">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full rounded-xl bg-primary-700 py-4 text-base font-bold text-white transition-colors hover:bg-primary-800 active:bg-primary-900 disabled:opacity-50"
          >
            {submitting ? '처리 중...' : paymentMode === 'split' ? '임시 예약 신청' : '결제하기'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
