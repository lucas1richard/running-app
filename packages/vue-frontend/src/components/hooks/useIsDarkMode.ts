import { computed, onUnmounted, ref, watchEffect } from 'vue';

function useDarkMode() {
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

export default useDarkMode;
