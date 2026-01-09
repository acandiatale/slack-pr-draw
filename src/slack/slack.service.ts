import { Injectable } from '@nestjs/common';
import { WebClient } from '@slack/web-api';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class SlackService {
  private slackClient: WebClient;

  constructor(private readonly supabaseService: SupabaseService) {
    this.slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);
  }

  async drawReviewers(
    channelId: string,
    requesterId: string,
    count: number,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // 채널 멤버 목록 가져오기
      const result = await this.slackClient.conversations.members({
        channel: channelId,
      });

      if (!result.members || result.members.length === 0) {
        return { success: false, message: '채널 멤버를 가져올 수 없습니다.' };
      }

      // 휴가자 목록 가져오기
      const vacationUsers = await this.supabaseService.getVacationUsers(channelId);

      // 본인과 휴가자, 봇 제외
      const eligibleMembers = result.members.filter(
        (memberId) =>
          memberId !== requesterId &&
          !vacationUsers.includes(memberId) &&
          !memberId.startsWith('B'), // 봇 ID는 보통 B로 시작
      );

      if (eligibleMembers.length === 0) {
        return { success: false, message: '선택 가능한 멤버가 없습니다.' };
      }

      if (eligibleMembers.length < count) {
        return {
          success: false,
          message: `선택 가능한 멤버가 ${eligibleMembers.length}명뿐입니다. 요청: ${count}명`,
        };
      }

      // 랜덤으로 멤버 선택
      const selectedMembers = this.shuffleArray(eligibleMembers).slice(0, count);

      // 멘션 문자열 생성
      const mentions = selectedMembers.map((id) => `<@${id}>`).join(' ');

      // 메시지 전송
      await this.slackClient.chat.postMessage({
        channel: channelId,
        text: `🎲 PR 리뷰어가 선정되었습니다!\n${mentions}\n\n<@${requesterId}>님의 PR 리뷰를 부탁드립니다! 🙏`,
      });

      return { success: true, message: '리뷰어가 선정되었습니다!' };
    } catch (error) {
      console.error('Error drawing reviewers:', error);
      return { success: false, message: '오류가 발생했습니다.' };
    }
  }

  async addVacation(
    targetUserId: string,
    channelId: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // 채널 멤버 목록 가져오기
      const result = await this.slackClient.conversations.members({
        channel: channelId,
      });

      if (!result.members || !result.members.includes(targetUserId)) {
        return { success: false, message: '리뷰어 이름을 확인해주세요. 채널에 존재하지 않는 사용자입니다.' };
      }

      const success = await this.supabaseService.addVacation(targetUserId, channelId);
      if (success) {
        return { success: true, message: `<@${targetUserId}>님의 휴가 등록이 완료되었습니다. 🏖️` };
      }
      return { success: false, message: '휴가 등록에 실패했습니다.' };
    } catch (error) {
      console.error('Error adding vacation:', error);
      return { success: false, message: '오류가 발생했습니다.' };
    }
  }

  async removeVacation(
    targetUserId: string,
    channelId: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // 채널 멤버 목록 가져오기
      const result = await this.slackClient.conversations.members({
        channel: channelId,
      });

      if (!result.members || !result.members.includes(targetUserId)) {
        return { success: false, message: '리뷰어 이름을 확인해주세요. 채널에 존재하지 않는 사용자입니다.' };
      }

      // 휴가 등록 여부 확인
      const vacationUsers = await this.supabaseService.getVacationUsers(channelId);
      if (!vacationUsers.includes(targetUserId)) {
        return { success: false, message: `<@${targetUserId}>님은 휴가중인 리뷰어가 아닙니다.` };
      }

      const success = await this.supabaseService.removeVacation(targetUserId, channelId);
      if (success) {
        return { success: true, message: `<@${targetUserId}>님의 휴가 해제가 완료되었습니다. 복귀를 환영합니다! 🎉` };
      }
      return { success: false, message: '휴가 해제에 실패했습니다.' };
    } catch (error) {
      console.error('Error removing vacation:', error);
      return { success: false, message: '오류가 발생했습니다.' };
    }
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
