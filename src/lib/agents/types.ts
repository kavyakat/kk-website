export interface AgentSkill {
  id: string;
  name: string;
  description: string;
}

export interface AgentCard {
  name: string;
  description: string;
  url: string;
  version: string;
  skills: AgentSkill[];
}

export interface TextPart {
  type: "text";
  text: string;
}

export interface JsonRpcRequest {
  jsonrpc: "2.0";
  id: string;
  method: "tasks/send";
  params: { message: { role: "user"; parts: TextPart[] } };
}

export interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: string;
  result: { status: "completed"; message: { role: "agent"; parts: TextPart[] } };
}

export interface Delegation {
  to: "funFacts";
  request: JsonRpcRequest;
  response: JsonRpcResponse;
}

export type ChatAction = "about" | "experience" | "skills" | "funFacts";

export interface ChatRequest {
  action?: ChatAction;
  text?: string;
  flirty?: boolean;
}

export interface ChatResponse {
  reply: string;
  agent: "kavya" | "funFacts";
  delegation?: Delegation;
  resting?: boolean;
  error?: string;
  flirty?: boolean;
}
