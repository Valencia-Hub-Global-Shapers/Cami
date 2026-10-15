"""Original score for the Camí showcase video.

Synthesised from scratch with numpy, so it carries no licence questions.
72 BPM in 4/4: one bar is exactly 100 video frames (src/timing.ts), so
every scene starts on a bar line.

Dramatic reading: weight -> recognition -> quiet confidence.

    bars  0-2   presents       pad alone, D minor, one piano note
    bars  2-8   context        D minor, sparse piano line, low drone
    bar   8     the turn       riser into an F major bloom (Camí appears)
    bars 11-29  the platform   soft piano pulse, I-V-vi-IV in F
    bars 29-34  possibilities  fuller: strings up, soft low pulse
    bars 34-39  end card       Bb, then F major held under the logos

Usage: python3 music/score.py public/music_raw.wav
"""

import sys

import numpy as np
from scipy.io import wavfile
from scipy.signal import fftconvolve, butter, sosfilt

SR = 44100
BPM = 72
BEAT = 60 / BPM
BAR = 4 * BEAT
BARS = 39
LENGTH = BARS * BAR + 4.0

CHORDS = {
    'Dm': ([50, 53, 57], 38),
    'Bb': ([50, 53, 58], 34),
    'Gm': ([50, 55, 58], 31),
    'A': ([49, 52, 57], 33),
    'F': ([48, 53, 57], 41),
    'C': ([48, 52, 55], 36),
    'Csus': ([48, 53, 55], 36),
}

# One chord per bar (or two per bar as a tuple).
PROGRESSION = (
    ['Dm', 'Dm']
    + ['Dm', 'Bb', 'Gm', 'A', 'Dm', ('Gm', 'A')]
    + ['F', 'C', 'Dm']
    + ['Bb', 'F', 'C', 'Dm'] * 4 + ['Bb', 'F']
    + ['C', 'Dm', 'Bb', 'F', 'C']
    + ['Bb', ('Csus', 'F'), 'F', 'F', 'F']
)

# Piano line: (bar, beat, midi, length in beats, velocity).
MELODY = [
    (0, 0, 62, 4, 0.45), (1, 0, 69, 2, 0.4), (1, 2, 65, 2, 0.35),
    (2, 0, 69, 1.5, 0.5), (2, 1.5, 74, 0.5, 0.45), (2, 2, 72, 2, 0.45),
    (3, 0, 70, 1.5, 0.5), (3, 1.5, 69, 0.5, 0.42), (3, 2, 65, 2, 0.42),
    (4, 0, 67, 1, 0.5), (4, 1, 70, 1, 0.48), (4, 2, 74, 2, 0.5),
    (5, 0, 73, 2, 0.52), (5, 2, 76, 2, 0.5),
    (6, 0, 74, 1.5, 0.52), (6, 1.5, 72, 0.5, 0.45), (6, 2, 69, 2, 0.45),
    (7, 0, 70, 1, 0.5), (7, 1, 69, 1, 0.48), (7, 2, 67, 1, 0.5),
    (7, 3, 64, 1, 0.5),
    (8, 0, 72, 1, 0.6), (8, 1, 77, 3, 0.62),
    (9, 0, 76, 2, 0.55), (9, 2, 72, 2, 0.5),
    (10, 0, 74, 2, 0.52), (10, 2, 69, 2, 0.48),
    (35, 2, 65, 6, 0.5), (35, 2.5, 69, 6, 0.45), (35, 3, 72, 6, 0.45),
    (36, 0, 77, 6, 0.5), (37, 0, 84, 8, 0.38),
]

# A long-note counter melody over the platform and the build.
for start in (19, 23):
    MELODY += [
        (start, 0, 81, 4, 0.34), (start + 1, 0, 79, 4, 0.32),
        (start + 2, 0, 77, 2, 0.32), (start + 2, 2, 76, 2, 0.3),
        (start + 3, 0, 74, 4, 0.3),
    ]
MELODY += [
    (29, 0, 81, 3, 0.42), (29, 3, 79, 1, 0.38), (30, 0, 77, 4, 0.42),
    (31, 0, 81, 2, 0.45), (31, 2, 84, 2, 0.48), (32, 0, 79, 4, 0.45),
    (33, 0, 77, 2, 0.45), (33, 2, 74, 2, 0.42),
    (34, 0, 74, 2, 0.45), (34, 2, 77, 2, 0.42),
]


def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def at(seconds):
    return int(round(seconds * SR))


def bar_time(bar, beat=0.0):
    return bar * BAR + beat * BEAT


def chords_by_bar():
    """Expand the progression to (start, length, chord name) events."""
    events = []
    for bar, item in enumerate(PROGRESSION):
        if isinstance(item, tuple):
            events.append((bar_time(bar), 2 * BEAT, item[0]))
            events.append((bar_time(bar, 2), 2 * BEAT, item[1]))
        else:
            events.append((bar_time(bar), BAR, item))
    return events


def piano(freq, length, vel):
    """A soft felt-piano tone: inharmonic partials with fast decay."""
    dur = length + 2.5
    t = np.arange(at(dur)) / SR
    tone = np.zeros_like(t)
    for n in range(1, 9):
        f = n * freq * np.sqrt(1 + 0.0003 * n * n)
        if f > 9000:
            break
        decay = (0.9 + 0.55 * n) * (freq / 300) ** 0.35
        amp = (1 / n ** 1.4) * np.exp(-t * decay)
        tone += amp * (np.sin(2 * np.pi * f * t)
                       + 0.4 * np.sin(2 * np.pi * f * 1.0012 * t))
    attack = np.minimum(1, t / 0.006)
    release = np.clip(1 - (t - length) / 0.6, 0, 1)
    return vel * tone * attack * release * 0.35


def pad(midis, length, gain, detune=0.004):
    """A warm string pad: detuned additive saws, slow swell."""
    dur = length + 1.8
    t = np.arange(at(dur)) / SR
    out = np.zeros((len(t), 2))
    for midi in midis:
        base = hz(midi)
        for side, sign in ((0, -1), (1, 1)):
            for d in (-1, 0, 1):
                f0 = base * (1 + sign * d * detune)
                phase = np.random.default_rng(midi * 7 + d + side).random()
                for n in range(1, 10):
                    f = n * f0
                    if f > 5000:
                        break
                    amp = np.exp(-n / 3.2) / n
                    out[:, side] += amp * np.sin(
                        2 * np.pi * (f * t + phase * n))
    swell = np.minimum(1, t / 1.4) ** 2
    release = np.clip(1 - (t - length) / 1.8, 0, 1)
    breathe = 1 + 0.08 * np.sin(2 * np.pi * 0.15 * t)
    env = swell * release * breathe
    # Even out chords whose overtones line up, so no chord jumps out.
    rms = np.sqrt(np.mean(out ** 2))
    return gain * 0.12 * out * env[:, None] / rms


def bass(midi, length, gain):
    dur = length + 1.0
    t = np.arange(at(dur)) / SR
    f = hz(midi)
    tone = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t)
    env = np.minimum(1, t / 0.08) * np.clip(1 - (t - length) / 1.0, 0, 1)
    return gain * tone * env


def soft_kick(gain):
    t = np.arange(at(0.6)) / SR
    freq = 48 + 70 * np.exp(-t * 28)
    phase = 2 * np.pi * np.cumsum(freq) / SR
    return gain * np.sin(phase) * np.exp(-t * 7)


def riser(length, gain):
    """Filtered noise that opens up into the turn."""
    n = at(length)
    noise = np.random.default_rng(3).standard_normal((n, 2))
    sos = butter(2, [300, 4000], btype='band', fs=SR, output='sos')
    shaped = sosfilt(sos, noise, axis=0)
    ramp = np.linspace(0, 1, n) ** 3
    return gain * shaped * ramp[:, None]


def bloom(gain):
    """A low, soft impact when Camí appears."""
    t = np.arange(at(4.0)) / SR
    tone = np.sin(2 * np.pi * 43.65 * t) + 0.5 * np.sin(2 * np.pi * 87.3 * t)
    return gain * tone * np.exp(-t * 1.1) * np.minimum(1, t / 0.01)


def add(mix, start, sound):
    i = at(start)
    if sound.ndim == 1:
        sound = np.stack([sound, sound], axis=1)
    end = min(len(mix), i + len(sound))
    mix[i:end] += sound[:end - i]


def section_gain(bar):
    """The intensity curve, per bar, for the pad."""
    if bar < 2:
        return 0.55
    if bar < 8:
        return 0.5
    if bar < 11:
        return 0.85
    if bar < 29:
        return 0.6
    if bar < 34:
        return 1.0
    return 0.8


def reverb(dry, seconds=3.2, wet=0.32):
    n = at(seconds)
    t = np.arange(n) / SR
    rng = np.random.default_rng(11)
    ir = rng.standard_normal((n, 2)) * np.exp(-t / 0.9)[:, None]
    sos = butter(1, 5000, btype='low', fs=SR, output='sos')
    ir = sosfilt(sos, ir, axis=0)
    ir /= np.sqrt((ir ** 2).sum(axis=0))
    # Only the upper range goes into the room: a noise impulse response has
    # narrow random peaks that would make single bass notes jump out.
    send = sosfilt(butter(2, 220, btype='high', fs=SR, output='sos'),
                   dry, axis=0)
    out = np.zeros_like(dry)
    for ch in range(2):
        out[:, ch] = fftconvolve(send[:, ch], ir[:, ch])[:len(dry)]
    return dry + wet * out * 1.6


def render():
    mix = np.zeros((at(LENGTH), 2))
    dry_piano = np.zeros_like(mix)

    for start, length, name in chords_by_bar():
        bar = int(start / BAR + 1e-6)
        notes, root = CHORDS[name]
        add(mix, start, pad(notes, length, section_gain(bar)))
        if 2 <= bar:
            gain = 0.15 if bar < 8 else 0.22 if bar < 29 else 0.3
            add(mix, start, bass(root, length, gain))

    # The platform's pulse: eighth-note arpeggios in the piano.
    for start, length, name in chords_by_bar():
        bar = int(start / BAR + 1e-6)
        if not 11 <= bar < 34:
            continue
        notes, _ = CHORDS[name]
        r, third, fifth = sorted(notes)
        shape = [r + 12, fifth + 12, r + 24, third + 24,
                 fifth + 12, third + 24, r + 24, fifth + 12]
        steps = int(round(length / (BEAT / 2)))
        for k in range(steps):
            vel = 0.2 if k % 4 else 0.27
            if bar >= 29:
                vel *= 1.3
            add(dry_piano, start + k * BEAT / 2,
                piano(hz(shape[k % 8]), BEAT / 2, vel))

    for bar, beat, midi, length, vel in MELODY:
        add(dry_piano, bar_time(bar, beat),
            piano(hz(midi), length * BEAT, vel))

    # Soft low pulse under the possibilities.
    for bar in range(29, 34):
        for beat in (0, 2):
            add(mix, bar_time(bar, beat), soft_kick(0.35))

    add(mix, bar_time(6, 2), riser(bar_time(8) - bar_time(6, 2), 0.05))
    add(mix, bar_time(8), bloom(0.35))
    add(mix, bar_time(35, 2), bloom(0.22))

    mix += dry_piano
    mix = reverb(mix)
    mix = mix[:at(BARS * BAR)]
    fade = np.clip((len(mix) - np.arange(len(mix))) / at(3.0), 0, 1)
    mix *= fade[:, None]
    mix /= np.max(np.abs(mix)) * 1.12
    return mix


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else 'music_raw.wav'
    wavfile.write(out, SR, render().astype(np.float32))
    print(f'wrote {out}: {BARS * BAR:.2f} s')


if __name__ == '__main__':
    main()
