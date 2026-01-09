-- Supabase에서 실행할 SQL
-- vacations 테이블 생성

CREATE TABLE IF NOT EXISTS vacations (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  channel_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, channel_id)
);

-- RLS (Row Level Security) 비활성화 (간단한 앱용)
ALTER TABLE vacations DISABLE ROW LEVEL SECURITY;

-- 또는 RLS를 사용하고 싶다면 아래 정책 추가
-- ALTER TABLE vacations ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all operations" ON vacations FOR ALL USING (true);
