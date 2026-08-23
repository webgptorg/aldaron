'use client';

import type { CSSProperties, FormEvent, KeyboardEvent } from 'react';
import { useState } from 'react';
import styles from './hopko.module.css';

const MOODS = [
    {
        emoji: '✦',
        label: 'optimistically wiggly',
        reply: 'I have no idea what that means, but I have already made it 14% more exciting.',
    },
    {
        emoji: '☕',
        label: 'professionally caffeinated',
        reply: 'Excellent. I put it in a very important pile and gave the pile a tiny hat.',
    },
    {
        emoji: '⚡',
        label: 'electrically motivated',
        reply: 'WHOOSH. Your problem has been converted into three suspiciously doable steps.',
    },
    {
        emoji: '☁',
        label: 'softly avoiding reality',
        reply: 'Let us call it a strategic pause. Then let us do the first two minutes anyway.',
    },
] as const;

const SUGGESTIONS = ['write the scary email', 'plan the tiny next step', 'name the weird idea'];

const PROCESS_STEPS = [
    {
        number: '01',
        icon: '👀',
        title: 'Stare at it',
        description: 'Hopko looks directly at the problem until it becomes slightly embarrassed.',
    },
    {
        number: '02',
        icon: '🌀',
        title: 'Wiggle strategically',
        description: 'A gentle shuffle creates momentum. Nobody knows why. The data is compelling.',
    },
    {
        number: '03',
        icon: '🚀',
        title: 'Yeet a draft',
        description: 'Perfect is not invited. A tiny, real, imperfect first version is already on its way.',
    },
] as const;

export function HopkoExperiment() {
    const [moodIndex, setMoodIndex] = useState(0);
    const [hopCount, setHopCount] = useState(0);
    const [isHopping, setIsHopping] = useState(false);
    const [task, setTask] = useState('');
    const [submittedTask, setSubmittedTask] = useState('');

    const mood = MOODS[moodIndex];
    const meterWidth = `${Math.min(100, (hopCount / 10) * 100)}%`;

    function makeHop() {
        setHopCount((count) => count + 1);
        setIsHopping(true);
        window.setTimeout(() => setIsHopping(false), 720);
    }

    function cycleMood() {
        setMoodIndex((index) => (index + 1) % MOODS.length);
        makeHop();
    }

    function submitTask(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const cleanTask = task.trim();

        if (!cleanTask) {
            cycleMood();
            return;
        }

        setSubmittedTask(cleanTask);
        makeHop();
    }

    function handleMascotKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            makeHop();
        }
    }

    return (
        <div className={styles.page}>
            <div className={styles.paperGrain} aria-hidden="true" />
            <div className={styles.backgroundBlob} aria-hidden="true" />

            <header className={styles.topbar}>
                <a className={styles.wordmark} href="#top" aria-label="Hopko home">
                    hopko<span>™</span>
                </a>
                <div className={styles.topbarRight}>
                    <div className={styles.livePill}>
                        <span className={styles.liveDot} aria-hidden="true" />
                        <span>live from the snack drawer</span>
                    </div>
                    <a className={styles.topLink} href="#hop-meter">
                        play with Hopko <span aria-hidden="true">↘</span>
                    </a>
                </div>
            </header>

            <main id="top">
                <section className={styles.hero}>
                    <div className={styles.heroCopy}>
                        <p className={styles.eyebrow}>
                            <span className={styles.eyebrowMark} aria-hidden="true">
                                ✳
                            </span>
                            experimental morale technology / build 0.0.1
                        </p>

                        <h1>
                            Make your
                            <span className={styles.titleAccent}> boring </span>
                            <br />
                            things hop.
                        </h1>

                        <p className={styles.heroIntro}>
                            Meet Hopko: a pocket-sized productivity goblin who turns intimidating tasks into tiny,
                            doable, suspiciously joyful adventures.
                        </p>

                        <div className={styles.heroActions}>
                            <button type="button" className={styles.primaryButton} onClick={makeHop}>
                                Make Hopko hop <span aria-hidden="true">↗</span>
                            </button>
                            <a className={styles.secondaryButton} href="#method">
                                See the science <span aria-hidden="true">↓</span>
                            </a>
                        </div>

                        <div className={styles.heroNote}>
                            <span className={styles.noteArrow} aria-hidden="true">
                                ↳
                            </span>
                            <span>
                                currently refusing to answer emails until someone says “good job”
                            </span>
                        </div>
                    </div>

                    <div className={styles.heroVisual}>
                        <div className={`${styles.sticker} ${styles.stickerTop}`} aria-hidden="true">
                            <span>100%</span>
                            <em>boing</em>
                        </div>
                        <div className={`${styles.doodle} ${styles.doodleStar}`} aria-hidden="true">
                            ✦
                        </div>
                        <div className={`${styles.doodle} ${styles.doodleArrow}`} aria-hidden="true">
                            ↝
                        </div>

                        <div
                            className={`${styles.mascotButton} ${isHopping ? styles.mascotButtonHopping : ''}`}
                            role="button"
                            tabIndex={0}
                            aria-label="Make Hopko hop"
                            onClick={makeHop}
                            onKeyDown={handleMascotKeyDown}
                        >
                            <div className={styles.mascotShadow} aria-hidden="true" />
                            <div className={styles.mascot} data-mood={mood.emoji}>
                                <div className={styles.antenna} aria-hidden="true">
                                    <span />
                                </div>
                                <div className={styles.mascotBody}>
                                    <div className={styles.face}>
                                        <span className={`${styles.eye} ${styles.eyeLeft}`} />
                                        <span className={`${styles.eye} ${styles.eyeRight}`} />
                                        <span className={`${styles.cheek} ${styles.cheekLeft}`} />
                                        <span className={`${styles.cheek} ${styles.cheekRight}`} />
                                        <span className={styles.mouth} />
                                    </div>
                                    <div className={styles.belly}>
                                        <span>{mood.emoji}</span>
                                    </div>
                                </div>
                                <span className={`${styles.arm} ${styles.armLeft}`} aria-hidden="true" />
                                <span className={`${styles.arm} ${styles.armRight}`} aria-hidden="true" />
                                <span className={`${styles.foot} ${styles.footLeft}`} aria-hidden="true" />
                                <span className={`${styles.foot} ${styles.footRight}`} aria-hidden="true" />
                                {hopCount >= 10 && (
                                    <span className={styles.tinyHat} aria-label="Hopko earned a tiny hat">
                                        ♛
                                    </span>
                                )}
                            </div>
                            <span className={styles.clickHint}>click me, I dare you</span>
                        </div>

                        <div className={`${styles.sticker} ${styles.stickerBottom}`} aria-hidden="true">
                            <span>tiny tasks</span>
                            <strong>BIG HOPS</strong>
                        </div>

                        <div className={styles.moodCard} aria-live="polite">
                            <div className={styles.moodLabel}>
                                <span className={styles.moodPulse} aria-hidden="true" />
                                Hopko’s current mood
                            </div>
                            <div className={styles.moodValue}>
                                <span>{mood.emoji}</span> {mood.label}
                            </div>
                            <button type="button" className={styles.moodButton} onClick={cycleMood}>
                                change the vibe <span aria-hidden="true">↗</span>
                            </button>
                        </div>
                    </div>
                </section>

                <section className={styles.methodSection} id="method">
                    <div className={styles.sectionHeading}>
                        <p className={styles.sectionKicker}>The extremely serious process</p>
                        <h2>
                            A three-step system for
                            <span> getting unstuck.</span>
                        </h2>
                        <p>
                            Peer-reviewed by one enthusiastic goblin and a houseplant named Kevin.
                        </p>
                    </div>

                    <div className={styles.processGrid}>
                        {PROCESS_STEPS.map((step) => (
                            <article className={styles.processCard} key={step.number}>
                                <div className={styles.processTopline}>
                                    <span className={styles.processNumber}>{step.number}</span>
                                    <span className={styles.processIcon} aria-hidden="true">
                                        {step.icon}
                                    </span>
                                </div>
                                <h3>{step.title}</h3>
                                <p>{step.description}</p>
                                <span className={styles.cardArrow} aria-hidden="true">
                                    ↗
                                </span>
                            </article>
                        ))}
                    </div>
                </section>

                <section className={styles.experimentSection} id="hop-meter">
                    <div className={styles.experimentIntro}>
                        <p className={styles.sectionKicker}>The Hopko lab</p>
                        <h2>
                            Feed the goblin
                            <span> a task.</span>
                        </h2>
                        <p>
                            Give Hopko something that has been sitting in your brain’s “later” drawer. It will respond
                            with confidence it absolutely has not earned.
                        </p>
                    </div>

                    <div className={styles.labGrid}>
                        <form className={styles.taskForm} onSubmit={submitTask}>
                            <label htmlFor="hopko-task">What are we bravely avoiding today?</label>
                            <div className={styles.inputWrap}>
                                <input
                                    id="hopko-task"
                                    value={task}
                                    onChange={(event) => setTask(event.target.value)}
                                    placeholder="e.g. write the scary email"
                                    maxLength={120}
                                />
                                <button type="submit" aria-label="Send task to Hopko">
                                    ↗
                                </button>
                            </div>
                            <div className={styles.suggestions}>
                                <span>try:</span>
                                {SUGGESTIONS.map((suggestion) => (
                                    <button
                                        type="button"
                                        key={suggestion}
                                        onClick={() => {
                                            setTask(suggestion);
                                            makeHop();
                                        }}
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>

                            {submittedTask && (
                                <div className={styles.response} aria-live="polite">
                                    <div className={styles.responseHeader}>
                                        <span>Hopko says</span>
                                        <span aria-hidden="true">✦</span>
                                    </div>
                                    <p>{mood.reply}</p>
                                    <small>
                                        task received: <strong>{submittedTask}</strong>
                                    </small>
                                </div>
                            )}
                        </form>

                        <div className={styles.meterCard}>
                            <div className={styles.meterHeading}>
                                <div>
                                    <p className={styles.meterEyebrow}>personal hopometer</p>
                                    <h3>How bouncy are we?</h3>
                                </div>
                                <span className={styles.meterEmoji} aria-hidden="true">
                                    {hopCount >= 10 ? '♛' : '↗'}
                                </span>
                            </div>
                            <div className={styles.meterTrack} aria-label={`${hopCount} hops registered`}>
                                <div className={styles.meterFill} style={{ width: meterWidth }} />
                                <span className={styles.meterTick} style={{ left: '50%' }} />
                                <span className={styles.meterTick} style={{ left: '100%' }} />
                            </div>
                            <div className={styles.meterLabels}>
                                <span>sleepy potato</span>
                                <span>tiny hat territory</span>
                            </div>
                            <div className={styles.statsRow}>
                                <div>
                                    <strong>{hopCount}</strong>
                                    <span>hops registered</span>
                                </div>
                                <div>
                                    <strong>{mood.emoji}</strong>
                                    <span>current vibe</span>
                                </div>
                            </div>
                            <p className={styles.meterFootnote}>
                                {hopCount >= 10
                                    ? 'The hat has been earned. Please remain humble.'
                                    : `${10 - hopCount} more ${10 - hopCount === 1 ? 'hop' : 'hops'} until Hopko gets a tiny hat.`}
                            </p>
                        </div>
                    </div>
                </section>

                <section className={styles.finalSection}>
                    <div className={styles.finalStar} aria-hidden="true">
                        ✹
                    </div>
                    <p className={styles.sectionKicker}>That’s it. That’s the product.</p>
                    <h2>
                        Go make something
                        <span> weird.</span>
                    </h2>
                    <p className={styles.finalCopy}>
                        Hopko believes in you. Hopko also believes that a snack is a valid project-management strategy.
                    </p>
                    <button type="button" className={styles.finalButton} onClick={makeHop}>
                        one last hop <span aria-hidden="true">↗</span>
                    </button>
                    <p className={styles.finalFinePrint}>No dashboards. No accounts. No goblins were harmed.</p>
                </section>
            </main>

            <footer className={styles.footer}>
                <span>hopko™ / an isolated experiment</span>
                <span>made with unreasonable optimism <span aria-hidden="true">✦</span></span>
            </footer>
        </div>
    );
}
