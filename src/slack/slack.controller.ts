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

  @Post('commands')
  async handleCommand(
    @Body() payload: SlackCommandPayload,
    @Res() res: Response,
  ) {
    const { command, text, user_id, channel_id } = payload;

    // 즉시 응답 (Slack은 3초 내 응답 필요)
    res.status(200);

    try {
      switch (command) {
        case '/pr': {
          const count = parseInt(text.trim(), 10);
          if (isNaN(count) || count <= 0) {
            return res.json({
              response_type: 'ephemeral',
              text: '사용법: /pr [인원수]\n예: /pr 3',
            });
          }

          const result = await this.slackService.drawReviewers(
            channel_id,
            user_id,
            count,
          );

          return res.json({
            response_type: 'ephemeral',
            text: result.message,
          });
        }

        case '/pr-av': {
          const result = await this.slackService.addVacation(user_id, channel_id);
          return res.json({
            response_type: 'ephemeral',
            text: result.message,
          });
        }

        case '/pr-rv': {
          const result = await this.slackService.removeVacation(user_id, channel_id);
          return res.json({
            response_type: 'ephemeral',
            text: result.message,
          });
        }

        default:
          return res.json({
            response_type: 'ephemeral',
            text: '알 수 없는 명령어입니다.',
          });
      }
    } catch (error) {
      console.error('Command error:', error);
      return res.json({
        response_type: 'ephemeral',
        text: '오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      });
    }
  }
}
