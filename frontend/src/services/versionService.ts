import { apiService } from './api';

export interface ReleaseInfo {
  tag_name: string;
  name: string;
  body: string;
  html_url: string;
  published_at: string;
}

export interface VersionInfo {
  current: string;
  latest?: string;
  hasUpdate: boolean;
  release?: ReleaseInfo;
  error?: string;
}

export interface CurrentVersion {
  version: string;
}

class VersionService {
  async getCurrentVersion(): Promise<CurrentVersion> {
    return await apiService.get<CurrentVersion>('/version/');
  }

  async checkForUpdates(): Promise<VersionInfo> {
    return await apiService.get<VersionInfo>('/version/check');
  }

  async forceCheckUpdates(): Promise<VersionInfo> {
    return await apiService.post<VersionInfo>('/version/check');
  }
}

export default new VersionService();