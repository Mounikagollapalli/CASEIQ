// Small helper used by several components.
// Returns Tailwind color classes for a risk level.
export function getRiskColor(level) {
  if (level === "high") {
    return "bg-red-100 text-red-700";
  }
  if (level === "medium") {
    return "bg-yellow-100 text-yellow-700";
  }
  if (level === "low") {
    return "bg-green-100 text-green-700";
  }
  return "bg-gray-100 text-gray-700";
}
