import { apiService } from './api';
import type { Group, GroupWithChannels, GroupCreate, GroupUpdate, TestGroupResponse } from '../types/group';
import type { PaginationParams } from '../types/api';

export class GroupService {
  async getGroups(params?: PaginationParams): Promise<Group[]> {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    
    const endpoint = `/groups${queryParams.toString() ? `?${queryParams}` : ''}`;
    return apiService.get<Group[]>(endpoint);
  }

  async getGroup(id: number): Promise<GroupWithChannels> {
    return apiService.get<GroupWithChannels>(`/groups/${id}`);
  }

  async createGroup(groupData: GroupCreate): Promise<Group> {
    return apiService.post<Group>('/groups', groupData);
  }

  async updateGroup(id: number, groupData: GroupUpdate): Promise<Group> {
    return apiService.put<Group>(`/groups/${id}`, groupData);
  }

  async deleteGroup(id: number): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(`/groups/${id}`);
  }

  async regenerateGroupToken(id: number): Promise<Group> {
    return apiService.post<Group>(`/groups/${id}/regenerate-token`);
  }

  async addChannelToGroup(groupId: number, channelId: number): Promise<{ message: string }> {
    return apiService.post<{ message: string }>(`/groups/${groupId}/channels/${channelId}`);
  }

  async removeChannelFromGroup(groupId: number, channelId: number): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(`/groups/${groupId}/channels/${channelId}`);
  }

  async testGroup(id: number, title: string, body: string): Promise<TestGroupResponse> {
    return apiService.post<TestGroupResponse>(`/groups/${id}/test`, { title, body });
  }

  async testGroupWithChannels(
    title: string, 
    body: string, 
    channels: Array<{ id: number; name: string; channel_type: string; config: Record<string, unknown>; is_active: boolean }>
  ): Promise<TestGroupResponse> {
    return apiService.post<TestGroupResponse>('/groups/0/test', { 
      title, 
      body, 
      channels: channels.filter(c => c.is_active) 
    });
  }
}

export const groupService = new GroupService();