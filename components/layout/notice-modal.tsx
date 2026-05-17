"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function NoticeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hideUntil = localStorage.getItem("hideNoticeUntil");
    const isHiddenForToday = hideUntil && new Date(hideUntil) > new Date();
    const hasBeenShown = sessionStorage.getItem("noticeShown");

    if (!isHiddenForToday && !hasBeenShown) {
      setIsOpen(true);
      sessionStorage.setItem("noticeShown", "true");
    }
  }, []);

  const handleHideToday = () => {
    const tomorrow = new Date();
    tomorrow.setHours(24, 0, 0, 0); // Next midnight
    localStorage.setItem("hideNoticeUntil", tomorrow.toISOString());
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!mounted || !isOpen) return null;

  return (
    <div 
      role="dialog"
      aria-modal="false"
      aria-labelledby="notice-title"
      className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-[450px] translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-2xl sm:rounded-lg animate-in fade-in-0 zoom-in-95 duration-200"
    >
      <div className="flex flex-col space-y-1.5 text-center sm:text-left">
        <h2 id="notice-title" className="text-xl font-bold tracking-tight">공지사항</h2>
      </div>

      <button
        onClick={handleClose}
        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">닫기</span>
      </button>

      <div className="py-2 text-[14px] text-muted-foreground flex flex-col gap-4">
        <div className="bg-primary/5 border border-primary/10 p-3 rounded-lg text-foreground/90 leading-relaxed">
          현재 세종 신문고는 <strong>컴퓨터공학과 학생회와 함께 의견 수렴 및 운영 방향에 대해 논의를 진행 중</strong>입니다.
        </div>

        <div className="space-y-3 leading-relaxed">
          <p className="flex gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>특히 <strong>컴퓨터공학과 소속 학생들은 청원 작성, 투표, 댓글 등의 기능을 이용할 수 있을 뿐만 아니라</strong>, 청원이 승인될 경우 <strong>컴퓨터공학과 학생회 측에서 해당 청원을 검토하고 안건을 처리할 수 있습니다.</strong></span>
          </p>
          <p className="flex gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>학우분들의 실제 참여와 의견이 모이면, 추후 다른 학과 학생회에도 순차적으로 컨택하여 참여 범위를 확대해나갈 예정입니다.</span>
          </p>
        </div>


        <div className="bg-muted/40 p-3 rounded-lg text-[13px] mt-1 space-y-1">
          <p>💡 학교생활 중 개선되었으면 하는 부분이 있다면 세종 신문고에 청원으로 남겨주세요.</p>
          <p>💡 서비스 사용 후 희망 사항이나 개선 의견도 함께 남겨주시면 운영에 참고하겠습니다.</p>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-2 mt-2">
        <Button variant="outline" onClick={handleHideToday} className="w-full sm:w-auto">
          오늘 하루 보지 않기
        </Button>
        <Button onClick={handleClose} className="w-full sm:w-auto">
          닫기
        </Button>
      </div>
    </div>
  );
}
