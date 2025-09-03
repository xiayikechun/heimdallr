import { useState } from 'react';
import { Check, X, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Channel } from '../../types/channel';

import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Input } from '../ui/input';

interface ChannelSelectorProps {
  availableChannels: Channel[];
  selectedChannelIds: number[];
  onAddChannel: (channelId: number) => void;
  onRemoveChannel: (channelId: number) => void;
  isLoading?: boolean;
}

export function ChannelSelector({
  availableChannels,
  selectedChannelIds,
  onAddChannel,
  onRemoveChannel,
  isLoading = false
}: ChannelSelectorProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const selectedChannels = availableChannels.filter(channel => 
    selectedChannelIds.includes(channel.id)
  );
  
  const unselectedChannels = availableChannels.filter(channel => 
    !selectedChannelIds.includes(channel.id) && channel.is_active
  );

  const filteredUnselectedChannels = unselectedChannels.filter(channel =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    channel.channel_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddChannel = (channelId: number) => {
    onAddChannel(channelId);
    setSearchTerm('');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{t('channels.associatedChannels')}</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" disabled={isLoading}>
                <Plus className="mr-2 h-4 w-4" />
                {t('channels.addChannel')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t('channels.selectChannels')}</DialogTitle>
                <DialogDescription>
                  {t('channels.selectChannelsDesc')}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <Input
                  placeholder={t('channels.searchChannelsPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {filteredUnselectedChannels.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <p>{t('channels.noAvailableChannels')}</p>
                      <p className="text-sm">{t('channels.createActiveChannelsFirst')}</p>
                    </div>
                  ) : (
                    filteredUnselectedChannels.map((channel) => (
                      <div
                        key={channel.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{channel.name}</h4>
                            <Badge variant="outline">
                              {t(`channelTypes.${channel.channel_type}`)}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAddChannel(channel.id)}
                          disabled={isLoading}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {selectedChannels.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>{t('channels.noChannelsAdded')}</p>
            <p className="text-sm">{t('channels.clickAddChannelToStart')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {selectedChannels.map((channel) => (
              <div
                key={channel.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full">
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-medium">{channel.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t(`channelTypes.${channel.channel_type}`)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveChannel(channel.id)}
                  disabled={isLoading}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <div className="pt-3 border-t">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('channels.totalChannelsCount', { count: selectedChannels.length })}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}