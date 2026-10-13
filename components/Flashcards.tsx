import { useEffect, useMemo, useState } from 'react';
import { Lightbulb, RotateCcw, Shuffle, Sparkles } from 'lucide-react';
import type { Flashcard } from '../types';

interface FlashcardsProps {
  cards: Flashcard[];
  topic: string;
}

const shuffle = <T,>(items: T[]) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export default function Flashcards({ cards, topic }: FlashcardsProps) {
  const [deck, setDeck] = useState(cards);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    setDeck(cards);
    setIndex(0);
    setRevealed(false);
    setShowHint(false);
  }, [cards]);

  const card = deck[index];
  const progress = useMemo(() => ((index + 1) / Math.max(deck.length, 1)) * 100, [index, deck.length]);
  if (!card) return null;

  const move = (nextIndex: number) => {
    setIndex(nextIndex);
    setRevealed(false);
    setShowHint(false);
  };

  return (
    <section className="rounded-2xl border border-skin-border bg-skin-surface p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-skin-primary">Active recall</p>
          <h3 className="mt-1 text-xl font-bold text-skin-main">{topic} flashcards</h3>
        </div>
        <button
          type="button"
          onClick={() => { setDeck(shuffle(deck)); move(0); }}
          className="rounded-lg border border-skin-border p-2 text-skin-muted transition hover:border-skin-primary hover:text-skin-primary"
          title="Shuffle deck"
        >
          <Shuffle size={18} />
        </button>
      </div>

      <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-skin-base">
        <div className="h-full rounded-full bg-skin-primary transition-all" style={{ width: `${progress}%` }} />
      </div>

      <button
        type="button"
        onClick={() => setRevealed((value) => !value)}
        className="flex min-h-56 w-full flex-col items-center justify-center rounded-2xl border border-skin-border bg-gradient-to-br from-skin-primary-light to-skin-surface p-7 text-center transition hover:-translate-y-0.5 hover:shadow-lg"
        aria-label={revealed ? 'Hide flashcard answer' : 'Reveal flashcard answer'}
      >
        <Sparkles className="mb-4 text-skin-primary" size={24} />
        <span className="text-xs font-bold uppercase tracking-widest text-skin-muted">
          {revealed ? 'Answer' : 'Prompt'}
        </span>
        <span className="mt-3 text-xl font-bold leading-relaxed text-skin-main">
          {revealed ? card.definition : card.term}
        </span>
        <span className="mt-5 text-sm font-medium text-skin-primary">
          {revealed ? 'Tap to hide answer' : 'Think first, then tap to reveal'}
        </span>
      </button>

      {!revealed && card.hint && (
        <div className="mt-3 text-center">
          <button type="button" onClick={() => setShowHint((value) => !value)} className="inline-flex items-center gap-2 text-sm font-semibold text-skin-muted hover:text-skin-primary">
            <Lightbulb size={16} /> {showHint ? card.hint : 'Need a hint?'}
          </button>
        </div>
      )}

      <div className="mt-5 flex items-center justify-between gap-3">
        <button type="button" onClick={() => move(Math.max(0, index - 1))} disabled={index === 0} className="rounded-lg border border-skin-border px-4 py-2 text-sm font-bold text-skin-main disabled:opacity-40">Previous</button>
        <span className="text-sm font-semibold text-skin-muted">{index + 1} / {deck.length}</span>
        {index < deck.length - 1 ? (
          <button type="button" onClick={() => move(index + 1)} className="rounded-lg bg-skin-primary px-4 py-2 text-sm font-bold text-white">Next</button>
        ) : (
          <button type="button" onClick={() => move(0)} className="inline-flex items-center gap-2 rounded-lg bg-skin-primary px-4 py-2 text-sm font-bold text-white"><RotateCcw size={15} /> Restart</button>
        )}
      </div>
    </section>
  );
}
