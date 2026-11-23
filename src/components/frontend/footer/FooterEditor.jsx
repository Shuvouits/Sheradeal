"use client";

import { useState } from "react";
import {
  X,
  Plus,
  Trash2,
  Save,
  Upload,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const API = "/api/admin/footer";

const TABS = [
  { id: "branding", label: "Branding" },
  { id: "trust", label: "Trust Badges" },
  { id: "links", label: "Footer Links" },
  { id: "social", label: "Social Links" },
  { id: "contact", label: "Contact" },
  { id: "bottom", label: "Bottom Bar" },
];

const ICON_OPTIONS = [
  { value: "shield", label: "Shield" },
  { value: "truck", label: "Truck" },
  { value: "wallet", label: "Payment" },
  { value: "refresh", label: "Returns" },
  { value: "star", label: "Star" },
  { value: "package", label: "Package" },
  { value: "headphones", label: "Support" },
];

const PLATFORM_OPTIONS = [
  "facebook",
  "instagram",
  "youtube",
  "tiktok",
  "whatsapp",
  "messenger",
];

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#05714B] focus:ring-2 focus:ring-emerald-100";

async function request(path, options = {}) {
  const response = await fetch(path, {
    cache: "no-store",
    credentials: "same-origin",
    ...options,
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || result.success !== true) {
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

function Field({ label, children, hint }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-gray-800">
        {label}
      </label>

      {children}

      {hint && (
        <p className="text-[11px] leading-5 text-gray-500">
          {hint}
        </p>
      )}
    </div>
  );
}

function EditorCard({ title, children, action }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
        <h3 className="text-sm font-bold text-gray-900">
          {title}
        </h3>

        {action}
      </div>

      <div className="space-y-4 p-4">{children}</div>
    </div>
  );
}

function AddButton({ onClick, children, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-emerald-200 px-3 py-2 text-xs font-semibold text-[#05714B] hover:bg-emerald-50 disabled:opacity-40"
    >
      <Plus size={15} />
      {children}
    </button>
  );
}

function RemoveButton({ onClick, label = "Remove" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50"
    >
      <Trash2 size={16} />
    </button>
  );
}

export default function FooterEditor({
  footer,
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState(() => ({
    brand_name: footer.brand_name || "",
    brand_tagline: footer.brand_tagline || "",
    description: footer.description || "",
    community_title: footer.community_title || "",
    trust_badges: structuredClone(footer.trust_badges || []),
    link_columns: structuredClone(footer.link_columns || []),
    social_links: structuredClone(footer.social_links || []),
    contact: structuredClone(footer.contact || {}),
    payment_methods: [...(footer.payment_methods || [])],
    copyright_text: footer.copyright_text || "",
    bottom_right_text: footer.bottom_right_text || "",
    is_active: footer.is_active ?? true,
  }));

  const [tab, setTab] = useState("branding");
  const [logoUrl, setLogoUrl] = useState(footer.logo_url || "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function update(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function updateArrayItem(field, index, property, value) {
    setForm((previous) => ({
      ...previous,
      [field]: previous[field].map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [property]: value }
          : item
      ),
    }));
  }

  function addArrayItem(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: [...previous[field], value],
    }));
  }

  function removeArrayItem(field, index) {
    setForm((previous) => ({
      ...previous,
      [field]: previous[field].filter(
        (_, itemIndex) => itemIndex !== index
      ),
    }));
  }

  function updateContact(field, value) {
    setForm((previous) => ({
      ...previous,
      contact: {
        ...previous.contact,
        [field]: value,
      },
    }));
  }

  function updateColumn(index, field, value) {
    setForm((previous) => ({
      ...previous,
      link_columns: previous.link_columns.map((column, i) =>
        i === index ? { ...column, [field]: value } : column
      ),
    }));
  }

  function updateLink(columnIndex, linkIndex, field, value) {
    setForm((previous) => ({
      ...previous,
      link_columns: previous.link_columns.map((column, i) => {
        if (i !== columnIndex) return column;

        return {
          ...column,
          links: column.links.map((link, j) =>
            j === linkIndex
              ? { ...link, [field]: value }
              : link
          ),
        };
      }),
    }));
  }

  function addLink(columnIndex) {
    setForm((previous) => ({
      ...previous,
      link_columns: previous.link_columns.map((column, index) =>
        index === columnIndex
          ? {
              ...column,
              links: [
                ...column.links,
                { label: "", url: "" },
              ],
            }
          : column
      ),
    }));
  }

  function removeLink(columnIndex, linkIndex) {
    setForm((previous) => ({
      ...previous,
      link_columns: previous.link_columns.map((column, index) =>
        index === columnIndex
          ? {
              ...column,
              links: column.links.filter(
                (_, i) => i !== linkIndex
              ),
            }
          : column
      ),
    }));
  }

  function updatePayment(index, value) {
    setForm((previous) => ({
      ...previous,
      payment_methods: previous.payment_methods.map((item, i) =>
        i === index ? value : item
      ),
    }));
  }

  async function uploadLogo(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      setError("Logo must be JPG, PNG or WEBP, maximum 5 MB.");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const body = new FormData();
      body.append("logo", file);

      const data = await request(`${API}/logo`, {
        method: "POST",
        body,
      });

      setLogoUrl(data.logo_url || "");
      setSuccess("Logo uploaded successfully.");
    } catch (err) {
      setError(err.message || "Unable to upload logo.");
    } finally {
      setUploading(false);
    }
  }

  async function removeLogo() {
    setUploading(true);
    setError("");
    setSuccess("");

    try {
      await request(`${API}/logo`, {
        method: "DELETE",
      });

      setLogoUrl("");
      setSuccess("Logo removed successfully.");
    } catch (err) {
      setError(err.message || "Unable to remove logo.");
    } finally {
      setUploading(false);
    }
  }

  async function saveFooter(event) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await request(API, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(form),
      });

      onSaved();
    } catch (err) {
      setError(err.message || "Unable to save footer.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[350] flex items-center justify-center bg-black/65 p-3 sm:p-5">
      <div className="flex max-h-[94vh] w-full max-w-[900px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 p-5">
          <div>
            <h2 className="text-xl font-bold text-gray-950">
              Edit Website Footer
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Manage footer design content directly from the homepage.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close editor"
            className="cursor-pointer rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-gray-200 px-4">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setTab(item.id);
                setError("");
              }}
              className={`shrink-0 cursor-pointer border-b-2 px-4 py-3 text-xs font-semibold ${
                tab === item.id
                  ? "border-[#05714B] text-[#05714B]"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <form
          onSubmit={saveFooter}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-gray-50 p-5">
            {error && (
              <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle size={17} />
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-[#05714B]">
                <CheckCircle2 size={17} />
                {success}
              </div>
            )}

            {tab === "branding" && (
              <>
                <EditorCard title="Brand Identity">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Brand Name">
                      <input
                        required
                        maxLength={100}
                        value={form.brand_name}
                        onChange={(event) =>
                          update("brand_name", event.target.value)
                        }
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Brand Tagline">
                      <input
                        maxLength={100}
                        value={form.brand_tagline}
                        onChange={(event) =>
                          update("brand_tagline", event.target.value)
                        }
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  <Field label="Description">
                    <textarea
                      rows={4}
                      maxLength={1000}
                      value={form.description}
                      onChange={(event) =>
                        update("description", event.target.value)
                      }
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Community Title">
                    <input
                      maxLength={100}
                      value={form.community_title}
                      onChange={(event) =>
                        update("community_title", event.target.value)
                      }
                      className={inputClass}
                    />
                  </Field>
                </EditorCard>

                <EditorCard title="Footer Logo">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-emerald-50">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt="Current footer logo"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-4xl font-extrabold text-[#05714B]">
                          {form.brand_name.charAt(0) || "S"}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#05714B] px-4 py-2.5 text-xs font-semibold text-white">
                        {uploading ? (
                          <LoaderCircle size={16} className="animate-spin" />
                        ) : (
                          <Upload size={16} />
                        )}
                        Upload Logo

                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={uploadLogo}
                          disabled={uploading}
                          className="hidden"
                        />
                      </label>

                      {logoUrl && (
                        <button
                          type="button"
                          disabled={uploading}
                          onClick={removeLogo}
                          className="ml-2 cursor-pointer text-xs font-medium text-red-600 disabled:opacity-50"
                        >
                          Remove Logo
                        </button>
                      )}

                      <p className="text-xs text-gray-400">
                        JPG, PNG or WEBP. Maximum 5 MB.
                      </p>
                    </div>
                  </div>
                </EditorCard>

                <EditorCard title="Footer Visibility">
                  <label className="flex cursor-pointer items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        Active Footer
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Display the footer to website visitors.
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      checked={Boolean(form.is_active)}
                      onChange={(event) =>
                        update("is_active", event.target.checked)
                      }
                      className="h-5 w-5 accent-[#05714B]"
                    />
                  </label>
                </EditorCard>
              </>
            )}

            {tab === "trust" && (
              <EditorCard
                title="Trust Badges"
                action={
                  <AddButton
                    disabled={form.trust_badges.length >= 4}
                    onClick={() =>
                      addArrayItem("trust_badges", {
                        icon: "shield",
                        title: "",
                        subtitle: "",
                      })
                    }
                  >
                    Add Badge
                  </AddButton>
                }
              >
                <p className="text-xs text-gray-500">
                  Up to four trust badges will appear above the footer.
                </p>

                {form.trust_badges.map((badge, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-600">
                        Badge {index + 1}
                      </span>

                      <RemoveButton
                        label="Remove badge"
                        onClick={() =>
                          removeArrayItem("trust_badges", index)
                        }
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <Field label="Icon">
                        <select
                          value={badge.icon}
                          onChange={(event) =>
                            updateArrayItem(
                              "trust_badges",
                              index,
                              "icon",
                              event.target.value
                            )
                          }
                          className={inputClass}
                        >
                          {ICON_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </Field>

                      <Field label="Title">
                        <input
                          required
                          maxLength={100}
                          value={badge.title}
                          onChange={(event) =>
                            updateArrayItem(
                              "trust_badges",
                              index,
                              "title",
                              event.target.value
                            )
                          }
                          className={inputClass}
                        />
                      </Field>

                      <Field label="Subtitle">
                        <input
                          maxLength={180}
                          value={badge.subtitle || ""}
                          onChange={(event) =>
                            updateArrayItem(
                              "trust_badges",
                              index,
                              "subtitle",
                              event.target.value
                            )
                          }
                          className={inputClass}
                        />
                      </Field>
                    </div>
                  </div>
                ))}
              </EditorCard>
            )}

            {tab === "links" && (
              <>
                {form.link_columns.map((column, columnIndex) => (
                  <EditorCard
                    key={columnIndex}
                    title={`Navigation Column ${columnIndex + 1}`}
                    action={
                      <RemoveButton
                        label="Remove column"
                        onClick={() =>
                          removeArrayItem(
                            "link_columns",
                            columnIndex
                          )
                        }
                      />
                    }
                  >
                    <Field label="Column Heading">
                      <input
                        required
                        maxLength={100}
                        value={column.title}
                        onChange={(event) =>
                          updateColumn(
                            columnIndex,
                            "title",
                            event.target.value
                          )
                        }
                        className={inputClass}
                      />
                    </Field>

                    <div className="space-y-3">
                      {column.links.map((link, linkIndex) => (
                        <div
                          key={linkIndex}
                          className="flex items-end gap-2"
                        >
                          <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
                            <Field label="Link Text">
                              <input
                                required
                                maxLength={100}
                                value={link.label}
                                onChange={(event) =>
                                  updateLink(
                                    columnIndex,
                                    linkIndex,
                                    "label",
                                    event.target.value
                                  )
                                }
                                className={inputClass}
                                placeholder="All Products"
                              />
                            </Field>

                            <Field label="Link URL">
                              <input
                                required
                                maxLength={500}
                                value={link.url}
                                onChange={(event) =>
                                  updateLink(
                                    columnIndex,
                                    linkIndex,
                                    "url",
                                    event.target.value
                                  )
                                }
                                className={inputClass}
                                placeholder="/products"
                              />
                            </Field>
                          </div>

                          <RemoveButton
                            label="Remove link"
                            onClick={() =>
                              removeLink(columnIndex, linkIndex)
                            }
                          />
                        </div>
                      ))}
                    </div>

                    <AddButton
                      disabled={column.links.length >= 15}
                      onClick={() => addLink(columnIndex)}
                    >
                      Add Link
                    </AddButton>
                  </EditorCard>
                ))}

                {form.link_columns.length < 3 && (
                  <AddButton
                    onClick={() =>
                      addArrayItem("link_columns", {
                        title: "",
                        links: [],
                      })
                    }
                  >
                    Add Navigation Column
                  </AddButton>
                )}
              </>
            )}

            {tab === "social" && (
              <EditorCard
                title="Social Media Links"
                action={
                  <AddButton
                    disabled={form.social_links.length >= 10}
                    onClick={() =>
                      addArrayItem("social_links", {
                        platform: "facebook",
                        url: "",
                      })
                    }
                  >
                    Add Social
                  </AddButton>
                }
              >
                <p className="text-xs leading-5 text-gray-500">
                  Empty URLs will not appear on the public footer.
                  WhatsApp and Messenger will use dedicated buttons.
                </p>

                {form.social_links.map((item, index) => (
                  <div key={index} className="flex items-end gap-2">
                    <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-[160px_1fr]">
                      <Field label="Platform">
                        <select
                          value={item.platform}
                          onChange={(event) =>
                            updateArrayItem(
                              "social_links",
                              index,
                              "platform",
                              event.target.value
                            )
                          }
                          className={inputClass}
                        >
                          {PLATFORM_OPTIONS.map((platform) => (
                            <option key={platform} value={platform}>
                              {platform}
                            </option>
                          ))}
                        </select>
                      </Field>

                      <Field label="Profile URL">
                        <input
                          maxLength={500}
                          value={item.url || ""}
                          onChange={(event) =>
                            updateArrayItem(
                              "social_links",
                              index,
                              "url",
                              event.target.value
                            )
                          }
                          className={inputClass}
                          placeholder="https://..."
                        />
                      </Field>
                    </div>

                    <RemoveButton
                      label="Remove social link"
                      onClick={() =>
                        removeArrayItem("social_links", index)
                      }
                    />
                  </div>
                ))}
              </EditorCard>
            )}

            {tab === "contact" && (
              <EditorCard title="Contact Information">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Hotline Number">
                    <input
                      maxLength={40}
                      value={form.contact.hotline || ""}
                      onChange={(event) =>
                        updateContact("hotline", event.target.value)
                      }
                      className={inputClass}
                      placeholder="+880 1300-000000"
                    />
                  </Field>

                  <Field label="Email Address">
                    <input
                      type="email"
                      maxLength={180}
                      value={form.contact.email || ""}
                      onChange={(event) =>
                        updateContact("email", event.target.value)
                      }
                      className={inputClass}
                    />
                  </Field>
                </div>

                <Field label="Business Address">
                  <textarea
                    rows={4}
                    maxLength={500}
                    value={form.contact.address || ""}
                    onChange={(event) =>
                      updateContact("address", event.target.value)
                    }
                    className={inputClass}
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Store Link Text">
                    <input
                      maxLength={100}
                      value={form.contact.store_text || ""}
                      onChange={(event) =>
                        updateContact("store_text", event.target.value)
                      }
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Store Link URL">
                    <input
                      maxLength={500}
                      value={form.contact.store_url || ""}
                      onChange={(event) =>
                        updateContact("store_url", event.target.value)
                      }
                      className={inputClass}
                      placeholder="/#visit-outlets"
                    />
                  </Field>
                </div>
              </EditorCard>
            )}

            {tab === "bottom" && (
              <>
                <EditorCard
                  title="Payment Methods"
                  action={
                    <AddButton
                      disabled={form.payment_methods.length >= 8}
                      onClick={() =>
                        setForm((previous) => ({
                          ...previous,
                          payment_methods: [
                            ...previous.payment_methods,
                            "",
                          ],
                        }))
                      }
                    >
                      Add Method
                    </AddButton>
                  }
                >
                  {form.payment_methods.map((method, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2"
                    >
                      <input
                        required
                        maxLength={60}
                        value={method}
                        onChange={(event) =>
                          updatePayment(index, event.target.value)
                        }
                        className={inputClass}
                        placeholder="Cash on Delivery"
                      />

                      <RemoveButton
                        label="Remove payment method"
                        onClick={() =>
                          removeArrayItem("payment_methods", index)
                        }
                      />
                    </div>
                  ))}
                </EditorCard>

                <EditorCard title="Copyright and Bottom Text">
                  <Field
                    label="Copyright Text"
                    hint="The current year is inserted automatically."
                  >
                    <input
                      maxLength={200}
                      value={form.copyright_text}
                      onChange={(event) =>
                        update(
                          "copyright_text",
                          event.target.value
                        )
                      }
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Bottom Right Text">
                    <input
                      maxLength={200}
                      value={form.bottom_right_text}
                      onChange={(event) =>
                        update(
                          "bottom_right_text",
                          event.target.value
                        )
                      }
                      className={inputClass}
                      placeholder="Optional text"
                    />
                  </Field>
                </EditorCard>
              </>
            )}
          </div>

          <div className="flex shrink-0 justify-end gap-3 border-t border-gray-200 bg-white p-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="cursor-pointer rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#05714B] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#045C3D] disabled:opacity-50"
            >
              {saving ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <Save size={17} />
              )}

              {saving ? "Saving..." : "Save Footer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
