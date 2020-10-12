export function getLevelXP(num: number): number {
  return 5 * (num ** 2) + 50 * num + 100;
}

export function getLevelFromXP(xp: number): number {
  let remaining_xp = xp;
  let level = 0;
  while (remaining_xp >= getLevelXP(level)) {
    remaining_xp -= getLevelXP(level);
    level += 1;
  }
  return level;
}