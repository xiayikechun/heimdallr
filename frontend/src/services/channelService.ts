import { apiService } from './api';
import type { Channel, ChannelCreate, ChannelUpdate } from '../types/channel';
import type { PaginationParams } from '../types/api';

export class ChannelService {
  async getChannels(params?: PaginationParams): Promise<Channel[]> {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    
    const endpoint = `/channels${queryParams.toString() ? `?${queryParams}` : ''}`;
    return apiService.get<Channel[]>(endpoint);
  }

  async getChannel(id: number): Promise<Channel> {
    return apiService.get<Channel>(`/channels/${id}`);
  }

  async createChannel(channelData: ChannelCreate): Promise<Channel> {
    return apiService.post<Channel>('/channels', channelData);
  }

  async updateChannel(id: number, channelData: ChannelUpdate): Promise<Channel> {
    return apiService.put<Channel>(`/channels/${id}`, channelData);
  }

  async deleteChannel(id: number): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(`/channels/${id}`);
  }

  async testChannel(id: number, title: string, body: string, config?: Record<string, unknown>): Promise<{ message: string; success: boolean }> {
    const payload: { title: string; body: string; config?: Record<string, unknown> } = { title, body };
    if (config) {
      payload.config = config;
    }
    return apiService.post<{ message: string; success: boolean }>(`/channels/${id}/test`, payload);
  }

  async testChannelConfig(channelType: string, config: Record<string, unknown>, title: string, body: string): Promise<{ message: string; success: boolean }> {
    const payload = { 
      title, 
      body, 
      config, 
      channel_type: channelType 
    };
    return apiService.post<{ message: string; success: boolean }>(`/channels/0/test`, payload);
  }
}

export const channelService = new ChannelService();