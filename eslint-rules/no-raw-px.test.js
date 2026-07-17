// @vitest-environment node
import { describe, it } from 'vitest';
import { RuleTester } from 'eslint';
import rule from './no-raw-px.js';

// Route RuleTester's suites through vitest; without this it runs inline at
// import time and throws raw AssertionErrors outside any test.
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

new RuleTester().run('no-raw-px', rule, {
  valid: [
    'const cls = "text-2xs max-w-56 leading-tight";',
    'const cls = "w-[6.25rem] min-h-[2.5rem]";', // rem arbitrary values are allowed
    'const style = { width: 52 };', // runtime pixel math is out of scope
    'const s = "52px";', // px outside the Tailwind bracket syntax
    'const t = `grid-cols-${n} gap-2`;',
  ],
  invalid: [
    { code: 'const cls = "text-[10px]";', errors: [{ messageId: 'rawPx' }] },
    { code: 'const cls = "w-[52px] h-full";', errors: [{ messageId: 'rawPx' }] },
    { code: 'const cls = "m-[-4px]";', errors: [{ messageId: 'rawPx' }] },
    { code: 'const cls = "tracking-[0.5px]";', errors: [{ messageId: 'rawPx' }] },
    { code: 'const cls = `p-[12px] ${rest}`;', errors: [{ messageId: 'rawPx' }] },
  ],
});
