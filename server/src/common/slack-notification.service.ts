import { Injectable, Logger, Optional } from '@nestjs/common';
import { S2SService } from '../s2s/s2s.service';

@Injectable()
export class SlackNotificationService {
  private readonly logger = new Logger(SlackNotificationService.name);

  constructor(@Optional() private readonly s2sService?: S2SService) {}

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
      if (this.s2sService) {
        const conn = await this.s2sService.getConnection('central-gateway');
        if (conn) {
          await this.s2sService.call('central-gateway', '/notifications/slack/community', {
            method: 'POST',
            body: JSON.stringify({
              project: 'wonderlab',
              ...payload,
            }),
          });
          return;
        }
      }

      // Fallback to env if S2SService is not available or connection not seeded
      const gatewayUrl =
        process.env.GATEWAY_URL || 'https://central-gateway-server.onrender.com/api/v1';
      const secretKey = process.env.GATEWAY_SECRET_KEY;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (secretKey) {
        headers['Authorization'] = `Bearer ${secretKey}`;
      }

      const response = await fetch(`${gatewayUrl}/notifications/slack/community`, {
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
