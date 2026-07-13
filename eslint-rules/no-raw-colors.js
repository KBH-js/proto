/**
 * Custom ESLint rule: disallow raw color literals in TS/TSX source.
 *
 * Design-token guardrail — colors must come from the token pipeline
 * (`@proto/shared/theme` or Tailwind token classes), never inline hex/rgb/hsl.
 * This keeps the palette in one auditable place and makes theming reliable.
 *
 * Scans string literals and template chunks for:
 *   - hex colors:   #rgb #rgba #rrggbb #rrggbbaa
 *   - functional:   rgb() rgba() hsl() hsla()
 *
 * Sanctioned exceptions are handled in eslint.config.js (e.g. devtools console
 * `%c` styling), not by weakening this rule.
 */

const HEX = /#[0-9a-fA-F]{3,8}\b/;
const FUNC = /\b(?:rgba?|hsla?)\s*\(/i;

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow raw color literals (hex/rgb/hsl); use a design token from @proto/shared/theme or a Tailwind token class.',
    },
    messages: {
      rawColor:
        'Raw color literal "{{value}}" — use a design token (@proto/shared/theme) or a Tailwind token class instead.',
    },
    schema: [],
  },
  create(context) {
    /** @param {string} raw */
    function firstMatch(raw) {
      const hex = raw.match(HEX);
      if (hex) return hex[0];
      const fn = raw.match(FUNC);
      if (fn) return fn[0];
      return null;
    }

    function check(node, raw) {
      const match = firstMatch(raw);
      if (match) {
        context.report({ node, messageId: 'rawColor', data: { value: match } });
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
