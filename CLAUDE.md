# FootballIQ / Next Level Academy — Claude Code Rules

## Absolute rule: Card frame is locked

The player card frame is now locked.

Do NOT modify the frame system unless Thomas explicitly writes:

UNLOCK FRAME

Protected frame-related items:

- frame.SAFE.svg
- any SVG path data
- SVG viewBox
- SVG preserveAspectRatio
- .card-wrapper
- .card-frame
- .card-frame svg
- frame container width
- frame container height
- frame aspect-ratio
- frame transform/scale
- frame overflow/cropping
- the card frame bottom shape
- the card geometry

The frame geometry is the visual source of truth.

Never redesign it.
Never resize it.
Never crop it differently.
Never change its SVG.
Never change its aspect-ratio.
Never change preserveAspectRatio.

## Allowed card changes

You may edit only content layers unless told otherwise:

- OVR / rating
- position text
- player name
- stats labels
- stats values
- badge
- tier text
- player image
- glow/effects outside the locked frame geometry
- colors/tier themes, as long as frame geometry is not changed

## Work style

Make small, isolated changes.

Before changing layout, identify the active selectors first.

Never commit or push unless Thomas explicitly approves it.

If a requested change would require touching protected frame rules, stop and ask Thomas first.

## Current locked frame state

The frame is currently visually accepted.
Do not change it.

Only content inside/around the frame should be adjusted from now on.
