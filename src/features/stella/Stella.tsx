import { createContext, useContext, useState, useRef, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send } from 'lucide-react';
import { Sheet, Button } from '@/ui';
import { StarMascot } from '@/ui/StarMascot';
import { useT, type TKey } from '@/i18n';
import { matchTopic, STELLA_TOPICS } from './knowledge';

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

  useEffect(() => {
    if (open) {
      setMessages([{ from: 'stella', text: t('stella.subtitle') }]);
      setInput('');
    }
  }, [open, t]);

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
            <div className="flex flex-col items-center py-4">
              <StarMascot size={90} animated />
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={m.from === 'user' ? 'flex justify-end' : 'flex items-start gap-2'}>
              {m.from === 'stella' && (
                <div className="flex-shrink-0 mt-0.5">
                  <StarMascot size={30} />
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

          {/* Suggested questions */}
          <div className="pt-2">
            <div className="metric-label mb-2">{t('stella.suggested')}</div>
            <div className="flex flex-wrap gap-2">
              {STELLA_TOPICS.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => askTopic(topic.questionKey, topic.answerKey, topic.route)}
                  className="text-[13px] bg-section hover:bg-divider text-ink rounded-full px-3 h-8 transition-colors"
                >
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
