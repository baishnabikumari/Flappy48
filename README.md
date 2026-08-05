# Flappy48
A flappy-bird style game crossed with the one and only 2048's merge mechanic, wrapped into a reactive art shell(particle field + chasing LED border) for the theme **ELECTROART**.

U fly a numbered tile through gates collect theme and grows you into a flying bird(if you got the same value you level up then), No end screen, no levels - its endless, and gets harfer the longer u survive.

## screenshos and demo



## Controls
- **Space**, **click**, or **tap** - flap

## How it plays
- Fly through the gates without clipping the walls.
- grab number(tiles)  sitting in the gaps:
  - Same values as your bird -> merge, your value gets double, score goes up.
  - Different value -> it joins a trailing chain behind you.
- Scroll speed and gate width both scale with your score, ramping up to a fixed maximum so it stays hard but fair, forever.

## Tech

- HTML, JS and CSS
- Live server



## Tuning
These constants at the top of the game.js control feels and difficulty - safe to adjust without touching the logic.

- `Gravity` -> how fast the bird falls.
- `Flap Power` -> how strong each flap is.
- `BASE_SCROLL_SPEED` / `MAX_SCROLL_SPEED` -> scroll speed range across the difficuty ramp.
- `BASE_GATE_GAP` / `MIN_GATE_GAP` -> gate gap size across the difficuty ramp.
- `DIFFICULTY_RAMP_SCORE` -> score at which difficulty hits its max(higher = more  forgiving ramp).

Thanks This was the Flappy48 ~ Made with 💖 by Me.