import { inject, onUnmounted, provide, ref, watch, type Ref } from 'vue';

function useIsDarkMode() {
  const isDarkMode = ref<boolean | null>(document.documentElement.getAttribute('data-darkreader-mode') === 'dynamic'
    || window.matchMedia('(prefers-color-scheme: dark)').matches);

  const handleDarkModeChange = (event: MediaQueryListEvent) => {
    console.log(isDarkMode, event.matches)
    isDarkMode.value = event.matches;
  };
  
  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  darkModeMediaQuery.addEventListener('change', handleDarkModeChange);

  onUnmounted(() => {
    darkModeMediaQuery.removeEventListener('change', handleDarkModeChange);
  });
  
  
  return isDarkMode;
}

export const provideIsDarkMode = () => {
  const isDarkMode = useIsDarkMode();
  provide('isDarkMode', isDarkMode);
}

export const injectIsDarkMode = (): Ref<boolean> => {
  const isDarkMode = ref<boolean>(false);
  const injectedIsDarkMode = inject<Ref<boolean>>('isDarkMode', isDarkMode);
  return injectedIsDarkMode;
}
