// One emoji per muscle / exercise, so each exercise reads at a glance.
const BY_ID: Record<string, string> = {
  calf_raise: '🍗', // polpacci
  glute_bridge: '🍑', // glutei
};
const BY_MUSCLE: Record<string, string> = {
  chest: '🤱', // petto
  back: '🪢', // schiena
  legs: '🦵', // gambe
  shoulders: '🤷', // spalle
  arms: '💪🏼', // braccia
  core: '🐢', // addome
  fullbody: '🔥', // total body
};

export function exerciseEmoji(exerciseId: string, muscle: string): string {
  return BY_ID[exerciseId] ?? BY_MUSCLE[muscle] ?? '🏋️';
}
