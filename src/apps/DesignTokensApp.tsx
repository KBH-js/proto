import { Palette, Layers, Boxes, ShieldCheck } from 'lucide-react';
import { useTranslation } from '../i18n';
import { buildTokenLayers, type TokenGroup } from './designTokens';

/**
 * Design Tokens — a local app that renders the 3-layer token pipeline
 * (primitive → semantic → component) straight from the single token source
 * (@proto/shared/theme). Paired with the `local/no-raw-colors` lint rule, it
 * makes the token guardrail visible: every color on screen comes from a token,
 * and raw colors are blocked at lint time.
 *
 * A host shell component, so it uses Tailwind `dark:` variants directly.
 */

// Static token source → build once.
const layers = buildTokenLayers();

/** Swatch chip fed by a runtime token value (a variable, not a raw literal). */
function Swatch({ name, value, ref }: { name: string; value: string; ref?: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-neutral-200 bg-neutral-50 p-2 dark:border-neutral-700 dark:bg-neutral-800/60">
      <span
        className="h-8 w-8 flex-shrink-0 rounded-md ring-1 ring-inset ring-black/10 dark:ring-white/15"
        style={{ background: value }}
      />
      <div className="min-w-0">
        <p className="truncate font-mono text-xs font-medium text-neutral-800 dark:text-neutral-100">
          {name}
        </p>
        <p className="truncate font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
          {value}
          {ref && <span className="text-neutral-400 dark:text-neutral-500"> → {ref}</span>}
        </p>
      </div>
    </div>
  );
}

function Layer({
  icon: Icon,
  title,
  description,
  groups,
}: {
  icon: typeof Palette;
  title: string;
  description: string;
  groups: TokenGroup[];
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
        <h2 className="text-sm font-bold text-neutral-800 dark:text-neutral-100">{title}</h2>
        <span className="text-xs text-neutral-400 dark:text-neutral-500">{description}</span>
      </div>
      <div className="space-y-2">
        {groups.map((g) => (
          <div key={g.group}>
            <p className="mb-1 font-mono text-[11px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              {g.group}
            </p>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {g.tokens.map((tok) => (
                <Swatch key={tok.name} name={tok.name} value={tok.value} ref={tok.ref} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function DesignTokensApp() {
  const { t } = useTranslation();

  return (
    <div className="flex h-full flex-col overflow-auto bg-white text-neutral-800 dark:bg-neutral-900 dark:text-neutral-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-rose-600 p-5 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
            <Palette className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold">{t('tokens.title')}</h1>
            <p className="text-xs text-white/80">{t('tokens.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-5 p-5">
        {/* Guardrail explainer */}
        <div className="flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/40">
          <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div>
            <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              {t('tokens.guardTitle')}
            </p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-emerald-700 dark:text-emerald-400/90">
              {t('tokens.guardBody')}
            </p>
          </div>
        </div>

        <Layer
          icon={Boxes}
          title={t('tokens.layerPrimitive')}
          description={t('tokens.layerPrimitiveDesc')}
          groups={layers.primitive}
        />
        <Layer
          icon={Layers}
          title={t('tokens.layerSemantic')}
          description={t('tokens.layerSemanticDesc')}
          groups={layers.semantic}
        />
        <Layer
          icon={Palette}
          title={t('tokens.layerComponent')}
          description={t('tokens.layerComponentDesc')}
          groups={layers.component}
        />
      </div>
    </div>
  );
}
