"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

// Returns the text after the last comma (trimmed) — the "word currently being typed"
// when multiValue is enabled, so suggestions match just that segment.
function lastSegment(value) {
  const parts = value.split(",");
  return parts[parts.length - 1].trim();
}

/**
 * Text input that fetches distinct historical values for `field`
 * from the backend and shows them as a dropdown while the user types.
 *
 * When multiValue is true, the field is treated as a comma-separated list
 * (e.g. "Fever, Cough"): suggestions are matched against whatever comes
 * after the last comma, and picking a suggestion only replaces that last
 * segment — so typing a comma after a selection starts a fresh lookup for
 * the next word instead of matching the whole string.
 */
export default function AutocompleteInput({
  label,
  field,
  value,
  onChange,
  type = "text",
  required = false,
  disabled = false,
  multiValue = false,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!field || type !== "text") return;

    const query = multiValue ? lastSegment(value) : value;

    const timeout = setTimeout(async () => {
      if (!query) return setSuggestions([]);
      try {
        const data = await api.get(
          `/patients/suggestions?field=${field}&q=${encodeURIComponent(query)}`
        );
        setSuggestions(data.suggestions || []);
      } catch {
        setSuggestions([]);
      }
    }, 250);
    return () => clearTimeout(timeout);
  }, [value, field, type, multiValue]);

  const selectSuggestion = (s) => {
    if (multiValue) {
      const lastCommaIdx = value.lastIndexOf(",");
      const prefix = lastCommaIdx >= 0 ? `${value.slice(0, lastCommaIdx + 1)} ` : "";
      onChange(prefix + s);
    } else {
      onChange(s);
    }
    setOpen(false);
  };

  return (
    <div className="relative" ref={wrapRef}>
      {label && <label className="mb-1 block text-xs font-medium text-slate-600">{label}</label>}
      <input
        className="input"
        type={type}
        required={required}
        disabled={disabled}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        autoComplete="off"
        placeholder={multiValue ? "Type, use comma for more than one" : undefined}
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-40 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {suggestions.map((s, i) => (
            <li
              key={i}
              onClick={() => selectSuggestion(s)}
              className="cursor-pointer px-3 py-2 text-sm hover:bg-brand-50"
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
