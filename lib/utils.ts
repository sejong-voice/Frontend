import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 백엔드에서 내려주는 UTC 날짜 문자열(Z 포함 여부 무관)을 
 * 명시적으로 대한민국 표준시(KST, UTC+9)로 변환하여 포맷팅합니다.
 * @param dateString 백엔드 날짜 문자열 (예: "2024-04-20T15:00:00")
 * @param formatType 반환 형식 ("date" | "datetime")
 */
export function formatToKST(dateString?: string | null, formatType: "date" | "datetime" = "date") {
  if (!dateString) return "-";
  
  // 1. Z가 없으면 강제로 추가해 확실한 UTC 기준으로 파싱
  const utcString = dateString.endsWith("Z") ? dateString : `${dateString}Z`;
  const date = new Date(utcString);
  
  if (Number.isNaN(date.getTime())) return "-";
  
  // 2. KST는 UTC보다 9시간 빠름
  const kstTime = date.getTime() + (9 * 60 * 60 * 1000);
  const kstDate = new Date(kstTime);
  
  // 3. 브라우저의 로컬 타임존 환경을 무시하고, UTC 메서드로 고정된 KST 값 추출
  const year = kstDate.getUTCFullYear();
  const month = String(kstDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(kstDate.getUTCDate()).padStart(2, "0");
  const hours = String(kstDate.getUTCHours()).padStart(2, "0");
  const minutes = String(kstDate.getUTCMinutes()).padStart(2, "0");
  
  if (formatType === "date") {
    return `${year}.${month}.${day}`;
  }
  return `${year}.${month}.${day} ${hours}:${minutes}`;
}
