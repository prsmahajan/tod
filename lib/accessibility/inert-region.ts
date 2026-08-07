export function getInertAttribute(inactive: boolean): Record<string, string> {
  return inactive ? { inert: "true" } : {};
}
