import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Save, Loader2, Shield, Calendar, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { authService } from '../services/authService';
import { userUpdateSchema } from '../utils/validators';
import { getErrorMessage } from '../utils/helpers';

import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import { Input } from '../components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Separator } from '../components/ui/separator';

type FormData = {
  email: string;
  password: string;
  confirmPassword: string;
};

export function ProfilePage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  // Fetch current user data
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => authService.getCurrentUser(),
  });

  const form = useForm<FormData>({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      form.reset({
        email: user.email || '',
        password: '',
        confirmPassword: '',
      });
    }
  }, [user, form]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: FormData) => {
      const updateData: any = {};
      
      // Only include email if it's different from current
      if (data.email !== user?.email) {
        updateData.email = data.email || undefined;
      }
      
      // Only include password if it's provided
      if (data.password) {
        updateData.password = data.password;
      }
      
      return authService.updateCurrentUser(updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      setIsEditingPassword(false);
      form.setValue('password', '');
      form.setValue('confirmPassword', '');
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await updateProfileMutation.mutateAsync(data);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleCancelPasswordEdit = () => {
    setIsEditingPassword(false);
    form.setValue('password', '');
    form.setValue('confirmPassword', '');
    form.clearErrors(['password', 'confirmPassword']);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('profile.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('profile.subtitle')}
          </p>
        </div>
        
        <Alert variant="destructive">
          <AlertDescription>
            {t('profile.loadFailed')}: {error ? getErrorMessage(error) : t('profile.userNotFound')}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('profile.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('profile.subtitle')}
        </p>
      </div>

      {/* Success message */}
      {updateProfileMutation.isSuccess && (
        <Alert>
          <AlertTitle>{t('profile.updateSuccess')}</AlertTitle>
          <AlertDescription>
            {t('profile.updateSuccessDesc')}
          </AlertDescription>
        </Alert>
      )}

      {/* Error message */}
      {updateProfileMutation.error && (
        <Alert variant="destructive">
          <AlertDescription>
            {t('profile.updateFailed')}: {getErrorMessage(updateProfileMutation.error)}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile form */}
        <Card>
          <CardHeader>
            <CardTitle>{t('profile.basicInfo')}</CardTitle>
            <CardDescription>
              {t('profile.basicInfoDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Email field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('profile.emailAddress')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            type="email"
                            placeholder={t('profile.emailPlaceholder')}
                            disabled={updateProfileMutation.isPending}
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                {/* Password section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">{t('profile.password')}</h4>
                    {!isEditingPassword && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingPassword(true)}
                      >
                        {t('profile.changePassword')}
                      </Button>
                    )}
                  </div>

                  {isEditingPassword ? (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('profile.newPassword')}</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder={t('profile.newPasswordPlaceholder')}
                                disabled={updateProfileMutation.isPending}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('profile.confirmNewPassword')}</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder={t('profile.confirmNewPasswordPlaceholder')}
                                disabled={updateProfileMutation.isPending}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex space-x-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleCancelPasswordEdit}
                          disabled={updateProfileMutation.isPending}
                        >
                          {t('common.cancel')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {t('profile.passwordChangeHint')}
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <div className="flex justify-end pt-6 border-t">
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('profile.updating')}
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {t('profile.saveChanges')}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Account info */}
        <Card>
          <CardHeader>
            <CardTitle>{t('profile.accountInfo')}</CardTitle>
            <CardDescription>
              {t('profile.accountInfoDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Username */}
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {t('profile.username')}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {user.username}
                </p>
              </div>
            </div>

            {/* Admin status */}
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-gray-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {t('profile.accountType')}
                </p>
                <div className="mt-1">
                  <Badge variant={user.is_admin ? 'default' : 'secondary'}>
                    {user.is_admin ? t('profile.administrator') : t('profile.regularUser')}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Registration date */}
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {t('profile.registrationTime')}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(user.created_at).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            {/* Last update */}
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {t('profile.lastUpdate')}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(user.updated_at).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}