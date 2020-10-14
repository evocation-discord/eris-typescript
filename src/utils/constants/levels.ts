export function getLevelXP(num: number): number {
  return 5 * (num ** 2) + 50 * num + 100;
}

export function getLevelFromXP(xp: number): number {
  let remainingXp = xp;
  let level = 0;
  while (remainingXp >= getLevelXP(level)) {
    remainingXp -= getLevelXP(level);
    level += 1;
  }
  return level;
}
