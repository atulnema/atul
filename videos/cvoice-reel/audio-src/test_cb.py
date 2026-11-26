import sys, time, torch, torchaudio as ta
torch.set_num_threads(4)
out = sys.argv[1]
from chatterbox.mtl_tts import ChatterboxMultilingualTTS
t=time.time(); m = ChatterboxMultilingualTTS.from_pretrained(device="cpu"); print("load", time.time()-t)
line = "भाई, इलेवनलैब्स के लिए पैसे खर्च कर रहे हो? रुक जाओ!"
for ref in ['hm_omega','hm_psi']:
    t=time.time()
    w = m.generate(line, language_id="hi", audio_prompt_path=f"{out}/kokoro_{ref}.wav", exaggeration=0.75, cfg_weight=0.35, temperature=0.8)
    ta.save(f"{out}/cb_{ref}.wav", w, m.sr); print(ref, w.shape[-1]/m.sr, "s in", time.time()-t)
