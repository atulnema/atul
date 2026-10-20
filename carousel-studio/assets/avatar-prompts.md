# Avatar generation prompts (Nano Banana / Gemini)

Run these **in a single Gemini chat thread**, in order. Doing it in one
thread (rather than 5 fresh prompts) is what keeps the face/outfit
consistent across poses — each new prompt builds on the model's own
previous output.

Source photo: `7685028d-1000418146.jpg` (face, glasses, beard, arms-crossed
shot — good base reference).

Style locked in: flat vector with soft cel-shading, electric-blue (#2D6CFF)
accents on neutral streetwear, plain flat light-gray background (so the
background is trivial to key/remove later).

---

## 1. Base character + pose: casual

Attach the source photo, then send:

> Using the attached photo as the exact likeness reference, create a
> full-body flat modern vector-style cartoon character of this person.
> Preserve their real face shape, skin tone, short black hair, full beard,
> and round glasses exactly as shown. Style: bold flat color shapes, soft
> cel-shading for subtle depth, thin dark outline, minimal gradients,
> friendly and confident expression, modern app-illustration / mascot
> style. Outfit: casual streetwear — fitted gray crewneck t-shirt with
> electric-blue (#2D6CFF) trim on the collar and sleeve cuffs, dark jeans,
> white sneakers with electric-blue accents. Background: plain flat solid
> light-gray (#E5E5E5), no shadow, no texture. Pose: standing relaxed in a
> 3/4 view, hands at sides, weight on one leg, warm confident smile, full
> body visible from head to shoe, centered in frame, portrait orientation.

Save the result as `assets/pose-casual-raw.png`.

## 2. Pose: pointing

In the **same thread**, send:

> Same character, same exact face, hair, beard, glasses, outfit, and flat
> cartoon style, same plain light-gray background. New pose: pointing
> forward with the right hand as if presenting or explaining something off
> to the side, body angled slightly toward the point, confident
> expression, full body visible, centered, portrait orientation.

Save as `assets/pose-pointing-raw.png`.

## 3. Pose: victory

> Same character, same style and background. New pose: one arm raised
> with a fist in a victory gesture, big confident smile, slight forward
> lean, full body visible, centered, portrait orientation.

Save as `assets/pose-victory-raw.png`.

## 4. Pose: arms-crossed

> Same character, same style and background. New pose: arms crossed over
> the chest, relaxed confident stance, subtle smile, full body visible,
> centered, portrait orientation.

Save as `assets/pose-arms-crossed-raw.png`.

## 5. Pose: holding phone

> Same character, same style and background. New pose: holding a
> smartphone in one hand at chest height, looking slightly down at the
> screen, other arm relaxed at the side, full body visible, centered,
> portrait orientation.

Save as `assets/pose-phone-raw.png`.

---

## Notes

- Download each image at the highest resolution Gemini offers.
- Keep the background a flat, untextured color (light gray as specified)
  — this makes automated background removal far more reliable than a
  photo-real or gradient background.
- Once all 5 are generated, send them back (attach in chat, or drop the
  files somewhere I can read them) and the background-removal step turns
  them into `assets/pose-<name>-cutout.png` transparent PNGs.
