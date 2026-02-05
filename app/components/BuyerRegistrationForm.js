"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import { setAuthUser } from "../../lib/auth";
import { useRouter } from "next/navigation";

const initialState = {
  name: "",
  email: "",
  phone: "",
  password: "",
  industry: "",
  subIndustry: "",
  location: ""
};

export default function BuyerRegistrationForm() {
  const [form, setForm] = useState(initialState);
  const [industries, setIndustries] = useState([]);
  const [subIndustries, setSubIndustries] = useState([]);
  const [status, setStatus] = useState({ loading: false, error: "", success: "" });
  const router = useRouter();

  useEffect(() => {
    apiFetch("/api/industries")
      .then((payload) => setIndustries(payload.data || []))
      .catch(() => setIndustries([]));
  }, []);

  useEffect(() => {
    const selected = industries.find((item) => item.slug === form.industry);
    setSubIndustries(selected?.subIndustries || []);
  }, [form.industry, industries]);

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setStatus({ loading: true, error: "", success: "" });

    try {
      const payload = await apiFetch("/api/auth/register-msme", {
        method: "POST",
        body: JSON.stringify(form)
      });
      setAuthUser(payload.data);
      setStatus({ loading: false, error: "", success: "Registration complete. Redirecting..." });
      setForm(initialState);
      router.push("/portal/buyer");
    } catch (error) {
      setStatus({ loading: false, error: error.message, success: "" });
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm text-ink-700">
          Full name
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            required
            className="mt-2 w-full rounded-xl border border-steel-300 bg-white px-4 py-3 text-sm"
          />
        </label>
        <label className="text-sm text-ink-700">
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            required
            className="mt-2 w-full rounded-xl border border-steel-300 bg-white px-4 py-3 text-sm"
          />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm text-ink-700">
          Phone
          <input
            name="phone"
            value={form.phone}
            onChange={onChange}
            required
            className="mt-2 w-full rounded-xl border border-steel-300 bg-white px-4 py-3 text-sm"
          />
        </label>
        <label className="text-sm text-ink-700">
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            required
            minLength={6}
            className="mt-2 w-full rounded-xl border border-steel-300 bg-white px-4 py-3 text-sm"
          />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm text-ink-700">
          Industry
          <select
            name="industry"
            value={form.industry}
            onChange={onChange}
            className="mt-2 w-full rounded-xl border border-steel-300 bg-white px-4 py-3 text-sm"
          >
            <option value="">Select industry</option>
            {industries.map((industry) => (
              <option key={industry.slug} value={industry.slug}>
                {industry.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-ink-700">
          Sub-industry
          <select
            name="subIndustry"
            value={form.subIndustry}
            onChange={onChange}
            className="mt-2 w-full rounded-xl border border-steel-300 bg-white px-4 py-3 text-sm"
          >
            <option value="">Select sub-industry</option>
            {subIndustries.map((segment) => (
              <option key={segment.slug} value={segment.slug}>
                {segment.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="text-sm text-ink-700">
        Location (city/state)
        <input
          name="location"
          value={form.location}
          onChange={onChange}
          className="mt-2 w-full rounded-xl border border-steel-300 bg-white px-4 py-3 text-sm"
        />
      </label>

      {status.error ? <p className="text-sm text-red-600">{status.error}</p> : null}
      {status.success ? <p className="text-sm text-jade-600">{status.success}</p> : null}

      <button
        type="submit"
        disabled={status.loading}
        className="w-full rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {status.loading ? "Submitting..." : "Create Buyer Account"}
      </button>
    </form>
  );
}
