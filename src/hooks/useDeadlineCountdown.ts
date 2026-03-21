"use client";
import { useState, useEffect } from "react";

export function useDeadlineCountdown(deadlineAt: string | null) {
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!deadlineAt) {
      setDaysRemaining(null);
      return;
    }
    const calc = () => {
      const now = new Date();
      const deadline = new Date(deadlineAt);
      const diff = deadline.getTime() - now.getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      if (days <= 0) {
        setExpired(true);
        setDaysRemaining(0);
      } else {
        setExpired(false);
        setDaysRemaining(days);
      }
    };
    calc();
    const interval = setInterval(calc, 60000);
    return () => clearInterval(interval);
  }, [deadlineAt]);

  return { daysRemaining, expired };
}
