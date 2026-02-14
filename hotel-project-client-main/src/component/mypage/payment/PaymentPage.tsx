import React, { useState, useEffect } from 'react';
import { ChevronRight, CreditCard, Calendar, MapPin, Users, Clock, History } from 'lucide-react';
import { formatDateToYMD, formatNumberToWon } from '@/utils/format/formatUtil';

// 타입
interface PaymentHistoryItem {
  paymentId: number;
  reservationId: number;
  hotelName: string;
  hotelAddress: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  participantCount: number;
  amount: number;
  paymentMethod: string;
  paymentStatus: 'PAID' | 'PENDING' | 'CANCELLED' | 'REFUNDED';
  paidAt: string;
  reservationNumber: string;
}

interface PaymentDetail {
  totalAmount: number;
  participantCount: number;
  discountAmount: number;
  paymentMethod: string;
  paidAt: string;
  paymentStatus: string;
  paymentNumber: string;
}

//목업 state
const usePaymentHistoryStore = () => {
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentDetail | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // 목업 데이터
  useEffect(() => {
    const mockData: PaymentHistoryItem[] = [
      {
        paymentId: 1,
        reservationId: 101,
        hotelName: '그랜드 호텔',
        hotelAddress: '서울시 강남구',
        roomType: '디럭스 더블',
        checkInDate: '2025-08-15',
        checkOutDate: '2025-08-17',
        participantCount: 2,
        amount: 350000,
        paymentMethod: '신한카드',
        paymentStatus: 'PAID',
        paidAt: '2025-08-10 14:30:25',
        reservationNumber: '2387913001',
      },
      {
        paymentId: 2,
        reservationId: 102,
        hotelName: '스카이 리조트',
        hotelAddress: '부산시 해운대구',
        roomType: '오션뷰 스위트',
        checkInDate: '2025-07-20',
        checkOutDate: '2025-07-22',
        participantCount: 3,
        amount: 675560,
        paymentMethod: '신한카드',
        paymentStatus: 'PENDING',
        paidAt: '2025-07-15 16:45:12',
        reservationNumber: '2387913002',
      },
      {
        paymentId: 3,
        reservationId: 103,
        hotelName: '시티 비즈니스 호텔',
        hotelAddress: '대구시 중구',
        roomType: '스탠다드 싱글',
        checkInDate: '2025-06-10',
        checkOutDate: '2025-06-11',
        participantCount: 1,
        amount: 120000,
        paymentMethod: 'KB국민카드',
        paymentStatus: 'CANCELLED',
        paidAt: '2025-06-05 10:20:33',
        reservationNumber: '2387913003',
      },
    ];
    setPaymentHistory(mockData);
  }, []);

  return {
    paymentHistory,
    selectedPayment,
    isDetailOpen,
    setSelectedPayment,
    setIsDetailOpen,
  };
};

// 결제 상태 컴포넌트
const PaymentStatusBadge: React.FC<{ status: PaymentHistoryItem['paymentStatus'] }> = ({
  status,
}) => {
  const statusConfig = {
    PAID: { text: '결제완료', color: 'bg-blue-100 text-blue-800' },
    PENDING: { text: '결제대기', color: 'bg-yellow-100 text-yellow-800' },
    CANCELLED: { text: '결제취소', color: 'bg-red-100 text-red-800' },
    REFUNDED: { text: '환불완료', color: 'bg-gray-100 text-gray-800' },
  };

  const config = statusConfig[status];
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-medium ${config.color}`}>
      {config.text}
    </span>
  );
};

// 결제내역 아이템 컴포넌트
const PaymentHistoryItem: React.FC<{
  payment: PaymentHistoryItem;
  onDetailClick: (payment: PaymentHistoryItem) => void;
}> = ({ payment, onDetailClick }) => {
  return (
    <div
      className="cursor-pointer rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
      onClick={() => onDetailClick(payment)}
    >
      {/* 헤더 */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-600">예약번호: {payment.reservationNumber}</span>
        </div>
        <div className="flex items-center space-x-2">
          <PaymentStatusBadge status={payment.paymentStatus} />
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* 호텔 정보 */}
      <div className="mb-4">
        <h3 className="mb-1 text-lg font-semibold text-gray-900">{payment.hotelName}</h3>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span>{payment.hotelAddress}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>투숙객 {payment.participantCount}명</span>
          </div>
        </div>
      </div>

      {/* 예약 정보 */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>
              {formatDateToYMD(payment.checkInDate)} ~ {formatDateToYMD(payment.checkOutDate)}
            </span>
          </div>
          <span className="text-sm text-gray-500">({payment.roomType})</span>
        </div>
      </div>

      {/* 결제 정보 */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>결제일: {formatDateToYMD(payment.paidAt)}</span>
          <span>• {payment.paymentMethod}</span>
        </div>
        <div className="text-xl font-bold text-blue-600">{formatNumberToWon(payment.amount)}</div>
      </div>
    </div>
  );
};

// 결제 상세 모달
const PaymentDetailModal: React.FC<{
  payment: PaymentHistoryItem | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({ payment, isOpen, onClose }) => {
  if (!isOpen || !payment) return null;

  return (
    <div className="bg-opacity-30 fixed inset-0 z-50 flex items-center justify-center bg-gray-200 p-4">
      <div className="max-h-[70vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">결제 상세</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 transition-colors hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* 총 결제 금액 */}
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900">총 결제 금액</span>
            <span className="text-2xl font-extrabold text-blue-600">
              {formatNumberToWon(payment.amount)}
            </span>
          </div>

          <div className="space-y-2 rounded-lg bg-gray-50 p-4">
            <div className="flex justify-between text-sm text-gray-700">
              <span>투숙객 x {payment.participantCount}</span>
              <span>{formatNumberToWon(payment.amount)}</span>
            </div>
          </div>
        </div>

        <div className="my-6 border-t border-dashed border-blue-300"></div>

        {/* 총 예약 금액 */}
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">총 예약 금액</span>
            <span className="text-xl font-extrabold text-blue-600">
              {formatNumberToWon(payment.amount)}
            </span>
          </div>

          <div className="space-y-2 rounded-lg bg-gray-50 p-4">
            <div className="flex justify-between text-sm text-gray-700">
              <span>투숙객 x {payment.participantCount}</span>
              <span>{formatNumberToWon(payment.amount)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-700">
              <span>할인코드</span>
              <span>0원</span>
            </div>
          </div>
        </div>

        {/* 결제 수단 정보 */}
        <div className="mb-6">
          <h3 className="mb-4 text-lg font-bold text-gray-900">결제 수단 정보</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">결제수단</span>
              <span className="font-medium">{payment.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">결제 일시</span>
              <span className="font-medium">{payment.paidAt}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">결제 상태</span>
              <PaymentStatusBadge status={payment.paymentStatus} />
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">결제 번호</span>
              <span className="font-medium">{payment.paymentId}</span>
            </div>
          </div>
        </div>

        {/* 주의사항 */}
        <div className="text-center text-xs text-red-500">
          결제 완료 후에는 결제 수단 변경이 불가능하오니 유의해주시기 바랍니다.
        </div>
      </div>
    </div>
  );
};

// 메인 컴포넌트
const PaymentPage: React.FC = () => {
  const { paymentHistory, isDetailOpen, setIsDetailOpen } = usePaymentHistoryStore();
  const [selectedItem, setSelectedItem] = useState<PaymentHistoryItem | null>(null);

  const handleDetailClick = (payment: PaymentHistoryItem) => {
    setSelectedItem(payment);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedItem(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold text-gray-800">결제 내역</h1>
        </div>
        <div className="flex items-center space-x-4">
          <History className="h-5 w-5 text-gray-600" />
          <span className="text-gray-600">지금까지의 결제 내역을 확인하실 수 있습니다.</span>
        </div>
      </div>

      {/* 컨텐츠 */}
      <div className="mx-auto max-w-4xl px-4 py-8">
        {paymentHistory.length === 0 ? (
          <div className="py-16 text-center">
            <CreditCard className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">결제 내역이 없습니다</h3>
            <p className="text-gray-500">첫 번째 예약을 만들어보세요!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentHistory.map((payment) => (
              <PaymentHistoryItem
                key={payment.paymentId}
                payment={payment}
                onDetailClick={handleDetailClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* 상세 모달 */}
      <PaymentDetailModal
        payment={selectedItem}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
      />
    </div>
  );
};

export default PaymentPage;
