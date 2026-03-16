export const ARCHETYPES = {
  warrior: {
    label: 'Warrior',
    emoji: '⚔️',
    description: 'Strong in combat. Favoured in direct confrontation.',
    skills: {
      2: { name: 'Shield Bash', description: 'Stun an enemy with your shield.' },
      3: { name: 'War Cry', description: 'Terrify nearby enemies, weakening their resolve.' },
      4: { name: 'Berserker', description: 'Enter a rage state — devastating but reckless.' },
      5: { name: 'Unstoppable', description: 'Push through damage that would stop anyone else.' }
    }
  },
  rogue: {
    label: 'Rogue',
    emoji: '🗡️',
    description: 'Excels at stealth, deception, and theft.',
    skills: {
      2: { name: 'Pickpocket', description: 'Steal from anyone without them noticing.' },
      3: { name: 'Shadowstep', description: 'Vanish and reappear somewhere unexpected.' },
      4: { name: 'Assassinate', description: 'One precise strike with lethal potential.' },
      5: { name: 'Ghost Walk', description: 'Become completely undetectable for a short time.' }
    }
  },
  mage: {
    label: 'Mage',
    emoji: '🔮',
    description: 'Commands powerful magic. Fragile but devastating.',
    skills: {
      2: { name: 'Fireball', description: 'Hurl a ball of fire. Burns everything nearby.' },
      3: { name: 'Arcane Shield', description: 'A magical barrier absorbs incoming damage.' },
      4: { name: 'Time Slow', description: 'Slow time around a target briefly.' },
      5: { name: 'Meteor', description: 'Call a meteor from the sky. Massive destruction.' }
    }
  },
  ranger: {
    label: 'Ranger',
    emoji: '🏹',
    description: 'Master of survival, tracking, and the wilds.',
    skills: {
      2: { name: 'Eagle Eye', description: 'Spot things others cannot. See through darkness.' },
      3: { name: 'Beast Call', description: 'Call a wild animal to aid you.' },
      4: { name: 'Trap Master', description: 'Set a trap that triggers on the next enemy.' },
      5: { name: "Nature's Wrath", description: 'Unleash the environment as a weapon.' }
    }
  },
  cleric: {
    label: 'Cleric',
    emoji: '✝️',
    description: 'Channel divine power. Heals, smites, and defies death.',
    skills: {
      2: { name: 'Heal', description: 'Restore health to yourself or an ally.' },
      3: { name: 'Smite', description: 'Divine strike — devastating against undead and demons.' },
      4: { name: 'Resurrection', description: 'Bring a dead character back. Once per campaign.' },
      5: { name: 'Divine Intervention', description: 'Call on your god directly. Anything can happen.' }
    }
  }
};

export const XP_THRESHOLDS = { 1: 0, 2: 100, 3: 300, 4: 600, 5: 1000 };

export const LEVEL_NAMES = {
  1: 'Novice', 2: 'Apprentice', 3: 'Journeyman', 4: 'Veteran', 5: 'Legend'
};

export const CAMPAIGNS = [
  {
    id: 'cursed_dungeon',
    name: 'The Cursed Dungeon',
    emoji: '💀',
    description: 'Ancient evil stirs beneath a forgotten keep.',
    brief: `The party has descended into a dungeon cursed by an ancient lich.
    Traps, monsters, rival adventurers, and dark magic await at every turn.
    The dungeon grows more dangerous with depth. Treasure is plentiful but deadly to reach.
    The ultimate goal: destroy the lich's phylactery deep in the final chamber.`
  },
  {
    id: 'pirate_seas',
    name: 'Pirate Seas',
    emoji: '🏴‍☠️',
    description: 'Treasure, sea monsters, and no rules on the open ocean.',
    brief: `The party sails the Crimson Sea, a lawless stretch of ocean ruled by pirate lords.
    Naval combat, island exploration, kraken attacks, cursed treasure, and betrayal are all on the table.
    The ultimate goal: find the legendary sunken vault of Captain Morrigan before a rival crew does.`
  },
  {
    id: 'haunted_kingdom',
    name: 'The Haunted Kingdom',
    emoji: '👑',
    description: 'A kingdom in decay. Ghosts, politics, and dark magic.',
    brief: `The kingdom of Valdris is rotting from within. The king is dead — replaced by something else.
    Ghosts walk the streets, noble houses scheme, and a dark cult grows in the shadows.
    Political intrigue, supernatural horror, and moral choices define this campaign.
    The ultimate goal: expose the puppet master controlling the false king.`
  },
  {
    id: 'forgotten_jungle',
    name: 'Forgotten Jungle',
    emoji: '🌿',
    description: 'Ancient ruins, tribal dangers, and lost civilisations.',
    brief: `A dense, uncharted jungle hides the ruins of a civilisation that vanished overnight.
    Dangerous wildlife, tribal factions, ancient traps, and forgotten gods fill the canopy.
    Survival is never guaranteed. The jungle remembers everything.
    The ultimate goal: reach the heart temple and learn what destroyed the civilisation — before it destroys you.`
  },
  {
    id: 'frozen_north',
    name: 'The Frozen North',
    emoji: '❄️',
    description: 'Norse mythology, ice giants, and brutal survival.',
    brief: `The party has journeyed to the Frozen North where gods walk among men and frost giants rule the peaks.
    Survival against the cold is a constant threat. Norse gods meddle in mortal affairs.
    Ragnarok is coming — the only question is which side the party stands on.
    The ultimate goal: seal the rift that is letting Jotunheim bleed into the mortal world.`
  },
  {
    id: 'shadow_city',
    name: 'Shadow City',
    emoji: '🌆',
    description: 'Urban crime, thieves guilds, and corrupt power.',
    brief: `The sprawling city of Ashenmoor is controlled by three crime guilds and a corrupt magistrate.
    Assassinations, heists, underground arenas, forbidden magic, and power plays are daily life.
    Loyalty is currency. Betrayal is survival.
    The ultimate goal: bring down the Magistrate's monopoly on the city's shadow economy — or take it for themselves.`
  }
];

export const TURN_DURATIONS = [
  { value: 1, label: '1 hour' },
  { value: 4, label: '4 hours' },
  { value: 24, label: '24 hours' }
];

export function getLevel(xp) {
  if (xp >= 1000) return 5;
  if (xp >= 600) return 4;
  if (xp >= 300) return 3;
  if (xp >= 100) return 2;
  return 1;
}

export function getXPForLevel(level) {
  return XP_THRESHOLDS[level] || 0;
}

export function getXPProgress(xp) {
  const level = getLevel(xp);
  if (level === 5) return 1;
  const current = XP_THRESHOLDS[level];
  const next = XP_THRESHOLDS[level + 1];
  return (xp - current) / (next - current);
}
