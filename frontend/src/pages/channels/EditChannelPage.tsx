import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { z } from "zod"
import { ArrowLeft, Save, Loader2, Hammer } from "lucide-react"

import { channelService } from "../../services/channelService"
import { ROUTES } from "../../utils/constants"
import { getErrorMessage } from "../../utils/helpers"
import type { ChannelUpdate, ChannelType } from "../../types/channel"

import { Button } from "../../components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form"
import { Input } from "../../components/ui/input"
import { Switch } from "../../components/ui/switch"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { ChannelConfigForm } from "../../components/channels/ChannelConfigForm"
import { ChannelTypeSelector } from "../../components/channels/ChannelTypeSelector"
import { Skeleton } from "../../components/ui/skeleton"
import { TestChannelModal } from "../../components/channels/TestChannelModal"

const createEditFormSchema = (
  t: (key: string, options?: Record<string, unknown>) => string
) =>
  z.object({
    name: z
      .string()
      .min(1, t("validation.required"))
      .max(100, t("validation.maxLength", { max: 100 })),
    channel_type: z.string().min(1, t("channels.selectChannelType")),
    is_active: z.boolean(),
    config: z.record(z.string(), z.unknown()),
  })

export function EditChannelPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const [showTestModal, setShowTestModal] = useState(false)

  const channelId = parseInt(id || "0", 10)
  const formSchema = createEditFormSchema(t)
  type FormData = z.infer<typeof formSchema>

  // Fetch channel data
  const {
    data: channel,
    isPending,
    error,
  } = useQuery({
    queryKey: ["channel", channelId],
    queryFn: () => channelService.getChannel(channelId),
    enabled: !!channelId && channelId > 0,
  })

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: channel?.name || "",
      channel_type: channel?.channel_type || "",
      is_active: channel?.is_active ?? true,
      config: channel?.config || {},
    },
    mode: "onChange",
  })

  const [isFormReady, setIsFormReady] = useState(false)

  // Update form values when channel data loads
  useEffect(() => {
    if (channel) {
      form.reset({
        name: channel.name || "",
        channel_type: channel.channel_type || "",
        is_active: channel.is_active ?? true,
        config: channel.config || {},
      })
      setIsFormReady(true)
    }
  }, [channel, form])

  const updateChannelMutation = useMutation({
    mutationFn: (data: ChannelUpdate) =>
      channelService.updateChannel(channelId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] })
      queryClient.invalidateQueries({ queryKey: ["channel", channelId] })
      navigate(ROUTES.CHANNELS)
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      const channelData: ChannelUpdate = {
        name: data.name,
        channel_type: data.channel_type,
        is_active: data.is_active,
        config: data.config as Record<string, unknown>,
      }
      await updateChannelMutation.mutateAsync(channelData)
    } catch (error) {
      console.error("Failed to update channel:", error)
    }
  }

  const handleChannelTypeChange = (value: string) => {
    // 如果改变了渠道类型，清空配置
    if (value !== form.getValues("channel_type")) {
      form.setValue("config", {})
    }
  }

  // Loading state (do not render form until data is fetched and form is initialized)
  if (isPending || !isFormReady) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" disabled>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("common.back")}
          </Button>
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(ROUTES.CHANNELS)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("common.back")}
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t("channels.editTitle")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t("channels.editSubtitle")}
            </p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            {t("errors.loadChannelsFailed", {
              message: getErrorMessage(error),
            })}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(ROUTES.CHANNELS)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("common.back")}
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("channels.editTitle")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t("channels.editSubtitle")}
          </p>
        </div>
      </div>

      {/* Error display */}
      {updateChannelMutation.error && (
        <Alert variant="destructive">
          <AlertDescription>
            {t("errors.updateChannelFailed", {
              message: getErrorMessage(updateChannelMutation.error),
            })}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("channels.channelConfig")}</CardTitle>
          <CardDescription>{t("channelConfig.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("channels.channelName")} {t("channels.required")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("channels.channelNamePlaceholder")}
                          disabled={updateChannelMutation.isPending || !channel}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Controller
                  control={form.control}
                  name="channel_type"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>
                        {t("channels.channelType")} {t("channels.required")}
                      </FormLabel>
                      <FormControl>
                        <ChannelTypeSelector
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value)
                            handleChannelTypeChange(value)
                          }}
                          disabled={updateChannelMutation.isPending || !channel}
                        />
                      </FormControl>
                      {fieldState.error && (
                        <p className="text-sm font-medium text-destructive">
                          {fieldState.error.message}
                        </p>
                      )}
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        {t("channels.enableChannel")}
                      </FormLabel>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {t("channels.enableChannelDesc")}
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={updateChannelMutation.isPending || !channel}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Channel-specific configuration */}
              {form.watch("channel_type") && (
                <div className="space-y-4">
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">
                      {t("channels.channelConfig")}
                    </h3>
                    <ChannelConfigForm
                      channelType={form.watch("channel_type") as ChannelType}
                      control={form.control}
                      disabled={updateChannelMutation.isPending || !channel}
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowTestModal(true)}
                  disabled={
                    updateChannelMutation.isPending || !channel?.is_active
                  }
                >
                  <Hammer className="mr-2 h-4 w-4" />
                  {t("test.testChannel")}
                </Button>
                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(ROUTES.CHANNELS)}
                    disabled={updateChannelMutation.isPending}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateChannelMutation.isPending}
                  >
                    {updateChannelMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("channels.updating")}
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {t("common.save")}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Test channel modal */}
      {channel && (
        <TestChannelModal
          channelType={form.watch("channel_type")}
          channelName={channel.name}
          open={showTestModal}
          onOpenChange={setShowTestModal}
          config={form.watch("config")}
        />
      )}
    </div>
  )
}