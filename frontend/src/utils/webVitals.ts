export interface WebVitalMetric {
  name: 'LCP' | 'INP' | 'CLS' | 'FCP' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

function rateMetric(name: WebVitalMetric['name'], value: number): WebVitalMetric['rating'] {
  switch (name) {
    case 'LCP':
      return value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
    case 'INP':
      return value <= 200 ? 'good' : value <= 500 ? 'needs-improvement' : 'poor';
    case 'CLS':
      return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor';
    case 'FCP':
      return value <= 1800 ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor';
    case 'TTFB':
      return value <= 800 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor';
  }
}

/**
 * Monitoreo de rendimiento de usuarios reales (RUM - Core Web Vitals: LCP, INP, CLS, FCP, TTFB)
 * usando PerformanceObserver nativo sin librerías pesadas de terceros.
 */
export function initCoreWebVitals(onReport?: (metric: WebVitalMetric) => void) {
  if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') return;

  const emit = (name: WebVitalMetric['name'], rawValue: number) => {
    const value = name === 'CLS' ? Number(rawValue.toFixed(4)) : Math.round(rawValue);
    const metric: WebVitalMetric = { name, value, rating: rateMetric(name, value) };
    (window as unknown as Record<string, Record<string, WebVitalMetric>>).__WEB_VITALS__ = {
      ...((window as unknown as Record<string, Record<string, WebVitalMetric>>).__WEB_VITALS__ || {}),
      [name]: metric,
    };
    if (onReport) onReport(metric);
  };

  // 1. Largest Contentful Paint (LCP)
  try {
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const last = entries[entries.length - 1];
      if (last) emit('LCP', last.startTime);
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {}

  // 2. Cumulative Layout Shift (CLS)
  try {
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries() as (PerformanceEntry & {
        hadRecentInput?: boolean;
        value?: number;
      })[]) {
        if (!entry.hadRecentInput && typeof entry.value === 'number') {
          clsValue += entry.value;
          emit('CLS', clsValue);
        }
      }
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });
  } catch {}

  // 3. Interaction to Next Paint (INP)
  try {
    let maxInp = 0;
    const inpObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.duration > maxInp) {
          maxInp = entry.duration;
          emit('INP', maxInp);
        }
      }
    });
    inpObserver.observe({ type: 'event', buffered: true } as PerformanceObserverInit);
  } catch {}

  // 4. TTFB desde Navigation Timing
  try {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    if (nav && nav.responseStart > 0) {
      emit('TTFB', nav.responseStart);
    }
  } catch {}
}

