"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../../../lib/api";

export default function SupplierMachineVerification() {
  const router = useRouter();
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [sendingReplyId, setSendingReplyId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    manufacturer: "",
    industrySlug: "",
    subIndustrySlug: "",
    features: [],
    specs: [],
    photos: [],
    minOrderQty: "",
    leadTimeDays: "",
    condition: "new",
    priceRange: "",
    warrantyMonths: ""
  });
  const [newFeature, setNewFeature] = useState("");
  const [newSpec, setNewSpec] = useState({ key: "", value: "" });
  const [newPhoto, setNewPhoto] = useState("");
  const [industries, setIndustries] = useState([]);
  const [subIndustries, setSubIndustries] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const formatDateTime = (value) => {
    if (!value) return "—";
    try {
      return new Date(value).toLocaleString();
    } catch {
      return "—";
    }
  };

  const lastMessage = (messages) => {
    if (!Array.isArray(messages) || messages.length === 0) return null;
    return messages[messages.length - 1];
  };

  const needsSellerResponse = (messages) => lastMessage(messages)?.sender === "admin";

  const sendReply = async (machineId) => {
    const content = String(replyDrafts[machineId] || "").trim();
    if (!content) return;

    setSendingReplyId(machineId);
    try {
      const payload = await apiFetch(`/api/supplier/verify-machines/${machineId}/message`, {
        method: "POST",
        body: JSON.stringify({ content })
      });

      setMachines((prev) => prev.map((m) => (m._id === machineId ? payload.data : m)));
      setReplyDrafts((prev) => ({ ...prev, [machineId]: "" }));
    } catch (err) {
      alert(err.message || "Failed to send reply");
    } finally {
      setSendingReplyId(null);
    }
  };

  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const payload = await apiFetch("/api/industries");
        setIndustries(payload.data || []);
      } catch (err) {
        console.error("Failed to load industries:", err);
      }
    };
    fetchIndustries();
  }, []);

  useEffect(() => {
    const selectedIndustry = industries.find(ind => ind.slug === formData.industrySlug);
    setSubIndustries(selectedIndustry?.subIndustries || []);
    if (selectedIndustry && !selectedIndustry.subIndustries?.find(sub => sub.slug === formData.subIndustrySlug)) {
      setFormData(prev => ({ ...prev, subIndustrySlug: "" }));
    }
  }, [formData.industrySlug, industries]);

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const payload = await apiFetch("/api/supplier/verify-machines");
        setMachines(payload.data || []);
      } catch (err) {
        if (err?.status === 401) {
          router.push("/login/supplier");
          return;
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMachines();
  }, [router]);

  const handleAddFeature = () => {
    const trimmed = newFeature.trim();
    if (trimmed) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, trimmed]
      }));
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (index) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleAddSpec = () => {
    const key = newSpec.key.trim();
    const value = newSpec.value.trim();
    if (key && value) {
      setFormData((prev) => ({
        ...prev,
        specs: [...prev.specs, { key, value }]
      }));
      setNewSpec({ key: "", value: "" });
    }
  };

  const handleRemoveSpec = (index) => {
    setFormData((prev) => ({
      ...prev,
      specs: prev.specs.filter((_, i) => i !== index)
    }));
  };

  const handleAddPhoto = () => {
    const trimmed = newPhoto.trim();
    if (trimmed) {
      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, trimmed]
      }));
      setNewPhoto("");
    }
  };

  const handleRemovePhoto = (index) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const MAX_PHOTOS = 5;

  const blobToDataUrl = (blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error || new Error("Failed to read file"));
      reader.readAsDataURL(blob);
    });

  const compressImageFile = async (file) => {
    // Resize & compress in-browser to keep uploads fast and payloads small.
    const bitmap = await createImageBitmap(file);
    const maxDim = 1280;
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
    if (!blob) throw new Error("Failed to encode image");
    return blobToDataUrl(blob);
  };

  const handlePhotoFiles = async (event) => {
    const fileList = event.target.files;
    const files = fileList ? Array.from(fileList) : [];
    if (!files.length) return;

    const remaining = Math.max(0, MAX_PHOTOS - (formData.photos?.length || 0));
    if (remaining <= 0) {
      alert(`You can upload up to ${MAX_PHOTOS} photos.`);
      event.target.value = "";
      return;
    }

    const selected = files.slice(0, remaining);
    try {
      const dataUrls = await Promise.all(selected.map((file) => compressImageFile(file)));
      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, ...dataUrls]
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to process one of the images. Try a smaller file.");
    } finally {
      event.target.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation before submitting
    const errors = [];
    if (!formData.name || formData.name.length < 2) {
      errors.push("• Machine name must be at least 2 characters");
    }
    if (!formData.description || formData.description.length < 5) {
      errors.push("• Description must be at least 5 characters");
    }
    if (!formData.manufacturer || formData.manufacturer.length < 2) {
      errors.push("• Manufacturer must be at least 2 characters");
    }
    if (!formData.industrySlug) {
      errors.push("• Industry is required");
    }
    if (!formData.subIndustrySlug) {
      errors.push("• Sub-industry is required");
    }

    if (errors.length > 0) {
      alert("Please fix these errors:\n\n" + errors.join("\n"));
      return;
    }

    setSubmitting(true);

    try {
      console.log('Submitting form data:', formData);
      const json = await apiFetch("/api/supplier/verify-machine", {
        method: "POST",
        body: JSON.stringify(formData)
      });

      console.log('Success response:', json);

      setMachines((prev) => [json.data, ...prev]);
      setFormData({
        name: "",
        description: "",
        manufacturer: "",
        industrySlug: "",
        subIndustrySlug: "",
        features: [],
        specs: [],
        photos: [],
        minOrderQty: "",
        leadTimeDays: "",
        condition: "new",
        priceRange: "",
        warrantyMonths: ""
      });
      setShowForm(false);
      alert("Machine submitted for verification!");
    } catch (err) {
      console.error('Submit error:', err);
      alert(`Failed to submit machine: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteMachine = async (machineId) => {
    if (!confirm("Are you sure?")) return;
    try {
      await apiFetch(`/api/supplier/verify-machines/${machineId}`, { method: "DELETE" });
      setMachines((prev) => prev.filter((m) => m._id !== machineId));
    } catch (err) {
      alert("Failed to delete machine");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Machine Verification Portal</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
          >
            {showForm ? "Cancel" : "+ Add Machine"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Submit Machine for Verification</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Machine Name * <span className="text-xs text-gray-500">(min 2 chars)</span></label>
                <input
                  type="text"
                  required
                  minLength="2"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Cutting Machine, Weaving Loom"
                  className="w-full border rounded px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Manufacturer * <span className="text-xs text-gray-500">(min 2 chars)</span></label>
                <input
                  type="text"
                  required
                  minLength="2"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData((prev) => ({ ...prev, manufacturer: e.target.value }))}
                  placeholder="e.g., Company Name"
                  className="w-full border rounded px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Industry *</label>
                <select
                  required
                  value={formData.industrySlug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, industrySlug: e.target.value }))}
                  className="w-full border rounded px-3 py-2 outline-none focus:border-blue-500"
                >
                  <option value="">Select Industry</option>
                  <option value="food-processing">Food Processing</option>
                  <option value="textiles">Textiles</option>
                  <option value="manufacturing">Manufacturing</option>
                  {industries.map((industry) => (
                    <option key={industry.slug} value={industry.slug}>
                      {industry.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Sub-Industry *</label>
                <select
                  required
                  value={formData.subIndustrySlug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, subIndustrySlug: e.target.value }))}
                  className="w-full border rounded px-3 py-2 outline-none focus:border-blue-500"
                >
                  <option value="">Select Sub-Industry</option>
                  {formData.industrySlug === "food-processing" && (
                    <>
                      <option value="packaging-labeling">Packaging & Labeling</option>
                      <option value="dairy-processing">Dairy Processing</option>
                      <option value="grain-processing">Grain Processing</option>
                    </>
                  )}
                  {formData.industrySlug === "textiles" && (
                    <>
                      <option value="spinning-weaving">Spinning & Weaving</option>
                      <option value="dyeing-printing">Dyeing & Printing</option>
                      <option value="garment-manufacturing">Garment Manufacturing</option>
                    </>
                  )}
                  {formData.industrySlug === "manufacturing" && (
                    <>
                      <option value="machinery-equipment">Machinery & Equipment</option>
                      <option value="automation-systems">Automation Systems</option>
                      <option value="quality-control">Quality Control</option>
                    </>
                  )}
                  {subIndustries.map((subIndustry) => (
                    <option key={subIndustry.slug} value={subIndustry.slug}>
                      {subIndustry.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Min Order Qty</label>
                <input
                  type="text"
                  value={formData.minOrderQty}
                  onChange={(e) => setFormData((prev) => ({ ...prev, minOrderQty: e.target.value }))}
                  className="w-full border rounded px-3 py-2 outline-none focus:border-blue-500"
                  placeholder="e.g., 1 unit"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Lead Time (Days)</label>
                <input
                  type="text"
                  value={formData.leadTimeDays}
                  onChange={(e) => setFormData((prev) => ({ ...prev, leadTimeDays: e.target.value }))}
                  className="w-full border rounded px-3 py-2 outline-none focus:border-blue-500"
                  placeholder="e.g., 30-45"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Condition</label>
                <select
                  value={formData.condition}
                  onChange={(e) => setFormData((prev) => ({ ...prev, condition: e.target.value }))}
                  className="w-full border rounded px-3 py-2 outline-none focus:border-blue-500"
                >
                  <option value="new">New</option>
                  <option value="used">Used</option>
                  <option value="refurbished">Refurbished</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Price Range</label>
                <input
                  type="text"
                  value={formData.priceRange}
                  onChange={(e) => setFormData((prev) => ({ ...prev, priceRange: e.target.value }))}
                  className="w-full border rounded px-3 py-2 outline-none focus:border-blue-500"
                  placeholder="e.g., ₹8L - ₹12L"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Warranty (Months)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.warrantyMonths}
                  onChange={(e) => setFormData((prev) => ({ ...prev, warrantyMonths: e.target.value }))}
                  className="w-full border rounded px-3 py-2 outline-none focus:border-blue-500"
                  placeholder="e.g., 12"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">Description * <span className="text-xs text-gray-500">(min 5 chars)</span></label>
              <textarea
                required
                minLength="5"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Provide detailed description of the machine (at least 5 characters)"
                className="w-full border rounded px-3 py-2 outline-none focus:border-blue-500 resize-none"
                rows="4"
              />
            </div>

            {/* Photos */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">Photos</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoFiles}
                className="w-full border rounded px-3 py-2 outline-none focus:border-blue-500"
              />
              <p className="mt-2 text-xs text-gray-500">
                Upload up to {MAX_PHOTOS} photos (we auto-compress them for faster verification).
              </p>

              <div className="flex gap-2 mt-3">
                <input
                  type="url"
                  value={newPhoto}
                  onChange={(e) => setNewPhoto(e.target.value)}
                  className="flex-1 border rounded px-3 py-2 outline-none focus:border-blue-500"
                  placeholder="Or paste an image URL (https://...)"
                />
                <button
                  type="button"
                  onClick={handleAddPhoto}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
                >
                  Add URL
                </button>
              </div>

              {formData.photos.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {formData.photos.map((src, index) => (
                    <div key={`${src}-${index}`} className="relative group">
                      <img
                        src={src}
                        alt={`Machine photo ${index + 1}`}
                        className="h-28 w-full rounded object-cover border"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Features */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">Features</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  className="flex-1 border rounded px-3 py-2 outline-none focus:border-blue-500"
                  placeholder="Add feature"
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
                >
                  Add
                </button>
              </div>
              {formData.features.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.features.map((feature, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {feature}
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(index)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Specifications */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">Specifications</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                <input
                  type="text"
                  value={newSpec.key}
                  onChange={(e) => setNewSpec((prev) => ({ ...prev, key: e.target.value }))}
                  className="border rounded px-3 py-2 outline-none focus:border-blue-500"
                  placeholder="Spec name (e.g., Power)"
                />
                <input
                  type="text"
                  value={newSpec.value}
                  onChange={(e) => setNewSpec((prev) => ({ ...prev, value: e.target.value }))}
                  className="border rounded px-3 py-2 outline-none focus:border-blue-500"
                  placeholder="Spec value (e.g., 5 kW)"
                />
                <button
                  type="button"
                  onClick={handleAddSpec}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
                >
                  Add Spec
                </button>
              </div>

              {formData.specs.length > 0 && (
                <div className="space-y-2">
                  {formData.specs.map((spec, index) => (
                    <div
                      key={`${spec.key}-${index}`}
                      className="flex items-center justify-between gap-3 rounded-lg border bg-gray-50 px-3 py-2"
                    >
                      <p className="text-sm text-gray-800">
                        <span className="font-semibold">{spec.key}</span>
                        <span className="text-gray-500"> — {spec.value}</span>
                      </p>
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(index)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition"
              >
                {submitting ? "Submitting..." : "Submit for Verification"}
              </button>
            </div>
          </form>
        )}

        {/* Machines List */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Your Submitted Machines</h2>
          {machines.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600">No machines submitted yet.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {machines.map((machine) => (
                <div key={machine._id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-xl font-bold mb-1">{machine.name}</h3>
                      <p className="text-gray-600 mb-2">{machine.description}</p>
                      <p className="text-xs text-gray-500">
                        Submitted: {formatDateTime(machine.createdAt)}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        {needsSellerResponse(machine.messages) ? (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              lastMessage(machine.messages)?.priority
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {lastMessage(machine.messages)?.priority ? "Priority: Admin question" : "Admin question"}
                          </span>
                        ) : null}
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(machine.status)}`}>
                          {machine.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {machine.status === "approved" && machine.machineId ? (
                          <Link
                            href={`/machines/${machine.machineId}`}
                            className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                          >
                            View live
                          </Link>
                        ) : null}

                        {machine.status === "pending" ? (
                          <button
                            onClick={() => deleteMachine(machine._id)}
                            className="text-red-600 hover:text-red-800 text-sm font-semibold"
                          >
                            Delete
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      {machine.photos?.length ? (
                        <div className="grid grid-cols-2 gap-2">
                          {machine.photos.slice(0, 4).map((src, index) => (
                            <img
                              key={`${machine._id}-photo-${index}`}
                              src={src}
                              alt={`Photo ${index + 1}`}
                              className="h-28 w-full rounded border object-cover"
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="rounded border bg-gray-50 p-4 text-sm text-gray-600">
                          No photos uploaded.
                        </div>
                      )}

                      {machine.features?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {machine.features.map((feature, index) => (
                            <span
                              key={`${machine._id}-feature-${index}`}
                              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <div className="grid gap-2 text-sm">
                      <div className="rounded border bg-gray-50 px-3 py-2 flex justify-between">
                        <span className="font-semibold text-gray-800">Manufacturer</span>
                        <span className="text-gray-600">{machine.manufacturer || "—"}</span>
                      </div>
                      <div className="rounded border bg-gray-50 px-3 py-2 flex justify-between">
                        <span className="font-semibold text-gray-800">Min Order</span>
                        <span className="text-gray-600">{machine.minOrderQty || "—"}</span>
                      </div>
                      <div className="rounded border bg-gray-50 px-3 py-2 flex justify-between">
                        <span className="font-semibold text-gray-800">Lead Time</span>
                        <span className="text-gray-600">{machine.leadTimeDays || "—"}</span>
                      </div>
                      <div className="rounded border bg-gray-50 px-3 py-2 flex justify-between">
                        <span className="font-semibold text-gray-800">Condition</span>
                        <span className="text-gray-600">{machine.condition || "new"}</span>
                      </div>
                      <div className="rounded border bg-gray-50 px-3 py-2 flex justify-between">
                        <span className="font-semibold text-gray-800">Price Range</span>
                        <span className="text-gray-600">{machine.priceRange || "—"}</span>
                      </div>
                      <div className="rounded border bg-gray-50 px-3 py-2 flex justify-between">
                        <span className="font-semibold text-gray-800">Warranty</span>
                        <span className="text-gray-600">
                          {Number.isFinite(machine.warrantyMonths) ? `${machine.warrantyMonths} months` : "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {machine.specs?.length ? (
                    <div className="mt-4">
                      <p className="text-sm font-semibold mb-2">Specifications</p>
                      <div className="grid gap-2 md:grid-cols-2">
                        {machine.specs.map((spec, index) => (
                          <div
                            key={`${machine._id}-spec-${index}`}
                            className="flex items-center justify-between rounded border bg-white px-3 py-2 text-sm"
                          >
                            <span className="font-semibold text-gray-800">{spec.key}</span>
                            <span className="text-gray-600">{spec.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {machine.status === "rejected" && machine.rejectionReason ? (
                    <div className="mt-4 rounded bg-red-50 p-3 text-sm text-red-700">
                      <strong>Rejection reason:</strong> {machine.rejectionReason}
                    </div>
                  ) : null}

                  <div className="mt-6 border-t pt-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-bold">Admin Questions</h4>
                      {needsSellerResponse(machine.messages) ? (
                        <span className="text-xs font-semibold text-amber-700">
                          Awaiting your response
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">Up to date</span>
                      )}
                    </div>

                    {Array.isArray(machine.messages) && machine.messages.length > 0 ? (
                      <div className="mt-3 max-h-64 overflow-y-auto space-y-3">
                        {machine.messages.map((msg, index) => (
                          <div
                            key={`${machine._id}-msg-${index}`}
                            className={`flex ${msg.sender === "seller" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                                msg.sender === "seller"
                                  ? "bg-blue-600 text-white"
                                  : msg.priority
                                    ? "bg-red-50 border border-red-200 text-red-900"
                                    : "bg-gray-100 text-gray-900"
                              }`}
                            >
                              <p className="text-xs font-semibold opacity-80 mb-1">
                                {msg.sender === "seller" ? "You" : msg.priority ? "Admin • Priority" : "Admin"}
                              </p>
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                              <p className="text-[11px] opacity-70 mt-1">{formatDateTime(msg.createdAt)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-gray-600">No questions from admin yet.</p>
                    )}

                    {machine.status !== "approved" ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          sendReply(machine._id);
                        }}
                        className="mt-3 flex gap-2"
                      >
                        <textarea
                          value={replyDrafts[machine._id] || ""}
                          onChange={(e) =>
                            setReplyDrafts((prev) => ({ ...prev, [machine._id]: e.target.value }))
                          }
                          rows={2}
                          placeholder="Reply to admin (share more specs, photos, warranty, etc.)"
                          className="flex-1 border rounded px-3 py-2 outline-none focus:border-blue-500 resize-none"
                        />
                        <button
                          type="submit"
                          disabled={sendingReplyId === machine._id || !String(replyDrafts[machine._id] || "").trim()}
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded transition text-sm font-semibold"
                        >
                          {sendingReplyId === machine._id ? "Sending..." : "Send"}
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
