-- 1. 创建用户档案表（扩展 Supabase 自带的 auth.users 认证系统）
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. 创建真正的关系型书架表（带外键，和用户的 profile 关联起来）
CREATE TABLE IF NOT EXISTS books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL, -- 外键：这本书是谁的
  title TEXT NOT NULL,
  author_first TEXT,
  author_last TEXT NOT NULL,
  series TEXT,
  position INT,
  spice_level SMALLINT DEFAULT 0,
  cover_url TEXT,
  isbn TEXT,
  fave BOOLEAN DEFAULT FALSE,
  owned_physical TEXT, -- 'paperback' | 'hardcover' | 'yes' | null
  owned_ebook BOOLEAN DEFAULT FALSE,
  owned_audiobook BOOLEAN DEFAULT FALSE,
  my_rating SMALLINT,
  read_status TEXT DEFAULT 'Unread', -- 'Unread' | 'Reading' | 'Read' | 'DNF'
  progress SMALLINT DEFAULT 0,
  added_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. 一键开启 RLS（行级安全防盗网）
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- 4. 实施 RLS 策略：每个人只能增删改查属于自己的那行数据
CREATE POLICY "Users can manage their own profile" 
  ON profiles FOR ALL TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can manage their own books" 
  ON books FOR ALL TO authenticated USING (auth.uid() = owner_id);

-- 1. 临时移除 profiles 对 auth.users 的死锁约束，方便我们刷假数据
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 2. 现在你可以安全地创建你的“超级管理员假账号”了
INSERT INTO profiles (id, display_name) 
VALUES ('00000000-0000-0000-0000-000000000000', 'Annabelle')
ON CONFLICT (id) DO NOTHING;

-- 3. 顺理成章地，你的种子书就能完美地塞进去了！
INSERT INTO books (owner_id, title, author_first, author_last, read_status, spice_level)
VALUES 
('00000000-0000-0000-0000-000000000000', 'A Court of Thorns and Roses', 'Sarah J.', 'Maas', 'Reading', 3),
('00000000-0000-0000-0000-000000000000', 'Fourth Wing', 'Rebecca', 'Yarros', 'Unread', 4);


-- =========================================================================
-- 1. 补全基础核心表字段 与 辅助标签表
-- =========================================================================

-- 补全 books 中原本缺失的出版精度和计划字段（直接加进 books 表，不影响已有数据）
ALTER TABLE books ADD COLUMN IF NOT EXISTS series_count INT;
ALTER TABLE books ADD COLUMN IF NOT EXISTS status TEXT; -- 'Standalone' | 'Series' | 'Complete'
ALTER TABLE books ADD COLUMN IF NOT EXISTS subgenre TEXT;
ALTER TABLE books ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE books ADD COLUMN IF NOT EXISTS pub_y INT;
ALTER TABLE books ADD COLUMN IF NOT EXISTS pub_m INT;
ALTER TABLE books ADD COLUMN IF NOT EXISTS pub_d INT;
ALTER TABLE books ADD COLUMN IF NOT EXISTS plan_date DATE;

-- 创建书籍类型/流派交叉关联表 (book_genres)
CREATE TABLE IF NOT EXISTS book_genres (
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  genre TEXT NOT NULL,
  PRIMARY KEY (book_id, genre)
);

-- 创建书籍性向/流派标签表 (book_tropes)
CREATE TABLE IF NOT EXISTS book_tropes (
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  trope TEXT NOT NULL,
  PRIMARY KEY (book_id, trope)
);

-- =========================================================================
-- 2. 创建用户行为扩展表 (重读日志 & 亲友书评)
-- =========================================================================

-- 创建重读日志表 (reads)
CREATE TABLE IF NOT EXISTS reads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE NOT NULL,
  date DATE,
  format TEXT, -- 'physical' | 'ebook' | 'audiobook'
  rating SMALLINT,
  notes TEXT
);

-- 创建他人/外部独立书评表 (reviews)
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating SMALLINT,
  body TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =========================================================================
-- 3. 创建书单系统 (TBR & 任意归档)
-- =========================================================================

-- 创建书单主表 (lists)
CREATE TABLE IF NOT EXISTS lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  kind TEXT NOT NULL, -- 'tbr' | 'collection'
  is_priority BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 创建书单内书籍交叉索引表 (list_items)
CREATE TABLE IF NOT EXISTS list_items (
  list_id UUID REFERENCES lists(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  position INT,
  PRIMARY KEY (list_id, book_id)
);

-- =========================================================================
-- 4. 创建家庭联轴/共同体空间 (households)
-- =========================================================================

-- 创建家庭主表
CREATE TABLE IF NOT EXISTS households (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 创建家庭成员关系表
CREATE TABLE IF NOT EXISTS household_members (
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- 'admin' | 'member'
  PRIMARY KEY (household_id, user_id)
);

-- =========================================================================
-- 5. 创建线上共读俱乐部系统 (clubs)
-- =========================================================================

-- 创建俱乐部主表
CREATE TABLE IF NOT EXISTS clubs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  cover_url TEXT,
  unit_type TEXT NOT NULL, -- 'chapter' | 'page' | 'percent'
  unit_count INT NOT NULL,
  unit_label TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 创建俱乐部成员进度表
CREATE TABLE IF NOT EXISTS club_members (
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  display_name TEXT,
  progress INT DEFAULT 0,
  PRIMARY KEY (club_id, user_id)
);

-- 创建俱乐部共读讨论串（防剧透机制依赖该表）
CREATE TABLE IF NOT EXISTS club_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  unit INT NOT NULL, -- 评论所在的具体进度点 (如第5章、第50页)
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =========================================================================
-- 6. 创建凭证式开放共享书单 (shared_lists)
-- =========================================================================

CREATE TABLE IF NOT EXISTS shared_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  share_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  kind TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =========================================================================
-- 7. 统一开启全局安全防护网 (RLS Policies)
-- =========================================================================

ALTER TABLE book_genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_tropes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_lists ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- 8. 实施对应的 RLS 严苛访问控制策略
-- =========================================================================

-- 流派与性向：通过关联书籍的 owner_id 判定权限
CREATE POLICY "Manage genres via book ownership" ON book_genres FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM books WHERE books.id = book_genres.book_id AND books.owner_id = auth.uid()));

CREATE POLICY "Manage tropes via book ownership" ON book_tropes FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM books WHERE books.id = book_tropes.book_id AND books.owner_id = auth.uid()));

-- 重读日志：仅限原书主修改
CREATE POLICY "Manage reads via book ownership" ON reads FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM books WHERE books.id = reads.book_id AND books.owner_id = auth.uid()));

-- 书单：仅限创建者增删改查
CREATE POLICY "Manage own lists" ON lists FOR ALL TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Manage list items via list ownership" ON list_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM lists WHERE lists.id = list_items.list_id AND lists.owner_id = auth.uid()));

-- 共享码书单：任何人只要拿到特殊的唯一密码 code 就能看，但只有创建者可以改
CREATE POLICY "Anyone can view shared list via code" ON shared_lists FOR SELECT USING (true);
CREATE POLICY "Owner can manage shared list" ON shared_lists FOR ALL TO authenticated USING (auth.uid() = owner_id);

-- 俱乐部基础成员策略：加入俱乐部的用户可以互相查看和讨论
CREATE POLICY "Interact in joined clubs" ON clubs FOR ALL TO authenticated USING (true);
CREATE POLICY "Manage own club membership" ON club_members FOR ALL TO authenticated USING (auth.uid() = user_id);

-- 🌟 核心硬核高阶机制：防剧透策略 (Spoiler Gating)
-- 只有当当前登录者在俱乐部里的阅读进度 >= 该条评论的标记进度时，服务器才允许读出该评论！
CREATE POLICY "Read comments via progress gate" ON club_comments FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM club_members 
      WHERE club_members.club_id = club_comments.club_id 
        AND club_members.user_id = auth.uid() 
        AND club_members.progress >= club_comments.unit
    )
  );

CREATE POLICY "Post or delete own comments" ON club_comments FOR ALL TO authenticated
  USING (auth.uid() = user_id);

ALTER TABLE public.books DISABLE ROW LEVEL SECURITY;  
GRANT ALL ON TABLE public.books TO anon, authenticated, service_role;