// PostToolUse hook: lint the file Claude just edited so design-token
// guardrail violations (local/no-raw-colors, local/no-raw-px) surface at edit
// time instead of at the `pnpm lint` gate. Exit 2 feeds the ESLint output
// back to Claude (non-blocking — the edit already happened); every other
// path exits 0 silently.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);
let input;
try {
  input = JSON.parse(Buffer.concat(chunks).toString('utf8'));
} catch {
  process.exit(0);
}

const filePath = input?.tool_input?.file_path;
if (!filePath || !/\.(ts|tsx)$/i.test(filePath)) process.exit(0);

const projectDir = path.resolve(process.env.CLAUDE_PROJECT_DIR ?? process.cwd());
const abs = path.resolve(filePath);
const rel = path.relative(projectDir, abs);
// Outside the repo (scratchpad, temp dirs) — not ours to lint.
if (rel.startsWith('..') || path.isAbsolute(rel)) process.exit(0);
if (!existsSync(abs)) process.exit(0);

const eslintJs = path.join(projectDir, 'node_modules', 'eslint', 'bin', 'eslint.js');
if (!existsSync(eslintJs)) process.exit(0); // deps not installed — stay quiet

// process.execPath avoids Windows .cmd shims and shell quoting entirely;
// --no-warn-ignored keeps eslint-ignored paths (dist, worktrees) silent.
const result = spawnSync(process.execPath, [eslintJs, '--no-warn-ignored', abs], {
  cwd: projectDir,
  encoding: 'utf8',
  timeout: 30_000,
});

if (!result.status) process.exit(0); // exit 0 or spawn-level failure (null)
process.stderr.write(`${result.stdout ?? ''}${result.stderr ?? ''}`);
process.exit(2);
