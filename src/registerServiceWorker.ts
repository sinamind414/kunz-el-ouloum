import { APP_VERSION, DATA_VERSION } from './config/appConfig';

type UpdateListener = () => void;

const listeners = new Set<UpdateListener>();
let pendingRegistration: ServiceWorkerRegistration | null = null;
let reloadOnControllerChange = false;
let controllerChangeBound = false;

function notifyUpdateReady() {
  listeners.forEach((listener) => listener());
}

function markUpdateReady(registration: ServiceWorkerRegistration) {
  if (!registration.waiting) return;
  pendingRegistration = registration;
  notifyUpdateReady();
}

function bindControllerChangeReload() {
  if (controllerChangeBound || typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  controllerChangeBound = true;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!reloadOnControllerChange) return;
    reloadOnControllerChange = false;
    window.location.reload();
  });
}

function watchRegistration(registration: ServiceWorkerRegistration) {
  if (registration.waiting) {
    markUpdateReady(registration);
  }

  registration.addEventListener('updatefound', () => {
    const installing = registration.installing;
    if (!installing) return;

    installing.addEventListener('statechange', () => {
      if (installing.state === 'installed' && navigator.serviceWorker.controller) {
        markUpdateReady(registration);
      }
    });
  });
}

export function subscribeToServiceWorkerUpdates(listener: UpdateListener) {
  listeners.add(listener);
  if (pendingRegistration?.waiting) listener();
  return () => {
    listeners.delete(listener);
  };
}

export function applyServiceWorkerUpdate(): boolean {
  if (!pendingRegistration?.waiting) return false;
  reloadOnControllerChange = true;
  pendingRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
  return true;
}

export function registerServiceWorker() {
  if (!import.meta.env.PROD) return;
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  bindControllerChangeReload();

  window.addEventListener('load', () => {
    const swVersion = `${APP_VERSION}::${DATA_VERSION}`;
    void navigator.serviceWorker
      .register(`/sw.js?v=${encodeURIComponent(swVersion)}`)
      .then((registration) => {
        watchRegistration(registration);
        void registration.update().catch(() => {});
      })
      .catch(() => {});
  });
}
