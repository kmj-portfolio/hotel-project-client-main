export type Response<T> =
  | {
      resultCode: 'SUCCESS';
      result: T;
    }
  | {
      resultCode: 'ERROR';
      result: string;
    };

export default Response;
