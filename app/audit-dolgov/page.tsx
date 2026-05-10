"use client";
import Image from "next/image";
import { useMemo, useState } from "react";
import {
  ArrowBullet,
  AutoTextarea,
  MoodScale,
  PageFooter,
  PillToggle,
  PrintButton,
  ProgressBar,
  ResetButton,
} from "../_components/primitives";
import { useChecklistState } from "../_components/useChecklistState";

const CURRENCIES = ["₽", "$", "€", "¥", "₸"] as const;
type Currency = (typeof CURRENCIES)[number];
type DebtType = "" | "bank" | "state" | "people";
type DebtCategory = Exclude<DebtType, "">;

const DEBT_TYPES: { value: DebtCategory; label: string }[] = [
  { value: "bank", label: "Банк" },
  { value: "state", label: "Государство" },
  { value: "people", label: "Люди" },
];

type Debt = {
  id: string;
  creditor: string;
  amount: string;
  currency: Currency;
  rate: string;
  payment: string;
  term: string;
  overdue: boolean;
  type: DebtType;
  scaleFinancial: number | null;
  scaleEmotional: number | null;
  scaleRisk: number | null;
  note: string;
  ignoring: boolean;
};

function DebtTypeIcon({ type }: { type: DebtCategory }) {
  if (type === "bank") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M4 10h16M6 10v8M10 10v8M14 10v8M18 10v8M4 18h16M3 21h18M12 3l8 4H4l8-4Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === "state") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 3v18M7 6h10M7 6 4 12h6L7 6ZM17 6l-3 6h6l-3-6ZM9 21h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M16 19c0-2.2-1.8-4-4-4s-4 1.8-4 4M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM19 20a4.8 4.8 0 0 0-3-4.4M5 20a4.8 4.8 0 0 1 3-4.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function makeDebt(): Debt {
  return {
    id: Math.random().toString(36).slice(2),
    creditor: "",
    amount: "",
    currency: "₽",
    rate: "",
    payment: "",
    term: "",
    overdue: false,
    type: "",
    scaleFinancial: null,
    scaleEmotional: null,
    scaleRisk: null,
    note: "",
    ignoring: false,
  };
}

type State = {
  debts: Debt[];
  avoidedDebts: string;
  levels: boolean[]; // 9 items: child=[0,1,2], teen=[3,4,5], adult=[6,7,8]
  levelReflection: string;
  todaySteps: boolean[];
  myTodayStep: string;
  weekSteps: boolean[];
  anxietyBefore: number | null;
  anxietyAfter: number | null;
  notSoScary: string;
  whereAdult: string;
  takeaway: string;
};

const INITIAL: State = {
  debts: [makeDebt()],
  avoidedDebts: "",
  levels: Array(9).fill(false),
  levelReflection: "",
  todaySteps: Array(4).fill(false),
  myTodayStep: "",
  weekSteps: Array(3).fill(false),
  anxietyBefore: null,
  anxietyAfter: null,
  notSoScary: "",
  whereAdult: "",
  takeaway: "",
};

const LEVEL_PHRASES = [
  // child
  "«Я не хочу в это смотреть, само рассосётся»",
  "«Мне стыдно, и я прячусь»",
  "«Я ничего не решаю, всё от них зависит»",
  // teen
  "«Все гады: банки, государство, обстоятельства»",
  "«Я зол(а), но не понимаю, что конкретно делать»",
  "«То бросаюсь закрывать, то всё снова запускаю»",
  // adult
  "«Я смотрю на цифры, даже если страшно»",
  "«Я понимаю свои права и обязанности»",
  "«У меня есть пусть небольшой, но план»",
];

const TODAY_STEP_LABELS = [
  "Написать / позвонить в банк",
  "Свести все цифры в одну таблицу",
  "Поставить автоплатёж",
  "Попросить документ с условиями долга",
];

const WEEK_STEP_LABELS = [
  "Уточню реальные суммы и проценты",
  "Обсужу ситуацию с партнёром / семьёй",
  "Сокращу / перенаправлю один расход в сторону погашения долга",
];

const REQUIRED_FIELDS: (keyof State)[] = [
  "avoidedDebts",
  "levelReflection",
  "myTodayStep",
  "notSoScary",
  "whereAdult",
  "takeaway",
];

export default function AuditDolgovPage() {
  const { state, setState, update, reset } = useChecklistState<State>(
    "checklist:audit-dolgov:v1",
    INITIAL,
  );

  const updateDebt = (id: string, patch: Partial<Debt>) => {
    setState((prev) => ({
      ...prev,
      debts: prev.debts.map((d) => (d.id === id ? { ...d, ...patch } : d)),
    }));
  };

  const addDebt = () => {
    setState((prev) => ({ ...prev, debts: [...prev.debts, makeDebt()] }));
  };

  const removeDebt = (id: string) => {
    setState((prev) => ({
      ...prev,
      debts: prev.debts.length > 1 ? prev.debts.filter((d) => d.id !== id) : prev.debts,
    }));
  };

  const setLevel = (i: number, v: boolean) => {
    setState((prev) => {
      const levels = [...prev.levels];
      levels[i] = v;
      return { ...prev, levels };
    });
  };

  const setTodayStep = (i: number, v: boolean) => {
    setState((prev) => {
      const todaySteps = [...prev.todaySteps];
      todaySteps[i] = v;
      return { ...prev, todaySteps };
    });
  };

  const setWeekStep = (i: number, v: boolean) => {
    setState((prev) => {
      const weekSteps = [...prev.weekSteps];
      weekSteps[i] = v;
      return { ...prev, weekSteps };
    });
  };

  const progress = useMemo(() => {
    const textDone = REQUIRED_FIELDS.reduce((sum, key) => {
      const v = state[key];
      return sum + (typeof v === "string" && v.trim().length > 0 ? 1 : 0);
    }, 0);
    const debtFilled = state.debts.some((d) => d.creditor.trim().length > 0) ? 1 : 0;
    const levelFilled = state.levels.some(Boolean) ? 1 : 0;
    const beforeDone = state.anxietyBefore ? 1 : 0;
    const afterDone = state.anxietyAfter ? 1 : 0;
    const total = REQUIRED_FIELDS.length + 4;
    return Math.round(
      ((textDone + debtFilled + levelFilled + beforeDone + afterDone) / total) * 100,
    );
  }, [state]);

  // Debt summary
  const { debtCount, debtTotals } = useMemo(() => {
    const totals: Record<string, number> = {};
    state.debts.forEach((d) => {
      const val = parseFloat(d.amount.replace(/\s/g, "").replace(",", "."));
      if (!isNaN(val) && val > 0) {
        totals[d.currency] = (totals[d.currency] || 0) + val;
      }
    });
    return { debtCount: state.debts.length, debtTotals: totals };
  }, [state.debts]);

  const TOTAL = 4;

  return (
    <>
      <NavBar progress={progress} />
      <main className="paper-page">
        <CoverPage />

        <div className="guide-card no-print">
          <div>
            <div className="guide-kicker sans">Как проходить</div>
            <h2>Идите сверху вниз. Сайт сам сохраняет ответы.</h2>
          </div>
          <p>
            Заполните карточку по каждому долгу — чем честнее, тем лучше. Сайт
            автоматически определит, каким долгам уделить внимание в первую очередь.
          </p>
          <a href="#p2" className="guide-button sans">
            Начать с карты долгов
          </a>
        </div>

        {/* PAGE 2 — Карта долгов */}
        <section id="p2" className="section">
          <div>
            <h2 className="h1">Карта ваших долгов</h2>
          </div>
          <p className="audit-helper-text italic" style={{ color: "var(--c-muted)" }}>
            Заполните по одной карточке на каждый долг. После оценки нагрузки сайт
            покажет, с чего начать.
          </p>

          {/* Debt summary */}
          <div className="debt-summary">
            <div className="debt-summary-card">
              <div className="debt-summary-label">Количество долгов</div>
              <div className="debt-summary-value">{debtCount}</div>
            </div>
            <div className="debt-summary-card" style={{ flex: 2 }}>
              <div className="debt-summary-label">Общая сумма</div>
              <div className="debt-summary-value">
                {Object.keys(debtTotals).length === 0
                  ? "—"
                  : Object.entries(debtTotals)
                      .map(([cur, sum]) => `${sum.toLocaleString("ru-RU", { maximumFractionDigits: 2 })} ${cur}`)
                      .join(" · ")}
              </div>
            </div>
          </div>

          {/* Debt cards */}
          <div className="debt-cards-grid">
            {state.debts.map((debt, i) => (
              <DebtCardComponent
                key={debt.id}
                debt={debt}
                index={i}
                onChange={(patch) => updateDebt(debt.id, patch)}
                onRemove={state.debts.length > 1 ? () => removeDebt(debt.id) : undefined}
              />
            ))}
          </div>

          <button type="button" className="debt-add-btn" onClick={addDebt}>
            <span style={{ fontSize: "22px", lineHeight: 1 }}>+</span>
            Добавить ещё один долг
          </button>

          <div className="field-row">
            <label className="label">
              Какие из этих долгов я стараюсь не замечать / о каких неприятно думать?
            </label>
            <AutoTextarea
              value={state.avoidedDebts}
              onChange={(v) => update("avoidedDebts", v)}
              minRows={3}
            />
          </div>

          <PageFooter index={1} total={TOTAL} />
        </section>

        {/* PAGE 3 — Как я думаю о долгах */}
        <section id="p3" className="section">
          <div>
            <h2 className="h1">Как я думаю о своих долгах</h2>
          </div>
          <div className="flex items-start gap-3 mt-2">
            <ArrowBullet />
            <div>
              <div className="h2">Мини-диагностика уровней мышления</div>
              <p className="audit-helper-text audit-helper-text--compact italic" style={{ color: "var(--c-muted)", marginTop: "4px" }}>
                Отметьте то, что ближе всего к вам сейчас:
              </p>
            </div>
          </div>

          <LevelGroup pill="Уровень «Дитя»" indices={[0, 1, 2]} levels={state.levels} setLevel={setLevel} />
          <LevelGroup pill="Уровень «Подросток»" indices={[3, 4, 5]} levels={state.levels} setLevel={setLevel} />
          <LevelGroup pill="Уровень «Взрослый»" indices={[6, 7, 8]} levels={state.levels} setLevel={setLevel} />

          <div className="field-row">
            <label className="label">
              Вопрос для самонаблюдения: «В каких долгах я веду себя как Дитя, как Подросток и как Взрослый?»
            </label>
            <AutoTextarea
              value={state.levelReflection}
              onChange={(v) => update("levelReflection", v)}
              minRows={4}
            />
          </div>

          <PageFooter index={2} total={TOTAL} />
        </section>

        {/* PAGE 4 — Маленькие шаги */}
        <section id="p4" className="section">
          <div>
            <h2 className="h1">Маленькие шаги</h2>
          </div>
          <p className="steps-helper-text italic" style={{ color: "var(--c-muted)" }}>
            Один самый маленький шаг, который я могу сделать уже сегодня:
          </p>

          <div className="grid gap-3">
            {TODAY_STEP_LABELS.map((label, i) => (
              <PillToggle key={i} active={state.todaySteps[i]} onChange={(v) => setTodayStep(i, v)}>
                {label}
              </PillToggle>
            ))}
          </div>

          <div className="field-row">
            <label className="label">Мой шаг сегодня: (дата, время, что именно сделаю)</label>
            <AutoTextarea
              value={state.myTodayStep}
              onChange={(v) => update("myTodayStep", v)}
              minRows={3}
            />
          </div>

          <div className="flex items-start gap-3 mt-6 mb-3">
            <ArrowBullet />
            <div className="h2">На ближайшие 7 дней:</div>
          </div>
          <p className="steps-helper-text italic" style={{ color: "var(--c-muted)" }}>
            Какие три действия я сделаю, чтобы перейти в позицию Взрослого по долгам?
          </p>

          <div className="grid gap-3 mt-3">
            {WEEK_STEP_LABELS.map((label, i) => (
              <PillToggle key={i} active={state.weekSteps[i]} onChange={(v) => setWeekStep(i, v)}>
                {label}
              </PillToggle>
            ))}
          </div>

          <PageFooter index={3} total={TOTAL} />
        </section>

        {/* PAGE 5 — Как изменилось состояние */}
        <section id="p5" className="section">
          <div>
            <h2 className="h1">Как изменилось моё состояние</h2>
          </div>

          <div className="state-change-card">
            <div className="state-scale-block">
              <div className="label">Уровень тревоги до заполнения чек-листа:</div>
              <AnxietyScale
                value={state.anxietyBefore}
                onChange={(v) => update("anxietyBefore", v)}
                leftLabel="1 — спокойно"
                rightLabel="10 — паника"
              />
            </div>
            <div className="state-scale-block">
              <div className="label">Уровень тревоги после заполнения чек-листа:</div>
              <AnxietyScale
                value={state.anxietyAfter}
                onChange={(v) => update("anxietyAfter", v)}
                leftLabel="1 — контроль"
                rightLabel="10 — тревога"
              />
            </div>
          </div>

          <div className="field-row">
            <label className="label">
              Что оказалось не таким страшным, как я себе представлял(а)?
            </label>
            <AutoTextarea
              value={state.notSoScary}
              onChange={(v) => update("notSoScary", v)}
              minRows={3}
            />
          </div>

          <div className="field-row">
            <label className="label">
              Где я вижу, что могу действовать по-Взрослому, а не ждать чуда?
            </label>
            <AutoTextarea
              value={state.whereAdult}
              onChange={(v) => update("whereAdult", v)}
              minRows={3}
            />
          </div>

          <div className="field-row">
            <label className="label">
              Какой один вывод про себя и свои деньги я забираю после аудита?
            </label>
            <AutoTextarea
              value={state.takeaway}
              onChange={(v) => update("takeaway", v)}
              minRows={3}
            />
          </div>

          <div
            className="quote-card mt-10"
            style={{ borderColor: "var(--c-gold)", background: "#fff" }}
          >
            <div className="flex items-start gap-3">
              <ArrowBullet />
              <div>
                Этот чек-лист — один из инструментов работы с долгами и денежным мышлением.
                Чтобы глубже разобраться в своих жизненных сценариях и способах реагирования,
                читайте книгу Натальи Батаевой «На Личность идёт НаЛичность» или проходите
                онлайн-курс.
              </div>
            </div>
          </div>

          <div className="cta-buttons no-print">
            <a
              href="https://na-lichnost.ru/book"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-btn cta-btn--book"
            >
              Книга «На Личность идёт НаЛичность»
            </a>
            <a
              href="https://na-lichnost.ru/"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-btn cta-btn--course"
            >
              Онлайн-курс
            </a>
          </div>

          <div className="final-actions no-print">
            <PrintButton />
            <ResetButton onReset={reset} />
          </div>

          <PageFooter index={4} total={TOTAL} />
        </section>
      </main>
    </>
  );
}

// ─────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────

function NavBar({ progress }: { progress: number }) {
  const [open, setOpen] = useState(false);
  return (
    <nav className="top-dock no-print">
      <div className="top-dock-inner">
        <div className="top-dock-head sans">
          <a href="#p1" className="toc-link brand-link">
            Аудит долгов
          </a>
          <div className="top-dock-actions">
            <span>{progress}% заполнено</span>
            <button
              type="button"
              className="menu-toggle"
              aria-label={open ? "Закрыть меню" : "Открыть меню"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
        <ProgressBar value={progress} />
        <div className="section-tabs" data-open={open}>
          <a href="#p2" className="toc-link" onClick={() => setOpen(false)}>
            Долги
          </a>
          <a href="#p3" className="toc-link" onClick={() => setOpen(false)}>
            Уровни
          </a>
          <a href="#p4" className="toc-link" onClick={() => setOpen(false)}>
            Шаги
          </a>
          <a href="#p5" className="toc-link" onClick={() => setOpen(false)}>
            Итог
          </a>
        </div>
      </div>
    </nav>
  );
}

function CoverPage() {
  return (
    <section
      id="p1"
      className="cover-page rounded-2xl overflow-hidden mb-10"
      style={{
        background: "radial-gradient(ellipse at 30% 20%, #5e2a91 0%, #3b1768 55%, #2a0e52 100%)",
        color: "#fff",
        padding: "60px 40px",
        textAlign: "center",
      }}
    >
      <div className="mb-7" style={{ display: "flex", justifyContent: "center" }}>
        <Image src="/logo-nalich.png" alt="НаЛичность" height={115} width={200} style={{ height: "115px", width: "auto" }} priority />
      </div>
      <div style={{ marginBottom: "20px", marginTop: "36px" }}>
        <span className="pill-gold" style={{ fontSize: "20px", padding: "10px 32px" }}>
          «Чек-лист»
        </span>
      </div>
      <h1
        style={{
          fontFamily: "var(--font-forum), serif",
          fontSize: "clamp(36px, 5vw, 54px)",
          lineHeight: 1.05,
          fontWeight: 400,
          margin: "0",
          maxWidth: "720px",
          marginInline: "auto",
        }}
      >
        «Аудит долгов»
      </h1>
      <p
        className="sans mt-4 opacity-80"
        style={{ fontSize: "18px", maxWidth: "36rem", margin: "1rem auto 0" }}
      >
        Этот чек-лист поможет вам увидеть полную картину долгов, понять свои реакции и
        сделать первые шаги к управлению ситуацией.
      </p>
      <p className="sans italic mt-12 opacity-80">
        <a
          href="https://na-lichnost.ru/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "inherit" }}
        >
          @MethodBataeva
        </a>
      </p>
    </section>
  );
}

function DebtCardComponent({
  debt,
  index,
  onChange,
  onRemove,
}: {
  debt: Debt;
  index: number;
  onChange: (patch: Partial<Debt>) => void;
  onRemove?: () => void;
}) {
  return (
    <div className="debt-card">
      <div className="debt-card-header">
        <span className="debt-card-num">{index + 1}</span>
        <span className="debt-card-title">Долг {index + 1}</span>
        {onRemove && (
          <button type="button" className="debt-remove-btn" onClick={onRemove} aria-label="Удалить">
            ×
          </button>
        )}
      </div>
      <div className="debt-card-body">
        {/* Creditor */}
        <div className="dc-field-group">
          <label className="dc-label">Кредитор (банк, организация, имя)</label>
          <AutoTextarea
            className="field-input field-input-single"
            value={debt.creditor}
            onChange={(v) => onChange({ creditor: v })}
            placeholder="Сбербанк, ВТБ, имя человека…"
            minRows={1}
          />
        </div>

        {/* Amount + Currency */}
        <div className="debt-fields-2col">
          <div className="dc-field-group">
            <label className="dc-label">Сумма долга</label>
            <AutoTextarea
              className="field-input field-input-single"
              value={debt.amount}
              onChange={(v) => onChange({ amount: v })}
              placeholder="0"
              minRows={1}
            />
          </div>
          <div className="dc-field-group">
            <label className="dc-label">Валюта</label>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", paddingTop: "2px" }}>
              {CURRENCIES.map((cur) => (
                <button
                  key={cur}
                  type="button"
                  className="debt-currency-btn"
                  data-active={debt.currency === cur}
                  onClick={() => onChange({ currency: cur })}
                >
                  {cur}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Rate + Payment */}
        <div className="debt-fields-2col">
          <div className="dc-field-group">
            <label className="dc-label">Ставка, %</label>
            <AutoTextarea
              className="field-input field-input-single"
              value={debt.rate}
              onChange={(v) => onChange({ rate: v })}
              placeholder="0%"
              minRows={1}
            />
          </div>
          <div className="dc-field-group">
            <label className="dc-label">Платёж / мес.</label>
            <AutoTextarea
              className="field-input field-input-single"
              value={debt.payment}
              onChange={(v) => onChange({ payment: v })}
              placeholder="0"
              minRows={1}
            />
          </div>
        </div>

        {/* Term */}
        <div className="dc-field-group">
          <label className="dc-label">Срок / дата окончания</label>
          <AutoTextarea
            className="field-input field-input-single"
            value={debt.term}
            onChange={(v) => onChange({ term: v })}
            placeholder="Напр. 03.2027 или бессрочно"
            minRows={1}
          />
        </div>

        {/* Overdue */}
        <div className="dc-field-group">
          <label className="dc-label">Просрочка</label>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            <button
              type="button"
              className="debt-toggle-btn"
              data-active={!debt.overdue}
              onClick={() => onChange({ overdue: false })}
            >
              Нет
            </button>
            <button
              type="button"
              className="debt-toggle-btn"
              data-active={debt.overdue}
              onClick={() => onChange({ overdue: true })}
            >
              Есть просрочка
            </button>
          </div>
        </div>

        {/* Debt type */}
        <div className="dc-field-group">
          <label className="dc-label">Тип долга</label>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {DEBT_TYPES.map(({ value: val, label }) => (
              <button
                key={val}
                type="button"
                className="debt-type-btn"
                data-active={debt.type === val}
                onClick={() => onChange({ type: debt.type === val ? "" : val })}
              >
                <span className="debt-type-icon" aria-hidden>
                  <DebtTypeIcon type={val} />
                </span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ height: "1px", background: "var(--c-purple-line)", margin: "18px 0 20px", opacity: 0.5 }} />

        {/* Pressure scales */}
        <div style={{ marginBottom: "6px" }}>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--c-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Насколько давит? (1 — легко, 10 — критично)
          </span>
        </div>

        <MiniScale
          label="Финансово"
          hint="нагрузка на бюджет"
          value={debt.scaleFinancial}
          onChange={(v) => onChange({ scaleFinancial: v })}
        />
        <MiniScale
          label="Эмоционально"
          hint="давит психологически"
          value={debt.scaleEmotional}
          onChange={(v) => onChange({ scaleEmotional: v })}
        />
        <MiniScale
          label="Риск"
          hint="штрафы, суд, последствия"
          value={debt.scaleRisk}
          onChange={(v) => onChange({ scaleRisk: v })}
        />

        {/* Note */}
        <div className="dc-field-group" style={{ marginTop: "20px" }}>
          <label className="dc-label">Заметка (мысли, план, что важно помнить)</label>
          <AutoTextarea
            className="field-input field-input-multi"
            value={debt.note}
            onChange={(v) => onChange({ note: v })}
            placeholder="Запишите всё, что важно об этом долге…"
            minRows={2}
          />
        </div>

        {/* Ignoring toggle */}
        <button
          type="button"
          className="debt-ignore-btn"
          data-active={debt.ignoring}
          onClick={() => onChange({ ignoring: !debt.ignoring })}
        >
          <span style={{ fontSize: "18px" }}>👁</span>
          <span>Отметить: стараюсь не замечать этот долг</span>
        </button>
      </div>
    </div>
  );
}

function MiniScale({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: number | null;
  onChange: (v: number) => void;
}) {
  function tone(n: number) {
    if (n <= 3) return "green";
    if (n <= 5) return "yellow";
    if (n <= 8) return "orange";
    return "red";
  }

  return (
    <div style={{ marginBottom: "14px" }}>
      <div style={{ marginBottom: "5px" }}>
        <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--c-purple-deep)" }}>{label}</span>
        <span style={{ fontSize: "13px", color: "var(--c-muted)", marginLeft: "6px", fontStyle: "italic" }}>
          {hint}
        </span>
      </div>
      <div className="debt-mini-scale">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            className="debt-mini-btn"
            data-active={value === n}
            data-tone={value === n ? tone(n) : "neutral"}
            onClick={() => onChange(n)}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

function LevelGroup({
  pill,
  indices,
  levels,
  setLevel,
}: {
  pill: string;
  indices: number[];
  levels: boolean[];
  setLevel: (i: number, v: boolean) => void;
}) {
  return (
    <div className="mt-7">
      <div className="mb-3">
        <span className="pill-gold">{pill}</span>
      </div>
      <div className="grid gap-1">
        {indices.map((idx) => (
          <button
            key={idx}
            type="button"
            className="level-option flex items-center gap-3 text-left w-full py-2"
            onClick={() => setLevel(idx, !levels[idx])}
          >
            <span className="radio-circle" data-checked={levels[idx]}>
              <span className="radio-inner" />
            </span>
            <span className="level-option-text flex-1">{LEVEL_PHRASES[idx]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function AnxietyScale({
  value,
  onChange,
  leftLabel,
  rightLabel,
}: {
  value: number | null;
  onChange: (v: number) => void;
  leftLabel: string;
  rightLabel: string;
}) {
  function tone(n: number) {
    if (n <= 3) return "green";
    if (n <= 6) return "yellow";
    if (n <= 8) return "orange";
    return "red";
  }

  function feedbackText(v: number | null) {
    if (!v) return { title: "Выберите число", text: "Оцените уровень тревоги от 1 до 10." };
    if (v <= 3) return { title: "Низкая тревога", text: "Вы в относительно спокойном состоянии — есть ресурс для анализа." };
    if (v <= 6) return { title: "Средняя тревога", text: "Тревога есть, но вы способны наблюдать и делать шаги." };
    if (v <= 8) return { title: "Высокая тревога", text: "Долги сильно давят. Важно начать с одного маленького шага." };
    return { title: "Очень высокая тревога", text: "Тяжело. Начните с дыхания и одного самого простого действия." };
  }

  const activeTone = value ? tone(value) : "neutral";
  const fb = feedbackText(value);

  return (
    <div className="mood-scale" data-tone={activeTone} style={{ marginTop: "10px" }}>
      <div className="mood-scale-grid" role="group">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
          const active = value === n;
          return (
            <button
              key={n}
              type="button"
              className="mood-button"
              data-tone={active ? tone(n) : "neutral"}
              data-active={active}
              onClick={() => onChange(n)}
              aria-pressed={active}
            >
              {n}
            </button>
          );
        })}
      </div>
      <div className="mood-scale-labels sans">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
      <div className="mood-feedback">
        <strong>{fb.title}</strong>
        <span>{fb.text}</span>
      </div>
    </div>
  );
}
