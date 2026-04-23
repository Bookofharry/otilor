import { useCallback, useContext, createContext } from 'react';

// Analytics Event Types based on userflows.md
export type AnalyticsEventName =
  // Sprint 1 Events
  | 'create_invoice_clicked'
  | 'invoice_builder_opened'
  | 'invoice_draft_saved'
  | 'invoice_save_failed'
  | 'client_created'
  | 'client_selected'
  // Sprint 2 Events
  | 'invoice_detail_viewed'
  | 'invoice_mark_sent_clicked'
  | 'invoice_mark_sent_succeeded'
  | 'invoice_mark_paid_clicked'
  | 'invoice_mark_paid_succeeded'
  | 'invoice_pdf_downloaded'
  // Sprint 3 Events
  | 'send_invoice_clicked'
  | 'invoice_send_attempted'
  | 'invoice_send_succeeded'
  | 'invoice_send_failed'
  | 'upgrade_modal_viewed'
  | 'upgrade_started'
  | 'upgrade_completed';

// Event Properties Interface
export interface AnalyticsEventProperties {
  // Common properties
  platform?: 'web' | 'mobile';
  breakpoint?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  timestamp?: string;
  session_id?: string;
  user_id?: string;

  // Invoice-related properties
  invoice_id?: string;
  invoice_number?: string;
  invoice_status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'void';
  invoice_amount?: number;
  invoice_currency?: string;

  // Client-related properties
  client_id?: string;
  client_name?: string;
  is_new_client?: boolean;

  // Error properties
  error_code?: string;
  error_message?: string;
  retry_count?: number;

  // Send/Upgrade properties
  email_recipient?: string;
  has_attachment?: boolean;
  upgrade_plan?: 'monthly' | 'yearly';
  upgrade_amount?: number;

  // Navigation properties
  source_page?: string;
  target_page?: string;

  // Feature flags
  is_premium_user?: boolean;
  feature_flag_enabled?: boolean;
}

// Analytics Event Interface
export interface AnalyticsEvent {
  name: AnalyticsEventName;
  properties: AnalyticsEventProperties;
  timestamp: string;
}

// Analytics Context Type
export interface AnalyticsContextType {
  track: (eventName: AnalyticsEventName, properties?: Partial<AnalyticsEventProperties>) => void;
  trackError: (eventName: AnalyticsEventName, error: Error, properties?: Partial<AnalyticsEventProperties>) => void;
  setUserProperties: (properties: Record<string, unknown>) => void;
  identify: (userId: string, traits?: Record<string, unknown>) => void;
  reset: () => void;
}

// Create the context
export const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

// Hook to use analytics
export function useAnalytics(): AnalyticsContextType {
  const context = useContext(AnalyticsContext);

  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }

  return context;
}

// Helper to get current breakpoint
function getCurrentBreakpoint(): AnalyticsEventProperties['breakpoint'] {
  const width = window.innerWidth;
  if (width < 375) return 'xs';
  if (width < 768) return 'sm';
  if (width < 1024) return 'md';
  if (width < 1280) return 'lg';
  if (width < 1440) return 'xl';
  return '2xl';
}

// Helper to get session ID
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
}

// Create analytics hook factory (for use in provider)
export function useAnalyticsFactory(
  sendEvent: (event: AnalyticsEvent) => void,
  userId?: string
): AnalyticsContextType {
  const track = useCallback(
    (eventName: AnalyticsEventName, properties: Partial<AnalyticsEventProperties> = {}) => {
      const event: AnalyticsEvent = {
        name: eventName,
        properties: {
          platform: 'web',
          breakpoint: getCurrentBreakpoint(),
          timestamp: new Date().toISOString(),
          session_id: getSessionId(),
          user_id: userId,
          ...properties,
        },
        timestamp: new Date().toISOString(),
      };

      // Send to analytics provider
      sendEvent(event);

      // Also log to console in development
      if (import.meta.env.DEV) {
        console.log('[Analytics]', eventName, event.properties);
      }
    },
    [sendEvent, userId]
  );

  const trackError = useCallback(
    (eventName: AnalyticsEventName, error: Error, properties: Partial<AnalyticsEventProperties> = {}) => {
      track(eventName, {
        ...properties,
        error_message: error.message,
        error_code: (error as Error & { code?: string }).code || 'UNKNOWN_ERROR',
      });
    },
    [track]
  );

  const setUserProperties = useCallback(
    (properties: Record<string, unknown>) => {
      if (import.meta.env.DEV) {
        console.log('[Analytics] Set user properties:', properties);
      }
      // TODO: Implement with actual analytics provider
    },
    []
  );

  const identify = useCallback(
    (id: string, traits?: Record<string, unknown>) => {
      if (import.meta.env.DEV) {
        console.log('[Analytics] Identify user:', id, traits);
      }
      // TODO: Implement with actual analytics provider
    },
    []
  );

  const reset = useCallback(() => {
    sessionStorage.removeItem('analytics_session_id');
    if (import.meta.env.DEV) {
      console.log('[Analytics] Reset');
    }
    // TODO: Implement with actual analytics provider
  }, []);

  return {
    track,
    trackError,
    setUserProperties,
    identify,
    reset,
  };
}

// Convenience hooks for specific event categories
export function useInvoiceAnalytics() {
  const { track, trackError } = useAnalytics();

  return {
    trackCreateInvoice: (source: string) =>
      track('create_invoice_clicked', { source_page: source }),

    trackBuilderOpened: (invoiceId?: string) =>
      track('invoice_builder_opened', { invoice_id: invoiceId }),

    trackDraftSaved: (invoiceId: string, amount: number) =>
      track('invoice_draft_saved', { invoice_id: invoiceId, invoice_amount: amount }),

    trackSaveFailed: (error: Error, invoiceId?: string) =>
      trackError('invoice_save_failed', error, { invoice_id: invoiceId }),

    trackDetailViewed: (invoiceId: string, status: string) =>
      track('invoice_detail_viewed', { invoice_id: invoiceId, invoice_status: status as AnalyticsEventProperties['invoice_status'] }),

    trackMarkSent: (invoiceId: string) =>
      track('invoice_mark_sent_clicked', { invoice_id: invoiceId }),

    trackMarkSentSuccess: (invoiceId: string) =>
      track('invoice_mark_sent_succeeded', { invoice_id: invoiceId }),

    trackMarkPaid: (invoiceId: string, amount: number) =>
      track('invoice_mark_paid_clicked', { invoice_id: invoiceId, invoice_amount: amount }),

    trackMarkPaidSuccess: (invoiceId: string, amount: number) =>
      track('invoice_mark_paid_succeeded', { invoice_id: invoiceId, invoice_amount: amount }),

    trackPdfDownload: (invoiceId: string) =>
      track('invoice_pdf_downloaded', { invoice_id: invoiceId }),
  };
}

export function useClientAnalytics() {
  const { track } = useAnalytics();

  return {
    trackClientCreated: (clientId: string, clientName: string) =>
      track('client_created', { client_id: clientId, client_name: clientName, is_new_client: true }),

    trackClientSelected: (clientId: string, clientName: string, source: string) =>
      track('client_selected', { client_id: clientId, client_name: clientName, source_page: source }),
  };
}

export function useSendAnalytics() {
  const { track, trackError } = useAnalytics();

  return {
    trackSendClicked: (invoiceId: string) =>
      track('send_invoice_clicked', { invoice_id: invoiceId }),

    trackSendAttempted: (invoiceId: string, recipient: string) =>
      track('invoice_send_attempted', { invoice_id: invoiceId, email_recipient: recipient }),

    trackSendSuccess: (invoiceId: string, recipient: string) =>
      track('invoice_send_succeeded', { invoice_id: invoiceId, email_recipient: recipient }),

    trackSendFailed: (error: Error, invoiceId: string, recipient: string, retryCount?: number) =>
      trackError('invoice_send_failed', error, {
        invoice_id: invoiceId,
        email_recipient: recipient,
        retry_count: retryCount,
      }),
  };
}

export function useUpgradeAnalytics() {
  const { track } = useAnalytics();

  return {
    trackUpgradeModalViewed: (source: string) =>
      track('upgrade_modal_viewed', { source_page: source }),

    trackUpgradeStarted: (plan: 'monthly' | 'yearly', amount: number) =>
      track('upgrade_started', { upgrade_plan: plan, upgrade_amount: amount }),

    trackUpgradeCompleted: (plan: 'monthly' | 'yearly', amount: number) =>
      track('upgrade_completed', { upgrade_plan: plan, upgrade_amount: amount }),
  };
}
