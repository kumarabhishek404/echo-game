# Tuning

All gameplay numbers live in `src/game/core/config.ts`. Change them there. Tests that lock the 10 second delay and the grace windows read this config, so update those assertions if you change the timings.

## Feel

| Field | Default | Effect |
| --- | --- | --- |
| `playerMaxSpeed` | 360 points/second | Caps how fast the orb can chase the finger |
| `playerResponse` | 14 | Higher feels tighter. Speed is still capped |
| `playerRadius` | 16 | Body size and arena inset |

A one-second drag across an open arena cannot move farther than `playerMaxSpeed`.

## Echoes

| Field | Default | Effect |
| --- | --- | --- |
| `echoDelaysSec` | 10, 20, 30, 40, 50 | When each echo appears, and how far back it reads |
| `maxEchoes` | 5 | On-screen cap. Extra delays are ignored |
| `echoTelegraphSec` | 0.7 | Visible, non-lethal ring |
| `echoInvulnSec` | 0.85 | Still non-lethal after the telegraph |
| `echoOverlapGraceSec` | 0.6 | Extra non-lethal time if the body still overlaps the player |
| `echoTrailLength` | 8 | Decorative dots. Not used by collision |
| `historyPaddingSec` | 2 | Buffer is the longest delay plus this |

Do not set a delay longer than the buffer. The echo will refuse to spawn rather than replay a wrapped slot. Delays are distinct so echoes are not stacked on one sample.

`hazardsEnabled` is false. Leave it false until the echo loop is the difficulty you want. `updateHazards` is the only hook for later arena hazards.

## Collectibles and score

| Field | Default | Effect |
| --- | --- | --- |
| `collectibleCount` | 4 | How many diamonds are kept on the field |
| `edgeMargin` | 28 | Extra inset beyond the diamond radius |
| `minSpawnGap` | 36 | Separation from echoes and other diamonds |
| `spawnPressurePerEcho` | 10 | Added to the player clearance as echoes appear, capped at 28% of the short arena side |
| `scorePerSecond` | 10 | Survival component |
| `scorePerEnergy` | 100 | Pickup component |
| `pickupPadding` | 6 | Extra collection reach |

Score is `floor(seconds * scorePerSecond + energy * scorePerEnergy)`.

If a diamond cannot find a fair point, it waits and tries again. It will not spawn on the player, an echo, another diamond, or in the margin.

## Session

`countdownSec` in config documents a 3-step resume. The overlay waits 1 second between 3, 2, and 1. Restart skips that countdown.

Reduced motion removes trails, ambient particles, and the telegraph pulse. Sound and haptics are independent toggles.
