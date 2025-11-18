import api from './api';

export interface WorkspaceSettings {
  workspaceId: string;
  defaultCurrency: string;
  defaultTimezone: string;
  defaultLanguage: string;
  pipelineMode: 'standard' | 'enterprise' | 'custom';
  pipelineName?: string | null;
  leadAlerts: boolean;
  ticketUpdates: boolean;
  dailyDigest: boolean;
  taskReminders: boolean;
  compactMode: boolean;
  highContrast: boolean;
  theme: 'light' | 'dark';
  createdAt: string;
  updatedAt: string;
}

export type UpdateWorkspaceSettings = Partial<Omit<WorkspaceSettings, 'workspaceId' | 'createdAt' | 'updatedAt'>>;

const settingsService = {
  async getWorkspaceSettings(): Promise<WorkspaceSettings> {
    const response = await api.get('/settings');
    return response.data.data;
  },

  async updateWorkspaceSettings(payload: UpdateWorkspaceSettings): Promise<WorkspaceSettings> {
    const response = await api.put('/settings', payload);
    return response.data.data;
  }
};

export default settingsService;

