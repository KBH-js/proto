// @vitest-environment node
import { describe, it } from 'vitest';
import { RuleTester } from 'eslint';
import rule from './no-raw-colors.js';

// Route RuleTester's suites through vitest; without this it runs inline at
// import time and throws raw AssertionErrors outside any test.
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

new RuleTester().run('no-raw-colors', rule, {
  valid: [
    'const cls = "bg-surface text-primary shadow-window";',
    'const cssVar = "--net-accent";',
    'const n = 0xff00ff;', // numeric literal, not a string
    'const t = `w-${size} shadow`;',
    'const grad = "linear-gradient(to right, var(--from), var(--to))";',
  ],
  invalid: [
    { code: 'const c = "#fff";', errors: [{ messageId: 'rawColor' }] },
    { code: 'const c = "#AbCdEf12";', errors: [{ messageId: 'rawColor' }] },
    { code: 'const c = "rgba(0, 0, 0, 0.5)";', errors: [{ messageId: 'rawColor' }] },
    { code: 'const c = "hsl(220 14% 96%)";', errors: [{ messageId: 'rawColor' }] },
    { code: 'const c = `background: ${x} #ff0000`;', errors: [{ messageId: 'rawColor' }] },
  ],
});
