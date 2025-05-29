const SSR = typeof window === 'undefined';

export function testPlatform(re: RegExp) {
  return !SSR && window.navigator != null
    ? re.test(
        (window.navigator as any)['userAgentData']?.platform ||
          // eslint-disable-next-line @typescript-eslint/no-deprecated
          window.navigator.platform
      )
    : false;
}

function cached(fn: () => boolean) {
  if (process.env.NODE_ENV === 'test') {
    return fn;
  }

  let res: boolean | null = null;
  return () => {
    if (res == null) {
      res = fn();
    }
    return res;
  };
}

export const isMac = cached(() => testPlatform(/^Mac/i));

export const isIPhone = cached(() => testPlatform(/^iPhone/i));

export const isIPod = cached(() => testPlatform(/^iPod/i));

export const isIPad = cached(
  () =>
    testPlatform(/^iPad/i) ||
    // iPadOS 13 lies and says it's a Mac, but we can distinguish by detecting touch support.
    (isMac() && navigator.maxTouchPoints > 1)
);

export const isIOS = cached(function () {
  return isIPhone() || isIPad();
});

export const isAppleDevice = cached(function () {
  return isMac() || isIOS() || isIPod() || isIPad();
});

export function isModKey(event: KeyboardEvent | MouseEvent) {
  return isMac() ? event.metaKey : event.ctrlKey;
}
