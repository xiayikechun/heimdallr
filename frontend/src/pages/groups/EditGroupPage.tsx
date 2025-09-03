import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Save,
  Loader2,
  RefreshCw,
  Copy,
  Check,
  Hammer,
} from "lucide-react"

import { groupService } from '../../services/groupService';
import { channelService } from '../../services/channelService';
import { z } from 'zod';
import { ROUTES } from '../../utils/constants';
import { getErrorMessage, copyToClipboard } from '../../utils/helpers';

import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogCancel, AlertDialogAction } from '../../components/ui/alert-dialog';
import { ChannelSelector } from '../../components/groups/ChannelSelector';
import { TestGroupModal } from "../../components/groups/TestGroupModal"
import { Skeleton } from '../../components/ui/skeleton';

// 创建不使用optional的schema，确保类型一致
const formSchema = z.object({
  name: z.string().min(1, '分组名称不能为空').max(100, '分组名称不能超过100个字符'),
  description: z.string().max(500, '描述不能超过500个字符'),
});

type FormData = z.infer<typeof formSchema>;

export function EditGroupPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [selectedChannelIds, setSelectedChannelIds] = useState<number[]>([]);
  const [tokenCopied, setTokenCopied] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);

  const groupId = parseInt(id || '0', 10);

  // Fetch group data
  const { data: group, isLoading, error } = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => groupService.getGroup(groupId),
    enabled: !!groupId && groupId > 0,
  });

  // Fetch available channels
  const { 
    data: channels = [], 
    isLoading: channelsLoading 
  } = useQuery({
    queryKey: ['channels'],
    queryFn: () => channelService.getChannels(),
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  // Update form and selected channels when group data loads
  useEffect(() => {
    if (group) {
      form.reset({
        name: group.name,
        description: group.description || '',
      });
      setSelectedChannelIds(group.channels?.map(c => c.id) || []);
    }
  }, [group, form]);

  const updateGroupMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // Update group basic info
      const updatedGroup = await groupService.updateGroup(groupId, {
        name: data.name,
        description: data.description || undefined,
      });

      // 获取当前关联的渠道ID
      const currentChannelIds = group?.channels?.map(c => c.id) || [];
      
      // 找出需要移除的渠道
      const channelsToRemove = currentChannelIds.filter(id => !selectedChannelIds.includes(id));
      for (const channelId of channelsToRemove) {
        await groupService.removeChannelFromGroup(groupId, channelId);
      }
      
      // 找出需要添加的渠道
      const channelsToAdd = selectedChannelIds.filter(id => !currentChannelIds.includes(id));
      for (const channelId of channelsToAdd) {
        await groupService.addChannelToGroup(groupId, channelId);
      }
      
      return updatedGroup;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups-with-channels'] });
      navigate(ROUTES.GROUPS);
    },
  });

  const regenerateTokenMutation = useMutation({
    mutationFn: () => groupService.regenerateGroupToken(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await updateGroupMutation.mutateAsync(data);
    } catch (error) {
      console.error('Failed to update group:', error);
    }
  };

  const handleAddChannel = (channelId: number) => {
    setSelectedChannelIds(prev => [...prev, channelId]);
  };

  const handleRemoveChannel = (channelId: number) => {
    setSelectedChannelIds(prev => prev.filter(id => id !== channelId));
  };

  const maskToken = (token: string) => {
    if (token.length <= 10) return token
    return `${token.slice(0, 5)}***${token.slice(-5)}`
  }

  const handleCopyToken = async () => {
    if (group?.token) {
      const success = await copyToClipboard(group.token)
      if (success) {
        setTokenCopied(true);
        setTimeout(() => setTokenCopied(false), 2000);
      }
    }
  };

  const handleRegenerateToken = () => {
    setShowRegenerateDialog(true);
  };

  const confirmRegenerateToken = () => {
    regenerateTokenMutation.mutate();
    setShowRegenerateDialog(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" disabled>
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回
          </Button>
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-96" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !group) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(ROUTES.GROUPS)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              编辑通知分组
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              修改分组信息和渠道配置
            </p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            加载分组信息失败: {error ? getErrorMessage(error) : '分组不存在'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(ROUTES.GROUPS)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            编辑通知分组
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            修改分组信息和渠道配置
          </p>
        </div>
      </div>

      {/* Error display */}
      {updateGroupMutation.error && (
        <Alert variant="destructive">
          <AlertDescription>
            {t('errors.updateGroupFailed', { message: getErrorMessage(updateGroupMutation.error) })}
          </AlertDescription>
        </Alert>
      )}

      {regenerateTokenMutation.error && (
        <Alert variant="destructive">
          <AlertDescription>
            {t('groups.regenerateError')}: {getErrorMessage(regenerateTokenMutation.error)}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('groups.basicInfo')}</CardTitle>
              <CardDescription>{t('groups.basicInfoDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('groups.groupName')} *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('groups.groupNamePlaceholder')}
                            disabled={updateGroupMutation.isPending}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('groups.groupDescription')} {t('channels.optional')}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t('groups.groupDescPlaceholder')}
                            disabled={updateGroupMutation.isPending}
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Actions */}
                  <div className="flex justify-end space-x-4 pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate(ROUTES.GROUPS)}
                      disabled={updateGroupMutation.isPending}
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button
                      type="submit"
                      disabled={updateGroupMutation.isPending}
                    >
                      {updateGroupMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('groups.updating')}
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          {t('common.save')}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Group Token */}
          <Card>
            <CardHeader>
              <CardTitle>{t('groups.token')}</CardTitle>
              <CardDescription>{t('groups.tokenDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded border break-all">
                    {maskToken(group.token)}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyToken}
                  className="flex-shrink-0"
                >
                  {tokenCopied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      {t('common.copied')}
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      {t('common.copy')}
                    </>
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t('groups.regenerateTooltip')}
                </div>
                <div className="flex gap-2">
                  {selectedChannelIds.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowTestModal(true)}
                    >
                      <Hammer className="h-4 w-4 mr-2" />
                      {t('test.testChannel')}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRegenerateToken}
                    disabled={regenerateTokenMutation.isPending}
                  >
                    {regenerateTokenMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    {t('groups.regenerateToken')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Channel selection */}
        <div>
          {channelsLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  <div className="space-y-2">
                    <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <ChannelSelector
              availableChannels={channels}
              selectedChannelIds={selectedChannelIds}
              onAddChannel={handleAddChannel}
              onRemoveChannel={handleRemoveChannel}
              isLoading={updateGroupMutation.isPending}
            />
          )}
        </div>
      </div>

      {/* Test group modal */}
      {group && (
        <TestGroupModal
          groupId={0} // Use 0 to indicate test with provided config
          groupName={group.name}
          open={showTestModal}
          onOpenChange={setShowTestModal}
          channels={channels.filter(c => selectedChannelIds.includes(c.id))}
        />
      )}

      {/* Regenerate token confirmation dialog */}
      {group && (
        <AlertDialog
          open={showRegenerateDialog}
          onOpenChange={setShowRegenerateDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('groups.regenerateConfirm')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('groups.regenerateMessage', { name: group.name })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={confirmRegenerateToken}>
                {t('groups.regenerate')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}