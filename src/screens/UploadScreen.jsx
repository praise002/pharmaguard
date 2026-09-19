import { useState } from "react";
import PageLayout from "../components/PageLayout.jsx";
import TipCard from "../components/TipCard.jsx";
import ImageUploadSlot from "../components/ImageUploadSlot.jsx";
import { CameraIcon, WarningIcon } from "../components/icons.jsx";
import "./UploadScreen.css";

const PHOTO_TIPS = [
    "Good light, no glare on the label",
    "Photograph both the front and back of the pack",
    "Keep the whole label in frame and in focus",
];

const NAFDAC_TIPS = [
    <>
        <b>Place</b> — buy from licensed pharmacies
    </>,
    <>
        <b>Price</b> — be wary of suspiciously cheap prices
    </>,
    <>
        <b>Packaging</b> — check for misspellings, blurry print, tampered seals
    </>,
    <>
        <b>Product</b> — notice any unusual smell, color, or texture
    </>,
];

function UploadScreen({ onSubmit }) {
    const [frontFile, setFrontFile] = useState(null);
    const [backFile, setBackFile] = useState(null);

    const canSubmit = frontFile !== null;

    const handleSubmit = () => {
        if (!canSubmit) return;
        onSubmit({ front: frontFile, back: backFile });
    };

    return (
        <PageLayout wide>
            <div className="upload-grid">
                <div className="upload-grid__heading">
                    <span className="upload-screen__eyebrow">
                        PHARMAGUARD / MEDICINE CHECK
                    </span>
                    <h1>Scan it. Check it. Take it safely.</h1>
                    <p className="upload-screen__lede">
                        Photograph a medicine pack and get an instant check
                        against NAFDAC's published alerts.
                    </p>
                    <div className="upload-screen__promise">
                        <span
                            className="upload-screen__promise-mark"
                            aria-hidden="true"
                        />
                        <span>
                            Clear signals. Honest limits. A safer next step.
                        </span>
                    </div>
                </div>

                <div className="upload-grid__tips">
                    <TipCard
                        variant="blue"
                        icon={<CameraIcon />}
                        title="Photo tips"
                        rows={PHOTO_TIPS}
                    />
                    <TipCard
                        variant="amber"
                        icon={<WarningIcon />}
                        title="NAFDAC's own tips for spotting fake drugs"
                        rows={NAFDAC_TIPS}
                    />
                </div>

                <div className="upload-grid__form">
                    <div className="upload-screen__form-heading">
                        <div>
                            <span className="upload-screen__form-label">
                                START WITH THE PACK
                            </span>
                            <h2>Upload your photos</h2>
                        </div>
                        <span className="upload-screen__form-index">01</span>
                    </div>
                    <p className="upload-screen__form-copy">
                        The front identifies the product. The back often carries
                        the batch number, NAFDAC registration number, and dates.
                    </p>
                    <div className="upload-screen__slots">
                        <ImageUploadSlot
                            label="Front"
                            required
                            file={frontFile}
                            onChange={setFrontFile}
                        />
                        <ImageUploadSlot
                            label="Back"
                            file={backFile}
                            onChange={setBackFile}
                        />
                    </div>

                    <button
                        type="button"
                        className="btn-primary upload-screen__submit"
                        disabled={!canSubmit}
                        onClick={handleSubmit}
                    >
                        <CameraIcon />
                        Check this medicine
                    </button>
                </div>
            </div>

            <section
                className="story-section story-section--context"
                aria-labelledby="context-title"
            >
                <div className="story-section__label">THE CONTEXT</div>
                <div className="story-section__intro">
                    <h2 id="context-title">
                        A familiar fear deserves a clearer first step.
                    </h2>
                    <p>
                        When a medicine looks wrong, people need more than a
                        confident guess. PharmaGuard helps turn a rushed glance
                        into visible details, traceable alerts, and a practical
                        next action.
                    </p>
                </div>
                <div className="context-stats">
                    <div className="context-stat">
                        <strong>01</strong>
                        <span>Photograph the pack</span>
                    </div>
                    <div className="context-stat">
                        <strong>02</strong>
                        <span>Read what is visible</span>
                    </div>
                    <div className="context-stat">
                        <strong>03</strong>
                        <span>Know what to ask next</span>
                    </div>
                </div>
            </section>

            <section
                className="story-section story-section--method"
                aria-labelledby="method-title"
            >
                <div className="story-section__label">HOW IT WORKS</div>
                <div className="story-section__intro">
                    <h2 id="method-title">
                        A second set of eyes, not a medical oracle.
                    </h2>
                    <p>
                        The result is deliberately narrow: it checks the details
                        a photo can show and tells you where the evidence came
                        from.
                    </p>
                </div>
                <div className="method-grid">
                    <article className="method-card">
                        <span>01</span>
                        <h3>Read the pack</h3>
                        <p>
                            Extract the product, batch, registration number, and
                            dates from the label.
                        </p>
                    </article>
                    <article className="method-card">
                        <span>02</span>
                        <h3>Match public alerts</h3>
                        <p>
                            Compare what was found against NAFDAC's published
                            safety communications.
                        </p>
                    </article>
                    <article className="method-card">
                        <span>03</span>
                        <h3>Point to the next step</h3>
                        <p>
                            Explain what was flagged and when to pause, ask a
                            pharmacist, or report it.
                        </p>
                    </article>
                </div>
            </section>

            <section
                className="story-section story-section--evidence"
                aria-labelledby="evidence-title"
            >
                <div>
                    <div className="story-section__label">
                        EVIDENCE, NOT THEATRE
                    </div>
                    <h2 id="evidence-title">
                        Every result should show its work.
                    </h2>
                    <p>
                        PharmaGuard names the signal, cites the source, and
                        shows the fields it extracted from your photograph.
                        Nothing is hidden behind a green “safe” stamp.
                    </p>
                </div>
                <div className="evidence-card">
                    <div className="evidence-card__topline">
                        <span>EXAMPLE RESULT</span>
                        <b>CONFIRMED ALERT</b>
                    </div>
                    <h3>Augmentin 625mg Tablets</h3>
                    <dl>
                        <div>
                            <dt>SIGNAL</dt>
                            <dd>Batch number appears in a public alert</dd>
                        </div>
                        <div>
                            <dt>SOURCE</dt>
                            <dd>NAFDAC Public Alert 024/2026</dd>
                        </div>
                    </dl>
                    <small>This is not chemical verification.</small>
                </div>
            </section>

            <section
                className="story-section story-section--boundary"
                aria-labelledby="boundary-title"
            >
                <div className="story-section__label">THE BOUNDARY</div>
                <div className="story-section__intro">
                    <h2 id="boundary-title">Honesty is part of safety.</h2>
                    <p>
                        Knowing what the tool cannot conclude is just as
                        important as knowing what it can find.
                    </p>
                </div>
                <div className="boundary-grid">
                    <div>
                        <h3>PharmaGuard can</h3>
                        <ul>
                            <li>Flag visible packaging inconsistencies.</li>
                            <li>Match details against confirmed alerts.</li>
                            <li>Give a calm, practical next step.</li>
                        </ul>
                    </div>
                    <div>
                        <h3>PharmaGuard cannot</h3>
                        <ul>
                            <li>Prove what is chemically inside a medicine.</li>
                            <li>
                                Guarantee a pack is safe because it looks right.
                            </li>
                            <li>Replace a pharmacist, doctor, or regulator.</li>
                        </ul>
                    </div>
                </div>
            </section>
        </PageLayout>
    );
}

export default UploadScreen;
