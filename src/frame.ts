import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import focusLock from 'dom-focus-lock';

const IFRAME_MESSAGES = {
  VERIFF_HANDSHAKE: 'VERIFF_HANDSHAKE',
  VERIFF_RENDER: 'VERIFF_RENDER',
  VERIFF_FINISHED: 'VERIFF_FINISHED',
  VERIFF_CANCELED: 'VERIFF_CANCELED',
};

const CLIENT_MESSAGES = {
  FINISHED: 'FINISHED',
  CANCELED: 'CANCELED',
};

const wrapperStyles =
  '\n  position: fixed !important;\n  top: 0 !important;\n  right: 0 !important;\n  bottom: 0 !important;\n  left: 0 !important;\n  z-index: 9999999;\n  display: block !important;\n  width: 100vw;\n  height: 100%;\n  margin: 0 !important;\n  padding: 0 !important;\n  overflow: auto;\n  -webkit-overflow-scrolling: touch;\n  background: rgba(0, 0, 0, 0.6);\n';
const iframeStyles =
  '\n  position: absolute !important;\n  top: 0 !important;\n  right: 0 !important;\n  bottom: 0 !important;\n  left: 0 !important;\n  width: 100vw;\n  height: 100%;\n  margin: 0 !important;\n  padding: 0 !important;\n  background: none;\n  border: none\n';

const IFRAME_ID = 'veriffFrame';

export interface CreationFrameOptions {
  url?: string;
  onEvent(event): void;
}

export function createVeriffFrame(options: CreationFrameOptions) {
  const url = options.url;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const onEvent = options.onEvent ? options.onEvent : function() {};

  if (!url) {
    throw new Error('URL is not provided. Please provide a valid Veriff session url.');
  }

  function createIframe(url) {
    const frame = document.createElement('iframe');
    frame.src = url;
    frame.allow = 'camera; microphone';
    frame.id = IFRAME_ID;
    frame.style.cssText = iframeStyles;
    const wrapper = document.createElement('div');
    wrapper.style.cssText = wrapperStyles;
    wrapper.appendChild(frame);
    document.body.appendChild(wrapper);
    focusLock.on(frame);
    disableBodyScroll(frame);
    return frame;
  }

  function closeIframe() {
    const frame = document.getElementById(IFRAME_ID);

    if (frame && frame.parentNode) {
      focusLock.off(frame);
      enableBodyScroll(frame);
      const wrapper = frame.parentNode.parentNode;
      wrapper.removeChild(frame.parentNode);
    } else {
      clearAllBodyScrollLocks();
    }
  }

  function handleMessage(event) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    const frame: HTMLIFrameElement = document.getElementById(IFRAME_ID);

    if (event.data === IFRAME_MESSAGES.VERIFF_HANDSHAKE) {
      frame.contentWindow.postMessage(IFRAME_MESSAGES.VERIFF_RENDER, '*');
    }

    if (event.data === IFRAME_MESSAGES.VERIFF_CANCELED) {
      closeIframe();
      window.removeEventListener('message', handleMessage);
      onEvent(CLIENT_MESSAGES.CANCELED);
    }

    if (event.data === IFRAME_MESSAGES.VERIFF_FINISHED) {
      closeIframe();
      window.removeEventListener('message', handleMessage);
      onEvent(CLIENT_MESSAGES.FINISHED);
    }
  }

  createIframe(url);
  window.addEventListener('message', handleMessage);

  return {
    close: closeIframe,
  };
}
