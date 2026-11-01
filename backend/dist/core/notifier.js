import axios from "axios";
import nodemailer from "nodemailer";
import { config } from "../config.js";
/**
 * Escapes special HTML entities for Telegram HTML parse mode.
 */
function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
/**
 * Dispatches notification to Telegram Bot, Discord Webhook, or Email.
 */
export async function dispatchNotification(notifyConfig, resolvedMessage, userDestinations) {
    const channel = notifyConfig.channel;
    // ============================================================================
    // 1. TELEGRAM DISPATCH
    // ============================================================================
    if (channel === "telegram") {
        const chatId = userDestinations.telegram_chat_id;
        const botToken = config.TELEGRAM_BOT_TOKEN;
        if (!chatId) {
            return {
                channel: "telegram",
                sent: false,
                destination: "none",
                message: resolvedMessage,
                error: "Telegram Chat ID not configured in your account settings.",
            };
        }
        if (!botToken) {
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
            const formattedHtml = `⚡ <b>PromptFlow Alert</b>\n\n${escapeHtml(resolvedMessage)}`;
            await axios.post(url, {
                chat_id: chatId,
                text: formattedHtml,
                parse_mode: "HTML",
            });
            return {
                channel: "telegram",
                sent: true,
                destination: chatId,
                message: resolvedMessage,
            };
        }
        catch (err) {
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
    // ============================================================================
    // 2. DISCORD WEBHOOK DISPATCH
    // ============================================================================
    if (channel === "discord") {
        const webhookUrl = userDestinations.discord_webhook_url || config.DISCORD_WEBHOOK_URL;
        if (!webhookUrl) {
            return {
                channel: "discord",
                sent: false,
                destination: "none",
                message: resolvedMessage,
                error: "Discord Webhook URL not configured in your account settings.",
            };
        }
        try {
            // Send rich embed ONLY - avoids repeating the message twice
            await axios.post(webhookUrl, {
                username: "PromptFlow Bot",
                embeds: [
                    {
                        title: "⚡ PromptFlow Alert",
                        description: resolvedMessage.length > 4000 ? resolvedMessage.substring(0, 3990) + "..." : resolvedMessage,
                        color: 0x0284c7, // Sky 600
                        footer: {
                            text: "Autonomous Micro-Automation Engine",
                        },
                        timestamp: new Date().toISOString(),
                    },
                ],
            });
            return {
                channel: "discord",
                sent: true,
                destination: webhookUrl.substring(0, 35) + "...",
                message: resolvedMessage,
            };
        }
        catch (err) {
            const errorDetail = err.response?.data?.message || err.message;
            return {
                channel: "discord",
                sent: false,
                destination: webhookUrl.substring(0, 35) + "...",
                message: resolvedMessage,
                error: `Discord Webhook delivery failed: ${errorDetail}`,
            };
        }
    }
    // ============================================================================
    // 3. EMAIL DISPATCH
    // ============================================================================
    if (channel === "email") {
        const recipientEmail = userDestinations.email;
        if (!recipientEmail) {
            return {
                channel: "email",
                sent: false,
                destination: "none",
                message: resolvedMessage,
                error: "User email address not found in profile.",
            };
        }
        // Check if SMTP is configured
        if (config.SMTP_HOST && config.SMTP_USER && config.SMTP_PASS) {
            try {
                const transporter = nodemailer.createTransport({
                    host: config.SMTP_HOST,
                    port: config.SMTP_PORT ? parseInt(config.SMTP_PORT, 10) : 587,
                    secure: config.SMTP_PORT === "465",
                    auth: {
                        user: config.SMTP_USER,
                        pass: (config.SMTP_PASS || "").replace(/\s+/g, ""),
                    },
                });
                const htmlContent = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; border-radius: 16px; border: 1px solid #1e293b; overflow: hidden; color: #f8fafc;">
            <div style="background: linear-gradient(135deg, #0284c7, #4f46e5); padding: 24px; text-align: left;">
              <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #ffffff;">⚡ PromptFlow Alert</h1>
              <p style="margin: 4px 0 0; font-size: 12px; color: #e2e8f0;">Autonomous Scheduled Monitoring Notification</p>
            </div>
            <div style="padding: 24px; font-size: 14px; line-height: 1.6; color: #cbd5e1; white-space: pre-wrap;">
              ${escapeHtml(resolvedMessage)}
            </div>
            <div style="padding: 16px 24px; background: #090d16; border-top: 1px solid #1e293b; font-size: 11px; color: #64748b; text-align: center;">
              Sent by PromptFlow • Autonomous Micro-Pipelines
            </div>
          </div>
        `;
                await transporter.sendMail({
                    from: config.EMAIL_FROM || `"PromptFlow" <${config.SMTP_USER}>`,
                    to: recipientEmail,
                    subject: "⚡ PromptFlow Alert Notification",
                    text: resolvedMessage,
                    html: htmlContent,
                });
                return {
                    channel: "email",
                    sent: true,
                    destination: recipientEmail,
                    message: resolvedMessage,
                };
            }
            catch (err) {
                return {
                    channel: "email",
                    sent: false,
                    destination: recipientEmail,
                    message: resolvedMessage,
                    error: `Email delivery failed: ${err.message}`,
                };
            }
        }
        else {
            // SMTP not configured yet: simulate delivery gracefully in development
            console.log(`[EMAIL SIMULATION] Alert email dispatched to ${recipientEmail}!\nContent:\n${resolvedMessage}`);
            return {
                channel: "email",
                sent: true,
                destination: recipientEmail,
                message: resolvedMessage,
                simulated: true,
            };
        }
    }
    return {
        channel: channel,
        sent: false,
        destination: "unknown",
        message: resolvedMessage,
        error: `Unsupported notification channel: "${channel}"`,
    };
}
