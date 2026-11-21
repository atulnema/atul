# Synthesizes an original 30 s background track (music.wav) and UI click effects (sfx.wav).
# Pure numpy. Usage: python3 music.py <outdir>
import sys
import numpy as np
import soundfile as sf

SR = 44100
DUR = 30.0
N = int(SR * DUR)
out = sys.argv[1] if len(sys.argv) > 1 else "."
rng = np.random.default_rng(7)

BPM = 104
BEAT = 60 / BPM
BAR = BEAT * 4

def hz(m): return 440.0 * 2 ** ((m - 69) / 12)

# Am7 - Fmaj7 - Cmaj7 - G(add9)  (MIDI notes)
CHORDS = [
    [57, 60, 64, 67],   # A C E G
    [53, 57, 60, 64],   # F A C E
    [48, 52, 55, 59],   # C E G B
    [55, 59, 62, 69],   # G B D A
]
ROOTS = [45, 41, 48, 43]

def env_adsr(n, a, r):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    if na: e[:na] = np.linspace(0, 1, na)
    if nr: e[-nr:] *= np.linspace(1, 0, nr)
    return e

def place(buf, sig, t):
    s = int(t * SR)
    if s >= len(buf): return
    n = min(len(sig), len(buf) - s)
    buf[s:s + n] += sig[:n]

pad = np.zeros(N); bass = np.zeros(N); arp = np.zeros(N); drums = np.zeros(N)

nbars = int(np.ceil(DUR / BAR)) + 1
for b in range(nbars):
    t0 = b * BAR
    ch, root = CHORDS[b % 4], ROOTS[b % 4]

    # Pad: soft additive tones, two slightly detuned voices
    n = int((BAR + 0.6) * SR); tt = np.arange(n) / SR
    sig = np.zeros(n)
    for m in ch:
        f = hz(m)
        for det in (-0.12, 0.12):
            ff = f * 2 ** (det / 12 / 4)
            sig += np.sin(2 * np.pi * ff * tt) + 0.3 * np.sin(2 * np.pi * 2 * ff * tt) + 0.1 * np.sin(2 * np.pi * 3 * ff * tt)
    sig *= env_adsr(n, 0.5, 0.7) * (1 + 0.08 * np.sin(2 * np.pi * 0.5 * tt))
    place(pad, sig, t0)

    # Bass on beats 1 and 3
    for beat in (0, 2):
        n = int(BEAT * 1.8 * SR); tt = np.arange(n) / SR
        f = hz(root)
        sig = (np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(2 * np.pi * 2 * f * tt)) * np.exp(-tt * 2.2) * env_adsr(n, 0.01, 0.15)
        place(bass, sig, t0 + beat * BEAT)

    # Arp: 8th-note plucks over chord tones, an octave up
    pattern = [0, 1, 2, 3, 2, 1, 2, 3]
    for i, p in enumerate(pattern):
        n = int(0.6 * SR); tt = np.arange(n) / SR
        f = hz(ch[p] + 12)
        sig = (np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(2 * np.pi * 2 * f * tt) + 0.08 * np.sin(2 * np.pi * 3 * f * tt))
        sig *= np.exp(-tt * 7) * env_adsr(n, 0.003, 0.05) * (0.9 if i % 2 == 0 else 0.65)
        place(arp, sig, t0 + i * BEAT / 2)

    # Drums
    for beat in range(4):
        tb = t0 + beat * BEAT
        n = int(0.35 * SR); tt = np.arange(n) / SR
        freq = 45 + 75 * np.exp(-tt * 28)
        kick = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-tt * 9)
        place(drums, kick * 0.9, tb)
        n = int(0.06 * SR)
        noise = rng.standard_normal(n); noise = np.diff(noise, prepend=0)
        hat = noise * np.exp(-np.arange(n) / SR * 70)
        place(drums, hat * 0.12, tb + BEAT / 2)
    # light clap-ish snare on 2 and 4
    for beat in (1, 3):
        n = int(0.18 * SR); tt = np.arange(n) / SR
        noise = rng.standard_normal(n); noise = noise - np.convolve(noise, np.ones(8) / 8, mode="same")
        place(drums, noise * np.exp(-tt * 22) * 0.25, t0 + beat * BEAT)

# Simple stereo-ish echo on the arp (3/8 beat delay, feedback)
d = int(BEAT * 0.75 * SR)
wet = np.zeros(N)
src = arp.copy()
for k in range(1, 5):
    g = 0.38 ** k
    wet[d * k:] += src[:N - d * k] * g

def norm(x): return x / (np.abs(x).max() + 1e-9)

t = np.arange(N) / SR
# Arrangement: drums enter with step 1, drop out at outro
drum_gain = np.clip((t - 3.0) / 0.6, 0, 1) * np.clip((26.4 - t) / 0.5, 0, 1)
bass_gain = np.clip((t - 1.2) / 1.5, 0, 1)
arp_gain = np.clip((t - 0.2) / 1.0, 0, 1)

L = 0.42 * norm(pad) + 0.40 * norm(bass) * bass_gain + 0.30 * norm(arp) * arp_gain + 0.10 * norm(wet) * arp_gain + 0.30 * norm(drums) * drum_gain
R = 0.42 * norm(pad) + 0.40 * norm(bass) * bass_gain + 0.22 * norm(arp) * arp_gain + 0.16 * norm(np.roll(wet, int(0.011 * SR))) * arp_gain + 0.30 * norm(drums) * drum_gain

fade = np.clip(t / 0.8, 0, 1) * np.clip((DUR - t) / 2.0, 0, 1)
mix = np.stack([L * fade, R * fade], axis=1)
mix = np.tanh(mix * 1.2) / np.tanh(1.2)
mix = mix / np.abs(mix).max() * 0.9
sf.write(f"{out}/music.wav", mix.astype(np.float32), SR)

# UI clicks at the cursor clicks in the animation
sfx = np.zeros(N)
for tc in (4.5, 6.6, 13.95, 23.55):
    n = int(0.05 * SR); tt = np.arange(n) / SR
    click = (np.sin(2 * np.pi * 1800 * tt) * 0.6 + rng.standard_normal(n) * 0.15) * np.exp(-tt * 140)
    place(sfx, click, tc)
# soft success chime when the PR opens and when tests pass
for tc, notes in ((19.9, [76, 83]), (23.8, [79, 84, 88])):
    for i, m in enumerate(notes):
        n = int(0.9 * SR); tt = np.arange(n) / SR
        place(sfx, np.sin(2 * np.pi * hz(m) * tt) * np.exp(-tt * 5) * 0.25, tc + i * 0.07)
sfx = sfx / np.abs(sfx).max() * 0.7
sf.write(f"{out}/sfx.wav", np.stack([sfx, sfx], axis=1).astype(np.float32), SR)
print("ok")
