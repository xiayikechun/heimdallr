import { useState } from 'react';
import { MoreHorizontal, Edit, Trash2, Play, Pause, Hammer } from "lucide-react"
import { useTranslation } from 'react-i18next';

import type { Channel } from '../../types/channel';
import { formatDate } from '../../utils/helpers';

import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { TestChannelModal } from './TestChannelModal';

interface ChannelCardProps {
  channel: Channel;
  onEdit: (channel: Channel) => void;
  onDelete: (channelId: number) => void;
  onToggleStatus: (channelId: number, isActive: boolean) => void;
  isLoading?: boolean;
}

export function ChannelCard({ 
  channel, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  isLoading = false 
}: ChannelCardProps) {
  const { t } = useTranslation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);

  const handleDelete = () => {
    onDelete(channel.id);
    setShowDeleteDialog(false);
  };

  const handleToggleStatus = () => {
    onToggleStatus(channel.id, !channel.is_active);
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-lg">{channel.name}</h3>
                <Badge variant={channel.is_active ? "default" : "secondary"}>
                  {channel.is_active ? t('common.active') : t('common.inactive')}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t(`channelTypes.${channel.channel_type}`)}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" disabled={isLoading}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(channel)}>
                  <Edit className="mr-2 h-4 w-4" />
                  {t('common.edit')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowTestModal(true)}
                  disabled={!channel.is_active}
                >
                  <Hammer className="mr-2 h-4 w-4" />
                  {t('test.testChannel')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggleStatus}>
                  {channel.is_active ? (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      {t('common.disable')}
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      {t('common.enable')}
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600 dark:text-red-400"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t('common.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">
                {t('common.createdAt')}:
              </span>
              <span>{formatDate(channel.created_at, "yyyy-MM-dd HH:mm")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">
                {t('common.updatedAt')}:
              </span>
              <span>{formatDate(channel.updated_at, "yyyy-MM-dd HH:mm")}</span>
            </div>
            {/* Display partial configuration info */}
            {Object.keys(channel.config || {}).length > 0 && (
              <div className="pt-2 border-t">
                <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">
                  {t('channelConfig.configItems', { count: Object.keys(channel.config).length })}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('channels.deleteConfirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('channels.deleteMessage', { name: channel.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Test channel modal */}
      <TestChannelModal
        channelId={channel.id}
        channelName={channel.name}
        open={showTestModal}
        onOpenChange={setShowTestModal}
      />
    </>
  )
}