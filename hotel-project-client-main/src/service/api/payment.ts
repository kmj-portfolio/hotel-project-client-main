import client, { getAccessToken } from '../instance/client';
import handleApiReqeust from './handleApiReqeust';
import type {
  VerifyPaymentRequest,
  CancelPaymentRequest,
  PaymentListResponse,
  PaymentResponse,
} from '@/types/PaymentType';

export const createPayment = async (reservationId: number) => {
  return await handleApiReqeust<PaymentResponse>(() =>
    client.post('/api/payments', { reservationId }),
  );
};

export const getMyPayments = async (page = 0, size = 20) => {
  return await handleApiReqeust<PaymentListResponse>(() =>
    client.get('/api/payments/my', { params: { page, size } }),
  );
};

export const verifyPayment = async (data: VerifyPaymentRequest) => {
  return await handleApiReqeust<PaymentResponse>(() =>
    client.post('/api/payments/verifications', data),
  );
};

export const cancelPayment = async (data: CancelPaymentRequest) => {
  return await handleApiReqeust<string>(() => client.post('/api/payments/cancel', data));
};

/**
 * Opens an SSE connection to /api/payments/{paymentId}/stream and resolves when
 * the backend emits payment-complete, or rejects on payment-failed / payment-cancelled.
 * Pass an AbortSignal to cancel (e.g. when PortOne itself fails before payment).
 */
export const subscribePaymentSse = (paymentId: string, signal: AbortSignal): Promise<void> => {
  return new Promise((resolve, reject) => {
    let settled = false;
    const safeResolve = () => { if (!settled) { settled = true; resolve(); } };
    const safeReject = (err: Error) => { if (!settled) { settled = true; reject(err); } };

    (async () => {
      try {
        const token = getAccessToken();
        const headers: Record<string, string> = {
          Accept: 'text/event-stream',
          'ngrok-skip-browser-warning': 'true',
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`/api/payments/${paymentId}/stream`, { headers, signal });

        if (!response.ok || !response.body) {
          safeReject(new Error('SSE 연결에 실패했습니다.'));
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let currentEvent = '';

        signal.addEventListener('abort', () => {
          reader.cancel().catch(() => {});
          safeReject(new Error('cancelled'));
        });

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (line.startsWith('event:')) {
              currentEvent = line.slice(6).trim();
            } else if (line === '' && currentEvent) {
              if (currentEvent === 'payment-complete') {
                reader.cancel().catch(() => {});
                safeResolve();
                return;
              }
              if (currentEvent === 'payment-failed') {
                reader.cancel().catch(() => {});
                safeReject(new Error('결제에 실패했습니다.'));
                return;
              }
              if (currentEvent === 'payment-cancelled') {
                reader.cancel().catch(() => {});
                safeReject(new Error('결제가 취소되었습니다.'));
                return;
              }
              currentEvent = '';
            }
          }
        }

        safeReject(new Error('결제 결과를 받지 못했습니다.'));
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          safeReject(err instanceof Error ? err : new Error(String(err)));
        }
      }
    })();
  });
};
