import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

import { groupService } from '../../services/groupService';
import { channelService } from '../../services/channelService';
import { groupCreateSchema } from '../../utils/validators';
import { ROUTES } from '../../utils/constants';
import { getErrorMessage } from '../../utils/helpers';

import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { ChannelSelector } from '../../components/groups/ChannelSelector';

type FormData = {
  name: string;
  description: string;
};

export function CreateGroupPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedChannelIds, setSelectedChannelIds] = useState<number[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(groupCreateSchema),
    defaultValues: {
      name: '',
      // description will use schema default
    },
  });

  // 获取可用渠道
  const { 
    data: channels = [], 
    isLoading: channelsLoading 
  } = useQuery({
    queryKey: ['channels'],
    queryFn: () => channelService.getChannels(),
  });

  const createGroupMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // 先创建分组
      const group = await groupService.createGroup({
        name: data.name,
        description: data.description || undefined,
      });
      
      // 然后添加渠道关联
      for (const channelId of selectedChannelIds) {
        await groupService.addChannelToGroup(group.id, channelId);
      }
      
      return group;
    },
    onSuccess: () => {
      // Invalidate and refetch groups queries to refresh the list page
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['groups-with-channels'] });
      navigate(ROUTES.GROUPS);
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createGroupMutation.mutateAsync(data);
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };

  const handleAddChannel = (channelId: number) => {
    setSelectedChannelIds(prev => [...prev, channelId]);
  };

  const handleRemoveChannel = (channelId: number) => {
    setSelectedChannelIds(prev => prev.filter(id => id !== channelId));
  };

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
          {t('common.back')}
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('groups.createTitle')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('groups.createSubtitle')}
          </p>
        </div>
      </div>

      {/* Error display */}
      {createGroupMutation.error && (
        <Alert variant="destructive">
          <AlertDescription>
            {t('errors.createGroupFailed', { message: getErrorMessage(createGroupMutation.error) })}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('groups.basicInfo')}</CardTitle>
            <CardDescription>
              {t('groups.basicInfoDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('groups.groupName')} *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('groups.groupNamePlaceholder')}
                          disabled={createGroupMutation.isPending}
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
                          disabled={createGroupMutation.isPending}
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
                    disabled={createGroupMutation.isPending}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={createGroupMutation.isPending || !form.watch('name')}
                  >
                    {createGroupMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('groups.creating')}
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {t('groups.createButton')}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

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
              isLoading={createGroupMutation.isPending}
            />
          )}
        </div>
      </div>
    </div>
  );
}