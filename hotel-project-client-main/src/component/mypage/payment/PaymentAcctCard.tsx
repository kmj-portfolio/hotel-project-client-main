import Card from '@/component/common/card/Card';
interface FareItem {
  payNo: number;
  payAcct: string;
  payDateTime: string;
  state: string;
}

const fareBreakdown: FareItem = {
  payNo: 371194823,
  payAcct: '신한카드',
  payDateTime: '2025-08-02 00:37',
  state: '완료',
};

const PaymentAcctCard = () => {
  return (
    <Card className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
      <Card.Content>
        <div className="mb-6 flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900">결제 수단 정보</span>
        </div>
        <div className="space-y-3 bg-gray-100 p-4">
          <div className="text-ms font-medium text-gray-900">
            결제수단 : {fareBreakdown.payAcct}
          </div>
          <div className="text-ms font-medium text-gray-900">
            결제 일시 : {fareBreakdown.payDateTime}
          </div>
          <div className="text-ms font-medium text-gray-900">결제 상태 : {fareBreakdown.state}</div>
          <div className="text-ms font-medium text-gray-900">결제 번호 : {fareBreakdown.payNo}</div>
        </div>

        <div className="mt-6 text-center text-xs font-bold text-red-500">
          결제 완료 후에는 결제 수단 변경이 불가능하오니 유의해주시기 바랍니다.
        </div>
      </Card.Content>
    </Card>
  );
};

export default PaymentAcctCard;
