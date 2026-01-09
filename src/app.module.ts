import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './supabase/supabase.module';
import { SlackModule } from './slack/slack.module';

@Module({
  imports: [SupabaseModule, SlackModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
