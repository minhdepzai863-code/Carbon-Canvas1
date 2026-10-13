import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, RotateCcw, Shuffle, Check } from "lucide-react";
import type { Flashcard } from "../types";

export default function Flashcards({
  cards,
  topic,
  storageKey,
}: {
  cards: Flashcard[];
  topic: string;
  storageKey: string;
}) {
  const read = <T,>(suffix: string, fallback: T): T => {
    try {
      const value = JSON.parse(
        localStorage.getItem(`cc-recall-v3:${storageKey}:${suffix}`) || "null",
      );
      return (
        Array.isArray(fallback)
          ? Array.isArray(value)
          : typeof value === typeof fallback
      )
        ? value
        : fallback;
    } catch {
      return fallback;
    }
  };
  const [custom, setCustom] = useState<Flashcard[]>(() =>
    read<Flashcard[]>("custom", [])
      .filter(
        (c) =>
          c && typeof c.term === "string" && typeof c.definition === "string",
      )
      .slice(0, 200),
  );
  const [deck, setDeck] = useState([...cards, ...custom]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [known, setKnown] = useState<Set<string>>(
    () =>
      new Set(read<string[]>("known", []).filter((v) => typeof v === "string")),
  );
  const [mode, setMode] = useState<"all" | "unmastered">("all");
  const [batchSize, setBatchSize] = useState(() => {
    const value = read("batch", 20);
    return [0, 5, 10, 20, 50].includes(value) ? value : 20;
  });
  const [query, setQuery] = useState("");
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [storageError, setStorageError] = useState("");
  useEffect(() => {
    setDeck([...cards, ...custom]);
    setIndex(0);
    setRevealed(false);
  }, [cards, custom]);
  useEffect(() => {
    try {
      localStorage.setItem(
        `cc-recall-v3:${storageKey}:known`,
        JSON.stringify([...known]),
      );
      localStorage.setItem(
        `cc-recall-v3:${storageKey}:custom`,
        JSON.stringify(custom),
      );
      localStorage.setItem(
        `cc-recall-v3:${storageKey}:batch`,
        JSON.stringify(batchSize),
      );
      setStorageError("");
    } catch {
      setStorageError(
        "Browser storage is unavailable or full. This recall session is not saved.",
      );
    }
  }, [known, custom, batchSize, storageKey]);
  const activeDeck = useMemo(
    () =>
      deck
        .filter(
          (c) =>
            (mode === "all" || !known.has(c.id || c.term)) &&
            (c.term + " " + c.definition)
              .toLowerCase()
              .includes(query.toLowerCase()),
        )
        .slice(0, batchSize || undefined),
    [deck, mode, known, query, batchSize],
  );
  const position = Math.min(index, Math.max(0, activeDeck.length - 1));
  const card = activeDeck[position];
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
  const addCard = (event: FormEvent) => {
    event.preventDefault();
    if (!front.trim() || !back.trim() || custom.length >= 200) return;
    setCustom((old) => [
      ...old,
      {
        id: `custom:${crypto.randomUUID()}`,
        term: front.trim(),
        definition: back.trim(),
      },
    ]);
    setFront("");
    setBack("");
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
      <div className="conditions">
        <label>
          Deck mode
          <select
            value={mode}
            onChange={(e) => {
              setMode(e.target.value as "all" | "unmastered");
              move(0);
            }}
          >
            <option value="all">All cards</option>
            <option value="unmastered">Needs review</option>
          </select>
        </label>
        <label>
          Cards in this round
          <select
            value={batchSize}
            onChange={(e) => {
              setBatchSize(Number(e.target.value));
              move(0);
            }}
          >
            {[5, 10, 20, 50, 0].map((n) => (
              <option key={n} value={n}>
                {n || "All"}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label>
        Find a concept
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            move(0);
          }}
          placeholder="Search this deck…"
        />
      </label>
      {storageError && <p role="alert">{storageError}</p>}
      {card ? (
        <>
          <button
            className={"recall-card" + (revealed ? " revealed" : "")}
            aria-label={
              revealed ? "Hide flashcard answer" : "Reveal flashcard answer"
            }
            aria-expanded={revealed}
            onClick={() => setRevealed((v) => !v)}
          >
            <span className="recall-label">
              {revealed ? "Explanation" : "Question " + (position + 1)}
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
              disabled={position === 0}
              onClick={() => move(position - 1)}
            >
              <ArrowLeft size={18} />
            </button>
            <span>
              {position + 1} of {activeDeck.length}
            </span>
            {revealed && (
              <button
                className="button subtle"
                onClick={() => {
                  setKnown((s) => new Set(s).add(card.id || card.term));
                  move(
                    mode === "unmastered"
                      ? position
                      : (position + 1) % activeDeck.length,
                  );
                }}
              >
                <Check size={16} /> Got it
              </button>
            )}
            <button
              className="icon-button"
              aria-label="Next flashcard"
              onClick={() => move((position + 1) % activeDeck.length)}
            >
              <ArrowRight size={18} />
            </button>
          </div>
          {revealed && (
            <button
              className="button secondary"
              onClick={() => {
                setKnown((s) => {
                  const next = new Set(s);
                  next.delete(card.id || card.term);
                  return next;
                });
                move((position + 1) % activeDeck.length);
              }}
            >
              Needs more practice
            </button>
          )}
        </>
      ) : (
        <p>
          No cards match this round. Choose All cards, clear the search, or add
          your own.
        </p>
      )}
      <p className="fine-print">
        {deck.filter((c) => known.has(c.id || c.term)).length} of {deck.length}{" "}
        recalled. Progress and your own cards are saved in this browser.
      </p>
      <details>
        <summary>Add your own recall card</summary>
        <form onSubmit={addCard}>
          <label>
            Question
            <input
              value={front}
              onChange={(e) => setFront(e.target.value)}
              maxLength={1000}
              required
            />
          </label>
          <label>
            Answer
            <textarea
              value={back}
              onChange={(e) => setBack(e.target.value)}
              maxLength={4000}
              required
            />
          </label>
          <button
            className="button"
            type="submit"
            disabled={custom.length >= 200}
          >
            Save recall card
          </button>
        </form>
      </details>
    </section>
  );
}
