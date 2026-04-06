import axios from "axios";

export const api = axios.create({
  baseURL: "",
  withCredentials: true, // 쿠키(세션)를 같이 보내기 위해 필수
  headers: {},
  // Spring Security 등에서 사용하는 CSRF 토큰 설정 (필요한 경우)
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

// 2. 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    // localStorage에 토큰이 있다면 자동으로 헤더에 넣어줍니다.
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 인증 에러 시 처리 (예: 토큰 삭제 등)
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
      }
    }
    return Promise.reject(error);
  },
);
