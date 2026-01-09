import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
    );
  }

  async addVacation(userId: string, channelId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('vacations')
      .upsert({ user_id: userId, channel_id: channelId }, { onConflict: 'user_id,channel_id' });

    return !error;
  }

  async removeVacation(userId: string, channelId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('vacations')
      .delete()
      .eq('user_id', userId)
      .eq('channel_id', channelId);

    return !error;
  }

  async getVacationUsers(channelId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('vacations')
      .select('user_id')
      .eq('channel_id', channelId);

    if (error || !data) return [];
    return data.map((row) => row.user_id);
  }
}
