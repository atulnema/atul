import sys, time, soundfile as sf, numpy as np, torch
torch.set_num_threads(4)
out = sys.argv[1]
line = "भाई, इलेवनलैब्स के लिए पैसे खर्च कर रहे हो? रुक जाओ! ये एआई टूल शायद तुम्हारा पैसा बचा सकता है।"
from kokoro import KPipeline
p = KPipeline(lang_code='h')
for v in ['hm_omega','hm_psi']:
    t=time.time()
    aud = np.concatenate([a.numpy() if hasattr(a,'numpy') else a for _,_,a in p(line, voice=v, speed=1.15)])
    sf.write(f"{out}/kokoro_{v}.wav", aud, 24000); print(v, len(aud)/24000, 's in', time.time()-t)
