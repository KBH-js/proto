/**
 * Custom ESLint rule: disallow px-based Tailwind arbitrary values in TS/TSX.
 *
 * Design-token guardrail — sizes must come from the token scale
 * (`@proto/shared/theme` fontSize/spacing, exposed as Tailwind classes like
 * `text-2xs`, `max-w-56`) or, when a value genuinely has no scale step, a rem
 * arbitrary value (`w-[6.25rem]`). Raw px in class strings (`text-[10px]`,
 * `w-[52px]`) bypasses the scale and breaks user font-size scaling.
 *
 * Scans string literals and template chunks for `[<number>px]` — the Tailwind
 * arbitrary-value bracket syntax. Runtime pixel math (window geometry, drag
 * deltas, inline style numbers) is intentionally out of scope: those are
 * computed coordinates, not design sizes.
 */

const PX_ARBITRARY = /\[-?\d*\.?\d+px\]/;

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow px arbitrary values in Tailwind classes; use a token class (text-2xs, max-w-56, …) or a rem arbitrary value.',
    },
    messages: {
      rawPx:
        'Raw px arbitrary value "{{value}}" — use a token class from the shared scale (e.g. text-2xs, max-w-56) or a rem arbitrary value instead.',
    },
    schema: [],
  },
  create(context) {
    function check(node, raw) {
      const match = raw.match(PX_ARBITRARY);
      if (match) {
        context.report({ node, messageId: 'rawPx', data: { value: match[0] } });
      }
    }

    return {
      Literal(node) {
        if (typeof node.value === 'string') check(node, node.value);
      },
      TemplateElement(node) {
        check(node, node.value.raw);
      },
    };
  },
};

export default rule;
