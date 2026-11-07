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
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '💡 [COMMUNITY] New Simulation Proposal',
            emoji: true,
          },
        },
      ],
      attachments: [
        {
          color: '#0284c7',
          blocks: [
            {
              type: 'section',
              fields: [
                { type: 'mrkdwn', text: `*Topic:*\n\`${title}\`` },
                { type: 'mrkdwn', text: `*Category:*\n\`${category}\`` },
                { type: 'mrkdwn', text: `*Author:*\n\`${authorName}\`` },
                { type: 'mrkdwn', text: '*Source:*\n`Wonderlab Community`' },
              ],
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Description:*\n\`\`\`\n${description.slice(0, 400)}${description.length > 400 ? '...' : ''}\n\`\`\``,
              },
            },
            {
              type: 'actions',
              elements: [
                {
                  type: 'button',
                  text: { type: 'plain_text', text: '📋 View All Requests' },
                  url: 'https://wonderlab.io.vn/requests',
                  style: 'primary',
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

    await this.postMessage(this.commentsModerationChannel, {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `💬 [DISCUSSION] New Scientific ${isReply ? 'Reply' : 'Post'}`,
            emoji: true,
          },
        },
      ],
      attachments: [
        {
          color: '#8b5cf6',
          blocks: [
            {
              type: 'section',
              fields: [
                { type: 'mrkdwn', text: `*Simulation:*\n\`${simulationSlug}\`` },
                { type: 'mrkdwn', text: `*Author:*\n\`${authorName}\`` },
              ],
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Message:*\n\`\`\`\n${content.slice(0, 350)}${content.length > 350 ? '...' : ''}\n\`\`\``,
              },
            },
            {
              type: 'actions',
              elements: [
                {
                  type: 'button',
                  text: { type: 'plain_text', text: '🔬 Open Simulation Chamber' },
                  url: `https://wonderlab.io.vn/simulations/${simulationSlug}`,
                  style: 'primary',
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
