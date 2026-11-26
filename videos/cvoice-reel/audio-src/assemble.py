"""Pick best VO takes, assemble the voiceover, build timeline.json, synthesize music + SFX, mix.

Usage: python assemble.py <project_dir> [--edge] [--fake]

--edge uses the per-scene Microsoft neural voice clips from gen_edge.py (current default voice).
"""
import json, math, os, re, sys
import numpy as np
import soundfile as sf
from scipy.signal import lfilter, butter, sosfilt

PROJ = sys.argv[1]
FAKE = "--fake" in sys.argv
EDGE = "--edge" in sys.argv
BASE = os.path.join(PROJ, "audio-src")
SR = 44100
FPS = 30
segs = json.load(open(os.path.join(BASE, "segments.json")))

TRANS = {
    "hook": "cut", "stop": "flash", "save": "whipUp", "tease": "zoom", "logo": "iris",
    "features": "whipLeft", "process": "blur", "clone": "whipRight", "styles": "zoom",
    "dubbing": "whipUp", "buildup": "blur", "demo": "flash", "url": "whipLeft", "cta": "zoom",
}
NO_CAP = {"h2", "c3"}
HL_WORDS = {"CVoice.ai", "CVoice.ai!"}
PRE = 5  # scene starts this many frames before its first spoken word
LEAD = 0.12  # silence before first word
FORCE = {"f1": 1}  # takes pinned after an English-mode ASR check


def jround(x):  # JS Math.round
    return int(math.floor(x + 0.5))


def resample(y, sr_in, sr_out):
    if sr_in == sr_out:
        return y
    import librosa
    return librosa.resample(y, orig_sr=sr_in, target_sr=sr_out)


def norm_txt(t):
    return re.sub(r"[\s,.!?।\-–]", "", t)


def cer(a, b):
    a, b = norm_txt(a), norm_txt(b)
    d = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        prev, d[0] = d[0], i
        for j, cb in enumerate(b, 1):
            cur = d[j]
            d[j] = min(d[j] + 1, d[j - 1] + 1, prev + (ca != cb))
            prev = cur
    return d[len(b)] / max(1, len(b))


# ---------------- 1. voice ----------------
clips = {}
report = []
if EDGE:
    # One clip per scene; segment times come from the voice's word boundaries.
    import librosa
    order0 = []
    for s in segs:
        if s["scene"] not in order0:
            order0.append(s["scene"])
    last_gap = {s["scene"]: s["gap"] for s in segs}
    scene_audio, scene_segs = {}, {}
    for sc in order0:
        y, sr = librosa.load(os.path.join(BASE, "edge", sc + ".mp3"), sr=SR, mono=True)
        meta = json.load(open(os.path.join(BASE, "edge", sc + ".json")))
        st = min(v[0] for v in meta["segs"].values())
        en = max(v[1] for v in meta["segs"].values())
        a = max(0, int((st - 0.03) * SR))
        b = min(len(y), int((en + 0.07) * SR))
        yt = y[a:b].astype(np.float32)
        rms_ = np.sqrt(np.mean(yt ** 2)) + 1e-9
        yt *= 0.1 / rms_
        fl = int(0.01 * SR)
        yt[:fl] *= np.linspace(0, 1, fl)
        yt[-fl * 4:] *= np.linspace(1, 0, fl * 4)
        scene_audio[sc] = yt
        scene_segs[sc] = {k: (v[0] - a / SR, v[1] - a / SR) for k, v in meta["segs"].items()}
    t = LEAD
    seg_t = {}
    placements = []
    for sc in order0:
        placements.append((t, scene_audio[sc]))
        for k, (x0, x1) in scene_segs[sc].items():
            seg_t[k] = (t + x0, t + x1)
        t += len(scene_audio[sc]) / SR + last_gap[sc]
    total_s = t
    DUR = int(math.ceil(total_s * FPS))
    N = int(DUR / FPS * SR) + SR
    vo = np.zeros(N, np.float32)
    for t0, c in placements:
        a = int(t0 * SR)
        vo[a:a + len(c)] += c
    print("edge VO length %.2fs" % total_s)
elif not FAKE:
    import librosa
    from faster_whisper import WhisperModel
    asr = WhisperModel("small", device="cpu", compute_type="int8")
    for s in segs:
        best = None
        for take in ([FORCE[s["id"]]] if s["id"] in FORCE else range(2)):
            p = os.path.join(BASE, "takes", f"{s['id']}_{take}.wav")
            if not os.path.exists(p):
                continue
            y, sr = sf.read(p)
            if y.ndim > 1:
                y = y.mean(1)
            y = resample(y.astype(np.float32), sr, SR)
            yt, idx = librosa.effects.trim(y, top_db=36, frame_length=1024, hop_length=256)
            y16 = resample(yt, SR, 16000)
            out, _ = asr.transcribe(y16, language="hi", beam_size=3)
            txt = " ".join(o.text for o in out).strip()
            score = cer(txt, s["tts"])
            # long takes relative to text length usually carry babble
            exp = len(norm_txt(s["tts"])) * 0.072
            dur = len(yt) / SR
            if dur > exp * 1.8 + 0.4:
                score += 0.3
            if best is None or score < best[0]:
                best = (score, take, yt, txt)
        score, take, yt, txt = best
        report.append({"id": s["id"], "take": take, "cer": round(score, 3), "dur": round(len(yt) / SR, 2), "asr": txt})
        # loudness match + tiny fades
        rms = np.sqrt(np.mean(yt ** 2)) + 1e-9
        yt = yt * (0.1 / rms)
        fl = int(0.012 * SR)
        yt[:fl] *= np.linspace(0, 1, fl)
        yt[-fl * 3:] *= np.linspace(1, 0, fl * 3)
        clips[s["id"]] = yt
    json.dump(report, open(os.path.join(BASE, "take_report.json"), "w"), ensure_ascii=False, indent=1)
else:
    for s in segs:
        clips[s["id"]] = np.zeros(int(len(norm_txt(s["tts"])) * 0.07 * SR), np.float32)

if not EDGE:
    # global tempo: keep VO inside ~44 s
    vo_len = sum(len(c) for c in clips.values()) / SR + sum(s["gap"] for s in segs) + LEAD
    TEMPO = 1.0
    if vo_len > 45.0 and not FAKE:
        TEMPO = min(1.15, vo_len / 44.5)
        import librosa
        for k in clips:
            clips[k] = librosa.effects.time_stretch(clips[k], rate=TEMPO).astype(np.float32)
    print("raw VO length %.2fs, tempo %.3f" % (vo_len, TEMPO))

    # ---------------- 2. place VO + timeline ----------------
    t = LEAD
    seg_t = {}
    for s in segs:
        c = clips[s["id"]]
        seg_t[s["id"]] = (t, t + len(c) / SR)
        t += len(c) / SR + s["gap"]
    total_s = t
    DUR = int(math.ceil(total_s * FPS))
    N = int(DUR / FPS * SR) + SR
    vo = np.zeros(N, np.float32)
    for s in segs:
        a = int(seg_t[s["id"]][0] * SR)
        c = clips[s["id"]]
        vo[a:a + len(c)] += c

TL_segs = {}
for s in segs:
    a, b = seg_t[s["id"]]
    TL_segs[s["id"]] = {"s": jround(a * FPS), "e": jround(b * FPS), "cap": s["cap"]}

order = []
for s in segs:
    if s["scene"] not in order:
        order.append(s["scene"])
scenes = []
for i, sc in enumerate(order):
    first = next(s for s in segs if s["scene"] == sc)
    st = 0 if i == 0 else TL_segs[first["id"]]["s"] - PRE
    scenes.append({"id": sc, "s": st, "e": None, "trans": TRANS[sc]})
for i in range(len(scenes)):
    scenes[i]["e"] = scenes[i + 1]["s"] if i + 1 < len(scenes) else DUR

# words (proportional to letters inside each voiced segment)
words, groups = [], []
for s in segs:
    sg = TL_segs[s["id"]]
    ws = s["cap"].split(" ")
    weights = [max(1, len(norm_txt(w))) + 1.5 for w in ws]
    tot = sum(weights)
    acc = sg["s"]
    span = sg["e"] - sg["s"]
    seg_words = []
    for w, wt in zip(ws, weights):
        d = span * wt / tot
        wd = {"w": w, "s": jround(acc), "e": jround(acc + d), "seg": s["id"]}
        if w in HL_WORDS:
            wd["hl"] = True
        seg_words.append(wd)
        acc += d
    words += seg_words
    if s["id"] in NO_CAP:
        continue
    # chunk: <=3 words and <=20 letters
    cur = []
    for wd in seg_words:
        if cur and (len(cur) >= 3 or sum(len(x["w"]) for x in cur) + len(wd["w"]) > 20):
            groups.append(cur)
            cur = []
        cur.append(wd)
    if cur:
        groups.append(cur)
G = []
for i, g in enumerate(groups):
    st = g[0]["s"] - 3
    en = g[-1]["e"] + 8
    if i + 1 < len(groups):
        en = min(en, groups[i + 1][0]["s"] - 3)
    G.append({"s": st, "e": max(st + 6, en), "words": g})

timeline = {"fps": FPS, "duration": DUR, "segs": TL_segs, "scenes": scenes, "words": words, "groups": G}
json.dump(timeline, open(os.path.join(PROJ, "src", "timeline.json"), "w"), ensure_ascii=False, indent=1)
print("duration %.2fs (%d frames), %d scenes" % (DUR / FPS, DUR, len(scenes)))
for sc in scenes:
    print("  %-9s %4d-%4d  %.2fs  %s" % (sc["id"], sc["s"], sc["e"], (sc["e"] - sc["s"]) / FPS, sc["trans"]))

# ---------------- 3. SFX synthesis ----------------
rng = np.random.default_rng(7)


def env_exp(n, tau):
    return np.exp(-np.arange(n) / (tau * SR))


def lp(x, fc):
    sos = butter(2, fc / (SR / 2), "low", output="sos")
    return sosfilt(sos, x)


def hp(x, fc):
    sos = butter(2, fc / (SR / 2), "high", output="sos")
    return sosfilt(sos, x)


def bp(x, lo, hi):
    sos = butter(2, [lo / (SR / 2), hi / (SR / 2)], "band", output="sos")
    return sosfilt(sos, x)


def whoosh(d=0.42, lo=300, hi=5000):
    n = int(d * SR)
    x = rng.standard_normal(n)
    out = np.zeros(n)
    # sweeping band via chunks
    chunks = 24
    for k in range(chunks):
        a, b = k * n // chunks, (k + 1) * n // chunks
        c = lo + (hi - lo) * (math.sin(math.pi * k / chunks))
        out[a:b] = bp(x[max(0, a - 500):b], c * 0.6, min(c * 1.6, SR / 2 - 100))[-(b - a):]
    e = np.sin(np.linspace(0, math.pi, n)) ** 2
    return (out * e * 0.9).astype(np.float32)


def pop(f0=900, d=0.09):
    n = int(d * SR)
    tt = np.arange(n) / SR
    fr = f0 * np.exp(-tt * 18)
    ph = 2 * np.pi * np.cumsum(fr) / SR
    return (np.sin(ph) * env_exp(n, 0.025) * 0.7).astype(np.float32)


def click(d=0.02, bright=4000):
    n = int(d * SR)
    x = hp(rng.standard_normal(n), bright) * env_exp(n, 0.003)
    return (x * 0.5).astype(np.float32)


def tick():
    a = pop(2400, 0.04) * 0.6
    b = click(0.015, 6000)
    a[: len(b)] += b
    return a.astype(np.float32)


def impact(d=0.9, big=1.0):
    n = int(d * SR)
    tt = np.arange(n) / SR
    fr = 110 * np.exp(-tt * 6) + 38
    ph = 2 * np.pi * np.cumsum(fr) / SR
    body = np.sin(ph) * env_exp(n, 0.28)
    crack = lp(rng.standard_normal(n), 2500) * env_exp(n, 0.05)
    x = body * 1.0 + crack * 0.5
    return (np.tanh(x * 1.6 * big) * 0.85).astype(np.float32)


def coin(f0=2200):
    n = int(0.35 * SR)
    tt = np.arange(n) / SR
    x = (np.sin(2 * np.pi * f0 * tt) + 0.5 * np.sin(2 * np.pi * f0 * 1.5 * tt) + 0.3 * np.sin(2 * np.pi * f0 * 2.76 * tt))
    return (x * env_exp(n, 0.09) * 0.3).astype(np.float32)


def ding(f0=1320):
    n = int(1.1 * SR)
    tt = np.arange(n) / SR
    x = sum(a * np.sin(2 * np.pi * f0 * m * tt) * env_exp(n, 0.5 / m) for m, a in [(1, 1), (2.0, 0.4), (3.01, 0.25), (4.2, 0.12)])
    return (x * 0.32).astype(np.float32)


def riser(d=1.2):
    n = int(d * SR)
    x = rng.standard_normal(n)
    out = np.zeros(n)
    chunks = 30
    for k in range(chunks):
        a, b = k * n // chunks, (k + 1) * n // chunks
        c = 300 * (2 ** (5 * k / chunks))
        out[a:b] = bp(x[max(0, a - 500):b], c * 0.7, min(c * 1.4, SR / 2 - 100))[-(b - a):]
    tt = np.arange(n) / SR
    tone = np.sin(2 * np.pi * np.cumsum(200 * 2 ** (3 * tt / d)) / SR) * 0.25
    e = (np.arange(n) / n) ** 2
    return ((out * 0.8 + tone) * e * 0.8).astype(np.float32)


def shimmer():
    n = int(0.8 * SR)
    tt = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * f * tt + i) * env_exp(n, 0.25) for i, f in enumerate([2093, 2637, 3136, 4186]))
    return (x * 0.08 * np.minimum(1, tt * 40)).astype(np.float32)


def crash(d=1.6):
    n = int(d * SR)
    return (hp(rng.standard_normal(n), 5000) * env_exp(n, 0.45) * 0.35).astype(np.float32)


sfx = np.zeros(N, np.float32)


def put(sound, frame, gain=1.0, center=False):
    a = int(frame / FPS * SR)
    if center:
        a -= len(sound) // 2
    a = max(0, a)
    b = min(N, a + len(sound))
    sfx[a:b] += sound[: b - a] * gain


SC = {s["id"]: s for s in scenes}


def L(scene, local):
    return SC[scene]["s"] + local


def segl(scene, sid):
    return TL_segs[sid]["s"] - SC[scene]["s"], TL_segs[sid]["e"] - SC[scene]["s"]


W = whoosh()
for sc in scenes[1:]:
    tr = sc["trans"]
    if tr.startswith("whip") or tr in ("zoom", "blur"):
        put(W, sc["s"], 0.55 if tr != "blur" else 0.35, center=True)
    if tr == "flash":
        put(impact(1.1, 1.3), sc["s"], 0.9)

# hook
s_, e_ = segl("hook", "h1")
put(pop(700), L("hook", s_ + jround((e_ - s_) * 0.12) - 3), 0.8)
for i in range(3):
    put(tick(), L("hook", 6 + i * 6), 0.5)
for i in range(9):
    put(whoosh(0.25, 800, 4000), L("hook", 8 + i * 4), 0.12)
# save
for i in range(7):
    put(coin(2000 + 180 * i), L("save", 18 + i * 5), 0.8)
s_, e_ = segl("save", "h3")
put(pop(800), L("save", s_ + jround((e_ - s_) * 0.08) - 3), 0.7)
# tease
put(pop(500, 0.12), L("tease", 1), 0.8)
s_, e_ = segl("tease", "h4")
end_at = s_ + jround((e_ - s_) * 0.62)
put(pop(1100), L("tease", end_at - 4), 0.7)
# logo (iris)
put(riser(0.8), SC["logo"]["s"] - int(0.8 * FPS), 0.5)
put(impact(0.7, 0.8), SC["logo"]["s"] + 2, 0.55)
put(shimmer(), L("logo", 14), 1.0)
put(shimmer(), L("logo", 42), 0.8)
# features
for i, fid in enumerate(["f1", "f2", "f3", "f4"]):
    s_, _ = segl("features", fid)
    put(pop(650 + 120 * i), L("features", s_ - 4), 0.8)
    put(whoosh(0.22, 600, 3000), L("features", s_ - 6), 0.25)
s_, _ = segl("features", "m3")
put(ding(1568), L("features", s_ - 3), 0.5)
# process
s4, e4 = segl("process", "m4")
s5, _ = segl("process", "m5")
type_start = s4 + jround((e4 - s4) * 0.35)
fr = type_start
while fr < s5 + 2:
    put(click(0.02, 3000 + rng.integers(0, 2000)), L("process", fr), 0.35)
    fr += 2
put(tick(), L("process", s5 + 2), 0.9)
put(whoosh(0.3, 500, 3500), L("process", s5 + 4), 0.35)
put(pop(900), L("process", s5 + 12), 0.6)
# clone
dur_clone = SC["clone"]["e"] - SC["clone"]["s"]
put(riser(max(0.3, (max(20, dur_clone - 14) - 6) / FPS)), L("clone", 6), 0.25)
put(ding(1760), L("clone", max(20, dur_clone - 14)), 0.45)
# styles
dur_st = SC["styles"]["e"] - SC["styles"]["s"]
max_steps = max(1, (dur_st - 10) // 11)
for k in range(1, max_steps + 1):
    put(tick(), L("styles", 4 + k * 11), 0.8)
# dubbing
for i in range(3):
    put(pop(700 + 150 * i), L("dubbing", 14 + i * 8), 0.6)
# buildup -> demo riser
bu = SC["buildup"]
put(riser((SC["demo"]["s"] - bu["s"]) / FPS), bu["s"], 0.75)
# demo
put(crash(), SC["demo"]["s"], 0.8)
s3, _ = segl("demo", "r3")
s4d, e4d = segl("demo", "r4")
s5d, _ = segl("demo", "r5")
for at in [s3 - 3, s4d + jround((e4d - s4d) * 0.3) - 3]:
    put(whoosh(0.25, 500, 3000), L("demo", at), 0.3)
    put(impact(0.4, 0.6), L("demo", at + 8), 0.45)
put(impact(0.8, 1.0), L("demo", s5d + 4), 0.7)
put(ding(1320), L("demo", s5d + 4), 0.55)
# url
c2s, c2e = segl("url", "c2")
ts = c2s + jround((c2e - c2s) * 0.3)
for k in range(9):
    put(click(0.02, 3500), L("url", ts + 2 * k), 0.45)
load = ts + 18 + 3
put(pop(1000), L("url", load), 0.5)
put(tick(), L("url", load + 16), 1.0)
# cta
put(pop(600, 0.12), L("cta", 0), 0.8)
put(ding(1568), L("cta", 10), 0.55)
put(shimmer(), L("cta", 22), 1.0)

# ---------------- 4. music bed (124 BPM) ----------------
BPM = 124
beat = 60 / BPM
tt_all = np.arange(N) / SR


def kick_s():
    n = int(0.4 * SR)
    t_ = np.arange(n) / SR
    fr = 50 + 120 * np.exp(-t_ * 30)
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * env_exp(n, 0.13)


def clap_s():
    n = int(0.2 * SR)
    x = bp(rng.standard_normal(n), 900, 4000)
    e = env_exp(n, 0.05)
    for off in (0.0, 0.012, 0.024):
        k = int(off * SR)
        e[k:] += 0.6 * env_exp(n - k, 0.01)
    return x * e * 0.5


def hat_s():
    n = int(0.06 * SR)
    return hp(rng.standard_normal(n), 7000) * env_exp(n, 0.015) * 0.35


def saw(freq, n):
    t_ = np.arange(n) / SR
    return 2 * ((t_ * freq) % 1) - 1


KICK, CLAP, HAT = kick_s(), clap_s(), hat_s()
chords = [(57, [57, 60, 64]), (53, [53, 57, 60]), (48, [48, 52, 55]), (55, [55, 59, 62])]  # Am F C G
mid = lambda m: 440 * 2 ** ((m - 69) / 12)

drums = np.zeros(N); bass = np.zeros(N); keys = np.zeros(N); hats = np.zeros(N)


def add(buf, s, t0):
    a = int(t0 * SR)
    if a >= N:
        return
    b = min(N, a + len(s))
    buf[a:b] += s[: b - a]


n_beats = int(total_s / beat) + 8
for bi in range(n_beats):
    t0 = bi * beat
    add(drums, KICK, t0)
    if bi % 2 == 1:
        add(drums, CLAP, t0)
    add(hats, HAT, t0 + beat / 2)
    add(hats, HAT * 0.5, t0 + beat * 0.75)
    bar = (bi // 4) % 4
    root, triad = chords[bar]
    # offbeat bass
    nb = int(beat / 2 * SR)
    bs = lp(saw(mid(root - 12), nb), 600) * env_exp(nb, 0.12)
    add(bass, bs * 0.55, t0 + beat / 2)
    # 3-3-2 stabs on 16ths in each beat pair
    if bi % 2 == 0:
        for st16 in (0, 3, 6):
            nn = int(0.22 * SR)
            ch = sum(lp(saw(mid(m + 12) * (1 + d), nn), 2600) for m in triad for d in (-0.004, 0.004))
            add(keys, ch * env_exp(nn, 0.08) * 0.09, t0 + st16 * beat / 4)


def gate(buf, t_from, t_to, fade=0.02):
    a, b = int(t_from * SR), int(t_to * SR)
    f = int(fade * SR)
    g = np.ones(N)
    g[a:b] = 0
    g[max(0, a - f):a] = np.linspace(1, 0, min(f, a))
    g[b:b + f] = np.linspace(0, 1, min(f, N - b))
    return buf * g


fsec = lambda fr: fr / FPS
stop_a, stop_b = fsec(SC["stop"]["s"]), fsec(SC["save"]["s"])
bu_a, demo_a = fsec(SC["buildup"]["s"]), fsec(SC["demo"]["s"])
music_parts = {"drums": drums, "bass": bass, "keys": keys, "hats": hats}
for k in music_parts:
    music_parts[k] = gate(music_parts[k], stop_a, stop_b)
# buildup: drop kick + bass, keep hats + keys filtered, silence just before the drop
music_parts["drums"] = gate(music_parts["drums"], bu_a, demo_a)
music_parts["bass"] = gate(music_parts["bass"], bu_a, demo_a)
for k in ("keys", "hats"):
    music_parts[k] = gate(music_parts[k], demo_a - 0.25, demo_a)
# snare roll in buildup
roll_t = bu_a
step = beat / 2
while roll_t < demo_a - 0.3:
    prog = (roll_t - bu_a) / max(0.1, demo_a - bu_a)
    add(music_parts["drums"], CLAP * (0.25 + 0.6 * prog), roll_t)
    step = beat / 2 if prog < 0.4 else (beat / 4 if prog < 0.75 else beat / 8)
    roll_t += step
music = music_parts["drums"] * 0.8 + music_parts["bass"] + music_parts["keys"] + music_parts["hats"]
# crash on re-entry after stop
add(music, crash(1.2) * 0.6, stop_b)
# sidechain-ish pump on kick
pump = 1 - 0.35 * np.exp(-((tt_all % beat) / 0.09))
music *= pump
# end fade
end_a = fsec(SC["cta"]["s"]) + 1.0
fade_len = max(0.5, total_s - end_a)
fm = np.clip(1 - (tt_all - end_a) / fade_len, 0, 1)
music *= fm
music = np.tanh(music * 1.2) / 1.2

# ---------------- 5. mix ----------------
def rms(x):
    return np.sqrt(np.mean(x[np.abs(x) > 1e-4] ** 2)) if np.any(np.abs(x) > 1e-4) else 1.0


vo_g = 0.2 / rms(vo) if not FAKE else 0
mus_g = 0.035 / rms(music)
# duck music under voice (smoothed envelope)
venv = np.abs(vo)
venv = lfilter([1 - 0.9995], [1, -0.9995], venv)
venv = venv / (venv.max() + 1e-9)
duck = 1 - 0.45 * np.clip(venv * 4, 0, 1)
mix = vo * vo_g + music * mus_g * duck + sfx * 0.55
mix = mix[: int(DUR / FPS * SR)]
peak = np.max(np.abs(mix))
mix = np.tanh(mix / max(peak, 1e-6) * 1.1) * 0.89
os.makedirs(os.path.join(PROJ, "public", "audio"), exist_ok=True)
sf.write(os.path.join(PROJ, "public", "audio", "mix.wav"), np.stack([mix, mix], 1), SR)
if not FAKE:
    sf.write(os.path.join(BASE, "vo_only.wav"), vo[: len(mix)] * vo_g, SR)
print("mix written")
