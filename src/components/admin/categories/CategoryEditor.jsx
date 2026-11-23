"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Save, Upload, ImageIcon,
  AlertTriangle, LoaderCircle, X, Plus, ChevronDown,
} from "lucide-react";
import CategoryStyles from "./CategoryStyles";
import {
  apiImage,
  categoryRequest,
  flattenTree,
  toSlug,
} from "./categoryUtils";

const initial = {
  name: "",
  slug: "",
  description: "",
  parent_id: "",
  status: "active",
  is_featured: false,
  display_order: 0,
  tax_class: "",
  meta_title: "",
  meta_description: "",
  tags: [],
};

function MediaPicker({ title, note, value, onChange, field }) {
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setBroken(false);
  }, [value]);

  return (
    <section className="cat-section">
      <h2>{title}</h2>

      <div className="cat-media-line">
        <span className="cat-media-preview">
          {value && !broken ? (
            <img
              src={value}
              alt={`${title} preview`}
              onError={() => setBroken(true)}
            />
          ) : (
            <ImageIcon size={30} />
          )}
        </span>

        <div>
          <label className="cat-button cat-outline cat-file-label">
            <Upload size={16} />
            Choose {title.toLowerCase()}
            <input
              type="file"
              name={field}
              accept="image/png,image/jpeg,image/webp"
              hidden
              onChange={(e) => onChange(e.target.files?.[0] || null)}
            />
          </label>
          <p className="cat-help">{note}</p>
        </div>
      </div>
    </section>
  );
}

export default function CategoryEditor({ categoryId = null }) {
  const editing = Boolean(categoryId);
  const router = useRouter();

  const [form, setForm] = useState(initial);
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [coverFile, setCoverFile] = useState(null);
  const [iconFile, setIconFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [iconPreview, setIconPreview] = useState("");

  const [tagDraft, setTagDraft] = useState("");
  const [seoOpen, setSeoOpen] = useState(true);
  const [slugEdited, setSlugEdited] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [treeData, item] = await Promise.all([
          categoryRequest("/api/admin/categories/tree"),
          editing
            ? categoryRequest(`/api/admin/categories/${categoryId}`)
            : Promise.resolve(null),
        ]);

        if (!active) return;

        setTree(treeData || []);

        if (item) {
          setForm({
            name: item.name || "",
            slug: item.slug || "",
            description: item.description || "",
            parent_id: item.parent_id == null
              ? ""
              : String(item.parent_id),
            status: item.status || "active",
            is_featured: Boolean(item.is_featured),
            display_order: item.display_order ?? 0,
            tax_class: item.tax_class || "",
            meta_title: item.meta_title || "",
            meta_description: item.meta_description || "",
            tags: Array.isArray(item.tags) ? item.tags : [],
          });

          setCoverPreview(apiImage(item.cover_image));
          setIconPreview(apiImage(item.icon));
          setSlugEdited(true);
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [categoryId, editing]);

  useEffect(() => {
    return () => {
      if (coverPreview.startsWith("blob:")) {
        URL.revokeObjectURL(coverPreview);
      }

      if (iconPreview.startsWith("blob:")) {
        URL.revokeObjectURL(iconPreview);
      }
    };
  }, [coverPreview, iconPreview]);

  const flat = useMemo(() => flattenTree(tree), [tree]);

  const forbiddenIds = useMemo(() => {
    const ids = new Set();

    if (!editing) return ids;

    const target = Number(categoryId);

    function collect(nodes, blocked = false) {
      for (const node of nodes || []) {
        const isBlocked = blocked || Number(node.id) === target;

        if (isBlocked) ids.add(Number(node.id));
        collect(node.children, isBlocked);
      }
    }

    collect(tree);
    return ids;
  }, [tree, categoryId, editing]);

  function setField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "name" && !slugEdited
        ? { slug: toSlug(value) }
        : {}),
    }));
  }

  function chooseImage(file, kind) {
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Choose a JPG, PNG or WebP image.");
      return;
    }

    const limit = kind === "cover" ? 4 : 2;

    if (file.size > limit * 1024 * 1024) {
      setError(`${kind} exceeds the ${limit} MB limit.`);
      return;
    }

    if (kind === "cover") {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    } else {
      setIconFile(file);
      setIconPreview(URL.createObjectURL(file));
    }

    setError("");
  }

  function addTag() {
    const tag = tagDraft.trim();

    if (
      tag &&
      !form.tags.includes(tag) &&
      form.tags.length < 20 &&
      tag.length <= 50
    ) {
      setField("tags", [...form.tags, tag]);
    }

    setTagDraft("");
  }

  async function upload(id, field, file) {
    if (!file) return;

    const data = new FormData();
    data.append(field, file);

    await categoryRequest(`/api/admin/categories/${id}/${field}`, {
      method: "POST",
      body: data,
    });
  }

  async function save(event) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setError("");

    let savedId = editing ? categoryId : null;

    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        slug: form.slug.trim() || null,
        parent_id: form.parent_id === ""
          ? null
          : Number(form.parent_id),
        display_order: Number(form.display_order) || 0,
        description: form.description.trim() || null,
        tax_class: form.tax_class.trim() || null,
        meta_title: form.meta_title.trim() || null,
        meta_description: form.meta_description.trim() || null,
      };

      const result = await categoryRequest(
        editing
          ? `/api/admin/categories/${categoryId}`
          : "/api/admin/categories",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      savedId = result.id || savedId;

      try {
        await upload(savedId, "cover", coverFile);
        await upload(savedId, "icon", iconFile);
      } catch (uploadError) {
        setError(
          `Category saved, but media upload failed: ${uploadError.message}`
        );

        if (!editing) {
          router.replace(`/admin/categories/${savedId}/edit`);
        }

        return;
      }

      router.push("/admin/categories");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="cat-root cat-editor-root">
      <CategoryStyles />

      <div className="cat-editor-head">
        <div className="cat-editor-title">
          <h1>
            {editing ? form.name || "Edit Category" : "Add Category"}
          </h1>

          {editing && !loading && (
            <span className={`cat-pill ${form.status}`}>
              {form.status}
            </span>
          )}
        </div>

        <div className="cat-editor-actions">
          <button
            type="submit"
            form="category-edit-form"
            disabled={saving || loading}
            className="cat-button cat-primary"
          >
            {saving ? (
              <LoaderCircle size={16} className="cat-spinner" />
            ) : (
              <Save size={16} />
            )}
            {saving ? "Saving..." : "Save"}
          </button>

          <Link
            href="/admin/categories"
            className="cat-button cat-outline"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
        </div>
      </div>

      {error && (
        <div className="cat-notice cat-notice-error" role="alert">
          <AlertTriangle size={17} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="cat-empty">
          <LoaderCircle size={18} className="cat-spinner" />
          Loading category...
        </div>
      ) : (
        <form
          id="category-edit-form"
          onSubmit={save}
          className="cat-editor-grid"
        >
          <div className="cat-editor-main">
            <section className="cat-section">
              <h2>Details</h2>

              <label className="cat-field">
                Name *
                <input
                  required
                  maxLength={255}
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  placeholder="Category name"
                />
              </label>

              <label className="cat-field">
                Description
                <textarea
                  maxLength={500}
                  rows={3}
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  placeholder="Describe this category..."
                />
                <small>{form.description.length}/500 characters</small>
              </label>
            </section>

            <MediaPicker
              title="Media"
              field="cover"
              note="Cover image. JPG, PNG or WebP, maximum 4 MB."
              value={coverPreview}
              onChange={(file) => chooseImage(file, "cover")}
            />

            <MediaPicker
              title="Icon"
              field="icon"
              note="Transparent square image recommended, maximum 2 MB."
              value={iconPreview}
              onChange={(file) => chooseImage(file, "icon")}
            />

            <section className="cat-section">
              <h2>Variants</h2>
              <p className="cat-help">
                Category variant assignments will be available after
                the Global Variants API is created.
              </p>
            </section>

            <section className="cat-section">
              <div className="cat-section-heading">
                <div>
                  <h2>Search Engine Listing</h2>
                  <p className="cat-help">
                    Customize the search result preview.
                  </p>
                </div>

                <button
                  type="button"
                  className="cat-button cat-outline"
                  onClick={() => setSeoOpen(!seoOpen)}
                >
                  {seoOpen ? "Hide SEO" : "Show SEO"}
                  <ChevronDown size={15} />
                </button>
              </div>

              {seoOpen && (
                <>
                  <div className="cat-serp">
                    <strong>SheraDeal</strong>
                    <small>
                      sheradeal.com › categories › {form.slug || "category"}
                    </small>
                    <span>
                      {form.meta_title || form.name || "Category name"}
                    </span>
                    <p>
                      {form.meta_description ||
                        form.description ||
                        "No description available."}
                    </p>
                  </div>

                  <label className="cat-field">
                    Page title
                    <input
                      maxLength={70}
                      value={form.meta_title}
                      onChange={(e) =>
                        setField("meta_title", e.target.value)
                      }
                      placeholder={form.name || "Category page title"}
                    />
                    <small>{form.meta_title.length}/70</small>
                  </label>

                  <label className="cat-field">
                    Meta description
                    <textarea
                      rows={3}
                      maxLength={160}
                      value={form.meta_description}
                      onChange={(e) =>
                        setField("meta_description", e.target.value)
                      }
                    />
                    <small>{form.meta_description.length}/160</small>
                  </label>

                  <label className="cat-field">
                    URL handle
                    <div className="cat-slug">
                      <span>categories/</span>
                      <input
                        maxLength={255}
                        value={form.slug}
                        onChange={(e) => {
                          setSlugEdited(true);
                          setField("slug", toSlug(e.target.value));
                        }}
                      />
                    </div>
                    <small>URL slug must be unique across categories.</small>
                  </label>

                  <div className="cat-field">
                    Tags
                    <div className="cat-tag-wrap">
                      {form.tags.map((tag) => (
                        <span key={tag} className="cat-tag">
                          {tag}
                          <button
                            type="button"
                            onClick={() =>
                              setField(
                                "tags",
                                form.tags.filter((item) => item !== tag)
                              )
                            }
                            aria-label={`Remove ${tag}`}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}

                      <input
                        value={tagDraft}
                        onChange={(e) => setTagDraft(e.target.value)}
                        maxLength={50}
                        placeholder="Add a tag"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === ",") {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                      />

                      <button
                        type="button"
                        onClick={addTag}
                        title="Add tag"
                      >
                        <Plus size={17} />
                      </button>
                    </div>
                    <small>Press Enter to add. Maximum 20 tags.</small>
                  </div>
                </>
              )}
            </section>
          </div>

          <aside className="cat-editor-aside">
            <section className="cat-section">
              <h2>Status</h2>

              <label className="cat-field">
                Status
                <select
                  value={form.status}
                  onChange={(e) => setField("status", e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>

              <label className="cat-toggle">
                <span>
                  <strong>Featured category</strong>
                  <small>
                    Show this category in the featured section.
                  </small>
                </span>

                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) =>
                    setField("is_featured", e.target.checked)
                  }
                />
              </label>
            </section>

            <section className="cat-section">
              <h2>Organization</h2>

              <label className="cat-field">
                Parent category
                <select
                  value={form.parent_id}
                  onChange={(e) =>
                    setField("parent_id", e.target.value)
                  }
                >
                  <option value="">None (root category)</option>

                  {flat
                    .filter(
                      (node) =>
                        node.depth < 2 &&
                        !forbiddenIds.has(Number(node.id))
                    )
                    .map((node) => (
                      <option key={node.id} value={String(node.id)}>
                        {"— ".repeat(node.depth)}
                        {node.name}
                      </option>
                    ))}
                </select>

                <small>
                  Maximum 3 levels. Backend also validates the hierarchy.
                </small>
              </label>

              <div className="cat-hierarchy-help">
                <strong>Mega menu nesting</strong>
                <p>L1 Main category → Rail row</p>
                <p>L2 Sub-category → Column</p>
                <p>L3 Sub-sub-category → Link</p>
              </div>

              <label className="cat-field">
                Display order
                <input
                  type="number"
                  min="0"
                  value={form.display_order}
                  onChange={(e) =>
                    setField("display_order", e.target.value)
                  }
                />
                <small>Lower numbers appear first.</small>
              </label>

              <label className="cat-field">
                Tax class
                <input
                  value={form.tax_class}
                  maxLength={100}
                  placeholder="Leave empty to inherit"
                  onChange={(e) =>
                    setField("tax_class", e.target.value)
                  }
                />
                <small>
                  Tax classes will be configurable in Tax Settings.
                </small>
              </label>

              <div className="cat-info">
                <span>Products</span>
                <strong>Available after product integration</strong>
              </div>
            </section>
          </aside>
        </form>
      )}
    </div>
  );
}
