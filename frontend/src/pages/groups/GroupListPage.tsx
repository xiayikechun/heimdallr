import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from "react-i18next"
import { Plus, Search, Filter } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { groupService } from '../../services/groupService';
import { ROUTES } from '../../utils/constants';
import { getErrorMessage } from '../../utils/helpers';
import type { Group } from '../../types/group';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { GroupCard } from '../../components/groups/GroupCard';

export function GroupListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState("")

  const queryClient = useQueryClient()

  const {
    data: groups = [],
    isLoading: groupsLoading,
    error: groupsError,
  } = useQuery({
    queryKey: ["groups"],
    queryFn: () => groupService.getGroups(),
  })

  // 获取每个分组的详细信息（包含渠道信息）
  const { data: groupsWithChannels = {} } = useQuery({
    queryKey: ["groups-with-channels", groups.map((g) => g.id)],
    queryFn: async () => {
      const groupDetails = await Promise.all(
        groups.map(async (group) => {
          try {
            const detailed = await groupService.getGroup(group.id)
            return { [group.id]: detailed }
          } catch {
            return { [group.id]: { ...group, channels: [] } }
          }
        })
      )
      return groupDetails.reduce((acc, curr) => ({ ...acc, ...curr }), {})
    },
    enabled: groups.length > 0,
  })


  const deleteGroupMutation = useMutation({
    mutationFn: (groupId: number) => groupService.deleteGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });

  const regenerateTokenMutation = useMutation({
    mutationFn: (groupId: number) => groupService.regenerateGroupToken(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });

  // 过滤分组
  const filteredGroups = Array.isArray(groups) ? groups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.token?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  // 计算每个分组的渠道数量
  const getChannelCount = (groupId: number) => {
    const groupDetail = groupsWithChannels[groupId]
    return groupDetail?.channels?.length || 0
  }

  const handleEdit = (group: Group) => {
    // 导航到编辑页面
    navigate(`/groups/${group.id}/edit`);
  };

  const handleDelete = async (groupId: number) => {
    try {
      await deleteGroupMutation.mutateAsync(groupId);
    } catch (error) {
      console.error('Failed to delete group:', error);
    }
  };

  const handleRegenerateToken = async (groupId: number) => {
    try {
      await regenerateTokenMutation.mutateAsync(groupId);
    } catch (error) {
      console.error('Failed to regenerate token:', error);
    }
  };

  if (groupsError) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("groups.title")}
          </h1>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            {t("errors.loadGroupsFailed", {
              message: getErrorMessage(groupsError),
            })}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("groups.title")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t("groups.subtitle")}
          </p>
        </div>
        <Button asChild>
          <Link to={ROUTES.GROUP_CREATE}>
            <Plus className="mr-2 h-4 w-4" />
            {t("groups.createButton")}
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={t("groups.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4">
        <Badge variant="outline">
          {t("groups.total", {
            count: Array.isArray(groups) ? groups.length : 0,
          })}
        </Badge>
      </div>

      {/* Groups list */}
      {groupsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-gray-300 dark:text-gray-600">
            <Filter className="h-full w-full" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            {searchTerm ? t("groups.noGroupsFound") : t("groups.noGroupsYet")}
          </h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {searchTerm ? t("groups.adjustSearch") : t("groups.createFirst")}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <Button asChild>
                <Link to={ROUTES.GROUP_CREATE}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("groups.createButton")}
                </Link>
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              channelCount={getChannelCount(group.id)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onRegenerateToken={handleRegenerateToken}
              isLoading={
                deleteGroupMutation.isPending ||
                regenerateTokenMutation.isPending
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}