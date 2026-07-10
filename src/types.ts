export interface Rule {
  id: number;
  enabled: boolean;
  urlPattern: string;
  type: "request" | "response";
  operation: "set" | "remove" | "append";
  headerName: string;
  headerValue: string;
}
