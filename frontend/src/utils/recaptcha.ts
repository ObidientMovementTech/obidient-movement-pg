const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;
const SCRIPT_ID = 'recaptcha-v3';

let loadPromise: Promise<void> | null = null;

/** Lazily loads the reCAPTCHA v3 script once. */
function ensureLoaded(): Promise<void> {
  if (loadPromise) return loadPromise;
  if (!SITE_KEY) {
    // No site key — skip silently (dev convenience)
    return Promise.resolve();
  }
  loadPromise = new Promise((resolve, reject) => {
    if (document.getElementById(SCRIPT_ID)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load reCAPTCHA'));
    document.head.appendChild(script);
  });
  return loadPromise;
}

/**
 * Execute reCAPTCHA v3 for the given action and return a token.
 * Returns `undefined` if the site key is not configured or if execution fails.
 * Never throws — the request always proceeds to the server, which decides
 * whether to enforce reCAPTCHA verification.
 */
export async function getRecaptchaToken(action: string): Promise<string | undefined> {
  if (!SITE_KEY) return undefined;
  try {
    await ensureLoaded();
    const grecaptcha = (window as any).grecaptcha;
    if (!grecaptcha) {
      console.warn('reCAPTCHA: script loaded but grecaptcha not available');
      return undefined;
    }
    const token: string = await grecaptcha.execute(SITE_KEY, { action });
    return token;
  } catch (err) {
    console.warn('reCAPTCHA: token generation failed', err);
    return undefined;
  }
}
