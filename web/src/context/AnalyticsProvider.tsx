import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { AnalyticsEvent } from './useAnalytics';
import {
  AnalyticsContext,
  useAnalyticsFactory,
} from './useAnalytics';

// Analytics configuration
interface AnalyticsConfig {
  enabled: boolean;
  endpoint?: string;
  apiKey?: string;
  batchSize?: number;
  flushInterval?: number;
  debug?: boolean;
}

// Props for the provider
interface AnalyticsProviderProps {
  children: React.ReactNode;
  config?: Partial<AnalyticsConfig>;
  userId?: string;
}

// Default configuration
const defaultConfig: AnalyticsConfig = {
  enabled: true,
  batchSize: 10,
  flushInterval: 5000, // 5 seconds
  debug: import.meta.env.DEV,
};

export function AnalyticsProvider({
  children,
  config: userConfig = {},
  userId,
}: AnalyticsProviderProps) {
  const config = { ...defaultConfig, ...userConfig };
  const [isInitialized, setIsInitialized] = useState(false);
  const eventQueueRef = useRef<AnalyticsEvent[]>([]);
  const flushTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize analytics
  useEffect(() => {
    if (!config.enabled) {
      console.log('[Analytics] Disabled');
      return;
    }

    // TODO: Initialize actual analytics provider (Segment, Mixpanel, Amplitude, etc.)
    if (config.debug) {
      console.log('[Analytics] Initialized with config:', config);
    }

    setIsInitialized(true);

    // Track session start
    // Note: 'session_started' is not in the main event list, using a generic approach
    if (config.debug) {
      console.log('[Analytics] Session started for user:', userId);
    }

    return () => {
      // Flush remaining events on unmount
      flushEvents();
    };
  }, [config.enabled, config.debug, userId]);

  // Send event to analytics provider
  const sendEvent = useCallback(
    async (event: AnalyticsEvent) => {
      if (!config.enabled) return;

      // Add to queue
      eventQueueRef.current.push(event);

      // Flush if batch size reached
      if (eventQueueRef.current.length >= (config.batchSize || 10)) {
        await flushEvents();
      } else {
        // Schedule flush
        scheduleFlush();
      }

      // Also send immediately to console in debug mode
      if (config.debug) {
        console.log('[Analytics Event]', event.name, event.properties);
      }
    },
    [config.enabled, config.batchSize, config.debug]
  );

  // Flush events to analytics endpoint
  const flushEvents = useCallback(async () => {
    if (eventQueueRef.current.length === 0) return;

    const events = [...eventQueueRef.current];
    eventQueueRef.current = [];

    // Clear scheduled flush
    if (flushTimeoutRef.current) {
      clearTimeout(flushTimeoutRef.current);
      flushTimeoutRef.current = null;
    }

    try {
      // TODO: Send to actual analytics endpoint
      if (config.endpoint) {
        const response = await fetch(config.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(config.apiKey && { Authorization: `Bearer ${config.apiKey}` }),
          },
          body: JSON.stringify({ events }),
        });

        if (!response.ok) {
          throw new Error(`Analytics API error: ${response.status}`);
        }
      }

      if (config.debug) {
        console.log('[Analytics] Flushed', events.length, 'events');
      }
    } catch (error) {
      // Re-queue events on failure
      eventQueueRef.current.unshift(...events);
      console.error('[Analytics] Failed to flush events:', error);
    }
  }, [config.endpoint, config.apiKey, config.debug]);

  // Schedule a flush
  const scheduleFlush = useCallback(() => {
    if (flushTimeoutRef.current) return;

    flushTimeoutRef.current = setTimeout(() => {
      flushEvents();
      flushTimeoutRef.current = null;
    }, config.flushInterval);
  }, [config.flushInterval, flushEvents]);

  // Create analytics instance
  const analytics = useAnalyticsFactory(sendEvent, userId);

  // Track page views
  useEffect(() => {
    if (!isInitialized) return;

    const handleRouteChange = () => {
      // Track as invoice_detail_viewed when on detail page
      const path = window.location.pathname;
      if (path.includes('/invoices/') && path !== '/invoices') {
        // This will be tracked by the DetailPage component with proper invoice_id
        return;
      }
    };

    // Track initial page view
    handleRouteChange();

    // Listen for route changes (if using React Router)
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [isInitialized, analytics]);

  // Track user interactions
  useEffect(() => {
    if (!isInitialized || !config.enabled) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const trackableElement = target.closest('[data-analytics]');

      if (trackableElement) {
        const eventName = trackableElement.getAttribute('data-analytics');
        const eventProps = trackableElement.getAttribute('data-analytics-props');

        if (eventName) {
          analytics.track(eventName as Parameters<typeof analytics.track>[0], eventProps ? JSON.parse(eventProps) : {});
        }
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [isInitialized, config.enabled, analytics]);

  // Flush events before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      flushEvents();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [flushEvents]);

  return (
    <AnalyticsContext.Provider value={analytics}>
      {children}
    </AnalyticsContext.Provider>
  );
}


