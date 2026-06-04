import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SelectivePreloadingStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    if (route.data?.['preload'] !== true) return of(null);

    return new Observable(subscriber => {
      let innerSubscription: { unsubscribe: () => void } | null = null;
      let idleId: number | null = null;
      let timerId: ReturnType<typeof setTimeout> | null = null;

      const start = () => {
        innerSubscription = load().subscribe(subscriber);
      };

      timerId = setTimeout(() => {
        timerId = null;
        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
          idleId = window.requestIdleCallback(start, { timeout: 3000 });
        } else {
          start();
        }
      }, 6000);

      return () => {
        innerSubscription?.unsubscribe();
        if (idleId !== null && typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
          window.cancelIdleCallback(idleId);
        }
        if (timerId !== null) clearTimeout(timerId);
      };
    });
  }
}
