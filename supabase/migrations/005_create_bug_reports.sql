-- Bug Reports tablosu
CREATE TABLE IF NOT EXISTS bug_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'resolved', 'dismissed')),
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE bug_reports ENABLE ROW LEVEL SECURITY;

-- Herkes insert yapabilsin (anonim kullanıcılar dahil)
CREATE POLICY "Anyone can insert bug reports"
  ON bug_reports FOR INSERT
  WITH CHECK (true);

-- Sadece service role (admin API) okuyabilsin
CREATE POLICY "Service role can read bug reports"
  ON bug_reports FOR SELECT
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can update bug reports"
  ON bug_reports FOR UPDATE
  USING (auth.role() = 'service_role');
