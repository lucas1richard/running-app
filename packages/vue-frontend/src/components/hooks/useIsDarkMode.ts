import { inject, onUnmounted, provide, ref } from 'vue';

function useIsDarkMode() {
  const isDarkMode = ref<boolean | null>(document.documentElement.getAttribute('data-darkreader-mode') === 'dynamic'
    || window.matchMedia('(prefers-color-scheme: dark)').matches);

  const handleDarkModeChange = (event: MediaQueryListEvent) => {
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

export const injectIsDarkMode = () => {
  const isDarkMode = ref<boolean | null>(null);
  const injectedIsDarkMode = inject('isDarkMode', isDarkMode);

  return injectedIsDarkMode;
}

export default useIsDarkMode;
