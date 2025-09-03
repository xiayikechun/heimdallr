import { useQuery } from '@tanstack/react-query';
import { Bell, Users, Activity, TrendingUp } from 'lucide-react';
import { useTranslation } from "react-i18next"
import { useAuth } from '../contexts/AuthContext';
import { channelService } from '../services/channelService';
import { groupService } from '../services/groupService';
import { formatDate } from '../utils/helpers';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

export function DashboardPage() {
  const { t } = useTranslation()
  const { user } = useAuth();

  const { data: channels = [], isLoading: channelsLoading } = useQuery({
    queryKey: ['channels'],
    queryFn: () => channelService.getChannels(),
  });

  const { data: groups = [], isLoading: groupsLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: () => groupService.getGroups(),
  });

  const activeChannels = Array.isArray(channels) ? channels.filter(channel => channel.is_active) : [];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t("dashboard.title")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t("dashboard.welcome", { username: user?.username })}
        </p>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.totalChannels")}
            </CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {channelsLoading
                ? "-"
                : Array.isArray(channels)
                ? channels.length
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {channelsLoading
                ? t("dashboard.loadingChannels")
                : `${activeChannels.length} ${t("dashboard.activeChannels")}`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.totalGroups")}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {groupsLoading ? "-" : Array.isArray(groups) ? groups.length : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {groupsLoading
                ? t("dashboard.loadingChannels")
                : t("dashboard.groupsConfigured")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.accountStatus")}
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user?.is_admin ? t("auth.admin") : t("profile.regularUser")}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.registeredAt", {
                date: user ? formatDate(user.created_at, "yyyy-MM-dd") : "-",
              })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.systemStatus")}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {t("dashboard.systemNormal")}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.allServicesRunning")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Channels overview */}
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.channelsOverview")}</CardTitle>
            <CardDescription>{t("dashboard.recentChannels")}</CardDescription>
          </CardHeader>
          <CardContent>
            {channelsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"
                  />
                ))}
              </div>
            ) : !Array.isArray(channels) || channels.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Bell className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
                <p className="mt-2">{t("dashboard.noChannels")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Array.isArray(channels)
                  ? channels.slice(0, 5).map((channel) => (
                      <div
                        key={channel.id}
                        className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-medium">
                              {channel.name}
                            </h4>
                            <Badge
                              variant={
                                channel.is_active ? "default" : "secondary"
                              }
                            >
                              {channel.is_active
                                ? t("common.active")
                                : t("common.inactive")}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {t(`channelTypes.${channel.channel_type}`)} •{" "}
                            {formatDate(channel.created_at, "MM-dd HH:mm")}
                          </p>
                        </div>
                      </div>
                    ))
                  : null}
                {Array.isArray(channels) && channels.length > 5 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    {t("dashboard.moreChannels", {
                      count: Array.isArray(channels) ? channels.length - 5 : 0,
                    })}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Groups overview */}
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.groupsOverview")}</CardTitle>
            <CardDescription>{t("dashboard.recentGroups")}</CardDescription>
          </CardHeader>
          <CardContent>
            {groupsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"
                  />
                ))}
              </div>
            ) : !Array.isArray(groups) || groups.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Users className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
                <p className="mt-2">{t("dashboard.noGroups")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Array.isArray(groups)
                  ? groups.slice(0, 5).map((group) => (
                      <div
                        key={group.id}
                        className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700"
                      >
                        <div className="flex-1">
                          <h4 className="text-sm font-medium">{group.name}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Token: {group.token?.slice(0, 8) || "N/A"}... •{" "}
                            {formatDate(group.created_at, "MM-dd HH:mm")}
                          </p>
                        </div>
                      </div>
                    ))
                  : null}
                {Array.isArray(groups) && groups.length > 5 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    {t("dashboard.moreGroups", {
                      count: Array.isArray(groups) ? groups.length - 5 : 0,
                    })}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}