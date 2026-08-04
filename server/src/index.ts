import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'node:crypto';
import { createInvoicePdfBuffer } from './pdf';

type InvoiceStatus = 'Draft' | 'Sent' | 'Overdue' | 'Paid' | 'Void';
type StoredInvoiceStatus = Exclude<InvoiceStatus, 'Overdue'>;
type ApiInvoiceEventType =
  | 'invoice_created'
  | 'invoice_updated'
  | 'invoice_marked_sent'
  | 'invoice_sent_email'
  | 'invoice_marked_paid'
  | 'invoice_voided';

interface FieldError {
  field: string;
  message: string;
}

interface ApiEnvelope<T> {
  data: T;
  meta: Record<string, unknown>;
}

interface CursorMeta {
  next_cursor: string | null;
  has_more: boolean;
}

interface ErrorPayload {
  error: {
    code: string;
    message: string;
    field_errors?: FieldError[];
    details?: Record<string, unknown>;
  };
  request_id: string;
}

interface Address {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

interface ClientRecord {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  billing_address: Address | null;
  created_at: string;
  updated_at: string;
}

interface InvoiceLineItemRecord {
  id: string;
  description: string;
  quantity: string;
  unit_price: string;
  amount: string;
}

interface InvoiceTaxRecord {
  name: string;
  rate_percent: string;
  amount: string;
}

interface InvoiceDiscountRecord {
  type: 'percent' | 'fixed';
  value: string;
  amount: string;
}

interface InvoiceTotalsRecord {
  subtotal: string;
  tax: string;
  discount: string;
  total: string;
}

interface InvoiceRecord {
  id: string;
  number: string;
  client_id: string;
  status: StoredInvoiceStatus;
  issue_date: string;
  due_date: string;
  currency: string;
  line_items: InvoiceLineItemRecord[];
  tax?: InvoiceTaxRecord;
  discount?: InvoiceDiscountRecord;
  totals: InvoiceTotalsRecord;
  notes: string;
  sent_at: string | null;
  paid_at: string | null;
  voided_at: string | null;
  version: number;
  created_at: string;
  updated_at: string;
}

interface InvoiceEventRecord {
  id: string;
  type: ApiInvoiceEventType;
  occurred_at: string;
  actor: string;
}

interface ClientInput {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  billing_address?: unknown;
}

interface InvoiceLineItemInput {
  description?: unknown;
  quantity?: unknown;
  unit_price?: unknown;
}

interface InvoiceInput {
  client_id?: unknown;
  issue_date?: unknown;
  due_date?: unknown;
  currency?: unknown;
  line_items?: unknown;
  tax?: unknown;
  discount?: unknown;
  notes?: unknown;
}

interface SendEmailInput {
  to?: unknown;
  subject?: unknown;
  message?: unknown;
  attach_pdf?: unknown;
  send_copy_to_me?: unknown;
}

interface IdempotencyRecord {
  payload: string;
  status: number;
  body: ApiEnvelope<unknown>;
  createdAt: number;
}

class AppError extends Error {
  status: number;
  code: string;
  fieldErrors?: FieldError[];
  details?: Record<string, unknown>;

  constructor(
    status: number,
    code: string,
    message: string,
    options?: {
      fieldErrors?: FieldError[];
      details?: Record<string, unknown>;
    },
  ) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.fieldErrors = options?.fieldErrors;
    this.details = options?.details;
  }
}

const JWT_SECRET = process.env.JWT_SECRET ?? 'otilor_dev_secret_change_me';
const JWT_ISSUER = 'otilor';
const JWT_AUDIENCE = 'otilor-api';

interface JwtPayload {
  sub: string;
  email?: string;
  role?: string;
}

interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const header = req.header('Authorization');
  if (!header || !header.startsWith('Bearer ')) {
    sendError(res, new AppError(401, 'UNAUTHORIZED', 'Missing Authorization header.'));
    return;
  }

  const token = header.slice(7).trim();
  try {
    const payload = jwt.verify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }) as JwtPayload;

    req.user = payload;
    next();
  } catch (error) {
    sendError(res, new AppError(401, 'UNAUTHORIZED', 'Invalid or expired token.'));
  }
};

const app = express();
const port = Number(process.env.PORT ?? 4000);

const DEFAULT_CURRENCY = process.env.DEFAULT_CURRENCY ?? 'NGN';
const DEFAULT_ACTOR = 'user_local';
const EMAIL_PATTERN = /\S+@\S+\.\S+/;
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ID_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;

let invoiceCounter = 1;
const clients = new Map<string, ClientRecord>();
const invoices = new Map<string, InvoiceRecord>();
const invoiceEvents = new Map<string, InvoiceEventRecord[]>();
const idempotencyRecords = new Map<string, IdempotencyRecord>();

const randomSuffix = (length = 26): string => {
  const bytes = Array.from(randomBytes(length));
  return bytes.map((value) => ID_ALPHABET[value % ID_ALPHABET.length]).join('');
};

const generateId = (prefix: string): string => `${prefix}_${randomSuffix(20)}`;
const nowIso = (): string => new Date().toISOString();
const todayDate = (): string => nowIso().slice(0, 10);
const roundCurrency = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;
const formatAmount = (value: number): string => roundCurrency(value).toFixed(2);
const cleanString = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');
const requestIdOf = (res: Response): string => String(res.locals.requestId ?? 'req_unknown');

const parseCursor = (value: unknown): number => {
  if (typeof value !== 'string' || value.length === 0) return 0;

  try {
    const decoded = JSON.parse(Buffer.from(value, 'base64').toString('utf8')) as { index?: unknown };
    const index = Number(decoded.index);
    if (!Number.isInteger(index) || index < 0) {
      throw new Error('Invalid cursor');
    }
    return index;
  } catch {
    throw new AppError(422, 'VALIDATION_ERROR', 'Request validation failed.', {
      fieldErrors: [{ field: 'cursor', message: 'Cursor is invalid.' }],
    });
  }
};

const encodeCursor = (index: number): string =>
  Buffer.from(JSON.stringify({ index }), 'utf8').toString('base64');

const sendEnvelope = <T>(res: Response, status: number, data: T, meta: Record<string, unknown> = {}): void => {
  res.status(status).json({ data, meta } satisfies ApiEnvelope<T>);
};

const sendPaginated = <T>(res: Response, status: number, data: T, meta: CursorMeta): void => {
  res.status(status).json({ data, meta });
};

const sendError = (res: Response, error: AppError): void => {
  const payload: ErrorPayload = {
    error: {
      code: error.code,
      message: error.message,
      ...(error.fieldErrors && error.fieldErrors.length > 0 ? { field_errors: error.fieldErrors } : {}),
      ...(error.details ? { details: error.details } : {}),
    },
    request_id: requestIdOf(res),
  };

  res.status(error.status).json(payload);
};

const isDateOnly = (value: string): boolean => {
  if (!DATE_ONLY_PATTERN.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};

const parsePositiveDecimal = (value: string, field: string): number => {
  const parsed = Number(value);
  const valid = Number.isFinite(parsed) && parsed > 0 && Math.round(parsed * 100) === parsed * 100;
  if (!valid) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Request validation failed.', {
      fieldErrors: [{ field, message: 'Value must be a positive decimal with up to 2 decimal places.' }],
    });
  }
  return parsed;
};

const parseNonNegativeDecimal = (value: string, field: string): number => {
  const parsed = Number(value);
  const valid = Number.isFinite(parsed) && parsed >= 0 && Math.round(parsed * 100) === parsed * 100;
  if (!valid) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Request validation failed.', {
      fieldErrors: [{ field, message: 'Value must be a non-negative decimal with up to 2 decimal places.' }],
    });
  }
  return parsed;
};

const effectiveStatusOf = (invoice: InvoiceRecord): InvoiceStatus => {
  if (invoice.status !== 'Sent') return invoice.status;
  return invoice.due_date < todayDate() ? 'Overdue' : 'Sent';
};

const invoiceActionResult = (invoice: InvoiceRecord) => ({
  id: invoice.id,
  status: effectiveStatusOf(invoice),
  sent_at: invoice.sent_at,
  paid_at: invoice.paid_at,
  voided_at: invoice.voided_at,
  version: invoice.version,
});

const serializeInvoice = (invoice: InvoiceRecord) => ({
  ...invoice,
  status: effectiveStatusOf(invoice),
});

const serializeInvoiceListItem = (invoice: InvoiceRecord) => ({
  id: invoice.id,
  number: invoice.number,
  client_id: invoice.client_id,
  status: effectiveStatusOf(invoice),
  due_date: invoice.due_date,
  totals: {
    total: invoice.totals.total,
    currency: invoice.currency,
  },
  updated_at: invoice.updated_at,
});

const clientSummary = (client: ClientRecord) => ({
  id: client.id,
  name: client.name,
  email: client.email,
});

const requireInvoice = (invoiceId: string): InvoiceRecord => {
  const invoice = invoices.get(invoiceId);
  if (!invoice) {
    throw new AppError(404, 'NOT_FOUND', 'Resource not found.');
  }
  return invoice;
};

const requireClient = (clientId: string): ClientRecord => {
  const client = clients.get(clientId);
  if (!client) {
    throw new AppError(404, 'NOT_FOUND', 'Resource not found.');
  }
  return client;
};

const parseAddress = (value: unknown, fieldPrefix: string): Address | null => {
  if (value === undefined) return null;
  if (value === null) return null;
  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Request validation failed.', {
      fieldErrors: [{ field: fieldPrefix, message: 'Billing address must be an object.' }],
    });
  }

  const raw = value as Record<string, unknown>;
  const address: Address = {};
  const knownKeys: Array<keyof Address> = ['line1', 'line2', 'city', 'state', 'postal_code', 'country'];

  for (const key of knownKeys) {
    const normalized = cleanString(raw[key]);
    if (normalized) {
      address[key] = normalized;
    }
  }

  return Object.keys(address).length > 0 ? address : null;
};

function parseClientInput(input: ClientInput): Omit<ClientRecord, 'id' | 'created_at' | 'updated_at'>;
function parseClientInput(
  input: ClientInput,
  partial: false,
): Omit<ClientRecord, 'id' | 'created_at' | 'updated_at'>;
function parseClientInput(
  input: ClientInput,
  partial: true,
): Partial<Omit<ClientRecord, 'id' | 'created_at' | 'updated_at'>>;
function parseClientInput(
  input: ClientInput,
  partial = false,
): Partial<Omit<ClientRecord, 'id' | 'created_at' | 'updated_at'>> {
  const name = cleanString(input.name);
  const rawEmail = input.email;
  const email = rawEmail === null ? null : cleanString(rawEmail);
  const phone = input.phone === null ? null : cleanString(input.phone);
  const billingAddress =
    input.billing_address === undefined ? undefined : parseAddress(input.billing_address, 'billing_address');

  const fieldErrors: FieldError[] = [];

  if (!partial || input.name !== undefined) {
    if (!name) {
      fieldErrors.push({ field: 'name', message: 'Client name is required.' });
    } else if (name.length > 120) {
      fieldErrors.push({ field: 'name', message: 'Client name must be 120 characters or fewer.' });
    }
  }

  if ((input.email !== undefined || !partial) && email && !EMAIL_PATTERN.test(email)) {
    fieldErrors.push({ field: 'email', message: 'Email must be valid.' });
  }

  if (fieldErrors.length > 0) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Request validation failed.', { fieldErrors });
  }

  if (!partial) {
    return {
      name,
      email: email || null,
      phone: phone || null,
      billing_address: billingAddress ?? null,
    };
  }

  const updates: Partial<Omit<ClientRecord, 'id' | 'created_at' | 'updated_at'>> = {};

  if (input.name !== undefined) {
    updates.name = name;
  }
  if (input.email !== undefined) {
    updates.email = email || null;
  }
  if (input.phone !== undefined) {
    updates.phone = phone || null;
  }
  if (input.billing_address !== undefined) {
    updates.billing_address = billingAddress ?? null;
  }

  return updates;
}

const parseInvoiceLineItems = (rawItems: unknown): InvoiceLineItemRecord[] => {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Request validation failed.', {
      fieldErrors: [{ field: 'line_items', message: 'At least one line item is required.' }],
    });
  }

  return rawItems.map((rawItem, index) => {
    if (typeof rawItem !== 'object' || rawItem === null || Array.isArray(rawItem)) {
      throw new AppError(422, 'VALIDATION_ERROR', 'Request validation failed.', {
        fieldErrors: [{ field: `line_items[${index}]`, message: 'Line item must be an object.' }],
      });
    }

    const item = rawItem as InvoiceLineItemInput;
    const description = cleanString(item.description);
    const quantityValue = cleanString(item.quantity);
    const unitPriceValue = cleanString(item.unit_price);
    const fieldErrors: FieldError[] = [];

    if (!description) {
      fieldErrors.push({ field: `line_items[${index}].description`, message: 'Description is required.' });
    }
    if (!quantityValue) {
      fieldErrors.push({ field: `line_items[${index}].quantity`, message: 'Quantity is required.' });
    }
    if (!unitPriceValue) {
      fieldErrors.push({ field: `line_items[${index}].unit_price`, message: 'Unit price is required.' });
    }
    if (fieldErrors.length > 0) {
      throw new AppError(422, 'VALIDATION_ERROR', 'Request validation failed.', { fieldErrors });
    }

    const quantity = parsePositiveDecimal(quantityValue, `line_items[${index}].quantity`);
    const unitPrice = parseNonNegativeDecimal(unitPriceValue, `line_items[${index}].unit_price`);
    const amount = formatAmount(quantity * unitPrice);

    return {
      id: generateId('ili'),
      description,
      quantity: formatAmount(quantity),
      unit_price: formatAmount(unitPrice),
      amount,
    };
  });
};

const parseTax = (value: unknown): InvoiceTaxRecord | undefined => {
  if (value === undefined) return undefined;
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Request validation failed.', {
      fieldErrors: [{ field: 'tax', message: 'Tax must be an object.' }],
    });
  }

  const raw = value as Record<string, unknown>;
  const name = cleanString(raw.name) || 'Tax';
  const rateValue = cleanString(raw.rate_percent);
  if (!rateValue) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Request validation failed.', {
      fieldErrors: [{ field: 'tax.rate_percent', message: 'Tax rate is required.' }],
    });
  }

  const rate = parseNonNegativeDecimal(rateValue, 'tax.rate_percent');
  return {
    name,
    rate_percent: formatAmount(rate),
    amount: '0.00',
  };
};

const parseDiscount = (value: unknown): InvoiceDiscountRecord | undefined => {
  if (value === undefined) return undefined;
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Request validation failed.', {
      fieldErrors: [{ field: 'discount', message: 'Discount must be an object.' }],
    });
  }

  const raw = value as Record<string, unknown>;
  const type = cleanString(raw.type) as InvoiceDiscountRecord['type'];
  const discountValue = cleanString(raw.value);

  if (type !== 'percent' && type !== 'fixed') {
    throw new AppError(422, 'VALIDATION_ERROR', 'Request validation failed.', {
      fieldErrors: [{ field: 'discount.type', message: 'Discount type must be percent or fixed.' }],
    });
  }

  if (!discountValue) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Request validation failed.', {
      fieldErrors: [{ field: 'discount.value', message: 'Discount value is required.' }],
    });
  }

  const amount = parseNonNegativeDecimal(discountValue, 'discount.value');
  return {
    type,
    value: formatAmount(amount),
    amount: '0.00',
  };
};

const calculateTotals = (
  lineItems: InvoiceLineItemRecord[],
  tax?: InvoiceTaxRecord,
  discount?: InvoiceDiscountRecord,
): {
  lineItems: InvoiceLineItemRecord[];
  tax?: InvoiceTaxRecord;
  discount?: InvoiceDiscountRecord;
  totals: InvoiceTotalsRecord;
} => {
  const subtotal = roundCurrency(
    lineItems.reduce((sum, lineItem) => sum + Number(lineItem.amount), 0),
  );
  const taxAmount = tax ? roundCurrency(subtotal * (Number(tax.rate_percent) / 100)) : 0;
  const discountAmount = !discount
    ? 0
    : discount.type === 'fixed'
      ? roundCurrency(Number(discount.value))
      : roundCurrency(subtotal * (Number(discount.value) / 100));
  const total = roundCurrency(subtotal + taxAmount - discountAmount);

  return {
    lineItems,
    tax: tax ? { ...tax, amount: formatAmount(taxAmount) } : undefined,
    discount: discount ? { ...discount, amount: formatAmount(discountAmount) } : undefined,
    totals: {
      subtotal: formatAmount(subtotal),
      tax: formatAmount(taxAmount),
      discount: formatAmount(discountAmount),
      total: formatAmount(total),
    },
  };
};

const parseInvoiceInput = (
  input: InvoiceInput,
  options: { partial?: boolean; current?: InvoiceRecord } = {},
): Omit<InvoiceRecord, 'id' | 'number' | 'status' | 'sent_at' | 'paid_at' | 'voided_at' | 'version' | 'created_at' | 'updated_at'> => {
  const partial = options.partial ?? false;
  const current = options.current;
  const clientId = cleanString(input.client_id) || current?.client_id || '';
  const issueDate = cleanString(input.issue_date) || current?.issue_date || '';
  const dueDate = cleanString(input.due_date) || current?.due_date || '';
  const currency = cleanString(input.currency) || current?.currency || DEFAULT_CURRENCY;
  const notes = input.notes === undefined ? current?.notes ?? '' : cleanString(input.notes);
  const lineItems =
    input.line_items === undefined
      ? current?.line_items ?? []
      : parseInvoiceLineItems(input.line_items);
  const tax = input.tax === undefined ? current?.tax : parseTax(input.tax);
  const discount = input.discount === undefined ? current?.discount : parseDiscount(input.discount);

  const fieldErrors: FieldError[] = [];

  if (!clientId) {
    fieldErrors.push({ field: 'client_id', message: 'Client is required.' });
  }
  if (!issueDate) {
    fieldErrors.push({ field: 'issue_date', message: 'Issue date is required.' });
  } else if (!isDateOnly(issueDate)) {
    fieldErrors.push({ field: 'issue_date', message: 'Issue date must be YYYY-MM-DD.' });
  }
  if (!dueDate) {
    fieldErrors.push({ field: 'due_date', message: 'Due date is required.' });
  } else if (!isDateOnly(dueDate)) {
    fieldErrors.push({ field: 'due_date', message: 'Due date must be YYYY-MM-DD.' });
  }
  if (!currency) {
    fieldErrors.push({ field: 'currency', message: 'Currency is required.' });
  }
  if (partial && input.currency !== undefined && current && currency !== current.currency) {
    fieldErrors.push({ field: 'currency', message: 'Invoice currency cannot be changed after creation.' });
  }
  if (notes.length > 2000) {
    fieldErrors.push({ field: 'notes', message: 'Notes must be 2000 characters or fewer.' });
  }
  if (lineItems.length === 0) {
    fieldErrors.push({ field: 'line_items', message: 'At least one line item is required.' });
  }
  if (issueDate && dueDate && isDateOnly(issueDate) && isDateOnly(dueDate) && dueDate < issueDate) {
    fieldErrors.push({ field: 'due_date', message: 'Due date cannot be before issue date.' });
  }
  if (fieldErrors.length > 0) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Request validation failed.', { fieldErrors });
  }

  if (!partial || input.client_id !== undefined) {
    requireClient(clientId);
  } else if (current) {
    requireClient(current.client_id);
  }

  const totals = calculateTotals(lineItems, tax, discount);

  return {
    client_id: clientId,
    issue_date: issueDate,
    due_date: dueDate,
    currency,
    line_items: totals.lineItems,
    tax: totals.tax,
    discount: totals.discount,
    totals: totals.totals,
    notes,
  };
};

const ensureEditableInvoice = (invoice: InvoiceRecord): void => {
  const status = effectiveStatusOf(invoice);
  if (status === 'Paid' || status === 'Void') {
    throw new AppError(409, 'CONFLICT_STATUS_TRANSITION', `Transition from ${status} is not allowed.`);
  }
};

const ensureInvoiceCanSend = (invoice: InvoiceRecord): void => {
  const total = Number(invoice.totals.total);
  if (invoice.line_items.length === 0 || total <= 0) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Request validation failed.', {
      fieldErrors: [{ field: 'line_items', message: 'Invoice must contain billable line items before sending.' }],
    });
  }
};

const appendInvoiceEvent = (invoiceId: string, type: ApiInvoiceEventType, occurredAt = nowIso()): void => {
  const currentEvents = invoiceEvents.get(invoiceId) ?? [];
  currentEvents.push({
    id: generateId('evt'),
    type,
    occurred_at: occurredAt,
    actor: DEFAULT_ACTOR,
  });
  invoiceEvents.set(invoiceId, currentEvents);
};

const createSeedInvoice = (input: {
  client: ClientRecord;
  number: string;
  issue_date: string;
  due_date: string;
  status: StoredInvoiceStatus;
  sentAt?: string | null;
  paidAt?: string | null;
  notes: string;
  line_items: Array<{ description: string; quantity: string; unit_price: string }>;
  taxRate?: string;
  discountValue?: string;
}): InvoiceRecord => {
  const lineItems = parseInvoiceLineItems(input.line_items);
  const calculated = calculateTotals(
    lineItems,
    input.taxRate ? { name: 'Tax', rate_percent: formatAmount(Number(input.taxRate)), amount: '0.00' } : undefined,
    input.discountValue
      ? { type: 'percent', value: formatAmount(Number(input.discountValue)), amount: '0.00' }
      : undefined,
  );
  const createdAt = `${input.issue_date}T09:00:00.000Z`;
  const updatedAt = input.paidAt ?? input.sentAt ?? createdAt;

  const invoice: InvoiceRecord = {
    id: generateId('inv'),
    number: input.number,
    client_id: input.client.id,
    status: input.status,
    issue_date: input.issue_date,
    due_date: input.due_date,
    currency: DEFAULT_CURRENCY,
    line_items: calculated.lineItems,
    tax: calculated.tax,
    discount: calculated.discount,
    totals: calculated.totals,
    notes: input.notes,
    sent_at: input.sentAt ?? null,
    paid_at: input.paidAt ?? null,
    voided_at: null,
    version: 1,
    created_at: createdAt,
    updated_at: updatedAt,
  };

  invoices.set(invoice.id, invoice);
  invoiceEvents.set(invoice.id, [
    {
      id: generateId('evt'),
      type: 'invoice_created',
      occurred_at: createdAt,
      actor: DEFAULT_ACTOR,
    },
  ]);

  if (input.sentAt) {
    appendInvoiceEvent(invoice.id, 'invoice_marked_sent', input.sentAt);
  }
  if (input.paidAt) {
    appendInvoiceEvent(invoice.id, 'invoice_marked_paid', input.paidAt);
  }

  invoiceCounter = Math.max(invoiceCounter, Number(invoice.number.match(/(\d+)$/)?.[1] ?? '0') + 1);
  return invoice;
};

const seedData = (): void => {
  const seededClients: ClientRecord[] = [
    {
      id: generateId('cli'),
      name: 'Northline Studio',
      email: 'finance@northline.studio',
      phone: '+2348000000001',
      billing_address: {
        city: 'Lagos',
        state: 'Lagos',
        country: 'NG',
      },
      created_at: `${todayDate()}T08:00:00.000Z`,
      updated_at: `${todayDate()}T08:00:00.000Z`,
    },
    {
      id: generateId('cli'),
      name: 'Belmont Kitchens',
      email: 'ap@belmontkitchens.co',
      phone: '+2348000000002',
      billing_address: {
        city: 'Abuja',
        state: 'FCT',
        country: 'NG',
      },
      created_at: `${todayDate()}T08:30:00.000Z`,
      updated_at: `${todayDate()}T08:30:00.000Z`,
    },
  ];

  seededClients.forEach((client) => clients.set(client.id, client));

  const year = Number(todayDate().slice(0, 4));
  createSeedInvoice({
    client: seededClients[0],
    number: `INV-${year}-0001`,
    issue_date: `${year}-01-12`,
    due_date: `${year}-01-26`,
    status: 'Draft',
    notes: 'Net 14 terms.',
    line_items: [
      { description: 'Brand sprint', quantity: '1.00', unit_price: '1450.00' },
      { description: 'Landing page build', quantity: '1.00', unit_price: '1200.00' },
    ],
    taxRate: '7.50',
  });
  createSeedInvoice({
    client: seededClients[0],
    number: `INV-${year}-0002`,
    issue_date: `${year}-02-05`,
    due_date: `${year}-02-19`,
    status: 'Sent',
    sentAt: `${year}-02-06T10:00:00.000Z`,
    notes: 'Please remit within 14 days.',
    line_items: [{ description: 'Consulting retainer', quantity: '1.00', unit_price: '2100.00' }],
  });
  createSeedInvoice({
    client: seededClients[1],
    number: `INV-${year}-0003`,
    issue_date: `${year}-03-10`,
    due_date: `${year}-03-24`,
    status: 'Sent',
    sentAt: `${year}-03-11T11:00:00.000Z`,
    paidAt: `${year}-03-18T15:20:00.000Z`,
    notes: 'Thanks for your business.',
    line_items: [{ description: 'Kitchen redesign consultation', quantity: '1.00', unit_price: '3100.00' }],
  });
};

const createInvoiceNumber = (): string => {
  const year = todayDate().slice(0, 4);
  const number = `INV-${year}-${String(invoiceCounter).padStart(4, '0')}`;
  invoiceCounter += 1;
  return number;
};

const pruneIdempotencyRecords = (): void => {
  const cutoff = Date.now() - IDEMPOTENCY_TTL_MS;
  for (const [key, record] of idempotencyRecords.entries()) {
    if (record.createdAt < cutoff) {
      idempotencyRecords.delete(key);
    }
  }
};

const beginIdempotentRequest = (req: Request, res: Response): { key: string; payload: string } | null => {
  pruneIdempotencyRecords();

  const header = req.header('Idempotency-Key');
  if (!header) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Request validation failed.', {
      fieldErrors: [{ field: 'Idempotency-Key', message: 'Idempotency-Key header is required.' }],
    });
  }

  const storeKey = `${req.method}:${req.path}:${header}`;
  const payload = JSON.stringify(req.body ?? null);
  const existing = idempotencyRecords.get(storeKey);

  if (!existing) {
    return { key: storeKey, payload };
  }

  if (existing.payload !== payload) {
    throw new AppError(409, 'IDEMPOTENCY_CONFLICT', 'Idempotency key reuse with different payload.');
  }

  res.status(existing.status).json(existing.body);
  return null;
};

const completeIdempotentRequest = (
  context: { key: string; payload: string },
  status: number,
  body: ApiEnvelope<unknown>,
): void => {
  idempotencyRecords.set(context.key, {
    payload: context.payload,
    status,
    body,
    createdAt: Date.now(),
  });
};

seedData();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors());
app.use(express.json());
app.use(morgan('tiny'));
app.use((req, res, next) => {
  res.locals.requestId = cleanString(req.header('X-Request-Id')) || generateId('req');
  res.setHeader('X-Request-Id', requestIdOf(res));
  next();
});

app.get('/healthz', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/v1/ping', (_req, res) => {
  res.json({ success: true, message: 'pong' });
});

app.post('/v1/auth/login', express.json(), (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';

  if (!email) {
    sendError(res, new AppError(422, 'VALIDATION_ERROR', 'Request validation failed.', {
      fieldErrors: [{ field: 'email', message: 'Email is required.' }],
    }));
    return;
  }

  const payload: JwtPayload = {
    sub: email,
    email,
    role: 'user',
    ...(name ? { name } : {}),
  };

  const token = jwt.sign(payload, JWT_SECRET, {
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    expiresIn: '7d',
  });

  sendEnvelope(res, 200, {
    access_token: token,
    token_type: 'Bearer',
    expires_in: 60 * 60 * 24 * 7,
    user: { email, name },
  });
});

app.use('/v1', authenticate);

app.get('/v1/dashboard/summary', (_req, res) => {
  const summary = Array.from(invoices.values()).reduce(
    (acc, invoice) => {
      const effectiveStatus = effectiveStatusOf(invoice);
      const total = Number(invoice.totals.total);

      if (effectiveStatus === 'Sent' || effectiveStatus === 'Overdue') {
        acc.total_unpaid.amount = formatAmount(Number(acc.total_unpaid.amount) + total);
      }
      if (effectiveStatus === 'Overdue') {
        acc.overdue_count += 1;
      }
      if (
        effectiveStatus === 'Paid' &&
        invoice.paid_at &&
        invoice.paid_at.slice(0, 7) === todayDate().slice(0, 7)
      ) {
        acc.paid_this_month.amount = formatAmount(Number(acc.paid_this_month.amount) + total);
      }
      if (effectiveStatus === 'Draft') {
        acc.draft_count += 1;
      }

      return acc;
    },
    {
      total_unpaid: { currency: DEFAULT_CURRENCY, amount: '0.00' },
      overdue_count: 0,
      paid_this_month: { currency: DEFAULT_CURRENCY, amount: '0.00' },
      draft_count: 0,
    },
  );

  sendEnvelope(res, 200, summary);
});

app.get('/v1/clients', (req, res) => {
  const limit = Math.max(1, Math.min(100, Number(req.query.limit ?? 20) || 20));
  const startIndex = parseCursor(req.query.cursor);
  const query = cleanString(req.query.q).toLowerCase();
  const filtered = Array.from(clients.values())
    .filter((client) =>
      !query ||
      client.name.toLowerCase().includes(query) ||
      (client.email ?? '').toLowerCase().includes(query),
    )
    .sort((left, right) => right.updated_at.localeCompare(left.updated_at));

  const page = filtered.slice(startIndex, startIndex + limit);
  const nextIndex = startIndex + page.length;
  sendPaginated(
    res,
    200,
    page.map(clientSummary),
    {
      next_cursor: nextIndex < filtered.length ? encodeCursor(nextIndex) : null,
      has_more: nextIndex < filtered.length,
    },
  );
});

app.post('/v1/clients', (req, res) => {
  const payload = parseClientInput(req.body as ClientInput);
  const timestamp = nowIso();
  const client: ClientRecord = {
    id: generateId('cli'),
    created_at: timestamp,
    updated_at: timestamp,
    ...payload,
  };

  clients.set(client.id, client);
  sendEnvelope(res, 201, client);
});

app.get('/v1/clients/:clientId', (req, res) => {
  const client = requireClient(req.params.clientId);
  sendEnvelope(res, 200, client);
});

app.patch('/v1/clients/:clientId', (req, res) => {
  const client = requireClient(req.params.clientId);
  const updates = parseClientInput(req.body as ClientInput, true);
  const updatedClient: ClientRecord = {
    ...client,
    ...updates,
    updated_at: nowIso(),
  };

  clients.set(client.id, updatedClient);
  sendEnvelope(res, 200, updatedClient);
});

app.get('/v1/invoices', (req, res) => {
  const limit = Math.max(1, Math.min(100, Number(req.query.limit ?? 20) || 20));
  const startIndex = parseCursor(req.query.cursor);
  const statusFilter = cleanString(req.query.status) as InvoiceStatus;
  const clientIdFilter = cleanString(req.query.client_id);
  const sort = cleanString(req.query.sort) || 'created_at_desc';

  const filtered = Array.from(invoices.values())
    .filter((invoice) => {
      const matchesStatus = !statusFilter || effectiveStatusOf(invoice) === statusFilter;
      const matchesClient = !clientIdFilter || invoice.client_id === clientIdFilter;
      return matchesStatus && matchesClient;
    })
    .sort((left, right) => {
      if (sort === 'due_date_asc') {
        return left.due_date.localeCompare(right.due_date) || right.updated_at.localeCompare(left.updated_at);
      }
      return right.created_at.localeCompare(left.created_at);
    });

  const page = filtered.slice(startIndex, startIndex + limit);
  const nextIndex = startIndex + page.length;

  sendPaginated(
    res,
    200,
    page.map(serializeInvoiceListItem),
    {
      next_cursor: nextIndex < filtered.length ? encodeCursor(nextIndex) : null,
      has_more: nextIndex < filtered.length,
    },
  );
});

app.post('/v1/invoices', (req, res) => {
  const payload = parseInvoiceInput(req.body as InvoiceInput);
  const timestamp = nowIso();
  const invoice: InvoiceRecord = {
    id: generateId('inv'),
    number: createInvoiceNumber(),
    status: 'Draft',
    sent_at: null,
    paid_at: null,
    voided_at: null,
    version: 1,
    created_at: timestamp,
    updated_at: timestamp,
    ...payload,
  };

  invoices.set(invoice.id, invoice);
  invoiceEvents.set(invoice.id, []);
  appendInvoiceEvent(invoice.id, 'invoice_created', timestamp);

  sendEnvelope(res, 201, serializeInvoice(invoice));
});

app.get('/v1/invoices/:invoiceId', (req, res) => {
  const invoice = requireInvoice(req.params.invoiceId);
  sendEnvelope(res, 200, serializeInvoice(invoice));
});

app.patch('/v1/invoices/:invoiceId', (req, res) => {
  const invoice = requireInvoice(req.params.invoiceId);
  ensureEditableInvoice(invoice);

  const ifMatchHeader = cleanString(req.header('If-Match'));
  if (!ifMatchHeader) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Request validation failed.', {
      fieldErrors: [{ field: 'If-Match', message: 'If-Match header is required.' }],
    });
  }

  const expectedVersion = Number(ifMatchHeader);
  if (!Number.isInteger(expectedVersion) || expectedVersion !== invoice.version) {
    throw new AppError(409, 'VERSION_CONFLICT', 'Version does not match latest resource version.', {
      details: { latest_version: invoice.version },
    });
  }

  const updates = parseInvoiceInput(req.body as InvoiceInput, { partial: true, current: invoice });
  const updatedInvoice: InvoiceRecord = {
    ...invoice,
    ...updates,
    status: invoice.status,
    sent_at: invoice.sent_at,
    paid_at: invoice.paid_at,
    voided_at: invoice.voided_at,
    version: invoice.version + 1,
    updated_at: nowIso(),
  };

  invoices.set(invoice.id, updatedInvoice);
  appendInvoiceEvent(invoice.id, 'invoice_updated', updatedInvoice.updated_at);
  sendEnvelope(res, 200, serializeInvoice(updatedInvoice));
});

app.post('/v1/invoices/:invoiceId/mark-sent', (req, res) => {
  const context = beginIdempotentRequest(req, res);
  if (!context) return;

  const invoice = requireInvoice(req.params.invoiceId);
  if (invoice.status !== 'Draft') {
    throw new AppError(409, 'CONFLICT_STATUS_TRANSITION', `Transition from ${effectiveStatusOf(invoice)} to Sent is not allowed.`);
  }

  const sentDate = cleanString((req.body as { sent_date?: unknown }).sent_date);
  if (!isDateOnly(sentDate)) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Request validation failed.', {
      fieldErrors: [{ field: 'sent_date', message: 'Sent date must be YYYY-MM-DD.' }],
    });
  }

  ensureInvoiceCanSend(invoice);

  const timestamp = nowIso();
  const updatedInvoice: InvoiceRecord = {
    ...invoice,
    status: 'Sent',
    sent_at: timestamp,
    version: invoice.version + 1,
    updated_at: timestamp,
  };
  invoices.set(invoice.id, updatedInvoice);
  appendInvoiceEvent(invoice.id, 'invoice_marked_sent', timestamp);

  const body = {
    data: invoiceActionResult(updatedInvoice),
    meta: {},
  } satisfies ApiEnvelope<ReturnType<typeof invoiceActionResult>>;

  completeIdempotentRequest(context, 200, body);
  res.status(200).json(body);
});

app.post('/v1/invoices/:invoiceId/send-email', (req, res) => {
  const context = beginIdempotentRequest(req, res);
  if (!context) return;

  const invoice = requireInvoice(req.params.invoiceId);
  const effectiveStatus = effectiveStatusOf(invoice);
  if (effectiveStatus !== 'Draft' && effectiveStatus !== 'Sent' && effectiveStatus !== 'Overdue') {
    throw new AppError(409, 'CONFLICT_STATUS_TRANSITION', `Transition from ${effectiveStatus} to Sent is not allowed.`);
  }

  const payload = req.body as SendEmailInput;
  const to = cleanString(payload.to);
  const subject = cleanString(payload.subject);
  const message = cleanString(payload.message);
  const fieldErrors: FieldError[] = [];

  if (!to || !EMAIL_PATTERN.test(to)) {
    fieldErrors.push({ field: 'to', message: 'Recipient email must be valid.' });
  }
  if (!subject) {
    fieldErrors.push({ field: 'subject', message: 'Subject is required.' });
  }
  if (!message) {
    fieldErrors.push({ field: 'message', message: 'Message is required.' });
  }
  if (typeof payload.attach_pdf !== 'boolean') {
    fieldErrors.push({ field: 'attach_pdf', message: 'attach_pdf must be a boolean.' });
  }
  if (typeof payload.send_copy_to_me !== 'boolean') {
    fieldErrors.push({ field: 'send_copy_to_me', message: 'send_copy_to_me must be a boolean.' });
  }
  if (fieldErrors.length > 0) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Request validation failed.', { fieldErrors });
  }

  ensureInvoiceCanSend(invoice);

  const timestamp = nowIso();
  const updatedInvoice: InvoiceRecord = {
    ...invoice,
    status: 'Sent',
    sent_at: timestamp,
    version: invoice.version + 1,
    updated_at: timestamp,
  };
  invoices.set(invoice.id, updatedInvoice);
  appendInvoiceEvent(invoice.id, 'invoice_sent_email', timestamp);

  const body = {
    data: {
      ...invoiceActionResult(updatedInvoice),
      delivery: {
        provider_message_id: generateId('msg'),
        state: 'queued',
      },
    },
    meta: {},
  } satisfies ApiEnvelope<Record<string, unknown>>;

  completeIdempotentRequest(context, 200, body);
  res.status(200).json(body);
});

app.post('/v1/invoices/:invoiceId/mark-paid', (req, res) => {
  const context = beginIdempotentRequest(req, res);
  if (!context) return;

  const invoice = requireInvoice(req.params.invoiceId);
  const effectiveStatus = effectiveStatusOf(invoice);
  if (effectiveStatus !== 'Sent' && effectiveStatus !== 'Overdue') {
    throw new AppError(409, 'CONFLICT_STATUS_TRANSITION', `Transition from ${effectiveStatus} to Paid is not allowed.`);
  }

  const paidDate = cleanString((req.body as { paid_date?: unknown }).paid_date);
  if (!isDateOnly(paidDate)) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Request validation failed.', {
      fieldErrors: [{ field: 'paid_date', message: 'Paid date must be YYYY-MM-DD.' }],
    });
  }
  if (paidDate > todayDate()) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Request validation failed.', {
      fieldErrors: [{ field: 'paid_date', message: 'Paid date cannot be in the future.' }],
    });
  }

  const timestamp = nowIso();
  const updatedInvoice: InvoiceRecord = {
    ...invoice,
    status: 'Paid',
    paid_at: timestamp,
    version: invoice.version + 1,
    updated_at: timestamp,
  };
  invoices.set(invoice.id, updatedInvoice);
  appendInvoiceEvent(invoice.id, 'invoice_marked_paid', timestamp);

  const body = {
    data: invoiceActionResult(updatedInvoice),
    meta: {},
  } satisfies ApiEnvelope<ReturnType<typeof invoiceActionResult>>;

  completeIdempotentRequest(context, 200, body);
  res.status(200).json(body);
});

app.post('/v1/invoices/:invoiceId/void', (req, res) => {
  const context = beginIdempotentRequest(req, res);
  if (!context) return;

  const invoice = requireInvoice(req.params.invoiceId);
  const effectiveStatus = effectiveStatusOf(invoice);
  if (effectiveStatus === 'Paid' || effectiveStatus === 'Void') {
    throw new AppError(409, 'CONFLICT_STATUS_TRANSITION', `Transition from ${effectiveStatus} to Void is not allowed.`);
  }

  const timestamp = nowIso();
  const updatedInvoice: InvoiceRecord = {
    ...invoice,
    status: 'Void',
    voided_at: timestamp,
    version: invoice.version + 1,
    updated_at: timestamp,
  };
  invoices.set(invoice.id, updatedInvoice);
  appendInvoiceEvent(invoice.id, 'invoice_voided', timestamp);

  const body = {
    data: invoiceActionResult(updatedInvoice),
    meta: {},
  } satisfies ApiEnvelope<ReturnType<typeof invoiceActionResult>>;

  completeIdempotentRequest(context, 200, body);
  res.status(200).json(body);
});

app.get('/v1/invoices/:invoiceId/events', (req, res) => {
  requireInvoice(req.params.invoiceId);
  const events = [...(invoiceEvents.get(req.params.invoiceId) ?? [])].sort((left, right) =>
    left.occurred_at.localeCompare(right.occurred_at),
  );
  sendEnvelope(res, 200, events);
});

app.get('/v1/invoices/:invoiceId/pdf', (req, res) => {
  const invoice = requireInvoice(req.params.invoiceId);
  const client = requireClient(invoice.client_id);
  const pdfBuffer = createInvoicePdfBuffer({
    number: invoice.number,
    clientName: client.name,
    clientEmail: client.email,
    issueDate: invoice.issue_date,
    dueDate: invoice.due_date,
    currency: invoice.currency,
    notes: invoice.notes,
    lineItems: invoice.line_items,
    totals: invoice.totals,
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${invoice.number}.pdf"`);
  res.status(200).send(pdfBuffer);
});

app.use((_req, _res, next) => {
  next(new AppError(404, 'NOT_FOUND', 'Resource not found.'));
});

app.use((error: unknown, _req: Request, res: Response, next: NextFunction) => {
  void next;
  if (error instanceof AppError) {
    sendError(res, error);
    return;
  }

  if (error instanceof SyntaxError) {
    sendError(res, new AppError(400, 'VALIDATION_ERROR', 'Malformed JSON request body.'));
    return;
  }

  console.error(error);
  sendError(res, new AppError(500, 'INTERNAL_ERROR', 'Something went wrong. Try again.'));
});

app.listen(port, () => {
  console.log(`SmartInvoice server started on http://localhost:${port}`);
});
