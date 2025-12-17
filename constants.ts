import { Theme, PresetMap } from './types';

export const THEMES: Theme[] = [
  { id: 'wedding', label: 'Wedding 💍' },
  { id: 'kpop', label: 'K-Pop Idol 🎤' },
  { id: 'office', label: 'Professional 💼' },
  { id: 'vintage', label: 'Vintage 🎞️' },
  { id: 'fun', label: 'Fun & Wild 🤪' },
  { id: 'halloween', label: 'Halloween 🎃' },
  { id: 'christmas', label: 'Christmas 🎄' },
  { id: 'redcarpet', label: 'Red Carpet 🏆' },
  { id: 'summer', label: 'Summer Festival 🏖️' },
  { id: 'fantasy', label: 'Fantasy RPG 🧝‍♀️' }
];

export const VINTAGE_ERAS: string[] = [
  'Roaring 20s Flapper', 
  'Elegant 50s Pin-up', 
  'Mod 60s', 
  'Disco 70s', 
  'Retro 80s Perm', 
  'Grunge 90s'
];

export const PRESETS: PresetMap = {
  'wedding': ["Low Bun", "Romantic Curls", "Tiara Updo", "Veil Style", "Half-up Floral", "French Twist", "Chignon", "Side Braid", "Sleek Ponytail"],
  'kpop': ["Two-tone Color", "Space Buns", "Hime Cut", "Bleached Bob", "Wet Look", "High Pigtails", "Ash Gray Waves", "Choppy Bangs", "Hair Tinsel"],
  'halloween': ["Witch Hat", "Vampire Sleek", "Zombie Messy", "Bride of Frank", "Devil Horns", "Ghostly White", "Pumpkin Orange", "Medusa Snakes", "Spider Web Accents"],
  'christmas': ["Reindeer Antlers", "Red Ribbon Bow", "Snowflake Pins", "Elf Hat", "Festive Glitter", "Green & Red Dye", "Angel Halo", "Cozy Beanie", "Winter Earmuffs"],
  'vintage': ["Finger Waves", "Victory Rolls", "Beehive", "Gibson Tuck", "Poodle Cut", "Headscarf", "Bouffant", "Shag Cut", "Feathered Layers"],
  'fun': ["Rainbow Afro", "Cyber Dreads", "Bald & Tattoo", "Neon Mohawk", "Flower Beard", "Water Hair", "Cloud Texture", "Fire Ombre", "Ice Spikes"],
  'office': ["Sleek Bob", "Low Pony", "Messy Bun", "Straight Layered", "Pixie Cut", "Half-Up Clip", "French Braid", "Wavy Lob", "Side Part"],
  'redcarpet': ["Hollywood Waves", "Sleek High Pony", "Sculpted Updo", "Wet Look Back", "Side Swept", "Jeweled Pins", "Volume Blowout", "Braided Crown", "Retro Glam"],
  'summer': ["Beach Waves", "Flower Crown", "Boho Braid", "Sun-kissed Highlights", "Messy Top Knot", "Scarf Wrap", "Fishtail Braid", "Salt Spray Texture", "Mini Braids"],
  'fantasy': ["Elf Ears Style", "White Hair", "Warrior Braid", "Tiara & flowing", "Forest Twigs", "Glowing Tips", "Mystical Updo", "Rogue Hood", "Dragon Scales"]
};

export const FUN_STYLES: string[] = [
  "Rainbow Afro", "Cyber Dreads", "Bald & Tattoo", "Neon Mohawk", "Flower Beard", "Water Hair", "Cloud Texture", "Fire Ombre", "Ice Spikes"
];

export interface SurpriseTheme {
  id: string;
  label: string;
  styles: string[];
}

export const SURPRISE_THEMES: SurpriseTheme[] = [
  { 
    id: 'steampunk', 
    label: 'Steampunk ⚙️', 
    styles: ["Goggles & Gears", "Brass Accessories", "Victorian Updo", "Copper Streaks", "Top Hat Style", "Mechanic Messy", "Steam Clouds", "Clockwork Pins", "Leather Straps"] 
  },
  { 
    id: 'goth', 
    label: 'Gothic 🖤', 
    styles: ["Jet Black Sleek", "Crimson Streaks", "Corset Braid", "Bat Wing Clips", "Pale Skin Contrast", "Spiked Choker", "Velvet Texture", "Messy Teased", "Victorian Mourning"] 
  },
  { 
    id: 'mermaid', 
    label: 'Mermaid Core 🧜‍♀️', 
    styles: ["Wet Look Waves", "Pearl Accessories", "Seafoam Green", "Shell Clips", "Scale Texture", "Coral Pink", "Fishtail Braid", "Glitter Roots", "Ocean Blue Ombre"] 
  },
  { 
    id: 'cyberpunk', 
    label: 'Cyberpunk 2077 🦾', 
    styles: ["Neon Blue Bob", "Data Port Impants", "Shaved Side Patterns", "Holographic Tips", "Cable Braids", "Chrome Finish", "Circuit Board Clip", "UV Reactive Dye", "Techwear Visor"] 
  },
  { 
    id: 'viking', 
    label: 'Viking Shieldmaiden ⚔️', 
    styles: ["Side Shave", "Warrior Braids", "Metal Rings", "Faux Hawk", "Rugged Texture", "Beads & Leather", "Platinum Blonde", "War Paint", "Wolf Cut"] 
  },
  { 
    id: 'anime', 
    label: 'Anime Protagonist 🎌', 
    styles: ["Gravity Defying Spikes", "Pink Twin Tails", "Ahoge (Cowlick)", "Giant Ribbon", "Magical Girl Transformation", "Cat Ears", "Blue Bob", "Silver Long", "Eye-Covering Bangs"] 
  },
  { 
    id: 'noir', 
    label: 'Film Noir 🕵️‍♀️', 
    styles: ["Femme Fatale Waves", "Structured Curls", "Tilt Hat", "Veiled Fascinator", "Dramatic Shadow", "Sleek 40s Roll", "Cigarette Holder Aesthetics", "Glossy Black", "Sharp Bob"] 
  },
  { 
    id: 'regency', 
    label: 'Regency Era 👑', 
    styles: ["Tight Ringlets", "Feather Plume", "High Bun", "Ribbon Bonnet", "Half-Up Curls", "Pearl Drop", "Floral Sprig", "Greek Goddess Style", "Soft Updo"] 
  }
];