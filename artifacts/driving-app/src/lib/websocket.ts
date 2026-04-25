/**
 * Minimal STOMP-over-WebSocket client for NeuroMove backend.
 * Backend uses Spring's STOMP endpoint at /ws with message broker at /topic.
 *
 * Implements just the subset of STOMP 1.2 we need:
 *   CONNECT / CONNECTED / SUBSCRIBE / UNSUBSCRIBE / MESSAGE / SEND / DISCONNECT
 */

import { API_BASE_URL } from "./api";
import { getToken } from "./userStore";

export type StompMessage = {
  destination: string;
  headers: Record<string, string>;
  body: string;
};

export type StompMessageHandler = (msg: StompMessage) => void;

const NULL = "\u0000";
const LF = "\n";

function buildFrame(
  command: string,
  headers: Record<string, string> = {},
  body = "",
): string {
  const parts = [command];
  for (const [k, v] of Object.entries(headers)) {
    parts.push(`${k}:${v}`);
  }
  parts.push("");
  parts.push(body);
  return parts.join(LF) + NULL;
}

function parseFrame(frame: string): {
  command: string;
  headers: Record<string, string>;
  body: string;
} | null {
  const trimmed = frame.replace(/\u0000$/, "").replace(/\n$/, "");
  if (!trimmed) return null;
  const [head, ...rest] = trimmed.split("\n\n");
  if (!head) return null;
  const lines = head.split(LF);
  const command = lines[0];
  const headers: Record<string, string> = {};
  for (let i = 1; i < lines.length; i++) {
    const idx = lines[i].indexOf(":");
    if (idx > 0) {
      const k = lines[i].slice(0, idx).trim();
      const v = lines[i].slice(idx + 1).trim();
      headers[k] = v;
    }
  }
  return { command, headers, body: rest.join("\n\n") };
}

function toWsUrl(httpUrl: string): string {
  if (httpUrl.startsWith("https://")) return "wss://" + httpUrl.slice(8);
  if (httpUrl.startsWith("http://")) return "ws://" + httpUrl.slice(7);
  return httpUrl;
}

export class StompClient {
  private url: string;
  private socket: WebSocket | null = null;
  private connected = false;
  private subscriptions = new Map<string, StompMessageHandler>();
  private subCounter = 0;
  private pendingConnect: ((ok: boolean) => void) | null = null;
  private reconnectTimeout: number | null = null;
  private shouldReconnect = true;

  constructor(baseUrl: string = API_BASE_URL) {
    this.url = `${toWsUrl(baseUrl)}/ws`;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.shouldReconnect = true;
        this.socket = new WebSocket(this.url);
        this.pendingConnect = (ok) => (ok ? resolve() : reject(new Error("STOMP CONNECT failed")));

        this.socket.onopen = () => {
          const headers: Record<string, string> = {
            "accept-version": "1.2",
            host: "neuromove",
            "heart-beat": "10000,10000",
          };
          const token = getToken();
          if (token) headers.Authorization = `Bearer ${token}`;
          this.socket?.send(buildFrame("CONNECT", headers));
        };

        this.socket.onmessage = (event) => {
          this.handleFrame(typeof event.data === "string" ? event.data : "");
        };

        this.socket.onerror = (err) => {
          console.error("[STOMP] socket error", err);
          if (this.pendingConnect) {
            this.pendingConnect(false);
            this.pendingConnect = null;
          }
        };

        this.socket.onclose = () => {
          this.connected = false;
          if (this.shouldReconnect) {
            this.scheduleReconnect();
          }
        };
      } catch (e) {
        reject(e);
      }
    });
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) return;
    this.reconnectTimeout = window.setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect().catch(() => {
        /* will reschedule on close */
      });
    }, 3000);
  }

  private handleFrame(data: string) {
    if (data === LF) return; // heartbeat
    const frames = data.split(NULL).filter((f) => f.trim().length > 0);
    for (const raw of frames) {
      const parsed = parseFrame(raw);
      if (!parsed) continue;
      switch (parsed.command) {
        case "CONNECTED":
          this.connected = true;
          if (this.pendingConnect) {
            this.pendingConnect(true);
            this.pendingConnect = null;
          }
          break;
        case "MESSAGE": {
          const subId = parsed.headers["subscription"];
          const handler = this.subscriptions.get(subId);
          if (handler) {
            handler({
              destination: parsed.headers["destination"] ?? "",
              headers: parsed.headers,
              body: parsed.body,
            });
          }
          break;
        }
        case "ERROR":
          console.error("[STOMP] server error", parsed.headers, parsed.body);
          if (this.pendingConnect) {
            this.pendingConnect(false);
            this.pendingConnect = null;
          }
          break;
        default:
          break;
      }
    }
  }

  isConnected() {
    return this.connected;
  }

  subscribe(destination: string, handler: StompMessageHandler): () => void {
    if (!this.connected || !this.socket) {
      console.warn("[STOMP] not connected; subscription queued is not supported in this minimal client");
    }
    const id = `sub-${++this.subCounter}`;
    this.subscriptions.set(id, handler);
    if (this.connected && this.socket) {
      this.socket.send(
        buildFrame("SUBSCRIBE", { id, destination, ack: "auto" }),
      );
    }
    return () => this.unsubscribe(id);
  }

  private unsubscribe(id: string) {
    this.subscriptions.delete(id);
    if (this.connected && this.socket) {
      this.socket.send(buildFrame("UNSUBSCRIBE", { id }));
    }
  }

  send(destination: string, body: unknown, headers: Record<string, string> = {}) {
    if (!this.connected || !this.socket) return;
    const payload = typeof body === "string" ? body : JSON.stringify(body);
    this.socket.send(
      buildFrame(
        "SEND",
        {
          destination,
          "content-type": "application/json",
          "content-length": String(new Blob([payload]).size),
          ...headers,
        },
        payload,
      ),
    );
  }

  disconnect() {
    this.shouldReconnect = false;
    if (this.connected && this.socket) {
      try {
        this.socket.send(buildFrame("DISCONNECT", {}));
      } catch {
        /* ignore */
      }
    }
    this.socket?.close();
    this.socket = null;
    this.connected = false;
  }
}

let sharedClient: StompClient | null = null;
let sharedConnectPromise: Promise<StompClient> | null = null;

export function getStompClient(): Promise<StompClient> {
  if (sharedClient && sharedClient.isConnected()) {
    return Promise.resolve(sharedClient);
  }
  if (sharedConnectPromise) return sharedConnectPromise;

  const client = new StompClient();
  sharedClient = client;
  sharedConnectPromise = client
    .connect()
    .then(() => {
      sharedConnectPromise = null;
      return client;
    })
    .catch((err) => {
      sharedConnectPromise = null;
      throw err;
    });
  return sharedConnectPromise;
}

export function disconnectStomp() {
  sharedClient?.disconnect();
  sharedClient = null;
  sharedConnectPromise = null;
}
