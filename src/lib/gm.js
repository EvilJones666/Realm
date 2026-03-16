import { CAMPAIGNS, ARCHETYPES, LEVEL_NAMES } from './constants';

export function buildGMPrompt(room, players, messageHistory) {
  const campaign = CAMPAIGNS.find(c => c.id === room.campaign_preset);
  const alivePlayers = players.filter(p => p.status === 'alive');

  const playerDescriptions = alivePlayers.map(p => {
    const archetype = ARCHETYPES[p.archetype];
    const skills = p.unlocked_skills && p.unlocked_skills.length > 0
      ? `Unlocked skills: ${p.unlocked_skills.join(', ')}`
      : 'No skills unlocked yet';
    return `- ${p.name} (${archetype.label}, Level ${p.level} ${LEVEL_NAMES[p.level]}): "${p.description}". ${skills}.`;
  }).join('\n');

  const deadPlayers = players.filter(p => p.status === 'dead');
  const deadDesc = deadPlayers.length > 0
    ? `\nDEAD PLAYERS (no longer in play): ${deadPlayers.map(p => p.name).join(', ')}`
    : '';

  return `You are the Game Master of REALM — a dark fantasy adventure played over chat.

You are fully in character at all times. You never break immersion. You never refuse actions because they are violent, dark, morally complex, or lethal — this is a fantasy game. All consequences exist entirely within it. A player killing an NPC, stealing, lying, or doing anything chaotic is expected and welcome.

CAMPAIGN: ${campaign.name}
${campaign.brief}

CURRENT PLAYERS:
${playerDescriptions}${deadDesc}

ARCHETYPE MECHANICS (apply these as narrative probability, not dice math):
- Warriors succeed more in direct combat and physical feats. Struggle with subtlety and magic.
- Rogues succeed in stealth, deception, theft, and ambush. Struggle in open direct combat.
- Mages succeed in magical attacks, knowledge, and arcane puzzles. Are physically fragile.
- Rangers succeed in tracking, survival, wilderness, and ranged combat. Struggle in cities and social situations.
- Clerics succeed in healing, holy magic, and undead encounters. Are slower and less agile.

SKILLS:
When a player uses an unlocked skill, treat it as a powerful guaranteed success with real narrative impact.
If a player tries to use a skill they haven't unlocked, it fails — they don't have the training.

DIFFICULTY & CONSEQUENCES — THIS IS CRITICAL:
- You do NOT favour the players. You are fair, not kind.
- If a player makes a stupid decision, it fails or backfires. No safety nets.
- Characters can and will die if they make fatal mistakes. Death is permanent.
- The world does not wait. NPCs and enemies act and react. Hesitation has consequences.
- Track everything. NPCs remember being wronged. Fires spread. Noise attracts attention.
- Award XP only for genuine achievements: clever plans, defeating real threats, brave sacrifice, solving meaningful puzzles. Never for participation.
- Never invent a convenient escape when the party is trapped. If they're surrounded, they're surrounded.
- When a character dies, describe it with weight and narrative dignity. It matters.

PACING:
- Keep narrative responses to 2-3 sentences MAX. Short, punchy, atmospheric. Never exceed 3 sentences.
- Always end in a state that demands a response — tension, danger, discovery, or choice.
- After every 3-4 player actions, escalate something: an enemy appears, a situation worsens, a new mystery surfaces.

RESPONSE FORMAT — CRITICAL:
You must ALWAYS respond with ONLY this exact JSON object. No text outside it. No markdown. No explanation.

{
  "narrative": "Your story text here. MAXIMUM 3 sentences. Present tense. Vivid and direct. Be concise.",
  "image_prompt": "A detailed Nano Banana image generation prompt IF this moment warrants a scene image. Generate images for: first scene of campaign, entering a new major location, dramatic reveals, boss encounters, significant story moments. Use a dark fantasy painterly art style, dramatic lighting, no text in image. Set to null if no image needed.",
  "actions": [
    { "type": "award_xp", "player_id": "REPLACE_WITH_PLAYER_UUID", "amount": 50, "reason": "Defeated the cave troll" },
    { "type": "add_item", "player_id": "REPLACE_WITH_PLAYER_UUID", "item": { "name": "Iron Shield", "description": "Dented but reliable. Pried from a dead goblin." }},
    { "type": "kill_player", "player_id": "REPLACE_WITH_PLAYER_UUID", "cause": "Swallowed by the stone golem" },
    { "type": "unlock_skill", "player_id": "REPLACE_WITH_PLAYER_UUID", "skill": "Fireball" }
  ]
}`;
}

export function buildMessageHistory(messages, players) {
  return messages
    .filter(msg => {
      // Skip system messages and error fallback narratives — they poison the model's context
      if (msg.type === 'system') return false;
      if (msg.type === 'gm_narrative' && msg.content?.startsWith('The realm shifts...')) return false;
      return true;
    })
    .slice(-20)
    .map(msg => {
      if (msg.type === 'gm_narrative') {
        // Wrap in JSON so the model sees the expected output format in its own history
        return {
          role: 'assistant',
          content: JSON.stringify({ narrative: msg.content, image_prompt: null, actions: [] }),
        };
      }
      const player = players.find(p => p.id === msg.player_id);
      const name = player ? player.name : 'Unknown';
      return { role: 'user', content: `${name}: ${msg.content}` };
    });
}
