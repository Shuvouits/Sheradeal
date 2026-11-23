"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  ChevronDown,
  Check,
  X,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  Palette,
  Search,
  Tag,
} from "lucide-react";

import GlobalVariantsStyles from "./GlobalVariantsStyles";

const DEFAULT_COLOR = "#05714B";

const visualTypes = [
  { value: "color", label: "Color & Label" },
  { value: "rectangle", label: "Rectangle" },
  { value: "pill", label: "Pill" },
  { value: "dropdown", label: "Dropdown" },
];

async function api(url, options = {}) {
  const response = await fetch(url, {
    cache: "no-store",
    ...options,
  });

  const raw = await response.text();

  let result;

  try {
    result = JSON.parse(raw);
  } catch {
    throw new Error(
      `Invalid API response (HTTP ${response.status}).`
    );
  }

  if (!response.ok || !result.success) {
    const firstError = result.errors
      ? Object.values(result.errors).flat()[0]
      : null;

    throw new Error(
      firstError ||
      result.message ||
      `Request failed (${response.status}).`
    );
  }

  return result.data;
}

function createDraft(variant, key) {
  if (!variant) {
    return {
      name: "",
      visual_type: "rectangle",
      display_order: 0,
      options: [
        {
          key,
          label: "",
          color_code: DEFAULT_COLOR,
        },
      ],
    };
  }

  return {
    name: variant.name || "",
    visual_type: variant.visual_type || "rectangle",
    display_order: variant.display_order || 0,
    options: (variant.options || []).map((option) => ({
      key: `existing-${option.id}`,
      id: option.id,
      label: option.label || "",
      value: option.value || "",
      color_code: option.color_code || DEFAULT_COLOR,
    })),
  };
}

function VariantSummary({ variant, onEdit, disabled }) {
  return (
    <div className="gv-summary">
      <div className="gv-summary-content">
        <strong className="gv-variant-name">
          {variant.name}
        </strong>

        <div className="gv-chips">
          {(variant.options || []).map((option) => (
            <span className="gv-chip" key={option.id}>
              {variant.visual_type === "color" && (
                <span
                  className="gv-color-dot"
                  style={{
                    backgroundColor:
                      option.color_code || DEFAULT_COLOR,
                  }}
                />
              )}

              {option.label}
            </span>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="gv-edit-button"
        onClick={onEdit}
        disabled={disabled}
        title={`Edit ${variant.name}`}
      >
        <Pencil size={17} />
      </button>
    </div>
  );
}

function OptionRow({
  option,
  index,
  visualType,
  onChange,
  onRemove,
  onDragStart,
  onDrop,
  onDragEnd,
  onMove,
  total,
  disabled,
}) {
  return (
    <div>
      <div
        className="gv-option-row"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          onDrop(option.key);
        }}
      >
        <span
          className="gv-drag-handle"
          draggable={!disabled}
          onDragStart={(event) => {
            event.dataTransfer.effectAllowed = "move";
            onDragStart(option.key);
          }}
          onDragEnd={onDragEnd}
          title="Drag to reorder"
        >
          <GripVertical size={17} />
        </span>

        <input
          className="gv-option-input"
          type="text"
          value={option.label}
          maxLength={150}
          placeholder={`Option ${index + 1}`}
          disabled={disabled}
          onChange={(event) =>
            onChange(option.key, "label", event.target.value)
          }
        />

        {visualType === "color" && (
          <div className="gv-color-control">
            <input
              type="color"
              value={option.color_code || DEFAULT_COLOR}
              disabled={disabled}
              onChange={(event) =>
                onChange(
                  option.key,
                  "color_code",
                  event.target.value.toUpperCase()
                )
              }
            />
          </div>
        )}

        <button
          type="button"
          className="gv-icon-action gv-remove-option"
          disabled={disabled}
          onClick={() => onRemove(option.key)}
          title="Remove option"
        >
          <Trash2 size={17} />
        </button>
      </div>

      <div className="gv-mobile-reorder">
        <button
          type="button"
          disabled={disabled || index === 0}
          onClick={() => onMove(index, -1)}
        >
          Move up
        </button>

        <button
          type="button"
          disabled={disabled || index === total - 1}
          onClick={() => onMove(index, 1)}
        >
          Move down
        </button>
      </div>
    </div>
  );
}

function VariantEditor({
  draft,
  setDraft,
  onSave,
  onDelete,
  onCancel,
  saving,
  isNew,
  nextKey,
  setError,
}) {
  const [newLabel, setNewLabel] = useState("");
  const [newColor, setNewColor] = useState("#E11D48");
  const [dragKey, setDragKey] = useState(null);

  function changeField(field, value) {
    setDraft((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function updateOption(key, field, value) {
    setDraft((previous) => ({
      ...previous,
      options: previous.options.map((option) =>
        option.key === key
          ? { ...option, [field]: value }
          : option
      ),
    }));
  }

  function removeOption(key) {
    setDraft((previous) => ({
      ...previous,
      options: previous.options.filter(
        (option) => option.key !== key
      ),
    }));
  }

  function addOption() {
    const label = newLabel.trim();

    if (!label) {
      setError("Please enter an option value.");
      return;
    }

    if (draft.options.length >= 200) {
      setError("Maximum 200 option values are allowed.");
      return;
    }

    const exists = draft.options.some(
      (option) =>
        option.label.trim().toLowerCase() === label.toLowerCase()
    );

    if (exists) {
      setError("This option already exists.");
      return;
    }

    setDraft((previous) => ({
      ...previous,
      options: [
        ...previous.options,
        {
          key: nextKey(),
          label,
          color_code: newColor,
        },
      ],
    }));

    setNewLabel("");
    setNewColor("#E11D48");
    setError("");
  }

  function moveOption(targetKey) {
    if (!dragKey || dragKey === targetKey) return;

    setDraft((previous) => {
      const options = [...previous.options];

      const from = options.findIndex(
        (option) => option.key === dragKey
      );

      const to = options.findIndex(
        (option) => option.key === targetKey
      );

      if (from < 0 || to < 0) return previous;

      const [moved] = options.splice(from, 1);
      options.splice(to, 0, moved);

      return { ...previous, options };
    });

    setDragKey(null);
  }

  function moveWithButton(index, direction) {
    setDraft((previous) => {
      const options = [...previous.options];
      const target = index + direction;

      if (target < 0 || target >= options.length) {
        return previous;
      }

      [options[index], options[target]] = [
        options[target],
        options[index],
      ];

      return { ...previous, options };
    });
  }

  function submitEditor(event) {
    event.preventDefault();

    // Include a value typed into "Add another value"
    // even if the user has not clicked the + button.
    const pendingOption = newLabel.trim()
      ? {
          label: newLabel.trim(),
          color_code: newColor,
        }
      : null;

    onSave(pendingOption);
  }

  return (
    <form className="gv-editor" onSubmit={submitEditor}>
      <div className="gv-form-grid">
        <label className="gv-field">
          <span>Variant Name</span>

          <input
            type="text"
            required
            maxLength={150}
            value={draft.name}
            disabled={saving}
            placeholder="Color, Storage, Size..."
            onChange={(event) =>
              changeField("name", event.target.value)
            }
          />

          <small>
            Name it "Color" or "Colour" to use color swatches.
          </small>
        </label>

        <label className="gv-field">
          <span>Visual</span>

          <div className="gv-select-wrap">
            <Tag size={17} />

            <select
              value={draft.visual_type}
              disabled={saving}
              onChange={(event) =>
                changeField("visual_type", event.target.value)
              }
            >
              {visualTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            <ChevronDown size={16} />
          </div>
        </label>
      </div>

      <div className="gv-options-section">
        <div className="gv-options-heading">
          <strong>Option Values</strong>
          <small>Drag the handle to change display order.</small>
        </div>

        <div className="gv-options-list">
          {draft.options.map((option, index) => (
            <OptionRow
              key={option.key}
              option={option}
              index={index}
              total={draft.options.length}
              visualType={draft.visual_type}
              onChange={updateOption}
              onRemove={removeOption}
              onDragStart={setDragKey}
              onDrop={moveOption}
              onDragEnd={() => setDragKey(null)}
              onMove={moveWithButton}
              disabled={saving}
            />
          ))}
        </div>

        <div className="gv-add-option">
          <span className="gv-drag-placeholder">
            <GripVertical size={17} />
          </span>

          <input
            type="text"
            value={newLabel}
            maxLength={150}
            placeholder="Add another value"
            disabled={saving || draft.options.length >= 200}
            onChange={(event) => setNewLabel(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addOption();
              }
            }}
          />

          {draft.visual_type === "color" && (
            <div className="gv-color-control">
              <input
                type="color"
                value={newColor}
                disabled={saving}
                onChange={(event) =>
                  setNewColor(event.target.value.toUpperCase())
                }
              />
            </div>
          )}

          <button
            type="button"
            className="gv-add-option-button"
            disabled={
              saving ||
              !newLabel.trim() ||
              draft.options.length >= 200
            }
            onClick={addOption}
            title="Add option"
          >
            <Plus size={19} />
          </button>
        </div>
      </div>

      <div className="gv-editor-footer">
        <div className="gv-editor-left">
          {!isNew && (
            <button
              type="button"
              className="gv-delete-button"
              disabled={saving}
              onClick={onDelete}
            >
              Delete
            </button>
          )}

          <button
            type="button"
            className="gv-cancel-button"
            disabled={saving}
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>

        <button
          type="submit"
          className="gv-save-button"
          disabled={saving}
        >
          {saving ? (
            <LoaderCircle size={16} className="gv-spin" />
          ) : (
            <Check size={17} />
          )}

          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}

export default function GlobalVariants() {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [expandedId, setExpandedId] = useState(null);
  const [draft, setDraft] = useState(null);

  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const keyCounter = useRef(0);

  function nextKey() {
    keyCounter.current += 1;
    return `new-option-${keyCounter.current}`;
  }

  const loadVariants = useCallback(async () => {
    const data = await api("/api/admin/global-variants");

    setVariants(Array.isArray(data) ? data : []);

    return data;
  }, []);

  useEffect(() => {
    let active = true;

    loadVariants()
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [loadVariants]);

  function openCreate() {
    setExpandedId("new");
    setDraft(createDraft(null, nextKey()));
    setError("");
    setNotice("");
  }

  function openEdit(variant) {
    if (expandedId === variant.id) {
      closeEditor();
      return;
    }

    setExpandedId(variant.id);
    setDraft(createDraft(variant, nextKey()));
    setError("");
    setNotice("");
  }

  function closeEditor() {
    setExpandedId(null);
    setDraft(null);
  }

  async function saveVariant(pendingOption = null) {
    if (!draft || saving) return;

    setError("");
    setNotice("");

    const name = draft.name.trim();

    if (!name) {
      setError("Variant name is required.");
      return;
    }

    const allOptions = [
      ...draft.options,
      ...(pendingOption ? [pendingOption] : []),
    ];

    if (allOptions.length > 200) {
      setError("Maximum 200 option values are allowed.");
      return;
    }

    const normalizedOptions = allOptions.map((option) => ({
      ...option,
      label: option.label.trim(),
    }));

    if (
      normalizedOptions.length === 0 ||
      normalizedOptions.some((option) => !option.label)
    ) {
      setError("At least one valid option value is required.");
      return;
    }

    const labels = normalizedOptions.map((option) =>
      option.label.toLowerCase()
    );

    if (new Set(labels).size !== labels.length) {
      setError("Duplicate option labels are not allowed.");
      return;
    }

    const payload = {
      name,
      visual_type: draft.visual_type,
      display_order: Number(draft.display_order) || 0,
      options: normalizedOptions.map((option, index) => ({
        ...(option.id ? { id: option.id } : {}),
        label: option.label,
        ...(option.id && option.value
          ? { value: option.value }
          : {}),
        color_code:
          draft.visual_type === "color"
            ? option.color_code || DEFAULT_COLOR
            : null,
        display_order: index + 1,
      })),
    };

    setSaving(true);

    try {
      const creating = expandedId === "new";

      await api(
        creating
          ? "/api/admin/global-variants"
          : `/api/admin/global-variants/${expandedId}`,
        {
          method: creating ? "POST" : "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      await loadVariants();
      closeEditor();

      setNotice(
        creating
          ? "Global variant created successfully."
          : "Global variant updated successfully."
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteVariant() {
    if (!deleteTarget || saving) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      await api(
        `/api/admin/global-variants/${deleteTarget.id}`,
        { method: "DELETE" }
      );

      await loadVariants();

      setDeleteTarget(null);
      closeEditor();

      setNotice("Global variant deleted successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const filteredVariants = variants.filter((variant) =>
    variant.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="gv-page">
      <GlobalVariantsStyles />

      <div className="gv-container">
        <div className="gv-header-card">
          <div>
            <h1>Global Variants</h1>

            <p>
              Create one variant once and use it for any
              product in the store.
            </p>
          </div>

          <button
            type="button"
            className="gv-create-button"
            disabled={saving}
            onClick={openCreate}
          >
            <Plus size={17} />
            Add Variant
          </button>
        </div>

        {error && (
          <div className="gv-message gv-error" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {notice && (
          <div className="gv-message gv-success">
            <CheckCircle2 size={18} />
            <span>{notice}</span>

            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Dismiss notice"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {variants.length > 7 && (
          <label className="gv-search">
            <Search size={17} />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search variants..."
            />
          </label>
        )}

        {expandedId === "new" && draft && (
          <div className="gv-card gv-new-card">
            <div className="gv-new-heading">
              <Palette size={19} />
              <strong>Create Global Variant</strong>
            </div>

            <VariantEditor
              draft={draft}
              setDraft={setDraft}
              saving={saving}
              isNew={true}
              nextKey={nextKey}
              setError={setError}
              onSave={saveVariant}
              onCancel={closeEditor}
            />
          </div>
        )}

        {loading ? (
          <div className="gv-loading">
            <LoaderCircle size={23} className="gv-spin" />
            Loading global variants...
          </div>
        ) : filteredVariants.length === 0 ? (
          <div className="gv-empty">
            <Palette size={34} />

            <strong>
              {search
                ? "No matching variants"
                : "No global variants yet"}
            </strong>

            <p>
              {search
                ? "Try another search term."
                : "Create your first variant to get started."}
            </p>
          </div>
        ) : (
          <div className="gv-list">
            {filteredVariants.map((variant) => (
              <div className="gv-card" key={variant.id}>
                <VariantSummary
                  variant={variant}
                  disabled={saving}
                  onEdit={() => openEdit(variant)}
                />

                {expandedId === variant.id && draft && (
                  <VariantEditor
                    draft={draft}
                    setDraft={setDraft}
                    saving={saving}
                    isNew={false}
                    nextKey={nextKey}
                    setError={setError}
                    onSave={saveVariant}
                    onCancel={closeEditor}
                    onDelete={() => setDeleteTarget(variant)}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {deleteTarget && (
        <div className="gv-modal-overlay">
          <div
            className="gv-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="gv-delete-title"
          >
            <button
              type="button"
              className="gv-modal-close"
              disabled={saving}
              onClick={() => setDeleteTarget(null)}
              aria-label="Close"
            >
              <X size={19} />
            </button>

            <div className="gv-modal-icon">
              <Trash2 size={25} />
            </div>

            <h2 id="gv-delete-title">
              Delete Global Variant
            </h2>

            <p>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget.name}</strong>?
              All its option values will also be deleted.
              This action cannot be undone.
            </p>

            <div className="gv-modal-buttons">
              <button
                type="button"
                className="gv-cancel-button"
                disabled={saving}
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="gv-delete-confirm"
                disabled={saving}
                onClick={deleteVariant}
              >
                {saving ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
