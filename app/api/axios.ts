import axios from "axios";

export const api = axios.create({
  baseURL: "",
  withCredentials: true, // 쿠키(세션)를 같이 보내기 위해 필수
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. 요청 인터셉터 (선택 사항)
// 로컬 스토리지 등에 토큰이 있다면 여기서 자동으로 헤더에 넣어줄 수 있습니다.
api.interceptors.request.use(
  (config) => {
    // 예: const token = localStorage.getItem('token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 로그아웃 로직 처리
    }
    return Promise.reject(error);
  },
);
