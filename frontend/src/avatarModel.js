export const AVATAR_STORAGE_KEY = "brainbytes.avatar.v1";

export const AVATAR_CHOICES = {
  skinTone: [
    { label: "Warm beige", value: "#f2c9a5" },
    { label: "Golden", value: "#d99b69" },
    { label: "Caramel", value: "#b8754e" },
    { label: "Deep brown", value: "#75452f" }
  ],
  hairColor: [
    { label: "Espresso", value: "#33233a" },
    { label: "Chestnut", value: "#78452f" },
    { label: "Blue", value: "#3975d5" },
    { label: "Purple", value: "#8052c7" }
  ],
  eyeColor: [
    { label: "Ocean", value: "#3d9bd6" },
    { label: "Emerald", value: "#3aa982" },
    { label: "Violet", value: "#8b5bd1" },
    { label: "Amber", value: "#d48b35" }
  ],
  outfit: [
    { label: "Cosmic", value: "#6551ba" },
    { label: "Ocean", value: "#2789b5" },
    { label: "Sunrise", value: "#e87970" },
    { label: "Forest", value: "#39856d" }
  ],
  hairstyle: [
    { label: "Crop", value: "crop" },
    { label: "Curls", value: "curls" },
    { label: "Long", value: "long" }
  ],
  accessory: [
    { label: "None", value: "none" },
    { label: "Glasses", value: "glasses" },
    { label: "Headset", value: "headset" },
    { label: "Star clip", value: "star" }
  ],
  background: [
    { label: "Lavender", value: "#ded5ff" },
    { label: "Sky", value: "#cceeff" },
    { label: "Mint", value: "#c9f3df" },
    { label: "Peach", value: "#ffe0cd" }
  ]
};

export const DEFAULT_AVATAR = {
  name: "Rookie",
  skinTone: AVATAR_CHOICES.skinTone[0].value,
  hairColor: AVATAR_CHOICES.hairColor[0].value,
  eyeColor: AVATAR_CHOICES.eyeColor[0].value,
  outfit: AVATAR_CHOICES.outfit[0].value,
  hairstyle: "crop",
  accessory: "headset",
  background: AVATAR_CHOICES.background[0].value
};

const OPPONENT_NAMES = ["Nova", "Byte", "Pixel", "Comet", "Echo", "Orbit"];

function choose(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function isChoice(field, value) {
  return AVATAR_CHOICES[field].some((option) => option.value === value);
}

function isValidAvatar(value) {
  return value
    && typeof value === "object"
    && typeof value.name === "string"
    && value.name.trim().length > 0
    && value.name.trim().length <= 18
    && isChoice("skinTone", value.skinTone)
    && isChoice("hairColor", value.hairColor)
    && isChoice("eyeColor", value.eyeColor)
    && isChoice("outfit", value.outfit)
    && isChoice("hairstyle", value.hairstyle)
    && isChoice("accessory", value.accessory)
    && isChoice("background", value.background);
}

export function loadSavedAvatar() {
  try {
    const stored = window.localStorage.getItem(AVATAR_STORAGE_KEY);
    if (!stored) {
      return { avatar: DEFAULT_AVATAR, isSaved: false, error: "" };
    }

    try {
      const parsed = JSON.parse(stored);
      const migrated = {
        ...DEFAULT_AVATAR,
        ...parsed,
        eyeColor: parsed.eyeColor || DEFAULT_AVATAR.eyeColor,
        outfit: parsed.outfit || DEFAULT_AVATAR.outfit
      };
      if (!isValidAvatar(migrated)) {
        return {
          avatar: DEFAULT_AVATAR,
          isSaved: false,
          error: "Your saved avatar data is invalid. Create and save a new avatar."
        };
      }

      return {
        avatar: { ...migrated, name: migrated.name.trim() },
        isSaved: true,
        error: ""
      };
    } catch {
      return {
        avatar: DEFAULT_AVATAR,
        isSaved: false,
        error: "Your saved avatar could not be read. Create and save a new avatar."
      };
    }
  } catch {
    return {
      avatar: DEFAULT_AVATAR,
      isSaved: false,
      error: "Avatar storage is unavailable in this browser."
    };
  }
}

export function saveAvatar(avatar) {
  if (!isValidAvatar(avatar)) {
    throw new Error("Please choose a name and valid avatar features before saving.");
  }

  window.localStorage.setItem(AVATAR_STORAGE_KEY, JSON.stringify({
    ...avatar,
    name: avatar.name.trim()
  }));
}

export function generateRandomAvatar(name) {
  return {
    name: name || choose(OPPONENT_NAMES),
    skinTone: choose(AVATAR_CHOICES.skinTone).value,
    hairColor: choose(AVATAR_CHOICES.hairColor).value,
    eyeColor: choose(AVATAR_CHOICES.eyeColor).value,
    outfit: choose(AVATAR_CHOICES.outfit).value,
    hairstyle: choose(AVATAR_CHOICES.hairstyle).value,
    accessory: choose(AVATAR_CHOICES.accessory).value,
    background: choose(AVATAR_CHOICES.background).value
  };
}

export function generateOpponent(previousName) {
  const names = OPPONENT_NAMES.filter((name) => name !== previousName);
  return generateRandomAvatar(choose(names));
}
