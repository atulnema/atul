"""Generate the voiceover with Microsoft's neural Hindi voice, one clip per scene.

Each scene is spoken in a single pass so sentences flow naturally. Word
boundary events give us where each segment starts and ends inside the clip.

Usage: python gen_edge.py <audio-src dir> [rate] [pitch]
"""
import asyncio, json, os, sys
import certifi

# Route through the session proxy and trust its CA.
CA = "/root/.ccr/ca-bundle.crt"
if os.path.exists(CA):
    certifi.where = lambda: CA
import edge_tts
import edge_tts.communicate as ec

ec.certifi.where = certifi.where
PROXY = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")

BASE = sys.argv[1]
RATE = sys.argv[2] if len(sys.argv) > 2 else "+12%"
PITCH = sys.argv[3] if len(sys.argv) > 3 else "+2Hz"
VOICE = "hi-IN-MadhurNeural"
OUT = os.path.join(BASE, "edge")
os.makedirs(OUT, exist_ok=True)

segs = json.load(open(os.path.join(BASE, "segments.json")))
scenes = []
for s in segs:
    if not scenes or scenes[-1]["id"] != s["scene"]:
        scenes.append({"id": s["scene"], "segs": []})
    scenes[-1]["segs"].append(s)


async def gen(scene):
    text, ranges = "", []
    for s in scene["segs"]:
        if text:
            text += " "
        a = len(text)
        text += s["tts"]
        ranges.append((s["id"], a, len(text)))
    comm = edge_tts.Communicate(text, VOICE, rate=RATE, pitch=PITCH, boundary="WordBoundary", proxy=PROXY)
    words = []
    with open(os.path.join(OUT, scene["id"] + ".mp3"), "wb") as f:
        async for ch in comm.stream():
            if ch["type"] == "audio":
                f.write(ch["data"])
            elif ch["type"] == "WordBoundary":
                words.append((ch["offset"] / 1e7, (ch["offset"] + ch["duration"]) / 1e7, ch["text"]))
    # map each spoken word back to the segment it came from
    cursor, cur_seg = 0, ranges[0][0]
    seg_times = {}
    for st, en, w in words:
        idx = text.find(w, cursor)
        if idx >= 0:
            cursor = idx + len(w)
            for sid, a, b in ranges:
                if a <= idx < b:
                    cur_seg = sid
        t = seg_times.setdefault(cur_seg, [st, en])
        t[0], t[1] = min(t[0], st), max(t[1], en)
    missing = [sid for sid, _, _ in ranges if sid not in seg_times]
    json.dump({"segs": seg_times, "words": words, "missing": missing}, open(os.path.join(OUT, scene["id"] + ".json"), "w"), ensure_ascii=False, indent=1)
    print(scene["id"], "words", len(words), "segs", {k: [round(v[0], 2), round(v[1], 2)] for k, v in seg_times.items()}, "missing", missing, flush=True)


async def main():
    force = set(sys.argv[4].split(",")) if len(sys.argv) > 4 else set()
    for sc in scenes:
        done = os.path.join(OUT, sc["id"] + ".json")
        if os.path.exists(done) and sc["id"] not in force and "all" not in force:
            continue
        for attempt in range(5):
            try:
                await gen(sc)
                break
            except Exception as e:  # service hiccups: back off and retry
                print(sc["id"], "retry", attempt + 1, type(e).__name__, flush=True)
                await asyncio.sleep(2 + 3 * attempt)
        else:
            raise SystemExit(f"failed: {sc['id']}")


asyncio.run(main())
