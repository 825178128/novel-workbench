export function parseAIJsonObject<T extends object>(content: string): T | null {
  const candidates = buildJsonCandidates(content);

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as T;
      }
    } catch {
      // Try the next likely JSON slice.
    }
  }

  return null;
}

export function parseAIJsonArray<T>(content: string): T[] | null {
  const candidates = buildJsonCandidates(content);

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (Array.isArray(parsed)) {
        return parsed as T[];
      }
    } catch {
      // Try the next likely JSON slice.
    }
  }

  return null;
}

function buildJsonCandidates(content: string): string[] {
  const trimmed = content.trim();
  const candidates = new Set<string>();

  if (trimmed) {
    candidates.add(trimmed);
  }

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]?.trim()) {
    candidates.add(fencedMatch[1].trim());
  }

  const objectStart = trimmed.indexOf('{');
  const objectEnd = trimmed.lastIndexOf('}');
  if (objectStart >= 0 && objectEnd > objectStart) {
    candidates.add(trimmed.slice(objectStart, objectEnd + 1));
  }

  const arrayStart = trimmed.indexOf('[');
  const arrayEnd = trimmed.lastIndexOf(']');
  if (arrayStart >= 0 && arrayEnd > arrayStart) {
    candidates.add(trimmed.slice(arrayStart, arrayEnd + 1));
  }

  return [...candidates];
}
