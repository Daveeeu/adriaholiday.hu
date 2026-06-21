export function createId(prefix: string, suffix: string) {
  return `${prefix}_${suffix}`;
}

export function createImageUrl(seed: string) {
  return `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=1600&q=80`;
}

export function createTimestamp(date: string, time = '09:00:00Z') {
  return `${date}T${time}`;
}

export function createSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}
