# Slack PR Reviewer Draw

Slack 채널에서 PR 리뷰어를 랜덤으로 뽑아주는 봇입니다.

## 기능

- `/pr [인원수]` - 지정한 인원수만큼 랜덤으로 리뷰어 선정 (본인/휴가자 제외)
- `/pr-av` - 휴가 등록 (리뷰어 뽑기에서 제외)
- `/pr-rv` - 휴가 해제 (리뷰어 뽑기에 다시 포함)

## 설정

### 1. Supabase 설정

1. [Supabase](https://supabase.com)에서 프로젝트 생성
2. SQL Editor에서 `supabase-schema.sql` 실행
3. Project Settings > API에서 URL과 anon key 복사

### 2. Slack App 설정

1. [Slack API](https://api.slack.com/apps)에서 앱 생성
2. **OAuth & Permissions**에서 Bot Token Scopes 추가:
   - `chat:write` - 메시지 전송
   - `commands` - 슬래시 명령어
   - `channels:read` - 채널 멤버 조회
   - `groups:read` - 비공개 채널 멤버 조회
3. 앱 설치 후 Bot User OAuth Token 복사

### 3. Slash Commands 설정

**Slack App > Slash Commands**에서 다음 명령어 추가:

| Command | Request URL | Description |
|---------|-------------|-------------|
| `/pr` | `https://your-app.vercel.app/slack/commands` | PR 리뷰어 뽑기 |
| `/pr-av` | `https://your-app.vercel.app/slack/commands` | 휴가 등록 |
| `/pr-rv` | `https://your-app.vercel.app/slack/commands` | 휴가 해제 |

### 4. Vercel 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 환경변수 설정 (Vercel Dashboard 또는 CLI)
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add SLACK_BOT_TOKEN
```

### 5. 환경변수

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SLACK_BOT_TOKEN=xoxb-your-bot-token
```

## 로컬 개발

```bash
# 의존성 설치
npm install

# .env 파일 생성
cp .env.example .env
# .env 파일에 값 입력

# 개발 서버 실행
npm run start:dev
```

## 사용 예시

```
/pr 3
> PR 리뷰어가 선정되었습니다!
> @user1 @user2 @user3
> @requester님의 PR 리뷰를 부탁드립니다!
```
