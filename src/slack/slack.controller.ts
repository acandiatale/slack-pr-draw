import { Controller, Post, Body, Res } from '@nestjs/common';
import type { Response } from 'express';
import { SlackService } from './slack.service';

interface SlackCommandPayload {
  token: string;
  team_id: string;
  team_domain: string;
  channel_id: string;
  channel_name: string;
  user_id: string;
  user_name: string;
  command: string;
  text: string;
  response_url: string;
  trigger_id: string;
}

@Controller('slack')
export class SlackController {
  constructor(private readonly slackService: SlackService) {}

  // Slack 멘션에서 user_id 또는 username 추출
  private extractUserIdentifier(text: string): string | null {
    const idMatch = text.match(/<@([A-Z0-9]+)(\|[^>]+)?>/);
    if (idMatch) return idMatch[1];

    const usernameMatch = text.match(/@(\S+)/);
    if (usernameMatch) return usernameMatch[1];

    const trimmed = text.trim();
    if (trimmed) return trimmed;

    return null;
  }

  // response_url로 지연 응답 전송
  private async sendDelayedResponse(
    responseUrl: string,
    message: string,
    isError = false,
  ): Promise<void> {
    try {
      await fetch(responseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          response_type: 'ephemeral',
          text: message,
          replace_original: true,
        }),
      });
    } catch (error) {
      console.error('Failed to send delayed response:', error);
    }
  }

  @Post('commands')
  async handleCommand(
    @Body() payload: SlackCommandPayload,
    @Res() res: Response,
  ) {
    const { command, text, user_id, channel_id, response_url } = payload;

    try {
      switch (command) {
        case '/pr': {
          const count = parseInt(text.trim(), 10);
          if (isNaN(count) || count <= 0) {
            return res.status(200).json({
              response_type: 'ephemeral',
              text: '사용법: /pr [인원수]\n예: /pr 3',
            });
          }

          // 작업 완료 후 응답
          const result = await this.slackService.drawReviewers(
            channel_id,
            user_id,
            count,
          );
          return res.status(200).json({
            response_type: 'ephemeral',
            text: result.message,
          });
        }

        case '/pr-av': {
          const userIdentifier = this.extractUserIdentifier(text);
          if (!userIdentifier) {
            return res.status(200).json({
              response_type: 'ephemeral',
              text: '사용법: /pr-av @사용자\n예: /pr-av @홍길동',
            });
          }

          const result = await this.slackService.addVacation(userIdentifier, channel_id);
          return res.status(200).json({
            response_type: 'ephemeral',
            text: result.message,
          });
        }

        case '/pr-rv': {
          const userIdentifier = this.extractUserIdentifier(text);
          if (!userIdentifier) {
            return res.status(200).json({
              response_type: 'ephemeral',
              text: '사용법: /pr-rv @사용자\n예: /pr-rv @홍길동',
            });
          }

          const result = await this.slackService.removeVacation(userIdentifier, channel_id);
          return res.status(200).json({
            response_type: 'ephemeral',
            text: result.message,
          });
        }

        case '/pr-vl': {
          const result = await this.slackService.getVacationList(channel_id);
          return res.status(200).json({
            response_type: 'ephemeral',
            text: result.message,
          });
        }

        default:
          return res.status(200).json({
            response_type: 'ephemeral',
            text: '알 수 없는 명령어입니다.',
          });
      }
    } catch (error) {
      console.error('Command error:', error);
      return res.status(200).json({
        response_type: 'ephemeral',
        text: '오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      });
    }
  }
}
