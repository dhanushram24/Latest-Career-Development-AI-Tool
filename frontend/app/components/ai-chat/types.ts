// types.ts
export interface Message {
  id: string;
  content: string;
  type: 'user' | 'assistant';
  timestamp: Date;
  data?: any;
  visualizations?: VisualizationData[];
}

export interface VisualizationData {
  type: 'bar_chart' | 'pie_chart' | 'radar_chart' | 'heatmap';
  title: string;
  data: any;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

export interface AIChatBotProps {
  userRole: 'admin' | 'user' | null;
  userEmail: string | null;
}