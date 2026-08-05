# Flappy48
A flappy-bird style game crossed with the one and only 2048's merge mechanic, wrapped into a reactive art shell(particle field + chasing LED border) its like an **ELECTROART**.

U fly a numbered tile through gates collect theme and grows you into a flying bird(if you got the same value you level up then), No end screen, no levels - its endless, and gets harfer the longer u survive.

The LED border and particle field aren't just pretty bits, they're dynamically generated from your game, your score controls the chase speed, your score + a trigger = gold flash, crash = red flash.

## screenshos and demo

<img width="1440" height="710" alt="Screenshot 2026-08-05 at 7 35 02 AM" src="https://github.com/user-attachments/assets/a73b5e9b-549a-4ffe-9a85-2801fa9a893d" />

<img width="1440" height="718" alt="Screenshot 2026-08-05 at 7 36 21 AM" src="https://github.com/user-attachments/assets/828a54e9-7f70-4cb5-bff3-b2649299e3c5" />

<img width="1440" height="710" alt="Screenshot 2026-08-05 at 7 36 52 AM" src="https://github.com/user-attachments/assets/ee1cbbdd-7558-464c-b75a-55e55a7728f9" />

https://github.com/user-attachments/assets/bdd90aa7-1ba1-4a09-ab63-8c29859c61d7

**Note(Ai declaration)** - i haven’t used AI in the project.

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
