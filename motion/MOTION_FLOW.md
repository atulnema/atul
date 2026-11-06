# MOTION_FLOW.md: Alphastrix Digital

The motion rulebook for every Alphastrix video, reel and loop, whether it's generated in Google Flow or rendered from `motion.html`. The tokens come straight from the website's `tailwind.config.ts`, so the motion work and the site look like one brand.

## 1. Brand intake (answered)

| Question | Answer |
| --- | --- |
| Brand and purpose | Alphastrix Digital: a growth studio that runs SEO, performance ads, web builds and brand for businesses that want measurable results. |
| Audience | Founders and marketing leads at small and mid-sized businesses in India and abroad who are tired of agencies that can't show numbers. |
| Primary offer | Free growth consultation via the site's contact section. *Add the live URL before you publish.* |
| Emotional frequency | Premium, bold, technical |
| The one thing motion must never do | Show a number we can't back up. |

## 2. Tokens

| Role | Hex | Notes |
| --- | --- | --- |
| Ground (background) | `#07070A` | Near-black with a cool cast |
| Surface (cards / glass) | `#121219` | Frosted glass, 1px border at `rgba(242,239,233,0.10)` |
| Surface 2 (raised) | `#1C1C26` | Slats, pills, secondary panels |
| Ink (primary type) | `#F2EFE9` | Warm bone white, tight tracking (-2% to -4% on display sizes) |
| Muted (labels / grid) | `#9A98A6` | Captions, axis labels, gridlines at 4–8% opacity |
| Accent 1 (active focus) | `#C8FF4D` | Acid lime. The thing you want the eye on. One per frame. |
| Accent 2 (highlight / depth) | `#7C5CFF` | Iris violet. Glows, bars, secondary emphasis. |

**Type:** Inter Tight for display, Inter for UI text. Kickers are uppercase, 18–20px at 1080, with +2.5px tracking.

**Physics:** `cubic-bezier(0.16, 1, 0.3, 1)` for everything. It leaves fast and settles slowly, with no overshoot. Springs (ω 9, ζ 0.55) are allowed only where the brief explicitly asks for physical overshoot, as in the card fan.

**Loop contract:** 0–2.2s move, 2.2–6.6s hold with micro-motion, 6.6–8.0s return. Frame 8.0 is frame 0.

## 3. Negative list

- No typewriter animation on headlines. Typing is allowed only inside a UI input field, where it's what the product actually does.
- No rainbow or multi-hue gradients. Two-tone lime → violet is the ceiling.
- No bounce on anything except an explicitly requested spring effect.
- No invented numbers. Placeholder data carries an "Illustrative Data" tag until it's replaced.
- No stock people, no disembodied 3D hands, no purple-neon soup, no text touching a card edge.

## 4. Master Google Flow style reference prompt

Paste this ahead of any scene prompt to lock the look:

> Premium motion graphic for Alphastrix Digital, a growth marketing studio. Deep near-black ground #07070A with a faint 72px grid fading out from the centre and soft film grain. Frosted glass cards #121219 with a 1px warm-white border at 10% opacity and a thin specular highlight along the top edge. Typography is crisp bone white #F2EFE9 in a tight geometric sans (Inter Tight), with small uppercase lime kickers. Acid lime #C8FF4D marks the single focal element in every shot. Iris violet #7C5CFF gives depth: bars, glows and secondary shapes. Lighting is soft and volumetric, with a gentle violet bloom top-left and a faint lime bloom bottom-right. Motion is smooth deceleration (cubic-bezier 0.16, 1, 0.3, 1): elements arrive fast and settle softly, with no bounce, no jitter and no linear moves. During holds there is subtle ambient life such as a travelling light pulse or a slow sheen, never a frozen frame. One hero object fills 60–70% of the frame. Every word and number stays legible at a 240px-wide thumbnail.

## 5. Master negative prompt

> amateur motion graphics, typewriter headline animation, cartoon bounce, rubbery overshoot, rainbow gradient, purple-to-blue neon soup, low-resolution UI, blurry text, invented numbers, fake metrics, stock photo people, disembodied 3D hands, cluttered screen, text clipping card edges, harsh cuts, jitter, flicker, distorted typography, clip art, third-party logos

## 6. The 8-part architecture, filled in for Alphastrix

1. **The bar:** keynote-grade product film. Tactile, physical, micro-detailed.
2. **Format:** 1080×1350 (LinkedIn / Instagram feed), 1080×1920 (Reels), or 1920×1080 (site / YouTube). 30fps, 8-second seamless loop.
3. **The one rule:** one hero object at 60–70% of frame that goes through one satisfying change.
4. **Look:** the tokens above, frosted glass depth, 1px specular rim, bold Inter Tight.
5. **Motion:** house curve, spring only where requested, continuous ambient life in the hold.
6. **Negative constraints:** section 3.
7. **Self-audit:** pause at 4.4s. The headline and the hero value must read at 240px wide. `node motion/render.mjs --effect <name> --still 4.4` produces exactly that frame and its 240px thumbnail.
8. **The scene:** two or three sentences on camera, the hero's change, and the return.

## 7. Notes on the source prompt pack

The pack is solid, but a few prompts break its own rules. Fix these before a client sees the output:

- **#12 Model Showdown** hardcodes "+34% Faster & More Coherent". That's an invented metric, the exact thing the pack bans elsewhere. Replace it with a result you measured, or tag it "Illustrative". The model names it lists will also go stale fast.
- **#6 Launch Film, Shot 4** shows a "100% Brand Aligned" badge. Unless you can prove it, it's a claim, not a status. Use "Reviewed" or a real check.
- **Typewriter text** is on the negative list, yet #6 Shot 3 and effect 02 type text. Both are fine if the typing happens inside an input field (that's real UI behaviour), so the rule above is scoped that way.
- **"No bounce"** conflicts with effect 07's overshoot. It's allowed there and nowhere else.
- **Named styles** (Apple Keynote, Cupertino, Vox, Johnny Harris) work as prompt shorthand, but for work you publish, describe the look instead of naming the brand. You get the same result without borrowing someone else's identity.
- **The reference tokens in the pack** (electric blue / cyan) are not Alphastrix colours. `motion.html` ships both sets: `?brand=alphastrix` (default) and `?brand=flow`.
