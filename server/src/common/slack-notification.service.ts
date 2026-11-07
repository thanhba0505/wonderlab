import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SlackNotificationService {
  private readonly logger = new Logger(SlackNotificationService.name);
  private readonly token = process.env.SLACK_BOT_TOKEN;

  // Dedicated channels
  private readonly userFeedbackChannel = process.env.SLACK_USER_FEEDBACK_CHANNEL || 'C0CFAFQH739';
  private readonly commentsModerationChannel =
    process.env.SLACK_COMMENTS_MODERATION_CHANNEL || 'C0CFAFQRU2K';

  /**
   * Internal dispatcher using standard fetch with graceful fallback
   */
  private async postMessage(channel: string, payload: Record<string, unknown>): Promise<void> {
    if (!this.token) {
      this.logger.debug(`SLACK_BOT_TOKEN not configured. Skipped dispatch to channel ${channel}.`);
      return;
    }

    try {
      const response = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel,
          ...payload,
        }),
      });

      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!data.ok) {
        this.logger.warn(`Slack API warning for channel ${channel}: ${data.error}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send Slack notification to ${channel}`, error);
    }
  }

  /**
   * Dispatches community simulation request alerts to #user-feedback
   */
  async notifySimulationRequest(params: {
    title: string;
    description: string;
    category?: string;
    authorName?: string;
  }): Promise<void> {
    const { title, description, category = 'General', authorName = 'Anonymous Learner' } = params;

    await this.postMessage(this.userFeedbackChannel, {
      text: `🧪 New Simulation Request: *${title}* by ${authorName}`,
      attachments: [
        {
          color: '#0284c7',
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: '🧪 New Simulation Proposal Submitted',
                emoji: true,
              },
            },
            {
              type: 'section',
              fields: [
                { type: 'mrkdwn', text: `*Topic:*\n${title}` },
                { type: 'mrkdwn', text: `*Category:*\n\`${category}\`` },
                { type: 'mrkdwn', text: `*Author:*\n${authorName}` },
                { type: 'mrkdwn', text: '*Source:*\nWonderlab Community' },
              ],
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Description:*\n> ${description.slice(0, 300)}${description.length > 300 ? '...' : ''}`,
              },
            },
            {
              type: 'actions',
              elements: [
                {
                  type: 'button',
                  text: { type: 'plain_text', text: '📋 View All Requests' },
                  url: 'https://wonderlab.io.vn/requests',
                },
                {
                  type: 'button',
                  text: { type: 'plain_text', text: '🛡️ Admin Console' },
                  url: 'https://wonderlab.io.vn/admin/requests',
                },
              ],
            },
          ],
        },
      ],
    });
  }

  /**
   * Dispatches new discussion/comment alerts to #comments-moderation
   */
  async notifyNewComment(params: {
    simulationSlug: string;
    authorName: string;
    content: string;
    isReply?: boolean;
  }): Promise<void> {
    const { simulationSlug, authorName, content, isReply = false } = params;
    const actionLabel = isReply ? 'Replied to discussion on' : 'Commented on';

    await this.postMessage(this.commentsModerationChannel, {
      text: `💬 ${authorName} ${actionLabel} *${simulationSlug}*`,
      attachments: [
        {
          color: '#8b5cf6',
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: `💬 New Scientific Discussion ${isReply ? 'Reply' : 'Post'}`,
                emoji: true,
              },
            },
            {
              type: 'section',
              fields: [
                { type: 'mrkdwn', text: `*Simulation:*\n\`${simulationSlug}\`` },
                { type: 'mrkdwn', text: `*Author:*\n${authorName}` },
              ],
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Message:*\n> ${content.slice(0, 280)}${content.length > 280 ? '...' : ''}`,
              },
            },
            {
              type: 'actions',
              elements: [
                {
                  type: 'button',
                  text: { type: 'plain_text', text: '🔬 Open Simulation Chamber' },
                  url: `https://wonderlab.io.vn/simulations/${simulationSlug}`,
                },
                {
                  type: 'button',
                  text: { type: 'plain_text', text: '⚖️ Moderate Comments' },
                  url: 'https://wonderlab.io.vn/admin/comments',
                },
              ],
            },
          ],
        },
      ],
    });
  }
}
