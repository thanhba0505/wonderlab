import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SlackNotificationService {
  private readonly logger = new Logger(SlackNotificationService.name);
  private readonly gatewayUrl =
    process.env.GATEWAY_URL || 'https://central-gateway-server.onrender.com/api/v1';
  private readonly secretKey = process.env.GATEWAY_SECRET_KEY;

  /**
   * Internal dispatcher calling Central Gateway
   */
  private async dispatchCommunityNotification(payload: {
    type: 'feedback' | 'comment';
    title: string;
    author: string;
    content: string;
    category?: string;
    actionUrl?: string;
    adminUrl?: string;
  }): Promise<void> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (this.secretKey) {
        headers['Authorization'] = `Bearer ${this.secretKey}`;
      }

      const response = await fetch(`${this.gatewayUrl}/notifications/slack/community`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          project: 'wonderlab',
          ...payload,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.warn(`Central Gateway responded with HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      this.logger.error('Failed to dispatch notification to Central Gateway', error);
    }
  }

  /**
   * Dispatches community simulation request alerts to #wonderlab-feedback via Central Gateway
   */
  async notifySimulationRequest(params: {
    title: string;
    description: string;
    category?: string;
    authorName?: string;
  }): Promise<void> {
    const { title, description, category = 'General', authorName = 'Anonymous Learner' } = params;

    await this.dispatchCommunityNotification({
      type: 'feedback',
      title,
      author: authorName,
      content: description,
      category,
      actionUrl: 'https://wonderlab.io.vn/requests',
      adminUrl: 'https://wonderlab.io.vn/admin/requests',
    });
  }

  /**
   * Dispatches new discussion/comment alerts to #wonderlab-comments via Central Gateway
   */
  async notifyNewComment(params: {
    simulationSlug: string;
    authorName: string;
    content: string;
    isReply?: boolean;
  }): Promise<void> {
    const { simulationSlug, authorName, content, isReply = false } = params;

    await this.dispatchCommunityNotification({
      type: 'comment',
      title: `${isReply ? 'Reply on' : 'Discussion on'} ${simulationSlug}`,
      author: authorName,
      content,
      actionUrl: `https://wonderlab.io.vn/simulations/${simulationSlug}`,
      adminUrl: 'https://wonderlab.io.vn/admin/comments',
    });
  }
}
