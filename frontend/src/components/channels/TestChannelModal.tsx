import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, Loader2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { channelService } from '../../services/channelService';
import { getErrorMessage } from '../../utils/helpers';

import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';

// Schema will be created inside component to access t function
const createTestSchema = (t: (key: string) => string) => z.object({
  title: z.string().min(1, t('validation.required')),
  body: z.string().min(1, t('validation.required')),
});

type TestFormData = {
  title: string;
  body: string;
};

interface TestChannelModalProps {
  channelId?: number; // Optional for testing config without existing channel
  channelName: string;
  channelType?: string; // Required when testing config without existing channel
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config?: Record<string, unknown>; // Optional config to use for testing
}

export function TestChannelModal({ channelId, channelName, channelType, open, onOpenChange, config }: TestChannelModalProps) {
  const { t } = useTranslation();
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const testSchema = createTestSchema(t);

  const form = useForm<TestFormData>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      title: 'Hello World',
      body: 'From Heimdallr',
    },
  });

  const testChannelMutation = useMutation({
    mutationFn: ({ title, body }: { title: string; body: string }) => {
      if (channelId) {
        // Test existing channel - only pass config if it's provided (for edit page)
        // For channel list testing, let backend use database config
        return channelService.testChannel(channelId, title, body, config);
      } else if (channelType && config) {
        // Test config without existing channel
        return channelService.testChannelConfig(channelType, config, title, body);
      } else {
        throw new Error('Either channelId or (channelType and config) must be provided');
      }
    },
    onSuccess: (data) => {
      setTestResult({
        success: data.success,
        message: data.message,
      });
    },
    onError: (error) => {
      setTestResult({
        success: false,
        message: getErrorMessage(error),
      });
    },
  });

  const onSubmit = async (data: TestFormData) => {
    setTestResult(null);
    await testChannelMutation.mutateAsync(data);
  };

  const handleClose = () => {
    setTestResult(null);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('test.title')}</DialogTitle>
          <DialogDescription>
            {t('test.subtitle', { channelName })}
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
                      disabled={testChannelMutation.isPending}
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
                      disabled={testChannelMutation.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {testResult && (
              <Alert variant={testResult.success ? "default" : "destructive"}>
                <AlertDescription>
                  {testResult.message}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end space-x-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={testChannelMutation.isPending}
              >
                <X className="mr-2 h-4 w-4" />
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={testChannelMutation.isPending}
              >
                {testChannelMutation.isPending ? (
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