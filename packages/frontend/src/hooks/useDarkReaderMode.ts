import { useEffect, useState } from 'react';

// Add this hook to detect Dark Reader
function useDarkReaderMode() {
  const [isDarkMode, setIsDarkMode] = useState<boolean | null>(() => {
    // Initial state check
    return document.documentElement.getAttribute('data-darkreader-mode') === 'dynamic' || window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  useEffect(() => {
    // Create mutation observer to watch for Dark Reader changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' && 
          mutation.attributeName === 'data-darkreader-mode'
        ) {
          const darkReaderMode = document.documentElement.getAttribute('data-darkreader-mode');
          setIsDarkMode(darkReaderMode === 'dynamic');
        }
      });
    });
    
    // Start observing the HTML element for attribute changes
    observer.observe(document.documentElement, { attributes: true });
    
    // 2. Observe system dark mode preference changes
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Modern approach using addEventListener
    const handleDarkModeChange = (event: MediaQueryListEvent) => {
      // Only update if Dark Reader isn't active
      if (document.documentElement.getAttribute('data-darkreader-mode') !== 'dynamic') {
        setIsDarkMode(event.matches);
      }
    };
    
    // Add the listener
    darkModeMediaQuery.addEventListener('change', handleDarkModeChange);
    
    // Cleanup observer on component unmount
    return () => {
      observer.disconnect();
      darkModeMediaQuery.removeEventListener('change', handleDarkModeChange);
    }
  }, []);
  
  
  return isDarkMode;
}

export default useDarkReaderMode;
