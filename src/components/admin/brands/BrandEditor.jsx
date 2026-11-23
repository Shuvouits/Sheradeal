
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Save, Upload, ImageIcon,
  LoaderCircle, AlertCircle, CheckCircle2,
  ChevronDown,
} from "lucide-react";
import BrandStyles from "./BrandStyles";

const emptyForm = {
  name: "",
  description: "",
  website: "",
  slug: "",
  status: "active",
  source: "official",
  approval_status: "approved",
  is_featured: false,
  display_order: 0,
  meta_title: "",
  meta_description: "",
};

function makeSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function BrandEditor({ brandId = null }) {
  const router = useRouter();
  const isEdit = Boolean(brandId);

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [logo, setLogo] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [seoOpen, setSeoOpen] = useState(true);
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (!isEdit) return;

    let cancelled = false;

    const loadBrand = async () => {
      try {
        const response = await fetch(`/api/admin/brands/${brandId}`, {
          cache: "no-store",
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Could not load brand.");
        }

        if (cancelled) return;

        const brand = result.data;

        setForm({
          name: brand.name || "",
          description: brand.description || "",
          website: brand.website || "",
          slug: brand.slug || "",
          status: brand.status || "active",
          source: brand.source || "official",
          approval_status: brand.approval_status || "approved",
          is_featured: Boolean(brand.is_featured),
          display_order: brand.display_order ?? 0,
          meta_title: brand.meta_title || "",
          meta_description: brand.meta_description || "",
        });

        setSlugTouched(true);

        if (brand.logo) {
          const base = process.env.NEXT_PUBLIC_LARAVEL_URL || "http://127.0.0.1:8000";
          setPreview(`${base.replace(/\/$/, "")}/storage/${brand.logo.replace(/^\/+/, "")}`);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadBrand();

    return () => { cancelled = true; };
  }, [brandId, isEdit]);

  const updateField = (key, value) => {
    setForm(prev => {
      const next = { ...prev, [key]: value };

      if (key === "name" && !slugTouched) {
        next.slug = makeSlug(value);
      }

      return next;
    });
  };

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please select a JPG, PNG or WebP image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Logo must not exceed 2 MB.");
      return;
    }

    if (preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setLogo(file);
    setPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (saving) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        ...form,
        display_order: Number(form.display_order) || 0,
        slug: form.slug.trim() || null,
        website: form.website.trim() || null,
        meta_title: form.meta_title.trim() || null,
        meta_description: form.meta_description.trim() || null,
        description: form.description.trim() || null,
      };

      const url = isEdit
        ? `/api/admin/brands/${brandId}`
        : "/api/admin/brands";

      const response = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        const validationError = result.errors
          ? Object.values(result.errors).flat()[0]
          : null;

        throw new Error(validationError || result.message || "Unable to save brand.");
      }

      const savedId = result.data?.id || brandId;

      if (logo && savedId) {
        setUploading(true);

        const formData = new FormData();
        formData.append("logo", logo);

        const logoResponse = await fetch(
          `/api/admin/brands/${savedId}/logo`,
          { method: "POST", body: formData }
        );

        const logoResult = await logoResponse.json();

        if (!logoResponse.ok || !logoResult.success) {
          setError(
            `Brand saved, but logo upload failed: ${logoResult.message || "Unknown error"}`
          );
          setUploading(false);
          if (!isEdit) router.replace(`/admin/brands/${savedId}/edit`);
          return;
        }
      }

      setSuccess(isEdit ? "Brand updated successfully." : "Brand created successfully.");
      router.push("/admin/brands");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="br-page br-loading">
        <LoaderCircle className="br-spin" size={24} />
        Loading brand...
      </div>
    );
  }

  return (
    <div className="br-page">
      <BrandStyles />

      <div className="br-edit-header">
        <div>
          <h1>{isEdit ? form.name || "Edit Brand" : "Add Brand"}</h1>
          {isEdit && <span className={`br-pill ${form.status}`}>{form.status}</span>}
        </div>

        <div className="br-header-actions">
          <button
            type="submit"
            form="brand-form"
            className="br-btn br-btn-primary"
            disabled={saving}
          >
            {saving ? <LoaderCircle size={17} className="br-spin" /> : <Save size={17} />}
            {uploading ? "Uploading..." : saving ? "Saving..." : "Save"}
          </button>

          <Link href="/admin/brands" className="br-btn br-btn-outline">
            <ArrowLeft size={17} /> Back
          </Link>
        </div>
      </div>

      {error && (
        <div className="br-alert br-alert-error">
          <AlertCircle size={17} /> {error}
        </div>
      )}

      {success && (
        <div className="br-alert br-alert-success">
          <CheckCircle2 size={17} /> {success}
        </div>
      )}

      <form id="brand-form" onSubmit={handleSave} className="br-editor-grid">
        <div className="br-editor-main">
          <section className="br-section">
            <h2>Details</h2>

            <div className="br-field">
              <label htmlFor="brand-name">Name *</label>
              <input
                id="brand-name"
                value={form.name}
                maxLength={255}
                onChange={e => updateField("name", e.target.value)}
                placeholder="Enter brand name"
                required
              />
            </div>

            <div className="br-field">
              <label htmlFor="brand-desc">Description</label>
              <textarea
                id="brand-desc"
                rows={3}
                maxLength={500}
                value={form.description}
                onChange={e => updateField("description", e.target.value)}
                placeholder="Describe this brand..."
              />
              <small>{form.description.length}/500 characters</small>
            </div>

            <div className="br-field">
              <label htmlFor="brand-website">Website</label>
              <input
                id="brand-website"
                type="url"
                value={form.website}
                onChange={e => updateField("website", e.target.value)}
                placeholder="https://brand.com"
              />
              <small>Optional link to the brand's official website.</small>
            </div>
          </section>

          <section className="br-section">
            <h2>Logo</h2>

            <div className="br-logo-upload">
              <div className="br-logo-preview">
                {preview ? (
                  <img src={preview} alt="Brand logo preview" />
                ) : (
                  <ImageIcon size={35} />
                )}
              </div>

              <div>
                <label className="br-btn br-btn-outline br-upload-button">
                  <Upload size={17} />
                  Choose image
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleLogoChange}
                    hidden
                  />
                </label>
                <p>JPG, PNG or WebP. Maximum 2 MB.</p>
              </div>
            </div>
          </section>

          <section className="br-section">
            <div className="br-section-heading">
              <div>
                <h2>Search Engine Listing</h2>
                <p>Customize how this brand appears in search results.</p>
              </div>

              <button
                type="button"
                className="br-btn br-btn-outline"
                onClick={() => setSeoOpen(!seoOpen)}
              >
                {seoOpen ? "Hide SEO" : "Show SEO"}
                <ChevronDown size={15} />
              </button>
            </div>

            {seoOpen && (
              <>
                <div className="br-serp-preview">
                  <strong>SheraDeal</strong>
                  <small>sheradeal.com › brands › {form.slug || "brand"}</small>
                  <span>{form.meta_title || form.name || "Brand name"}</span>
                  <p>{form.meta_description || form.description || "No description available."}</p>
                </div>

                <div className="br-field">
                  <label>Page title</label>
                  <input
                    maxLength={70}
                    value={form.meta_title}
                    onChange={e => updateField("meta_title", e.target.value)}
                    placeholder={form.name || "Brand page title"}
                  />
                  <small>{form.meta_title.length}/70</small>
                </div>

                <div className="br-field">
                  <label>Meta description</label>
                  <textarea
                    rows={3}
                    maxLength={160}
                    value={form.meta_description}
                    onChange={e => updateField("meta_description", e.target.value)}
                    placeholder="Enter meta description for search engines"
                  />
                  <small>{form.meta_description.length}/160</small>
                </div>

                <div className="br-field">
                  <label>URL handle</label>
                  <div className="br-slug-input">
                    <span>brands/</span>
                    <input
                      value={form.slug}
                      maxLength={255}
                      onChange={e => {
                        setSlugTouched(true);
                        updateField("slug", makeSlug(e.target.value));
                      }}
                      placeholder="brand-name"
                    />
                  </div>
                  <small>sh eradeal.com/brands/{form.slug || "brand-name"}</small>
                </div>
              </>
            )}
          </section>
        </div>

        <div className="br-editor-aside">
          <section className="br-section">
            <h2>Status</h2>

            <div className="br-field">
              <label>Status</label>
              <select
                value={form.status}
                onChange={e => updateField("status", e.target.value)}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="br-field">
              <label>Approval</label>
              <select
                value={form.approval_status}
                onChange={e => updateField("approval_status", e.target.value)}
              >
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <label className="br-toggle-row">
              <span>
                <strong>Featured brand</strong>
                <small>Highlight this brand on the storefront.</small>
              </span>
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={e => updateField("is_featured", e.target.checked)}
              />
            </label>
          </section>

          <section className="br-section">
            <h2>Organization</h2>

            <div className="br-field">
              <label>Source</label>
              <select
                value={form.source}
                onChange={e => updateField("source", e.target.value)}
              >
                <option value="official">Official</option>
                <option value="vendor">Vendor</option>
              </select>
            </div>

            <div className="br-field">
              <label>Display order</label>
              <input
                type="number"
                min={0}
                value={form.display_order}
                onChange={e => updateField("display_order", e.target.value)}
              />
              <small>Lower numbers appear first.</small>
            </div>

            <div className="br-info-row">
              <span>Products</span>
              <strong>Assigned after product integration</strong>
            </div>
          </section>
        </div>
      </form>
    </div>
  );
}
