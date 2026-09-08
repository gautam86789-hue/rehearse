import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';
import App from './App';

if (Platform.OS === 'web' && typeof document !== 'undefined') {
  // Inject Google Fonts and font-smoothing CSS for world-class rendering
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700;800&display=swap');
    
    * {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
      box-sizing: border-box;
    }
    
    body, html, #root {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
  `;
  document.head.appendChild(styleEl);

  document.documentElement.style.backgroundColor = '#07100D';
  document.body.style.backgroundColor = '#07100D';
  const root = document.getElementById('root');
  if (root) {
    root.style.backgroundColor = '#07100D';
    root.style.height = '100%';
    root.style.width = '100%';
  }
}

registerRootComponent(App);
