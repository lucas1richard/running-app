import { useCallback, useEffect, useRef } from 'react';
import useRunOnce from './useRunOnce';

type UseResizeObserverOptions = {
  defer?: boolean;
};

const useResizeObserver = <T extends (dims: DOMRectReadOnly) => void>(
  ref: React.RefObject<HTMLElement>,
  cb: T,
  { defer = false }: UseResizeObserverOptions = {}
) => {
  const observerRef = useRef<ResizeObserver | null>(null);

  const runCb = useCallback(() => {
    if (ref.current) {
      cb(ref.current.getBoundingClientRect());
    }
  }, [cb, ref]);
  useRunOnce(runCb, ref.current?.offsetWidth > 0  || ref.current?.offsetHeight > 0);

  useEffect(() => {
    if (!observerRef.current) {
      observerRef.current = new ResizeObserver((entries) => {
        cb(entries[0].contentRect);
      });
    }

    if (ref.current && !defer) {
      observerRef.current.observe(ref.current);
    }

    return () => {
      observerRef.current.disconnect();
    };
  }, [ref, cb, defer]);
};

export default useResizeObserver;
