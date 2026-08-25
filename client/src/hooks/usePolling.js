import { useEffect, useRef } from "react";

export default function usePolling(fn, intervalMs = 2000) {
  const savedFn = useRef(fn);
  savedFn.current = fn;

  useEffect(() => {
    savedFn.current(); // 立即执行
    const id = setInterval(() => savedFn.current(), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
}
