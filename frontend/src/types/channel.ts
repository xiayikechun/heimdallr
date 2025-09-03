export interface Channel {
  id: number;
  name: string;
  channel_type: string;
  config: Record<string, any>;
  is_active: boolean;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface ChannelCreate {
  name: string;
  channel_type: string;
  config: Record<string, any>;
  is_active?: boolean;
}

export interface ChannelUpdate {
  name?: string;
  channel_type?: string;
  config?: Record<string, any>;
  is_active?: boolean;
}

// 渠道类型定义
export const CHANNEL_TYPES = {
  bark: 'bark',
  wecom_webhook: 'wecom_webhook',
  wecom_app: 'wecom_app',
  pushover: 'pushover',
  pushdeer: 'pushdeer',
  chanify: 'chanify',
  email: 'email',
  discord_webhook: 'discord_webhook',
  telegram: 'telegram',
  ntfy: 'ntfy',
  lark_webhook: 'lark_webhook',
  dingtalk_webhook: 'dingtalk_webhook',
  apprise: 'apprise',
  pushme: 'pushme',
  quote0: 'quote0',
} as const;

export type ChannelType = typeof CHANNEL_TYPES[keyof typeof CHANNEL_TYPES];

// 渠道类型显示名称
export const CHANNEL_TYPE_LABELS: Record<ChannelType, string> = {
  bark: 'Bark',
  wecom_webhook: '企业微信 Webhook',
  wecom_app: '企业微信应用',
  pushover: 'Pushover',
  pushdeer: 'PushDeer',
  chanify: 'Chanify',
  email: 'SMTP（邮件）',
  discord_webhook: 'Discord',
  telegram: 'Telegram',
  ntfy: 'ntfy',
  lark_webhook: '飞书/Lark Webhook',
  dingtalk_webhook: '钉钉自定义机器人',
  apprise: 'Apprise',
  pushme: 'PushMe',
  quote0: 'Quote0/MindReset',
};

// 渠道配置字段定义
export interface ChannelConfigField {
  name: string;
  label: string;
  type: 'text' | 'password' | 'number' | 'boolean' | 'select';
  required: boolean;
  description?: string;
  descriptionI18nKey?: string; // 用于i18n键，支持富文本描述和超链接
  placeholder?: string;
  options?: { label: string; value: string | number | boolean }[];
  defaultValue?: unknown;
}

export const CHANNEL_CONFIG_FIELDS: Record<ChannelType, ChannelConfigField[]> = {
  bark: [
    {
      name: "BARK_URL",
      label: "Bark服务器地址",
      type: "text",
      required: false,
      placeholder: "https://api.day.app",
      description: "Bark服务器地址，如 https://api.day.app",
      defaultValue: "https://api.day.app",
    },
    {
      name: "BARK_KEY",
      label: "Bark推送Key",
      type: "password",
      required: true,
      placeholder: "qy7s8qnhjhphuNDHJNFxQE",
      description: "Bark的推送 key，如 qy7s8qnhjhphuNDHJNFxQE",
    },
    {
      name: "BARK_PARAMS",
      label: "推送参数",
      type: "text",
      required: false,
      placeholder: "level=timeSensitive",
      description: "Bark的推送参数，仅 ? 后参数，如 level=timeSensitive",
    },
  ],
  wecom_webhook: [
    {
      name: "WECOM_WEBHOOK_KEY",
      label: "企业微信机器人Key",
      type: "password",
      required: true,
      description: "企业微信机器人的 key",
      descriptionI18nKey: "channelConfig.fieldDesc.wecomWebhookKey",
    },
  ],
  wecom_app: [
    {
      name: "WECOM_CORP_ID",
      label: "企业ID",
      type: "text",
      required: true,
      description: "企业微信应用的 corp_id",
      descriptionI18nKey: "channelConfig.fieldDesc.wecomCorpId",
    },
    {
      name: "WECOM_AGENT_ID",
      label: "应用ID",
      type: "text",
      required: true,
      description: "企业微信应用的 agent_id",
    },
    {
      name: "WECOM_SECRET",
      label: "应用Secret",
      type: "password",
      required: true,
      description: "企业微信应用的 secret",
    },
  ],
  pushover: [
    {
      name: "PUSHOVER_TOKEN",
      label: "Pushover Token",
      type: "password",
      required: true,
      description: "Pushover 的 token",
      descriptionI18nKey: "channelConfig.fieldDesc.pushoverToken",
    },
    {
      name: "PUSHOVER_USER",
      label: "Pushover User",
      type: "text",
      required: true,
      description: "Pushover 的 user",
    },
  ],
  pushdeer: [
    {
      name: "PUSHDEER_TOKEN",
      label: "PushDeer Token",
      type: "password",
      required: true,
      description: "PushDeer 的 token",
      descriptionI18nKey: "channelConfig.fieldDesc.pushdeerToken",
    },
  ],
  chanify: [
    {
      name: "CHANIFY_ENDPOINT",
      label: "Chanify Endpoint",
      type: "text",
      required: false,
      placeholder: "https://api.chanify.net",
      description: "Chanify 的 endpoint，可不填，默认为 https://api.chanify.net",
      descriptionI18nKey: "channelConfig.fieldDesc.chanifyEndpoint",
      defaultValue: "https://api.chanify.net",
    },
    {
      name: "CHANIFY_TOKEN",
      label: "Chanify Token",
      type: "password",
      required: true,
      description: "Chanify 的 token",
    },
  ],
  email: [
    {
      name: "EMAIL_HOST",
      label: "邮件服务器地址",
      type: "text",
      required: true,
      placeholder: "smtp.gmail.com",
      description: "Email 服务器地址，如 smtp.gmail.com",
    },
    {
      name: "EMAIL_PORT",
      label: "端口",
      type: "number",
      required: true,
      placeholder: "465",
      description: "Email 服务器端口，如 465",
      defaultValue: 587,
    },
    {
      name: "EMAIL_USER",
      label: "用户名",
      type: "text",
      required: true,
      description: "Email 用户名",
    },
    {
      name: "EMAIL_PASSWORD",
      label: "密码",
      type: "password",
      required: true,
      description: "Email 密码",
    },
    {
      name: "EMAIL_SENDER",
      label: "发件人名称",
      type: "text",
      required: true,
      description: "Email 发件人名称",
    },
    {
      name: "EMAIL_TO",
      label: "收件人",
      type: "text",
      required: true,
      description: "Email 收件人",
    },
    {
      name: "EMAIL_STARTTLS",
      label: "使用TLS",
      type: "boolean",
      required: false,
      description: "Email 是否使用 TLS",
      defaultValue: false,
    },
  ],
  discord_webhook: [
    {
      name: "DISCORD_WEBHOOK_ID",
      label: "Discord Webhook ID",
      type: "text",
      required: true,
      description: "Discord的Webhook ID",
      descriptionI18nKey: "channelConfig.fieldDesc.discordWebhookId",
    },
    {
      name: "DISCORD_WEBHOOK_TOKEN",
      label: "Discord Webhook Token",
      type: "password",
      required: true,
      description: "Discord的Webhook Token",
    },
  ],
  telegram: [
    {
      name: "TELEGRAM_TOKEN",
      label: "Telegram Token",
      type: "password",
      required: true,
      description: "Telegram 的 Token",
      descriptionI18nKey: "channelConfig.fieldDesc.telegramToken",
    },
    {
      name: "TELEGRAM_CHAT_ID",
      label: "Chat ID",
      type: "text",
      required: true,
      description: "Telegram 的 Chat ID",
      descriptionI18nKey: "channelConfig.fieldDesc.telegramChatId",
    },
  ],
  ntfy: [
    {
      name: "NTFY_HOST",
      label: "ntfy服务端地址",
      type: "text",
      required: true,
      description: "ntfy的服务端地址",
    },
    {
      name: "NTFY_TOPIC",
      label: "Topic",
      type: "text",
      required: true,
      description: "ntfy的topic",
      descriptionI18nKey: "channelConfig.fieldDesc.ntfyTopic",
    },
  ],
  lark_webhook: [
    {
      name: "LARK_HOST",
      label: "飞书接口地址",
      type: "text",
      required: false,
      placeholder: "https://open.larksuite.com/open-apis/bot/v2/hook/",
      description: "飞书/Lark的接口地址，默认可以留空",
    },
    {
      name: "LARK_TOKEN",
      label: "飞书Token",
      type: "password",
      required: true,
      description: "飞书/Lark的Token",
    },
    {
      name: "LARK_SECRET",
      label: "签名密钥",
      type: "password",
      required: true,
      description: "飞书/Lark的签名密钥",
    },
  ],
  dingtalk_webhook: [
    {
      name: "DINGTALK_TOKEN",
      label: "钉钉机器人Token",
      type: "password",
      required: true,
      description: "钉钉的自定义机器人Token",
      descriptionI18nKey: "channelConfig.fieldDesc.dingtalkToken",
    },
    {
      name: "DINGTALK_SAFE_WORDS",
      label: "安全关键词",
      type: "text",
      required: false,
      description: "钉钉的自定义关键词，与签名二选一",
      descriptionI18nKey: "channelConfig.fieldDesc.dingtalkSafeWords",
    },
    {
      name: "DINGTALK_SECRET",
      label: "签名密钥",
      type: "password",
      required: false,
      description: "钉钉的secret，推荐使用签名",
      descriptionI18nKey: "channelConfig.fieldDesc.dingtalkSecret",
    },
  ],
  apprise: [
    {
      name: "APPRISE_URL",
      label: "Apprise协议URL",
      type: "text",
      required: true,
      description: "Apprise的协议URL",
      descriptionI18nKey: "channelConfig.fieldDesc.appriseUrl",
    },
  ],
  pushme: [
    {
      name: "PUSHME_URL",
      label: "PushMe服务端地址",
      type: "text",
      required: true,
      description: "PushMe的服务端地址",
    },
    {
      name: "PUSHME_PUSH_KEY",
      label: "推送密钥",
      type: "password",
      required: true,
      description: "PushMe的推送密钥",
    },
  ],
  quote0: [
    {
      name: "QUOTE0_DEVICE_ID",
      label: "设备ID",
      type: "text",
      required: true,
      description: "Quote0(MindReset)的设备ID",
      descriptionI18nKey: "channelConfig.fieldDesc.quote0DeviceId",
    },
    {
      name: "QUOTE0_API_KEY",
      label: "API密钥",
      type: "password",
      required: true,
      description: "Quote0(MindReset)的API密钥",
    },
    {
      name: "QUOTE0_BASE_URL",
      label: "服务端地址",
      type: "text",
      required: false,
      placeholder: "https://dot.mindreset.tech",
      description: "Quote0(MindReset)的服务端地址",
    },
  ],
}