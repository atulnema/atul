"""Procedural soundtrack for the Alphastrix Digital showreel.

128 BPM, 8 bars of 4/4 = exactly 15 seconds. F minor.
Every cue lines up with a beat so the picture can cut on the grid.

Run:  python3 scripts/make_music.py   ->  public/music.wav
"""

import os
import wave

import numpy as np
from scipy import signal

SR = 48000
BPM = 128.0
BEAT = 60.0 / BPM
BAR = 4 * BEAT
DUR = 15.0
N = int(DUR * SR)
rng = np.random.default_rng(7)

dry = np.zeros((N, 2))
send = np.zeros((N, 2))  # reverb send


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12.0)


def tt(length):
    return np.arange(int(length * SR)) / SR


def pan(sig, p):
    """p in [-1, 1] -> stereo, equal power."""
    a = (p + 1) * np.pi / 4
    return np.stack([sig * np.cos(a), sig * np.sin(a)], axis=1)


def add(bus, sig, t, gain=1.0, p=0.0):
    if sig.ndim == 1:
        sig = pan(sig, p)
    i = int(round(t * SR))
    if i >= N:
        return
    if i < 0:
        sig = sig[-i:]
        i = 0
    j = min(N, i + len(sig))
    bus[i:j] += sig[: j - i] * gain


def filt(x, kind, fc, order=2):
    sos = signal.butter(order, fc, btype=kind, fs=SR, output="sos")
    return signal.sosfilt(sos, x, axis=0)


def noise(length):
    return rng.standard_normal(int(length * SR))


def saw(f, length, phase=0.0):
    t = tt(length)
    return 2.0 * ((f * t + phase) % 1.0) - 1.0


# ---------------------------------------------------------------- drums
def kick():
    t = tt(0.42)
    f = 44 + 130 * np.exp(-t * 30)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * 7.5)
    click = filt(noise(0.42), "high", 2500) * np.exp(-t * 500) * 0.25
    return np.tanh((body + click) * 2.4) * 0.9


def hat(open_=False):
    length = 0.3 if open_ else 0.07
    t = tt(length)
    x = filt(noise(length), "high", 8500, 4)
    return x * np.exp(-t * (16 if open_ else 85))


def clap():
    t = tt(0.4)
    x = filt(noise(0.4), "band", [900, 3600], 2)
    env = np.zeros_like(t)
    for d in (0.0, 0.011, 0.023):
        m = t >= d
        env[m] += np.exp(-(t[m] - d) * 190)
    m = t >= 0.03
    env[m] += 0.6 * np.exp(-(t[m] - 0.03) * 24)
    return x * env


def snare():
    t = tt(0.2)
    n = filt(noise(0.2), "band", [1500, 7000], 2) * np.exp(-t * 34)
    tone = np.sin(2 * np.pi * 195 * t) * np.exp(-t * 42)
    return n * 0.9 + tone * 0.5


KICK, HAT, OHAT, CLAP = kick(), hat(), hat(True), clap()

# ---------------------------------------------------------------- synths
def bass_note(note, length):
    f = midi(note)
    t = tt(length)
    sub = np.sin(2 * np.pi * f * t)
    grit = filt(saw(f * 2, length) + saw(f * 2.003, length, 0.3), "low", 520, 4) * 0.42
    env = np.minimum(t / 0.006, 1.0) * np.exp(-t * 3.2)
    rel = np.clip((length - t) / 0.02, 0, 1)
    return np.tanh((sub * 0.9 + grit) * 1.5) * env * rel


def pluck(note, length=0.5, bright=1.0):
    f = midi(note)
    t = tt(length)
    x = np.zeros_like(t)
    for k in range(1, 15):
        if f * k > 15000:
            break
        x += np.sin(2 * np.pi * f * k * t + k) / k * np.exp(-t * (5 + 3.2 * k / bright))
    return x * np.minimum(t / 0.002, 1.0)


def pad_chord(notes, length, dark=350, bright=2600):
    """Detuned saw stack, returned as (dark, bright) stereo layers."""
    out = np.zeros((int(length * SR), 2))
    for i, n in enumerate(notes):
        f = midi(n)
        for d, p in ((-0.006, -0.8), (0.0, 0.0), (0.007, 0.8)):
            out += pan(saw(f * (1 + d), length, rng.random()), p * (1 if i % 2 else -1))
    out /= len(notes) * 3
    return filt(out, "low", dark, 2), filt(out, "low", bright, 2)


def riser(length, f0=180, f1=7000, power=2.2):
    t = tt(length)
    u = t / length
    x = np.zeros_like(t)
    for _ in range(28):
        a, b = f0 * rng.uniform(0.6, 1.6), f1 * rng.uniform(0.6, 1.4)
        f = a * (b / a) ** u
        x += np.sin(2 * np.pi * np.cumsum(f) / SR + rng.random() * 6.28)
    x /= 9
    n = filt(noise(length), "high", 3000) * 0.5
    return (x + n) * u**power


def reverse_cymbal(length):
    t = tt(length)
    return filt(noise(length), "high", 5000, 2) * np.exp((t - length) * 5.5)


def impact(big=1.0):
    t = tt(2.2)
    f = 36 + 40 * np.exp(-t * 9)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.6)
    thud = filt(noise(2.2), "low", 1800, 2) * np.exp(-t * 9) * 0.6
    crash = filt(noise(2.2), "high", 4200, 2) * np.exp(-t * 3.4) * 0.3
    return np.tanh((boom * 1.3 + thud) * 1.6) * big, crash * big


def whoosh(length=0.36, up=True):
    t = tt(length)
    u = t / length
    lo = filt(noise(length), "band", [400, 1600], 2)
    hi = filt(noise(length), "band", [2500, 9000], 2)
    mix = u if up else 1 - u
    env = np.exp(-((u - 0.62) ** 2) / 0.035)
    sig = (lo * (1 - mix) + hi * mix) * env
    p = (u * 2 - 1) * (1 if up else -1)
    a = (p + 1) * np.pi / 4
    return np.stack([sig * np.cos(a), sig * np.sin(a)], axis=1)


def tick(f=3200):
    t = tt(0.05)
    return np.sin(2 * np.pi * f * t) * np.exp(-t * 260)


# ---------------------------------------------------------------- arrangement
def bt(bar, beat=0.0):
    return bar * BAR + beat * BEAT


kick_times = []

# Bar 0: intro. Pad swells, riser, construction ticks, reverse cymbal.
pd, pb = pad_chord([53, 56, 60, 63, 67], BAR)  # Fm9
u = np.linspace(0, 1, len(pd))[:, None]
add(dry, pd * (1 - u) + pb * u**2, 0, 0.5 * 1.0)
dry[: int(BAR * SR)] *= np.minimum(np.linspace(0, 6, int(BAR * SR)), 1)[:, None]
add(dry, riser(BAR), 0, 0.16)
add(dry, reverse_cymbal(BEAT * 2), bt(0, 2), 0.2)
for i, f in enumerate([2100, 2500, 2100, 3150, 2500, 3750, 3150, 4200, 4200, 5000]):
    t0 = 0.12 + i * BEAT / 2 if i < 8 else bt(0, 3.5) + (i - 8) * BEAT / 4
    add(dry, tick(f), t0, 0.16, p=(-0.5 if i % 2 else 0.5))
    add(send, tick(f), t0, 0.22)
for b in (0, 2):  # low heartbeat
    add(dry, KICK, bt(0, b), 0.45)

# Groove bars
ARPS = {
    1: [65, 72, 68, 75, 72, 79, 75, 72, 65, 72, 68, 75, 80, 79, 75, 72],
    2: [65, 72, 68, 75, 72, 79, 75, 72, 65, 72, 68, 75, 80, 79, 75, 72],
    3: [65, 72, 68, 75, 72, 79, 75, 72, 68, 75, 72, 79, 84, 80, 79, 75],
    4: [61, 68, 65, 72, 68, 77, 72, 68, 61, 68, 65, 72, 77, 80, 77, 72],
    5: [63, 70, 67, 75, 70, 79, 75, 70, 67, 75, 70, 79, 82, 79, 87, 82],
    6: [77, 84, 80, 87, 84, 91, 87, 84, 77, 84, 80, 87, 92, 91, 87, 84],
}
BASS = {1: 29, 2: 29, 3: 29, 4: 25, 5: 27, 6: 29}
CHORD = {
    1: [53, 56, 60, 63, 67],
    2: [53, 56, 60, 63, 67],
    3: [53, 56, 60, 63, 67],
    4: [49, 56, 60, 65, 68],  # Dbmaj7
    5: [51, 55, 58, 62, 67],  # Eb
    6: [53, 56, 60, 63, 67],
}

for bar in range(1, 7):
    build = bar == 5
    last = bar == 6
    nbeats = 3 if last else 4  # bar 6 leaves a gap on beat 4 for the suck-in

    # kick
    for b in range(nbeats):
        if build and b >= 2:
            continue
        add(dry, KICK, bt(bar, b), 0.86)
        kick_times.append(bt(bar, b))

    # clap on 2 and 4
    for b in (1, 3):
        if build or (last and b == 3):
            continue
        add(dry, CLAP, bt(bar, b), 0.42)
        add(send, CLAP, bt(bar, b), 0.3)

    # hats
    for s in range(nbeats * 4):
        if build and s >= 8:
            continue
        vel = (0.21 if s % 4 == 2 else 0.095) * (1.0 if bar >= 2 else 0.8)
        add(dry, HAT, bt(bar, s / 4), vel, p=0.25 if s % 2 else -0.25)
    if bar >= 2:
        for b in range(nbeats):
            if build and b >= 2:
                continue
            add(dry, OHAT, bt(bar, b + 0.5), 0.13, p=0.15)

    # off-beat bass
    for b in range(nbeats):
        note = BASS[bar]
        if build:
            continue
        add(dry, bass_note(note, BEAT * 0.48), bt(bar, b + 0.5), 0.62)
        if bar >= 2 and b in (1, 3):
            add(dry, bass_note(note + 12, BEAT * 0.22), bt(bar, b + 0.75), 0.3)

    # chord stabs: every beat in the first drop bar, then on the 1 and the "and" of 2
    stab_beats = [0, 1, 2, 3] if bar == 1 else [0, 1.5]
    if last:
        stab_beats = [0, 1, 2]
    for b in stab_beats:
        for i, n in enumerate(CHORD[bar]):
            sig = pluck(n + 12, 0.45, 1.4)
            add(dry, sig, bt(bar, b), 0.085, p=(i - 2) / 2.5)
            add(send, sig, bt(bar, b), 0.085, p=(i - 2) / 2.5)

    # arp with ping-pong delay
    if bar >= 2:
        steps = ARPS[bar]
        for s, n in enumerate(steps):
            if last and s >= 12:
                continue
            g = 0.13 if bar != 5 else 0.08 + 0.08 * s / 16
            sig = pluck(n, 0.32, 1.0 + (0.6 if last else 0))
            t0 = bt(bar, s / 4)
            add(dry, sig, t0, g, p=(-0.35 if s % 2 else 0.35))
            add(send, sig, t0, g * 0.5)
            for k, fb in enumerate((0.38, 0.17)):
                add(dry, sig, t0 + (k + 1) * 0.75 * BEAT, g * fb, p=(0.8 if k % 2 else -0.8))

    # pad
    pd, pb = pad_chord(CHORD[bar], BAR)
    add(dry, pd * 0.5 + pb * (0.5 if bar >= 2 else 0.3), bt(bar), 0.5)

# Bar 5 build: accelerating snare roll, riser, long bass swell.
SN = snare()
roll = [2 + i * 0.5 for i in range(2)] + [3 + i * 0.25 for i in range(2)] + [3.5 + i * 0.125 for i in range(4)]
for i, b in enumerate(roll):
    add(dry, SN, bt(5, b), 0.36 + 0.05 * i)
    add(send, SN, bt(5, b), 0.16)
add(dry, riser(BEAT * 2.2, 300, 9000, 2.0), bt(5, 1.8), 0.36)
t = tt(BAR)
swell = bass_note(27, BAR) * 0 + np.sin(2 * np.pi * midi(27) * t) * (t / BAR) ** 1.5 * 0.5
add(dry, swell * np.clip((BAR - t) / 0.03, 0, 1), bt(5), 0.6)

# Whooshes on every vignette cut in bars 2-3 and into the big sections.
for i, tw in enumerate([bt(2, 0), bt(2, 2), bt(3, 0), bt(3, 2), bt(4, 0)]):
    add(dry, whoosh(0.34, up=i % 2 == 0), tw - 0.22, 0.2)
add(dry, whoosh(0.5), bt(5, 0) - 0.3, 0.2)

# Impacts on the section downbeats.
for tb, big in ((bt(1), 0.75), (bt(2), 0.35), (bt(4), 0.4), (bt(6), 0.7)):
    boom, crash = impact(big)
    add(dry, boom, tb, 0.5)
    add(dry, crash, tb, 0.5)
    add(send, crash, tb, 0.4)

# Bar 6 beat 4: everything cuts, reverse swell sucks into the end card.
add(dry, reverse_cymbal(BEAT * 1.6), bt(6, 2.4), 0.3)
add(dry, riser(BEAT * 1.0, 600, 5000, 3.0), bt(6, 3.0), 0.2)

# Bar 7: final hit. Sub boom, wide chord, long tail.
T_END = bt(7)
boom, crash = impact(1.0)
add(dry, boom, T_END, 0.62)
add(dry, crash, T_END, 0.6)
add(send, crash, T_END, 0.6)
add(dry, KICK, T_END, 0.9)
kick_times.append(T_END)
pd, pb = pad_chord([41, 53, 56, 60, 63, 67, 72], BAR)
tb_ = tt(BAR)[:, None]
add(dry, (pd * 0.8 + pb * np.exp(-tb_ * 2.2)) * np.exp(-tb_ * 0.9), T_END, 0.62)
for i, n in enumerate([53, 60, 65, 68, 72, 75, 79, 84]):
    sig = pluck(n, 1.6, 2.2)
    add(dry, sig, T_END + i * 0.012, 0.075, p=(i - 3.5) / 4)
    add(send, sig, T_END + i * 0.012, 0.11, p=(i - 3.5) / 4)
# a little sparkle answering the wordmark reveal
for i, n in enumerate([84, 87, 91, 96]):
    sig = pluck(n, 0.5, 1.2)
    add(dry, sig, T_END + BEAT * (1 + i * 0.25), 0.035, p=0.6 - i * 0.4)
    add(send, sig, T_END + BEAT * (1 + i * 0.25), 0.07)

# ---------------------------------------------------------------- sidechain, reverb, master
duck = np.ones(N)
tline = np.arange(N) / SR
for kt in kick_times:
    m = (tline >= kt) & (tline < kt + 0.4)
    duck[m] = np.minimum(duck[m], 1 - 0.55 * np.exp(-(tline[m] - kt) * 9))

ir_t = tt(2.0)
ir = np.stack([noise(2.0), noise(2.0)], axis=1) * np.exp(-ir_t * 3.3)[:, None]
ir = filt(filt(ir, "high", 350), "low", 7500)
ir /= np.sqrt((ir**2).sum(axis=0)).max()
wet = np.stack([signal.fftconvolve(send[:, c], ir[:, c])[:N] for c in range(2)], axis=1)

mix = dry + wet * 0.55
# Duck everything except the transients themselves a touch, for the pump.
mix = mix * (0.55 + 0.45 * duck[:, None])
mix = filt(mix, "high", 28, 2)
mix = np.tanh(mix * 1.25)
fade = np.clip((DUR - tline) / 0.35, 0, 1) ** 1.5
mix *= fade[:, None]
mix *= np.minimum(tline / 0.01, 1)[:, None]
mix *= 0.89 / np.abs(mix).max()

out = os.path.join(os.path.dirname(__file__), "..", "public", "music.wav")
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype("<i2").tobytes())

rms = np.sqrt((mix**2).mean())
print(f"wrote {os.path.abspath(out)}  peak={np.abs(mix).max():.2f} rms={rms:.3f} ({20*np.log10(rms):.1f} dBFS)")
for bar in range(8):
    seg = mix[int(bt(bar) * SR) : int(bt(bar + 1) * SR)]
    print(f"  bar {bar}: rms {20*np.log10(np.sqrt((seg**2).mean())+1e-9):.1f} dB")
