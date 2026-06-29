import { createContext, useContext, useState, useRef, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Send, Sparkles } from 'lucide-react';
import { Sheet, Button } from '@/ui';
import { useT, type TKey } from '@/i18n';
import { readSettings } from '@/data/repo';
import type { Settings } from '@/data/types';
import { matchTopic, STELLA_TOPICS } from './knowledge';

/** Stella's opening line — personalized by the user's name + onboarding goal. */
function stellaOpener(s: Settings | undefined, t: (k: TKey, v?: Record<string, string | number>) => string): string {
  const name = s?.name?.trim();
  const hello = name ? t('stella.helloName', { name }) : t('stella.hello');
  const tone = s?.goal ? t(`stella.tone.${s.goal}` as TKey) : t('stella.subtitle');
  return `${hello} ${tone}`;
}

/** Iridescent gradient orb — Stella's avatar (candy assistant style). */
function StellaOrb({ size = 64 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }} aria-hidden>
      <div
        className="absolute inset-0 rounded-full blur-[2px] animate-orb-spin"
        style={{
          background:
            'conic-gradient(from 0deg, #ff9ec4, #a78bfa, #7cc4ff, #5bc98c, #ffd479, #ff8a7a, #ff9ec4)',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          inset: size * 0.16,
          background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95), rgba(255,255,255,0.15) 60%, transparent)',
        }}
      />
    </div>
  );
}

interface StellaCtx {
  open: () => void;
  close: () => void;
  isOpen: boolean;
}
const Ctx = createContext<StellaCtx | null>(null);

export function StellaProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  return (
    <Ctx.Provider value={{ open: () => setOpen(true), close: () => setOpen(false), isOpen }}>
      {children}
      <StellaSheet open={isOpen} onClose={() => setOpen(false)} />
    </Ctx.Provider>
  );
}

export function useStella(): StellaCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStella must be used within StellaProvider');
  return ctx;
}

interface Msg {
  from: 'stella' | 'user';
  text: string;
  route?: string;
}

function StellaSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useT();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const settings = useLiveQuery(() => readSettings(), [], undefined);
  const opener = stellaOpener(settings, t);

  useEffect(() => {
    if (open) {
      setMessages([{ from: 'stella', text: opener }]);
      setInput('');
    }
  }, [open, opener]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  function ask(query: string) {
    if (!query.trim()) return;
    const topic = matchTopic(query);
    const answer: Msg = topic
      ? { from: 'stella', text: t(topic.answerKey), route: topic.route }
      : { from: 'stella', text: t('stella.fallback') };
    setMessages((m) => [...m, { from: 'user', text: query }, answer]);
    setInput('');
  }

  function askTopic(questionKey: TKey, answerKey: TKey, route?: string) {
    setMessages((m) => [...m, { from: 'user', text: t(questionKey) }, { from: 'stella', text: t(answerKey), route }]);
  }

  return (
    <Sheet open={open} onClose={onClose} title={t('stella.title')} size="full">
      <div className="flex flex-col h-full">
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pb-3">
          {messages.length === 1 && (
            <div className="flex flex-col items-center py-6 gap-4">
              <div className="animate-stella-float">
                <StellaOrb size={84} />
              </div>
              <div className="rounded-2xl rounded-tl-md bg-section px-4 py-3 text-[15px] font-semibold text-ink shadow-chip">
                {opener}
              </div>
            </div>
          )}
          {messages.length > 1 && messages.map((m, i) => (
            <div key={i} className={m.from === 'user' ? 'flex justify-end' : 'flex items-start gap-2'}>
              {m.from === 'stella' && (
                <div className="flex-shrink-0 mt-0.5">
                  <StellaOrb size={30} />
                </div>
              )}
              <div
                className={
                  m.from === 'user'
                    ? 'bg-primary text-on-primary rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-[14px] max-w-[80%]'
                    : 'bg-section rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-[14px] text-ink max-w-[85%]'
                }
              >
                <p className="leading-relaxed">{m.text}</p>
                {m.route && (
                  <button
                    onClick={() => { navigate(m.route!); onClose(); }}
                    className="mt-2 text-[13px] font-semibold text-project"
                  >
                    {t('stella.goThere')} →
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Suggested actions — horizontally scrollable candy chips (all offline) */}
          <div className="pt-2 -mx-4">
            <div className="metric-label mb-2 px-4">{t('stella.suggested')}</div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 pb-1">
              {STELLA_TOPICS.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => askTopic(topic.questionKey, topic.answerKey, topic.route)}
                  className="flex-shrink-0 inline-flex items-center gap-1.5 text-[13px] font-semibold bg-card border border-line/60 dark:border-white/5 hover:bg-section text-ink rounded-full pl-2.5 pr-3.5 h-9 shadow-chip transition-colors"
                >
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-accent/12 text-accent">
                    <Sparkles size={13} />
                  </span>
                  {t(topic.questionKey)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-3 border-t border-divider">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), ask(input))}
            placeholder={t('stella.placeholder')}
            className="flex-1 h-11 px-3.5 rounded-btn bg-section border border-line dark:border-transparent text-[15px] text-ink placeholder:text-ink-3 outline-none"
          />
          <Button onClick={() => ask(input)} icon={<Send size={18} />} aria-label="Invia" />
        </div>
      </div>
    </Sheet>
  );
}
