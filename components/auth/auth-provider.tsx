"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { api } from "../../app/api/axios";

export interface AuthUser {
  id: string;
  studentNo: string;
  name: string;
  department: string;
  role: "STUDENT" | "ADMIN";
  status: "ACTIVE" | "INACTIVE";
}

interface AuthContextValue {
  loading: boolean;
  user: AuthUser | null;
  isAdmin: boolean;
  login: (
    studentNo: string,
    password: string,
  ) => Promise<{ success: boolean; message?: string }>;
  refreshMe: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  // 1. 실제 프로필 정보 가져오기
  const refreshMe = useCallback(async () => {
    try {
      const res = await api.get("/api/v1/auth/profile");

      if (res.status === 200) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("프로필 로드 실패:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. 로그인 처리 로직
  const login = useCallback(
    async (studentNo: string, password: string) => {
      try {
        // 로그인 요청
        await api.post("/api/v1/auth/login", {
          studentNo,
          password,
        });

        await refreshMe();

        return { success: true };
      } catch (error: any) {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "로그인 정보가 올바르지 않습니다.";
        return { success: false, message };
      }
    },
    [refreshMe],
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/api/v1/auth/logout");
    } catch (error) {
      console.warn("서버 로그아웃 요청 실패:", error);
    }
    setUser(null);
    window.location.href = "/login";
  }, []);

  // 앱 초기 로드 시 실행
  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  const isAdmin = user?.role === "ADMIN";

  return (
    <AuthContext.Provider
      value={{ loading, user, isAdmin, login, refreshMe, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
