import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, Loader2, X, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { groupService } from '../../services/groupService';
import { getErrorMessage } from '../../utils/helpers';

import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';

const createTestSchema = (t: (key: string) => string) => z.object({
  title: z.string().min(1, t('validation.required')),
  body: z.string().min(1, t('validation.required')),
});

type TestFormData = {
  title: string;
  body: string;
};

interface TestGroupModalProps {
  groupId: number; // 0 means test with provided channels config
  groupName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channels?: Array<{ id: number; name: string; channel_type: string; config: Record<string, unknown>; is_active: boolean }>; // For testing edit mode
}

interface ChannelTestResult {
  channel_id: number;
  channel_name: string;
  success: boolean;
  message: string;
}

interface TestGroupResponse {
  success: boolean;
  message: string;
  channel_results: ChannelTestResult[];
}

export function TestGroupModal({ groupId, groupName, open, onOpenChange, channels }: TestGroupModalProps) {
  const { t } = useTranslation();
  const [testResult, setTestResult] = useState<TestGroupResponse | null>(null);

  const testSchema = createTestSchema(t);

  const form = useForm<TestFormData>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      title: 'Hello World',
      body: 'From Heimdallr',
    },
  });

  const testGroupMutation = useMutation({
    mutationFn: ({ title, body }: { title: string; body: string }) => {
      if (groupId === 0 && channels) {
        // Test with provided channels config (edit mode)
        return groupService.testGroupWithChannels(title, body, channels);
      } else {
        // Test with database config (list mode)
        return groupService.testGroup(groupId, title, body);
      }
    },
    onSuccess: (data: TestGroupResponse) => {
      setTestResult(data);
    },
    onError: (error) => {
      setTestResult({
        success: false,
        message: getErrorMessage(error),
        channel_results: [],
      });
    },
  });

  const onSubmit = async (data: TestFormData) => {
    setTestResult(null);
    await testGroupMutation.mutateAsync(data);
  };

  const handleClose = () => {
    setTestResult(null);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('groups.testGroup')}</DialogTitle>
          <DialogDescription>
            {t('test.subtitle', { channelName: groupName })}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('test.testTitle')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('test.testTitlePlaceholder')}
                      disabled={testGroupMutation.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('test.testContent')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('test.testContentPlaceholder')}
                      rows={3}
                      disabled={testGroupMutation.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {testResult && (
              <div className="space-y-4">
                <Alert variant={testResult.success ? "default" : "destructive"}>
                  <AlertDescription>
                    {testResult.message}
                  </AlertDescription>
                </Alert>

                {testResult.channel_results.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">{t('test.channelResults')}:</h4>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {testResult.channel_results.map((result) => (
                        <div
                          key={result.channel_id}
                          className="flex items-center space-x-2 text-sm p-2 rounded border"
                        >
                          {result.success ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <div className="flex-1">
                            <span className="font-medium">{result.channel_name}</span>
                            <div className="text-muted-foreground text-xs">
                              {result.message}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={testGroupMutation.isPending}
              >
                <X className="mr-2 h-4 w-4" />
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={testGroupMutation.isPending}
              >
                {testGroupMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('test.sending')}
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    {t('test.sendTest')}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}