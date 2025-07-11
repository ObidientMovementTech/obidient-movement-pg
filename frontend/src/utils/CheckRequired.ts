export default function checkReqiredField(
  profileData: { [key: string]: any },
  RequiredFields: { value: string; label: string }[]
) {
  for (let RequiredField of RequiredFields) {
    const data = profileData?.[RequiredField.value];
    if (isEmpty(data)) {
      return {
        is_ok: false,
        message: `The ${RequiredField.label} field is required`,
      };
    }
  }

  return {
    is_ok: true,
    message: ``,
  };
}

function isEmpty(value: any) {
  if (value == null) return true; // Check for null or undefined
  if (typeof value === "string") return value.trim().length === 0; // Check for empty strings
  if (Array.isArray(value)) return value.length === 0; // Check for empty arrays
  if (typeof value === "object") return Object.keys(value).length === 0; // Check for empty objects
  return false; // For other types (e.g., numbers, booleans), return false
}
