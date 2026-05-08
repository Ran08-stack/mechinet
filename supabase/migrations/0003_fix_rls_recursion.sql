-- =====================================================
-- תיקון: בעיית recursion ב-RLS
-- =====================================================
-- הבעיה: כל ה-policies קוראות ל-public.users בתוך תנאי ה-policy,
-- מה שמפעיל את ה-policy שוב ושוב ויוצר recursion infinite.
--
-- הפתרון: פונקציית עזר עם SECURITY DEFINER שמחזירה
-- את ה-mechina_id של המשתמש הנוכחי, בלי להפעיל RLS.
-- =====================================================

-- 1. פונקציה שמחזירה את mechina_id של המשתמש המחובר
create or replace function public.current_user_mechina_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select mechina_id from public.users where id = auth.uid()
$$;

-- 2. פונקציה שבודקת אם המשתמש המחובר הוא admin
create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select role = 'admin' from public.users where id = auth.uid()
$$;

-- =====================================================
-- מחיקת policies ישנות והחלפתן בחדשות שמשתמשות בפונקציה
-- =====================================================

-- ----- Users -----
drop policy if exists "Users can view themselves and team members" on public.users;
drop policy if exists "Users can update themselves" on public.users;

-- משתמש רואה את עצמו תמיד
create policy "Users can view their own row"
  on public.users for select
  to authenticated
  using (id = auth.uid());

-- משתמש רואה גם חברי צוות מאותה מכינה
create policy "Users can view team members"
  on public.users for select
  to authenticated
  using (
    mechina_id is not null
    and mechina_id = public.current_user_mechina_id()
  );

create policy "Users can update themselves"
  on public.users for update
  to authenticated
  using (id = auth.uid());

-- ----- Forms -----
drop policy if exists "Staff can view their mechina forms" on public.forms;
drop policy if exists "Published forms are viewable by anyone" on public.forms;
drop policy if exists "Staff can manage their mechina forms" on public.forms;

create policy "Staff can view their mechina forms"
  on public.forms for select
  to authenticated
  using (mechina_id = public.current_user_mechina_id());

create policy "Published forms are viewable by anyone"
  on public.forms for select
  to anon
  using (is_published = true);

-- צריך גם ל-authenticated אם הוא בעצם הציבור (לא חבר צוות)
create policy "Published forms are viewable by anyone authenticated"
  on public.forms for select
  to authenticated
  using (is_published = true);

create policy "Staff can insert forms for their mechina"
  on public.forms for insert
  to authenticated
  with check (mechina_id = public.current_user_mechina_id());

create policy "Staff can update their mechina forms"
  on public.forms for update
  to authenticated
  using (mechina_id = public.current_user_mechina_id());

create policy "Staff can delete their mechina forms"
  on public.forms for delete
  to authenticated
  using (mechina_id = public.current_user_mechina_id());

-- ----- Form Fields -----
drop policy if exists "Form fields viewable for accessible forms" on public.form_fields;
drop policy if exists "Staff can manage fields of their forms" on public.form_fields;

-- כל אחד יכול לראות שדות של טפסים מפורסמים
create policy "Anyone can view fields of published forms"
  on public.form_fields for select
  using (
    form_id in (select id from public.forms where is_published = true)
  );

-- חבר צוות יכול לראות את כל השדות של הטפסים שלו
create policy "Staff can view fields of their mechina forms"
  on public.form_fields for select
  to authenticated
  using (
    form_id in (
      select id from public.forms
      where mechina_id = public.current_user_mechina_id()
    )
  );

create policy "Staff can insert fields for their forms"
  on public.form_fields for insert
  to authenticated
  with check (
    form_id in (
      select id from public.forms
      where mechina_id = public.current_user_mechina_id()
    )
  );

create policy "Staff can update fields of their forms"
  on public.form_fields for update
  to authenticated
  using (
    form_id in (
      select id from public.forms
      where mechina_id = public.current_user_mechina_id()
    )
  );

create policy "Staff can delete fields of their forms"
  on public.form_fields for delete
  to authenticated
  using (
    form_id in (
      select id from public.forms
      where mechina_id = public.current_user_mechina_id()
    )
  );

-- ----- Candidates -----
drop policy if exists "Staff can view their mechina candidates" on public.candidates;
drop policy if exists "Anyone can submit to published forms" on public.candidates;
drop policy if exists "Staff can update their mechina candidates" on public.candidates;
drop policy if exists "Staff can delete their mechina candidates" on public.candidates;

create policy "Staff can view their mechina candidates"
  on public.candidates for select
  to authenticated
  using (mechina_id = public.current_user_mechina_id());

create policy "Anyone can submit to published forms"
  on public.candidates for insert
  with check (
    form_id in (select id from public.forms where is_published = true)
  );

create policy "Staff can update their mechina candidates"
  on public.candidates for update
  to authenticated
  using (mechina_id = public.current_user_mechina_id());

create policy "Staff can delete their mechina candidates"
  on public.candidates for delete
  to authenticated
  using (mechina_id = public.current_user_mechina_id());

-- ----- Notes -----
drop policy if exists "Staff can view notes on their mechina candidates" on public.notes;
drop policy if exists "Staff can create notes on their mechina candidates" on public.notes;
drop policy if exists "Users can delete their own notes" on public.notes;

create policy "Staff can view notes on their mechina candidates"
  on public.notes for select
  to authenticated
  using (
    candidate_id in (
      select id from public.candidates
      where mechina_id = public.current_user_mechina_id()
    )
  );

create policy "Staff can create notes on their mechina candidates"
  on public.notes for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and candidate_id in (
      select id from public.candidates
      where mechina_id = public.current_user_mechina_id()
    )
  );

create policy "Users can delete their own notes"
  on public.notes for delete
  to authenticated
  using (user_id = auth.uid());
