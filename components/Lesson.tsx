import type { Module, StudyGuide } from "../types";
import { getLessonChapter } from "../content/lessonChapters";
import ChemistryText from "./ChemistryText";

function LessonFigure({
  kind,
}: {
  kind: ReturnType<typeof getLessonChapter>["figure"];
}) {
  // Data/schematic SVGs, not generated molecular geometry or decorative artwork.
  if (kind === "orbitals")
    return (
      <figure className="lesson-figure">
        <div
          className="orbital-diagram"
          role="img"
          aria-label="Nitrogen electron configuration: two electrons in 1s, two in 2s, and one in each of three 2p orbitals."
        >
          {["1s", "2s", "2p", "2p", "2p"].map((label, i) => (
            <div key={i} aria-hidden="true">
              <span className="orbital-box">{i < 2 ? "↑↓" : "↑"}</span>
              <span className="orbital-label">{label}</span>
            </div>
          ))}
        </div>
        <figcaption>
          Nitrogen orbital occupancy. One box represents one orbital.
          Equal-energy p orbitals are occupied singly before pairing. This is an
          occupancy diagram, not an image of electron paths.
        </figcaption>
      </figure>
    );
  if (kind === "energy")
    return (
      <figure className="lesson-figure">
        <svg
          viewBox="0 0 560 240"
          role="img"
          aria-label="Schematic exothermic reaction energy profile. The uncatalysed and catalysed pathways share the same reactant and product energies but have different activation barriers."
        >
          <path d="M55 25V205H530" fill="none" stroke="currentColor" />
          <text x="70" y="22">
            Energy
          </text>
          <text x="280" y="230">
            Reaction progress
          </text>
          <path
            d="M70 125H135C195 125 185 38 255 38S335 173 400 173H515"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="3"
          />
          <path
            d="M70 125H135C195 125 200 80 255 80S335 173 400 173H515"
            fill="none"
            stroke="var(--green)"
            strokeWidth="3"
            strokeDasharray="7 4"
          />
          <text x="85" y="150">
            Reactants
          </text>
          <text x="418" y="163">
            Products
          </text>
          <text x="315" y="46">
            Uncatalysed
          </text>
          <text x="315" y="82">
            Catalysed
          </text>
        </svg>
        <figcaption>
          Schematic exothermic example, not measured data. Catalysis changes the
          activation barrier, not the reactant–product energy difference.
        </figcaption>
      </figure>
    );
  if (kind === "amount")
    return (
      <figure className="lesson-figure">
        <div className="concept-flow">
          <span>
            Measured mass
            <br />
            <ChemistryText text="$m$" />
          </span>
          <span aria-hidden="true">→</span>
          <span>
            Amount
            <br />
            <ChemistryText text="$n=m/M$" />
          </span>
          <span aria-hidden="true">→</span>
          <span>
            Equation ratio
            <br />
            <ChemistryText text="$n/\\nu$" />
          </span>
        </div>
        <figcaption>
          Convert measurements to amount before applying the balanced equation's
          coefficients. A solution volume instead uses n = cV.
        </figcaption>
      </figure>
    );
  if (kind === "particles")
    return (
      <figure className="lesson-figure">
        <div className="concept-flow">
          <span>
            Particles
            <br />
            atoms · ions · molecules
          </span>
          <span aria-hidden="true">→</span>
          <span>
            Arrangement
            <br />
            bonding · geometry
          </span>
          <span aria-hidden="true">→</span>
          <span>
            Properties
            <br />
            polarity · conductivity
          </span>
        </div>
        <figcaption>
          Explain an observation by linking the correct particles and structural
          model. A two-dimensional formula does not establish experimental
          three-dimensional angles.
        </figcaption>
      </figure>
    );
  return (
    <figure className="lesson-figure">
      <div className="concept-flow">
        <span>
          Identify
          <br />
          reactive species
        </span>
        <span aria-hidden="true">→</span>
        <span>
          Account
          <br />
          atoms · charge · conditions
        </span>
        <span aria-hidden="true">→</span>
        <span>
          Predict
          <br />
          then check evidence
        </span>
      </div>
      <figcaption>
        A balanced transformation is accounting, not proof of feasibility. Use
        the module's specific reagents, conditions and experimental evidence.
      </figcaption>
    </figure>
  );
}

export default function Lesson({
  module,
  guide,
}: {
  module: Module;
  guide: StudyGuide;
}) {
  const chapter = getLessonChapter(module, guide);
  return (
    <div className="lesson-reading">
      <h3>The bigger picture</h3>
      <p>
        <ChemistryText text={chapter.opening} />
      </p>
      <LessonFigure kind={chapter.figure} />
      <h3>How to approach a question</h3>
      <p>
        <ChemistryText text={chapter.approach} />
      </p>
      <section className="worked-example">
        <h3>
          Worked example: <ChemistryText text={chapter.example.problem} />
        </h3>
        <ol>
          {chapter.example.steps.map((step, i) => (
            <li key={i}>
              <ChemistryText text={step} />
            </li>
          ))}
        </ol>
        <p className="example-answer">
          <ChemistryText text={chapter.example.answer} />
        </p>
      </section>
      <h3>Build your explanation</h3>
      <p>
        Connect the example to these topic-specific ideas. Try explaining each
        without looking, then check the summary notes and the linked textbook.
      </p>
      <ol className="lesson-route">
        {guide.flashcards.slice(0, 5).map((card) => (
          <li key={card.term}>
            <ChemistryText text={card.term} />
          </li>
        ))}
      </ol>
      <div className="mistake-note">
        <h3>Before moving on</h3>
        {guide.commonMistakes.map((point) => (
          <p key={point}>
            <ChemistryText text={point} />
          </p>
        ))}
      </div>
      <p className="fine-print">
        This lesson is a guided introduction, not a replacement for the full
        syllabus or textbook. The worked example is original, not an official
        past-paper question. Follow the Sources tab for detailed reading.
      </p>
    </div>
  );
}
