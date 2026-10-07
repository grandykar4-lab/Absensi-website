-- Jalankan seluruh isi file ini di Supabase > SQL Editor > Run
create extension if not exists pgcrypto;

create table sessions (
  id uuid primary key default gen_random_uuid(),
  pin text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  active boolean not null default true
);

create table attendance (
  id bigint generated always as identity primary key,
  session_id uuid not null references sessions(id) on delete cascade,
  name text not null check (char_length(name) between 3 and 60),
  class text not null,
  name_key text not null,
  status text not null default 'Hadir',
  created_at timestamptz not null default now(),
  unique (session_id, name_key, class)   -- 1 nama+kelas = 1 absen per sesi
);

-- Row Level Security: siswa (anon) TIDAK bisa membaca/menulis tabel langsung
alter table sessions enable row level security;
alter table attendance enable row level security;
create policy "pengurus sessions" on sessions for all to authenticated using (true) with check (true);
create policy "pengurus attendance" on attendance for all to authenticated using (true) with check (true);

-- Waktu server
create function server_now() returns timestamptz language sql stable as $$ select now() $$;

-- Siswa absen (semua validasi di server)
create function submit_attendance(p_name text, p_class text, p_pin text)
returns json language plpgsql security definer set search_path = public as $$
declare s sessions; n text; t timestamptz;
begin
  n := regexp_replace(trim(coalesce(p_name,'')), '\s+', ' ', 'g');
  if char_length(n) < 3 or char_length(n) > 60
     or p_pin !~ '^\d{6}$'
     or p_class !~ '^(7|8|9)-([1-9]|1[01])$' then
    return json_build_object('ok', false, 'code', 'EMPTY');
  end if;
  select * into s from sessions where pin = p_pin order by created_at desc limit 1;
  if not found or not s.active then
    return json_build_object('ok', false, 'code', 'INVALID_PIN');
  end if;
  if s.expires_at <= now() then
    return json_build_object('ok', false, 'code', 'EXPIRED');
  end if;
  insert into attendance (session_id, name, class, name_key)
  values (s.id, n, p_class, lower(n))
  on conflict (session_id, name_key, class) do nothing
  returning created_at into t;
  if t is null then
    return json_build_object('ok', false, 'code', 'DUPLICATE');
  end if;
  return json_build_object('ok', true, 'name', n, 'class', p_class, 'time', t);
end $$;

-- Pengurus membuat PIN baru (PIN lama langsung nonaktif)
create function create_session() returns json
language plpgsql security definer set search_path = public as $$
declare p text; s sessions;
begin
  if auth.uid() is null then raise exception 'Harus login'; end if;
  update sessions set active = false where active;
  loop
    p := lpad((('x' || encode(gen_random_bytes(4), 'hex'))::bit(32)::bigint % 1000000)::text, 6, '0');
    exit when p !~ '^(\d)\1{5}$'
      and p not in ('123456','654321','012345','123123','234567','345678','456789','121212','112233');
  end loop;
  insert into sessions (pin, expires_at) values (p, now() + interval '5 minutes') returning * into s;
  return json_build_object('id', s.id, 'pin', s.pin, 'expires_at', s.expires_at, 'now', now());
end $$;

revoke execute on function create_session() from public, anon;
grant execute on function create_session() to authenticated;
grant execute on function submit_attendance(text, text, text) to anon, authenticated;
grant execute on function server_now() to anon, authenticated;
