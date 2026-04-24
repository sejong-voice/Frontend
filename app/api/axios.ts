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

// 토큰 재발급 동시 요청을 처리하기 위한 변수
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// 3. 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 만료된 토큰(401)이고 아직 재발급을 시도하지 않은 요청일 때
    // error.config 객체 자체가 undefined일 수 있으므로 안전하게 처리
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        // 이미 다른 요청이 재발급을 진행 중이라면 끝날 때까지 큐에 넣어 대기
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Refresh API 호출 (보안상 HTTP-Only 쿠키로 담긴 refresh_token 등을 이용하도록 withCredentials: true 설정)
        // 무한루프 방지를 위해 api 인스턴스 대신 axios 기본 인스턴스를 사용합니다.
        const res = await axios.post("/api/v1/auth/refresh", {}, {
          withCredentials: true,
        });

        // 백엔드에서 내려주는 새 토큰 필드명 가져오기
        const newAccessToken = (res.data as any).accessToken || (res.data as any).token || (res.data as any).jwt;
        
        // 백엔드 개발자님이 말씀해주신 초(Second) 단위 만료 시간
        // const expiresInSeconds = (res.data as any).expiresIn; 

        if (newAccessToken) {
          if (typeof window !== "undefined") {
            localStorage.setItem("accessToken", newAccessToken);
          }
          
          // api 기본 헤더 갱신
          api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
          // 방금 실패했던 요청의 헤더 갱신
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          
          // 대기 중이던 다른 요청들에게 새 토큰 전달 후 재실행
          processQueue(null, newAccessToken);
          
          // 방금 실패했던 요청 1회 자동 재시도
          return api(originalRequest); 
        }
      } catch (err) {
        processQueue(err, null);
        // 리프레시 요청 자체도 실패하면 (예: 리프레시 토큰까지 완전히 만료)
        // 찌꺼기 토큰을 삭제하고 강제 로그아웃
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          window.location.href = "/login";
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
