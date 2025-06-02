import useRunOnce from './useRunOnce';
import {
  computed,
  onMounted,
  onUnmounted,
  ref,
  type ShallowRef,
} from 'vue';

type UseResizeObserverOptions = {
  defer?: boolean;
};

const useResizeObserver = <T extends (dims: DOMRectReadOnly) => void>(
  templateRef: HTMLElement,
  cb: T,
  { defer = false }: UseResizeObserverOptions = {}
) => {
  const observerRef = ref<ResizeObserver | null>(null);

  const runCb = () => {
    if (templateRef) {
      cb(templateRef.getBoundingClientRect());
    }
  };


  let dep = false;
  if (templateRef) {
    dep = templateRef.offsetWidth > 0  || templateRef.offsetHeight > 0
  }

  useRunOnce(runCb, true);

  if (!observerRef.value) {
    observerRef.value = new ResizeObserver((entries) => {
      cb(entries[0].contentRect);
    });
  }

  if (templateRef && !defer) {
    observerRef.value.observe(templateRef);
  }
};

export default useResizeObserver;
