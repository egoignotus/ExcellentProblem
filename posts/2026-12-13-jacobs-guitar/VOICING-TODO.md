# Guitar voicing follow-up

## Problem

The generated chord voicings are physically compact but are not always
musically well balanced. `findVoicing()` currently rewards open strings,
small fret spans, low positions, sounding strings, and a root in the bass.
It does not evaluate how often each chord degree is duplicated or whether
two strings produce the exact same pitch.

### Example: five-string G minor

The current selector chooses:

```text
String: D2  A2  E3   A3  D4
Fret:    5   5   6    5   0
Note:   G2  D3  B♭3  D4  D4
```

This plays D4 twice in unison and produces three Ds overall. The open D4 is
favored by the open-string reward even though this alternative is more
balanced:

```text
String: D2  A2  E3   A3  D4
Fret:    5   5   6    5   5
Note:   G2  D3  B♭3  D4  G4
```

The alternative retains the compact shape while balancing the chord as two
Gs, two Ds, and one B♭.

## Proposed fix

Improve `findVoicing()` in `guitar_visual.js` rather than adding individual
overrides for every affected chord:

1. Strongly penalize exact pitch-and-octave duplicates.
2. Penalize repeated fifths more than repeated roots.
3. Reward balanced coverage of chord degrees.
4. Prefer a root in the highest voice when otherwise comparable, without
   making it mandatory.
5. Reduce the current open-string reward so resonance does not dominate
   chord structure.
6. Treat the root, third, seventh, and extensions as more important than the
   fifth.
7. For five-note extended chords on the five-string instrument, permit the
   fifth to be omitted before omitting a defining chord tone.
8. Preserve the existing ergonomic constraints and conventional,
   manually-defined basic shapes for the six-string guitar.

## Acceptance checks

- Five-string G minor selects `5-5-6-5-5` rather than `5-5-6-5-0`.
- No generated shape contains an avoidable exact unison duplicate.
- Major and minor shapes always contain their root, third, and fifth.
- Seventh chords contain their root, third, and seventh.
- Ninth and 7♯9 shapes retain their defining seventh and ninth; the fifth may
  be omitted when necessary.
- Generated shapes remain playable within the displayed fret range and the
  configured maximum fret span.
- Basic six-string chord shapes remain unchanged.
