import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, RotateCcw, Shuffle, Check } from "lucide-react";
import type { Flashcard } from "../types";

export default function Flashcards({
  cards,
  topic,
}: {
  cards: Flashcard[];
  topic: string;
}) {
  const [deck, setDeck] = useState(cards);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [known, setKnown] = useState<Set<string>>(new Set());
  useEffect(() => {
    setDeck(cards);
    setIndex(0);
    setRevealed(false);
    setKnown(new Set());
  }, [cards]);
  const card = deck[index];
  if (!card) return null;
  const move = (value: number) => {
    setIndex(value);
    setRevealed(false);
  };
  const shuffle = () => {
    const next = [...deck];
    for (let i = next.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
    setDeck(next);
    move(0);
  };
  return (
    <section className="flashcards" aria-label={topic + " flashcards"}>
      <div className="section-heading">
        <div>
          <h3>Active recall</h3>
          <p>Recall the idea before revealing the explanation.</p>
        </div>
        <button
          className="icon-button"
          aria-label="Shuffle flashcards"
          onClick={shuffle}
        >
          <Shuffle size={17} />
        </button>
      </div>
      <button
        className={"recall-card" + (revealed ? " revealed" : "")}
        aria-label={
          revealed ? "Hide flashcard answer" : "Reveal flashcard answer"
        }
        aria-expanded={revealed}
        onClick={() => setRevealed((v) => !v)}
      >
        <span className="recall-label">
          {revealed ? "Explanation" : "Question " + (index + 1)}
        </span>
        <span className="recall-text">
          {revealed ? card.definition : card.term}
        </span>
        <span className="recall-action">
          {revealed ? "Tap to see the question" : "Reveal answer"}{" "}
          <RotateCcw size={15} />
        </span>
      </button>
      <div className="recall-controls">
        <button
          className="icon-button"
          aria-label="Previous flashcard"
          disabled={index === 0}
          onClick={() => move(index - 1)}
        >
          <ArrowLeft size={18} />
        </button>
        <span>
          {index + 1} of {deck.length}
        </span>
        {revealed && (
          <button
            className="button subtle"
            onClick={() => {
              setKnown((s) => new Set(s).add(card.term));
              move((index + 1) % deck.length);
            }}
          >
            <Check size={16} /> Got it
          </button>
        )}
        <button
          className="icon-button"
          aria-label="Next flashcard"
          onClick={() => move((index + 1) % deck.length)}
        >
          <ArrowRight size={18} />
        </button>
      </div>
      <p className="fine-print">
        {known.size} of {deck.length} recalled in this session
      </p>
    </section>
  );
}
