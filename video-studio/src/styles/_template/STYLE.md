# STYLE: <name>

Every number in this file is measured from the reference reel with a script in `scripts/`.
If a cell cannot be measured, write "not measured" and say why. Do not estimate.

## Source

| | |
| --- | --- |
| Creator | @handle |
| Reel | title or link |
| File | `input/reel.mp4` |
| Size, frame rate, length | 1080x1920, 30 fps, 0.0 s (`frames.py info`) |
| Measured on | YYYY-MM-DD |

Credit the creator on screen and in the caption whenever their reel is shown.

## Fonts

From `font_match.py`. Score is the overlap with the reel's pixels, 0 to 1.

| Role | Font | File in `public/fonts/` | Weight / style | Score | Runner-up (score) | Sample word, frame |
| --- | --- | --- | --- | --- | --- | --- |
| Title | | | | | | |
| Caption | | | | | | |
| Label | | | | | | |

## Colours

From `colors.py`. Note the frame and point or box each one was sampled at.

| Use | Hex | Sampled at |
| --- | --- | --- |
| Text on dark footage | | |
| Text on light footage | | |
| Caption box | | |
| Caption text | | |
| Label box | | |
| Label text | | |
| Card background | | |
| Card border | | |

## Captions

From `measure_text.py` and `font_match.py`, on at least three different caption frames.

| Property | Value | Evidence |
| --- | --- | --- |
| Font size (px) | | |
| Box top / bottom (y, px) | | |
| Box padding left and right (px) | | |
| Box corner radius (px) | | |
| Letter spacing (px) | | |
| Alignment | | |
| Words on screen at once | | |
| Page length (ms) | | |
| Highlight | karaoke / current word | |
| Opacity of unlit words | | |

## Titles

| Property | Value | Evidence |
| --- | --- | --- |
| Line width (px) | | |
| Top of first line (y, px) | | |
| Line pitch / font size | | |
| Letter spacing (em) | | |
| Case | | |
| Alignment | | |

## Labels and cards

| Property | Value | Evidence |
| --- | --- | --- |
| Label font size (px) | | |
| Label letter spacing (em) | | |
| Label padding x / y (px) | | |
| Label corner radius (px) | | |
| Card corner radius (px) | | |
| Card border width (px) | | |

## Motion

From `motion.py`, timed on the source frames. Give both frames and seconds.

| Element | What moves | Distance (px) | Duration (frames / s) | Easing | Stagger | Window measured |
| --- | --- | --- | --- | --- | --- | --- |
| Title letters | | | | | | |
| Caption words | | | | | | |
| Card in | | | | | | |
| Card out | | | | | | |

## Transitions

| Transition | In (frames / s) | Hold (frames / s) | Out (frames / s) | Peak blur (px) | Direction | Window measured |
| --- | --- | --- | --- | --- | --- | --- |
| | | | | | | |

## Rhythm

| Property | Value |
| --- | --- |
| Shots per 10 s | |
| Longest pause left in speech (s) | |
| Graphics on screen at once | |
| When a graphic enters | on the word that names it / other |
| Music and sound hits | |

## Grade

From `grade.py measure`, footage only: list the `--exclude` boxes and `--range` used.

| Property | Reel |
| --- | --- |
| Black point / white point | |
| Tone curve p10 / p25 / p50 / p75 / p90 | |
| Shadows (colour, tint) | |
| Mids (colour, tint) | |
| Highlights (colour, tint) | |
| Saturation | |
| Hues used | |
| Hues absent | |
| Skin luma | |

LUT: `look.cube`, built for `<clip>` at strength `<0-1>`. A LUT maps one clip onto the look,
so rebuild it for footage shot in a different room or light.

## Rebuild check

From `compare.py`. A style is done when every row passes at 3 px or better.

| Reel frame | Element | Worst edge error (px) | Colour error (/255) | Overlap (IoU) | Result |
| --- | --- | --- | --- | --- | --- |
| | | | | | |
