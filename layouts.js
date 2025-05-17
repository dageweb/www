
function switchLanguage() {
  const selector = document.getElementById('langSelector');
  const newLang = selector.value;

  if (!newLang) return;

  document.cookie = `language=${newLang}; path=/; max-age=${60 * 60 * 24 * 365}`;
  loadPublicComponents();

  if (eventLanguageChanged !== null) {
    eventLanguageChanged(newLang);
  }
}
function setLanguageInSelector() {
  const selector = document.getElementById('langSelector');
  if (selector) {
    const lang = getCookie('language') || 'en';
    selector.value = lang;
  }
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

const language = getCookie('language') || 'en';


const basePaths = [
  'https://laylayout.pages.dev/',
  'https://raw.githubusercontent.com/wwwdageparty/htmlComponents/refs/heads/master/'
];

function loadLocalizedComponent(baseName, targetId) {
  const lang = (typeof language !== 'undefined' && language !== 'en') ? language : null;
  const localizedFile = lang ? `${baseName.replace('.html', '')}-${lang}.html` : null;
  const fallbackFile = baseName;

  const filesToTry = lang ? [localizedFile, fallbackFile] : [fallbackFile];
  let fileIndex = 0;
  let pathIndex = 0;

  function tryNext() {
    if (fileIndex >= filesToTry.length) {
      console.error(`Failed to load ${baseName} from all paths.`);
      return;
    }

    const file = filesToTry[fileIndex];
    const url = `${basePaths[pathIndex]}${file}`;

    fetch(url)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error ${res.status} for ${url}`);
        }
        return res.text();
      })
      .then(html => {
        document.getElementById(targetId).innerHTML = html;
        if (targetId === 'header' && typeof setLanguageInSelector === 'function') {
          setLanguageInSelector();
        }
      })
      .catch((err) => {
        console.warn(`Failed to load ${url}:`, err.message || err);
        pathIndex++;
        if (pathIndex < basePaths.length) {
          tryNext(); // try next base path for current file
        } else {
          pathIndex = 0;
          fileIndex++;
          tryNext(); // try next file (fallback) from first path
        }
      });
  }

  tryNext();
}

const publicComponents = ['header', 'footer'];

function loadPublicComponents() {
  componentsToLoad.forEach(componentName => {
    loadLocalizedComponent(`${componentName}.html`, componentName);
  });
}

loadPublicComponents();
