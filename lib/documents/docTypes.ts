/**
 * Known document types and the fields we ask the user to confirm/enter.
 * Adding a new type: add an entry here, and it shows up automatically
 * in the extraction form.
 */

export interface DocTypeFieldDef {
  key: string
  label: string
  inputType?: "text" | "number" | "date"
  placeholder?: string
}

export interface DocTypeDef {
  id: string
  label: string
  description?: string
  fields: DocTypeFieldDef[]
}

export const DOC_TYPES: DocTypeDef[] = [
  {
    id: "rental-contract",
    label: "חוזה שכירות",
    description: "פרטי המשכיר, סכום השכירות ותאריכים.",
    fields: [
      { key: "landlordName",  label: "שם המשכיר",             placeholder: "לדוגמה: ישראל ישראלי" },
      { key: "landlordId",    label: "ת.ז המשכיר (אופציונלי)" },
      { key: "rentAmount",    label: "דמי שכירות חודשיים (₪)", inputType: "number", placeholder: "4500" },
      { key: "startDate",     label: "תאריך תחילה",            inputType: "date" },
      { key: "endDate",       label: "תאריך סיום",             inputType: "date" },
    ],
  },
  {
    id: "id-card",
    label: "תעודת זהות",
    description: "אם תרצה, אפשר לעדכן את הת.ז ישירות ל-/settings להעתקה מהירה.",
    fields: [
      { key: "idNumber",   label: "מספר ת.ז",        placeholder: "9 ספרות" },
      { key: "fullName",   label: "שם מלא" },
      { key: "issueDate",  label: "תאריך הנפקה", inputType: "date" },
    ],
  },
  {
    id: "utility-bill",
    label: "חשבון שירות (חשמל/מים/ארנונה)",
    description: "משמש כאסמכתא לכתובת.",
    fields: [
      { key: "accountNumber", label: "מספר חשבון" },
      { key: "address",       label: "כתובת בחשבון" },
      { key: "billDate",      label: "תאריך החשבון", inputType: "date" },
    ],
  },
  {
    id: "other",
    label: "אחר",
    description: "אפשר לדלג על מילוי הפרטים.",
    fields: [],
  },
]

export function findDocType(id: string | null | undefined): DocTypeDef | null {
  if (!id) return null
  return DOC_TYPES.find((t) => t.id === id) ?? null
}
