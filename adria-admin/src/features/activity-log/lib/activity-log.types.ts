export type ActivityEvent =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'restored'
  | 'login'
  | 'login_failed'
  | 'logout'
  | 'ai_query';

export type ActivityChange = {
  field: string;
  old: string | number | boolean | null;
  new: string | number | boolean | null;
};

export type ActivityLogEntry = {
  id: string;
  logName: string | null;
  event: ActivityEvent | null;
  description: string;
  createdAt: string;
  causer: { id: string; name: string; email: string } | null;
  subject: {
    type: string | null;
    typeLabel: string;
    id: string | null;
    label: string | null;
    exists: boolean;
  } | null;
  changes: ActivityChange[];
  context: {
    ip: string | null;
    userAgent: string | null;
    email: string | null;
    reason: string | null;
    /** The MCP tool an AI assistant called (ai_query entries). */
    aiTool?: string | null;
    aiClient?: string | null;
    aiArguments?: Record<string, unknown> | null;
  };
};

export type ActivityLogQuery = {
  page: number;
  perPage: number;
  userId?: string;
  event?: ActivityEvent;
  subjectType?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type ActivityLogFilters = Omit<ActivityLogQuery, 'page' | 'perPage'>;

export type ActivityLogListResponse = {
  items: ActivityLogEntry[];
  totalCount: number;
  page: number;
  perPage: number;
};

export type ActivityLogFilterOptions = {
  users: { id: string; name: string; email: string; isActive: boolean }[];
  subjectTypes: { key: string; label: string }[];
  events: ActivityEvent[];
};
