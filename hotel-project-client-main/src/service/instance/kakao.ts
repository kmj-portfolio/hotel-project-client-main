import axios from 'axios';

const kakao = axios.create({
  baseURL: import.meta.env.VITE_KAKAO_API_URL,
  headers: {
    Authorization: `KakaoAK ${import.meta.env.VITE_KAKAO_REST_API_KEY}`,
  },
});

export default kakao;
