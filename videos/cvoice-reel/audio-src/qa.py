import sys, glob, os, numpy as np, librosa
from faster_whisper import WhisperModel
m = WhisperModel("small", device="cpu", compute_type="int8")
for f in sorted(sys.argv[1:]):
    y, sr = librosa.load(f, sr=16000)
    segs,_ = m.transcribe(f, language="hi", beam_size=3)
    txt = " ".join(s.text for s in segs)
    f0,_,_ = librosa.pyin(y, fmin=60, fmax=400, sr=sr)
    f0 = f0[~np.isnan(f0)]
    rms = librosa.feature.rms(y=y)[0]
    print(f"{os.path.basename(f):22s} dur={len(y)/sr:.2f}s f0med={np.median(f0):.0f}Hz f0std={np.std(12*np.log2(f0/np.median(f0))):.2f}st rmsCV={rms.std()/rms.mean():.2f}\n   -> {txt}")
