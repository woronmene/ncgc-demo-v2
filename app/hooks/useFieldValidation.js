import { useEffect } from "react";

export function useFieldValidation({
  form,
  field,
  lastValidatedRef,
  setVerifications,
  validateField,
}) {
  useEffect(() => {
    const value = (form[field] || "").trim();

    if (!value) {
      setVerifications((prev) => ({
        ...prev,
        [field]: { status: "idle", message: "" },
      }));
      lastValidatedRef.current[field] = "";
      return;
    }

    if (lastValidatedRef.current[field] === value) return;

    const id = setTimeout(() => validateField(field, value), 700);
    return () => clearTimeout(id);
  }, [form[field]]);
}
