-- 为临时沟通表授予 REST 调用所需的基础权限

grant select, insert, update, delete on public.team_interest_messages to authenticated;
grant select on public.team_interest_messages to anon;

grant usage, select on sequence public.team_interest_messages_id_seq to authenticated;
grant usage, select on sequence public.team_interest_messages_id_seq to anon;
