# PIXELPET Sprite Generation Prompts

Generate each sprite as a separate **64×64px PNG** with a **transparent background**.

**Style rules (apply to every sprite):**
- Pixel art, hard-edged pixels, no anti-aliasing
- Strict Game Boy Color 4-tone palette only: `#0f380f` `#306230` `#8bac0f` `#9bbc0f`
- No additional colours, no gradients, no dithering
- Consistent character identity across all stages — the pet evolves from the same creature
- Facing forward, centred in the 64×64 frame
- Character occupies roughly 48×48px of the canvas; leave a clear transparent border
- Transparent background (not white, not filled)

---

## egg.png

A cracked egg, 64×64px pixel art. Game Boy 4-tone palette only (#0f380f #306230 #8bac0f #9bbc0f). Transparent background. The egg is oval, slightly taller than wide, centred. A jagged crack runs down the upper-left side of the shell. Through the crack a soft inner glow shows (lightest palette tone #9bbc0f). The shell itself uses mid-tones (#8bac0f, #306230) with the darkest tone (#0f380f) for the outline and crack edges. The egg sits on a tiny surface suggestion (1–2 pixel baseline). No text, no extra decorations.

---

## baby_a.png

Frame A of a baby pixel pet, 64×64px pixel art. Game Boy 4-tone palette only (#0f380f #306230 #8bac0f #9bbc0f). Transparent background. The pet is a tiny round blob creature, about 20px wide and 20px tall, centred low in the frame. Two small black dot eyes (darkest tone). Tiny curved smile. Stubby nub feet. Body is mostly mid-tones with a highlight spot (lightest tone) on top. Idle resting pose — feet flat on implied ground line.

---

## baby_b.png

Frame B of a baby pixel pet, 64×64px pixel art. Game Boy 4-tone palette only (#0f380f #306230 #8bac0f #9bbc0f). Transparent background. Identical character to baby_a but the body is shifted 2px upward (mid-bounce), feet lifted slightly off the ground, suggesting a tiny idle bob animation. Same dot eyes and smile. The bounce gives a 2-frame loop with baby_a.

---

## child_a.png

Frame A of a child-stage pixel pet, 64×64px pixel art. Game Boy 4-tone palette only (#0f380f #306230 #8bac0f #9bbc0f). Transparent background. The evolved form of the baby: slightly taller (≈26px tall), body is rounder with a wider head. Rounder, larger eyes (2×2px squares, dark outline with lighter interior). Small stubby arms visible on the sides. Short legs. Idle standing pose, weight evenly balanced. Friendly expression.

---

## child_b.png

Frame B of a child-stage pixel pet, 64×64px pixel art. Game Boy 4-tone palette only (#0f380f #306230 #8bac0f #9bbc0f). Transparent background. Same character as child_a but with a slightly wider smile (mouth open one pixel), arms raised 1–2px higher, slight weight shift to one foot — creates a gentle sway loop with child_a.

---

## teen_a.png

Frame A of a teen-stage pixel pet, 64×64px pixel art. Game Boy 4-tone palette only (#0f380f #306230 #8bac0f #9bbc0f). Transparent background. The evolved form of the child: taller (≈32px), slimmer torso, spiky hair detail on the head (3–4 upward pixel spikes using darkest tone). Narrowed eyes (horizontal line eyes conveying attitude). Small diagonal smirk. Crossed or slightly angled arms. Slightly slouched idle pose suggesting teenage attitude.

---

## teen_b.png

Frame B of a teen-stage pixel pet, 64×64px pixel art. Game Boy 4-tone palette only (#0f380f #306230 #8bac0f #9bbc0f). Transparent background. Same character as teen_a. Spiky hair slightly shifted. Expression changes to a half-smirk / raised eyebrow look (one eye 1px higher). Weight shifted to opposite foot compared to teen_a. Loops with teen_a for a cool idle animation.

---

## adult_a.png

Frame A of an adult-stage pixel pet, 64×64px pixel art. Game Boy 4-tone palette only (#0f380f #306230 #8bac0f #9bbc0f). Transparent background. Fully grown version: ≈38px tall, stockier broader shoulders, well-defined head. Round confident eyes (2×2px with bright #9bbc0f highlight dot). Clear upward smile. Arms at sides, slightly out. Proud, balanced stance. This is the default idle frame.

---

## adult_b.png

Frame B of an adult-stage pixel pet, 64×64px pixel art. Game Boy 4-tone palette only (#0f380f #306230 #8bac0f #9bbc0f). Transparent background. Same character as adult_a. Smile is one pixel wider. One arm slightly raised. Feet together instead of apart. Weight shifted slightly creating a gentle sway loop with adult_a.

---

## sleeping.png

Sleeping adult pixel pet, 64×64px pixel art. Game Boy 4-tone palette only (#0f380f #306230 #8bac0f #9bbc0f). Transparent background. Same adult body as adult_a but: eyes replaced with two short horizontal lines (closed). Relaxed slight smile. Body tilted slightly or curled. Two or three small "Z" letters (pixel font, lightest tone #9bbc0f) floating upper-right of the character, decreasing in size. Peaceful resting pose.

---

## sick.png

Sick adult pixel pet, 64×64px pixel art. Game Boy 4-tone palette only (#0f380f #306230 #8bac0f #9bbc0f). Transparent background. Same adult body but: eyes are half-closed or swirly (X or spiral dots). Mouth in a downward wavy line. Two or three small sweat drops (lightest tone #9bbc0f, teardrop shape) flying off the head. Body slightly hunched forward. The overall impression is queasy and unwell.

---

## dead.png

Dead adult pixel pet, 64×64px pixel art. Game Boy 4-tone palette only (#0f380f #306230 #8bac0f #9bbc0f). Transparent background. The adult pet lying flat on its back: body horizontal, occupying the lower half of the canvas. X eyes (two small X shapes made of the darkest tone). Mouth as a flat line or small downward arc. Tiny "+" or star above the character (classic dead indicator). Still recognisable as the same character. Sombre but not gruesome.

---

## happy.png

Happy adult pixel pet, 64×64px pixel art. Game Boy 4-tone palette only (#0f380f #306230 #8bac0f #9bbc0f). Transparent background. Same adult body as adult_a but: eyes are large sparkling arcs (happy closed-eye crescents, or wide-open with #9bbc0f highlight dots). Big wide U-shaped smile. Small shine or sparkle symbols (4-pixel star crosses, lightest tone) in the upper corners of the frame. Arms raised in celebration. Exuberant, joyful energy.

---

## hungry.png

Hungry adult pixel pet, 64×64px pixel art. Game Boy 4-tone palette only (#0f380f #306230 #8bac0f #9bbc0f). Transparent background. Same adult body but: eyes drooped downward (sad), small frown, body slightly hunched. An empty pixel-art bowl is visible in front of / below the character — simple rounded rectangle with a horizontal line suggesting emptiness. The pet is staring at the empty bowl. Clearly conveys longing/hunger.

---

## play.png

Playing adult pixel pet mid-jump, 64×64px pixel art. Game Boy 4-tone palette only (#0f380f #306230 #8bac0f #9bbc0f). Transparent background. The adult pet in a dynamic mid-air jump pose: body centred high in the frame, legs bent or spread apart, arms raised wide. Excited large eyes (wide open with highlight), big grin. Small motion lines (2–3 short pixel dashes) below the feet to suggest upward movement. The character is lifted off the ground.

---

## feed.png

Adult pixel pet eating animation, 64×64px pixel art. Game Boy 4-tone palette only (#0f380f #306230 #8bac0f #9bbc0f). Transparent background. The adult pet with one arm raised, hand near open mouth, in the act of eating. A small pixel food item (round blob or bite shape, lightest tone) is visible near the mouth. Eyes are happy half-crescents (eating happily). Mouth is open in a round O shape mid-chew. The other arm rests at the side. Conveys contentment and active eating.
