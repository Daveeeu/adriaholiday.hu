import { PortfolioApiError, fetchPortfolioJson, getPortfolioApiBaseUrl } from "../content/portfolio-api";
import type { PortfolioOfferCard } from "../content/portfolio-offers-api";

/** Header carrying the assistant session token on tool calls. */
const SESSION_HEADER = "X-Assistant-Session";

export type SalesAssistantStatus = {
  available: boolean;
  accessCodeRequired: boolean;
  maxRecommendations: number;
};

export type SalesAssistantSession = {
  sessionToken: string;
  expiresAt: string;
  clientSecret: string;
  clientSecretExpiresAt: string;
  model: string;
};

/** A tool call's answer: `output` goes back to the model as is. */
export type SalesAssistantToolOutcome = {
  output: unknown;
  trips: PortfolioOfferCard[];
  replacesRecommendations: boolean;
};

type ToolResponseBody = {
  data?: {
    result?: unknown;
    display?: { trips?: PortfolioOfferCard[]; replacesRecommendations?: boolean };
  };
  error?: unknown;
  message?: string;
};

export async function fetchSalesAssistantStatus(): Promise<SalesAssistantStatus> {
  const payload = await fetchPortfolioJson<{ data: SalesAssistantStatus }>("/sales-assistant/status");

  return payload.data;
}

async function postJson(path: string, body: unknown, headers: Record<string, string> = {}): Promise<Response> {
  return fetch(`${getPortfolioApiBaseUrl()}${path}`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json", ...headers },
    credentials: "include",
    body: JSON.stringify(body),
  });
}

async function errorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const payload = (await response.json()) as { message?: unknown };

    return typeof payload.message === "string" && payload.message.trim() !== "" ? payload.message : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Starts a conversation: the backend mints a short-lived OpenAI client
 * secret and an assistant session for the catalog tools.
 */
export async function startSalesAssistantSession(accessCode: string | null): Promise<SalesAssistantSession> {
  const response = await postJson("/sales-assistant/sessions", accessCode ? { accessCode } : {});

  if (!response.ok) {
    const fallback =
      response.status === 429
        ? "Túl sok beszélgetést indítottál rövid idő alatt. Kérjük, próbáld újra később."
        : "Nem sikerült elindítani a beszélgetést.";

    throw new PortfolioApiError(response.status, await errorMessage(response, fallback));
  }

  return ((await response.json()) as { data: SalesAssistantSession }).data;
}

/**
 * Ends the conversation's session. Sent with keepalive so it still reaches
 * the server while the page is being closed.
 */
export function endSalesAssistantSession(sessionToken: string): void {
  void fetch(`${getPortfolioApiBaseUrl()}/sales-assistant/sessions/current`, {
    method: "DELETE",
    headers: { Accept: "application/json", [SESSION_HEADER]: sessionToken },
    credentials: "include",
    keepalive: true,
  }).catch(() => undefined);
}

/**
 * Runs a function call of the model on the backend. Any answer, an error
 * included, becomes the function's output, so the model can explain or
 * correct it; only an unreachable backend becomes a generic error output.
 */
export async function executeSalesAssistantTool(
  sessionToken: string,
  name: string,
  args: Record<string, unknown> | null,
): Promise<SalesAssistantToolOutcome> {
  let body: ToolResponseBody;

  try {
    const response = await postJson(
      `/sales-assistant/tools/${encodeURIComponent(name)}`,
      // Arguments that were not a JSON object fail validation on purpose.
      { arguments: args ?? "invalid" },
      { [SESSION_HEADER]: sessionToken },
    );
    body = (await response.json()) as ToolResponseBody;
  } catch {
    return {
      output: { error: { code: "tool_unreachable", message: "The catalog could not be reached. Say the information cannot be verified right now." } },
      trips: [],
      replacesRecommendations: false,
    };
  }

  if (body.data === undefined) {
    return { output: { error: body.error ?? { code: "tool_failed", message: body.message } }, trips: [], replacesRecommendations: false };
  }

  return {
    output: body.data.result ?? {},
    trips: body.data.display?.trips ?? [],
    replacesRecommendations: body.data.display?.replacesRecommendations ?? false,
  };
}
