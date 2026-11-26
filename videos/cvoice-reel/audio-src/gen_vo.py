import sys, json, os, time, torch, torchaudio as ta
torch.set_num_threads(4)
base = sys.argv[1]; ref = sys.argv[2]
segs = json.load(open(f"{base}/segments.json"))
os.makedirs(f"{base}/takes", exist_ok=True)
from chatterbox.mtl_tts import ChatterboxMultilingualTTS
m = ChatterboxMultilingualTTS.from_pretrained(device="cpu")
only = set(sys.argv[3].split(",")) if len(sys.argv) > 3 else None
for s in segs:
    if only and s["id"] not in only: continue
    for take in range(2):
        p = f"{base}/takes/{s['id']}_{take}.wav"
        if os.path.exists(p) and not only: continue
        torch.manual_seed(1000*take + hash(s["id"]) % 997 + (7 if only else 0))
        t = time.time()
        w = m.generate(s["tts"], language_id="hi", audio_prompt_path=ref, exaggeration=0.75, cfg_weight=0.35, temperature=0.8)
        ta.save(p, w, m.sr); print(s["id"], take, round(w.shape[-1]/m.sr,2), "s", round(time.time()-t,1), flush=True)
print("GEN_DONE")
