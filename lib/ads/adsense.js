const ADSENSE_SCRIPT_SELECTOR = 'script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]';

export function isAdSenseScriptLoaded() {
  return typeof window !== 'undefined' && typeof window.adsbygoogle !== 'undefined';
}

export function isAdUnitInitialized(ins) {
  if (!ins) return false;
  return Boolean(
    ins.getAttribute('data-adsbygoogle-status') ||
      ins.getAttribute('data-ad-status') ||
      ins.dataset.adInitialized === 'true'
  );
}

/**
 * Resolves when window.adsbygoogle is available (script already in <head>).
 */
export function waitForAdSense({ timeoutMs = 10000, intervalMs = 100 } = {}) {
  if (typeof window === 'undefined') {
    return Promise.resolve(false);
  }

  if (isAdSenseScriptLoaded()) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const started = Date.now();

    const finish = (ready) => {
      window.clearInterval(interval);
      scriptEl?.removeEventListener('load', onLoad);
      scriptEl?.removeEventListener('error', onError);
      resolve(ready);
    };

    const onLoad = () => finish(isAdSenseScriptLoaded());
    const onError = () => finish(false);

    const scriptEl = document.querySelector(ADSENSE_SCRIPT_SELECTOR);
    scriptEl?.addEventListener('load', onLoad);
    scriptEl?.addEventListener('error', onError);

    const interval = window.setInterval(() => {
      if (isAdSenseScriptLoaded()) {
        finish(true);
      } else if (Date.now() - started >= timeoutMs) {
        finish(false);
      }
    }, intervalMs);
  });
}

/**
 * Push a single ad unit once. Never throws — safe for Strict Mode retries.
 */
export function pushAdUnit(ins) {
  if (!ins || isAdUnitInitialized(ins)) return false;
  if (!isAdSenseScriptLoaded()) return false;

  try {
    ins.dataset.adInitialized = 'true';
    (window.adsbygoogle = window.adsbygoogle || []).push({});
    return true;
  } catch {
    delete ins.dataset.adInitialized;
    return false;
  }
}
