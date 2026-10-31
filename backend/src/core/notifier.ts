import axios from "axios";
import { config } from "../config.js";
import { NotifyConfig } from "../types/dsl.js";

export interface UserNotificationDestinations {
  telegram_chat_id?: string | null;
  discord_webhook_url?: string | null;
}

export interface NotificationResult {
  channel: string;
  sent: boolean;
  destination: string;
  message: string;
  error?: string;
  simulated?: boolean;
}

/**
 * Dispatches notification to Telegram Bot or Discord Webhook.
 */
export async function dispatchNotification(
  notifyConfig: NotifyConfig,
  resolvedMessage: string,
  userDestinations: UserNotificationDestinations
): Promise<NotificationResult> {
  const channel = notifyConfig.channel;

  if (channel === "telegram") {
    const chatId = userDestinations.telegram_chat_id;
    const botToken = config.TELEGRAM_BOT_TOKEN;

    if (!chatId) {
      return {
        channel: "telegram",
        sent: false,
        destination: "none",
        message: resolvedMessage,
        error: "User has not configured a Telegram Chat ID in their profile settings.",
      };
    }

    if (!botToken) {
      // In development or if bot token not yet provided, simulate delivery
      console.warn("[TELEGRAM SIMULATION] Bot token not provided. Message:", resolvedMessage);
      return {
        channel: "telegram",
        sent: true,
        destination: chatId,
        message: resolvedMessage,
        simulated: true,
      };
    }

    try {
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      await axios.post(url, {
        chat_id: chatId,
        text: resolvedMessage,
        parse_mode: "Markdown",
      });

      return {
        channel: "telegram",
        sent: true,
        destination: chatId,
        message: resolvedMessage,
      };
    } catch (err: any) {
      const errorDetail = err.response?.data?.description || err.message;
      return {
        channel: "telegram",
        sent: false,
        destination: chatId,
        message: resolvedMessage,
        error: `Telegram delivery failed: ${errorDetail}`,
      };
    }
  }

  if (channel === "discord") {
    const webhookUrl = userDestinations.discord_webhook_url;

    if (!webhookUrl) {
      return {
        channel: "discord",
        sent: false,
        destination: "none",
        message: resolvedMessage,
        error: "User has not configured a Discord Webhook URL in their profile settings.",
      };
    }

    try {
      await axios.post(webhookUrl, {
        content: resolvedMessage,
      });

      return {
        channel: "discord",
        sent: true,
        destination: webhookUrl,
        message: resolvedMessage,
      };
    } catch (err: any) {
      const errorDetail = err.response?.data?.message || err.message;
      return {
        channel: "discord",
        sent: false,
        destination: webhookUrl,
        message: resolvedMessage,
        error: `Discord webhook delivery failed: ${errorDetail}`,
      };
    }
  }

  return {
    channel,
    sent: false,
    destination: "unknown",
    message: resolvedMessage,
    error: `Unsupported notification channel: "${channel}"`,
  };
}
