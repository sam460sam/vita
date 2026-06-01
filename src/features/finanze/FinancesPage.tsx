import { useEffect, useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowDownLeft, ArrowUpRight, Plus, Wallet, Pencil, Trash2, Upload } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { db } from '@/data/db';
import { createTransaction, deleteTransaction, readBudget, setBudget, readSettings } from '@/data/repo';
import { defaultSettings } from '@/data/defaults';
import { platform } from '@/platform/platform';
import { PageHeader } from '@/app/PageHeader';
import { Screen } from '@/app/Screen';
import { Card, CardHeader, EmptyState, Button, Sheet, Field, Input, Select, Segmented, IconButton, Sankey, useToast } from '@/ui';
import { formatMoney, todayISO, currentMonthKey, monthKey } from '@/lib/format';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, categoryColor } from './categories';
import { parseBankCsv } from './importCsv';
import { useT } from '@/i18n';
import type { TxType } from '@/data/types';

export function FinancesPage() {
  const t = useT();
  const txs = useLiveQuery(() => db.transactions.orderBy('date').reverse().toArray(), [], []);
  const budget = useLiveQuery(() => readBudget(), [], undefined);
  const settings = useLiveQuery(() => readSettings(), [], undefined);
  const [formOpen, setFormOpen] = useState(false);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const toast = useToast();

  async function importCsv() {
    const text = await platform.pickTextFile('.csv,text/csv,text/plain');
    if (!text) return;
    const parsed = parseBankCsv(text);
    if (!parsed.length) {
      toast.show(t('finances.importNone'));
      return;
    }
    for (const tx of parsed) await createTransaction(tx);
    toast.show(`${parsed.length} ${t('finances.imported')}`);
  }

  const currency = (settings ?? defaultSettings()).currency;
  const month = currentMonthKey();
  const monthTxs = useMemo(() => (txs ?? []).filter((t) => monthKey(t.date) === month), [txs, month]);

  const income = monthTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = monthTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;
  const limit = budget?.monthlyLimit ?? 0;

  const byCategory = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of monthTxs.filter((t) => t.type === 'expense')) m.set(t.category, (m.get(t.category) ?? 0) + t.amount);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [monthTxs]);

  // Money-flow: income → each expense category (+ savings if income > expense)
  const flows = useMemo(() => {
    const f = byCategory.map(([cat, amt]) => ({ label: cat, value: amt, color: categoryColor(cat) }));
    const saved = income - expense;
    if (saved > 0) f.push({ label: t('finances.savings'), value: saved, color: '#22C55E' });
    return f;
  }, [byCategory, income, expense, t]);

  return (
    <>
      <PageHeader
        title={t('finances.title')}
        back="/altro"
        action={
          <Button size="sm" icon={<Plus size={16} />} onClick={() => setFormOpen(true)}>
            {t('finances.movement')}
          </Button>
        }
      />
      <Screen>
        {/* Balance */}
        <Card className="mb-4">
          <div className="text-center py-2">
            <div className="metric-label capitalize">{format(new Date(), 'MMMM yyyy', { locale: it })}</div>
            <div className="text-4xl font-semibold tnum text-ink mt-1" style={{ color: balance < 0 ? 'var(--c-danger)' : undefined }}>
              {formatMoney(balance, currency)}
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="text-center">
                <div className="flex items-center gap-1 text-habit text-[13px] font-semibold justify-center">
                  <ArrowDownLeft size={14} /> {t('finances.income')}
                </div>
                <div className="text-[15px] font-semibold tnum text-ink mt-0.5">{formatMoney(income, currency)}</div>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 text-activity text-[13px] font-semibold justify-center">
                  <ArrowUpRight size={14} /> {t('finances.expense')}
                </div>
                <div className="text-[15px] font-semibold tnum text-ink mt-0.5">{formatMoney(expense, currency)}</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Budget */}
        <Card className="mb-4" onClick={() => setBudgetOpen(true)}>
          <div className="flex items-center gap-3 cursor-pointer">
            <span className="h-9 w-9 rounded-full bg-finance/10 flex items-center justify-center text-finance">
              <Wallet size={18} />
            </span>
            <div className="flex-1">
              <div className="text-[15px] font-semibold text-ink">{t('finances.budget')}</div>
              <div className="text-[13px] text-ink-2">
                {limit > 0
                  ? t('finances.budget.of', { spent: formatMoney(expense, currency), limit: formatMoney(limit, currency) })
                  : t('finances.budget.tap')}
              </div>
            </div>
            <Pencil size={16} className="text-ink-3" />
          </div>
          {limit > 0 && (
            <div className="mt-3 h-2 rounded-full bg-section overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (expense / limit) * 100)}%`,
                  background: expense > limit ? 'var(--c-danger)' : 'var(--c-finance)',
                }}
              />
            </div>
          )}
        </Card>

        {/* Money flow (Sankey) */}
        {flows.length > 0 && income > 0 && (
          <Card className="mb-4">
            <CardHeader title={t('finances.flow')} />
            <Sankey
              sourceLabel={t('finances.income')}
              sourceValue={income}
              flows={flows}
              height={Math.max(220, flows.length * 46)}
              format={(n) => formatMoney(n, currency)}
            />
          </Card>
        )}

        {/* Spese per categoria */}
        {byCategory.length > 0 && (
          <Card className="mb-4">
            <CardHeader title={t('finances.byCategory')} />
            <div className="space-y-2.5">
              {byCategory.map(([cat, amt]) => (
                <div key={cat}>
                  <div className="flex justify-between text-[13px] mb-1">
                    <span className="text-ink font-medium">{cat}</span>
                    <span className="tnum text-ink-2">{formatMoney(amt, currency)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-section overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(amt / expense) * 100}%`, background: categoryColor(cat) }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Import bank statement */}
        <Card className="mb-4">
          <Button variant="subtle" block icon={<Upload size={17} />} onClick={importCsv}>
            {t('finances.import')}
          </Button>
          <p className="text-[11px] text-ink-3 mt-1.5">{t('finances.importNote')}</p>
        </Card>

        {/* Movimenti */}
        <Card>
          <CardHeader title={t('finances.movements')} />
          {(txs ?? []).length === 0 ? (
            <EmptyState
              icon={<Wallet size={22} />}
              title={t('finances.empty.title')}
              description={t('finances.empty.desc')}
              action={<Button onClick={() => setFormOpen(true)}>{t('finances.empty.cta')}</Button>}
            />
          ) : (
            <div className="divide-y divide-divider">
              {(txs ?? []).slice(0, 50).map((tx) => (
                <div key={tx.id} className="flex items-center gap-3 py-2.5 group">
                  <span
                    className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: `${categoryColor(tx.category)}1a`, color: categoryColor(tx.category) }}
                  >
                    {tx.type === 'income' ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[15px] text-ink truncate">{tx.category}</div>
                    <div className="text-[12px] text-ink-2 truncate">
                      {format(parseISO(tx.date), 'd MMM', { locale: it })}
                      {tx.note ? ` · ${tx.note}` : ''}
                    </div>
                  </div>
                  <span className={tx.type === 'income' ? 'text-habit font-semibold tnum' : 'text-ink font-semibold tnum'}>
                    {tx.type === 'income' ? '+' : '−'}
                    {formatMoney(tx.amount, currency)}
                  </span>
                  <IconButton label={t('common.delete')} className="opacity-0 group-hover:opacity-100" onClick={() => deleteTransaction(tx.id)}>
                    <Trash2 size={15} />
                  </IconButton>
                </div>
              ))}
            </div>
          )}
        </Card>
      </Screen>

      <TransactionForm open={formOpen} onClose={() => setFormOpen(false)} />
      <BudgetForm open={budgetOpen} onClose={() => setBudgetOpen(false)} current={limit} />
    </>
  );
}

function TransactionForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [type, setType] = useState<TxType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState('');
  const toast = useToast();
  const t = useT();

  const cats = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  useEffect(() => {
    if (open) {
      setType('expense');
      setAmount('');
      setCategory(EXPENSE_CATEGORIES[0]);
      setDate(todayISO());
      setNote('');
    }
  }, [open]);

  useEffect(() => {
    setCategory((type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES)[0]);
  }, [type]);

  async function save() {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    await createTransaction({ type, amount: amt, category, date, note: note.trim() || undefined });
    toast.show(t('txForm.saved'));
    onClose();
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={t('txForm.new')}
      footer={
        <Button block size="lg" onClick={save} disabled={!amount}>
          {t('txForm.save')}
        </Button>
      }
    >
      <Field label={t('txForm.type')}>
        <Segmented
          value={type}
          onChange={setType}
          options={[
            { value: 'expense', label: t('txForm.expense') },
            { value: 'income', label: t('txForm.income') },
          ]}
        />
      </Field>
      <Field label={t('txForm.amount')}>
        <Input type="number" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t('txForm.category')}>
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            {cats.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </Field>
        <Field label={t('txForm.date')}>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
      </div>
      <Field label={t('txForm.note')}>
        <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('txForm.notePh')} />
      </Field>
    </Sheet>
  );
}

function BudgetForm({ open, onClose, current }: { open: boolean; onClose: () => void; current: number }) {
  const [value, setValue] = useState('');
  const toast = useToast();
  const t = useT();
  useEffect(() => {
    if (open) setValue(current ? String(current) : '');
  }, [open, current]);

  async function save() {
    await setBudget(parseFloat(value) || 0);
    toast.show(t('budgetForm.saved'));
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title={t('budgetForm.title')} footer={<Button block size="lg" onClick={save}>{t('budgetForm.save')}</Button>}>
      <Field label={t('budgetForm.limit')}>
        <Input type="number" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0,00" />
      </Field>
      <p className="text-[13px] text-ink-2">{t('budgetForm.note')}</p>
    </Sheet>
  );
}
