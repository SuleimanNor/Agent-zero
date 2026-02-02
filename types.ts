export interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  sources?: GroundingSource[];
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface AgentConfig {
  model: string;
  systemInstruction: string;
  useSearch: boolean;
  temperature: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

export enum ConnectionStatus {
  IDLE = 'IDLE',
  CONNECTING = 'CONNECTING',
  STREAMING = 'STREAMING',
  ERROR = 'ERROR',
  COMPLETED = 'COMPLETED'
}