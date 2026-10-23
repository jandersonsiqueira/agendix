import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('safeNext only accepts local absolute paths', () => {
    const content = readFileSync(new URL('../src/lib/redirect.ts', import.meta.url), 'utf8');
    assert.match(content, /startsWith\('\/\/'\)/);
    assert.match(content, /includes\('\\\\'\)/);
});

test('migration enables RLS on every tenant table', () => {
    const sql = readFileSync(new URL('../supabase/migrations/20261009000100_initial.sql', import.meta.url), 'utf8');
    for (const table of ['profiles', 'organizations', 'organization_members', 'organization_invitations']) {
        assert.ok(sql.includes(`alter table public.${table} enable row level security;`));
    }
    assert.match(sql, /p_role = 'owner'/);
    assert.match(sql, /email_confirmed_at is not null/);
});
