-- =====================================================
-- Mechinet — Initial Database Schema
-- =====================================================
-- 6 טבלאות בסיסיות ל-MVP
-- כל טבלה מוגנת ב-RLS (Row Level Security)
-- =====================================================

-- =====================================================
-- 1. טבלת מכינות
-- =====================================================
create table public.mechinot (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  created_at timestamptz default now()
);

-- =====================================================
-- 2. טבלת משתמשי צוות
-- מקושרת ל-auth.users של Supabase
-- =====================================================
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  mechina_id uuid references public.mechinot(id) on delete cascade,
  role text not null default 'staff' check (role in ('admin', 'staff')),
  created_at timestamptz default now()
);

-- =====================================================
-- 3. טבלת טפסים
-- =====================================================
create table public.forms (
  id uuid primary key default gen_random_uuid(),
  mechina_id uuid not null references public.mechinot(id) on delete cascade,
  title text not null,
  description text,
  is_published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================================================
-- 4. טבלת שדות בטופס
-- options = JSON array של בחירות (אם זה שדה מסוג select)
-- =====================================================
create table public.form_fields (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms(id) on delete cascade,
  type text not null check (type in ('short_text', 'long_text', 'select', 'multi_select', 'file', 'email', 'phone', 'number')),
  label text not null,
  placeholder text,
  required boolean default false,
  options jsonb,
  "order" integer not null default 0,
  created_at timestamptz default now()
);

-- =====================================================
-- 5. טבלת מועמדים
-- answers = JSON של כל התשובות (key = field_id, value = answer)
-- =====================================================
create table public.candidates (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms(id) on delete cascade,
  mechina_id uuid not null references public.mechinot(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  status text not null default 'submitted' check (status in (
    'submitted', 'reviewed', 'interview', 'group_day', 'accepted', 'waitlist', 'rejected'
  )),
  answers jsonb not null default '{}'::jsonb,
  ai_summary text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_candidates_mechina on public.candidates(mechina_id);
create index idx_candidates_status on public.candidates(status);
create index idx_candidates_form on public.candidates(form_id);

-- =====================================================
-- 6. טבלת הערות צוות
-- =====================================================
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

create index idx_notes_candidate on public.notes(candidate_id);

-- =====================================================
-- Trigger: יוצר רשומה ב-public.users אוטומטית
-- כשמשתמש חדש נרשם דרך Supabase Auth
-- =====================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================
-- Trigger: מעדכן updated_at אוטומטית
-- =====================================================
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger forms_updated_at
  before update on public.forms
  for each row execute function public.handle_updated_at();

create trigger candidates_updated_at
  before update on public.candidates
  for each row execute function public.handle_updated_at();

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================
-- מדיניות אבטחה: כל משתמש רואה רק את הנתונים של המכינה שלו
-- =====================================================

alter table public.mechinot enable row level security;
alter table public.users enable row level security;
alter table public.forms enable row level security;
alter table public.form_fields enable row level security;
alter table public.candidates enable row level security;
alter table public.notes enable row level security;

-- ----- Mechinot -----
-- כל משתמש מחובר יכול לראות מכינות (כדי שיוכל לבחור איפה הוא)
create policy "Mechinot are viewable by authenticated users"
  on public.mechinot for select
  to authenticated
  using (true);

-- ----- Users -----
-- משתמש רואה את עצמו ואת חברי הצוות שלו
create policy "Users can view themselves and team members"
  on public.users for select
  to authenticated
  using (
    id = auth.uid()
    or mechina_id in (
      select mechina_id from public.users where id = auth.uid()
    )
  );

-- משתמש יכול לעדכן רק את עצמו
create policy "Users can update themselves"
  on public.users for update
  to authenticated
  using (id = auth.uid());

-- ----- Forms -----
-- צוות רואה רק את הטפסים של המכינה שלו
create policy "Staff can view their mechina forms"
  on public.forms for select
  to authenticated
  using (
    mechina_id in (
      select mechina_id from public.users where id = auth.uid()
    )
  );

-- טופס מפורסם נראה לציבור (לא חייבים להיות מחוברים)
create policy "Published forms are viewable by anyone"
  on public.forms for select
  to anon
  using (is_published = true);

-- צוות יכול ליצור/לעדכן טפסים של המכינה שלו
create policy "Staff can manage their mechina forms"
  on public.forms for all
  to authenticated
  using (
    mechina_id in (
      select mechina_id from public.users where id = auth.uid()
    )
  );

-- ----- Form Fields -----
-- שדות של טפסים גלויים בהתאם לטופס
create policy "Form fields viewable for accessible forms"
  on public.form_fields for select
  using (
    form_id in (
      select id from public.forms
      where is_published = true
        or mechina_id in (
          select mechina_id from public.users where id = auth.uid()
        )
    )
  );

create policy "Staff can manage fields of their forms"
  on public.form_fields for all
  to authenticated
  using (
    form_id in (
      select id from public.forms
      where mechina_id in (
        select mechina_id from public.users where id = auth.uid()
      )
    )
  );

-- ----- Candidates -----
-- צוות רואה מועמדים של המכינה שלו
create policy "Staff can view their mechina candidates"
  on public.candidates for select
  to authenticated
  using (
    mechina_id in (
      select mechina_id from public.users where id = auth.uid()
    )
  );

-- כל אחד (גם לא מחובר) יכול לשלוח טופס לטופס מפורסם
create policy "Anyone can submit to published forms"
  on public.candidates for insert
  with check (
    form_id in (select id from public.forms where is_published = true)
  );

-- צוות יכול לעדכן/למחוק מועמדים של המכינה שלו
create policy "Staff can update their mechina candidates"
  on public.candidates for update
  to authenticated
  using (
    mechina_id in (
      select mechina_id from public.users where id = auth.uid()
    )
  );

create policy "Staff can delete their mechina candidates"
  on public.candidates for delete
  to authenticated
  using (
    mechina_id in (
      select mechina_id from public.users where id = auth.uid()
    )
  );

-- ----- Notes -----
create policy "Staff can view notes on their mechina candidates"
  on public.notes for select
  to authenticated
  using (
    candidate_id in (
      select id from public.candidates
      where mechina_id in (
        select mechina_id from public.users where id = auth.uid()
      )
    )
  );

create policy "Staff can create notes on their mechina candidates"
  on public.notes for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and candidate_id in (
      select id from public.candidates
      where mechina_id in (
        select mechina_id from public.users where id = auth.uid()
      )
    )
  );

create policy "Users can delete their own notes"
  on public.notes for delete
  to authenticated
  using (user_id = auth.uid());

-- =====================================================
-- סיום
-- =====================================================
