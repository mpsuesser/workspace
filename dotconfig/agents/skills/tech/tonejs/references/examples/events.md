# Events

Category: Sequencing / Timing

Tone's Event classes ([Tone.ToneEvent](../classes/ToneEvent.md), [Tone.Loop](../classes/Loop.md), [Tone.Part](../classes/Part.md) and [Tone.Sequence](../classes/Sequence.md)) simplify scheduling events along the Transport. Each class abstracts away calls to [Transport.schedule](../variables/Transport.md) or [scheduleRepeat](../variables/Transport.md) and lets you create precise, rhythmic events which are startable, stoppable and loopable. (note that ToneEvent was called [Event](../classes/ToneEvent.md) before Tone.js 14.x)

## Code

```js
/**
 * KICK
 */
const kick = new Tone.MembraneSynth({
	envelope: {
		sustain: 0,
		attack: 0.02,
		decay: 0.8,
	},
	octaves: 10,
	pitchDecay: 0.01,
}).toDestination();

const kickPart = new Tone.Loop((time) => {
	kick.triggerAttackRelease("C2", "8n", time);
}, "2n").start(0);

/**
 * SNARE
 */
const snare = new Tone.NoiseSynth({
	volume: -10,
	envelope: {
		attack: 0.001,
		decay: 0.2,
		sustain: 0,
	},
}).toDestination();

const snarePart = new Tone.Loop((time) => {
	snare.triggerAttack(time);
}, "2n").start("4n");

/**
 * PIANO
 */
const keys = new Tone.PolySynth(Tone.Synth, {
	volume: -8,
	oscillator: {
		partials: [1, 2, 1],
	},
}).toDestination();

const cChord = ["C4", "E4", "G4", "B4"];
const dChord = ["D4", "F4", "A4", "C5"];
const gChord = ["B3", "D4", "E4", "A4"];

const pianoPart = new Tone.Part(
	(time, chord) => {
		keys.triggerAttackRelease(chord, "8n", time);
	},
	[
		["0:0:2", cChord],
		["0:1", cChord],
		["0:1:3", dChord],
		["0:2:2", cChord],
		["0:3", cChord],
		["0:3:2", gChord],
	]
).start("2m");

pianoPart.loop = true;
pianoPart.loopEnd = "1m";
pianoPart.humanize = true;

/**
 * BASS
 */
const bass = new Tone.MonoSynth({
	volume: -10,
	envelope: {
		attack: 0.1,
		decay: 0.3,
		release: 2,
	},
	filterEnvelope: {
		attack: 0.001,
		decay: 0.01,
		sustain: 0.5,
		baseFrequency: 200,
		octaves: 2.6,
	},
}).toDestination();

const bassPart = new Tone.Sequence(
	(time, note) => {
		bass.triggerAttackRelease(note, "16n", time);
	},
	["C2", ["C3", ["C3", "D2"]], "E2", ["D2", "A1"]],
	"4n"
).start(0);

bassPart.probability = 0.9;

// set the transport
Tone.Transport.bpm.value = 90;

drawer()
	.add({
		name: "Kick",
		tone: kick,
		open: false,
	})
	.add({
		name: "Snare",
		tone: snare,
		open: false,
	})
	.add({
		name: "Bass",
		tone: bass,
		open: false,
	})
	.add({
		name: "Keys",
		tone: keys,
		open: false,
	});

// bind the interface
document
	.querySelector("tone-play-toggle")
	.addEventListener("start", (e) => Tone.Transport.start());
document
	.querySelector("tone-play-toggle")
	.addEventListener("stop", (e) => Tone.Transport.stop());
```

Source: [events.html](https://github.com/Tonejs/Tone.js/blob/main/examples/events.html)
