"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../lib/api";
import { setAuthUser } from "../../lib/auth";

const initialState = {
  email: "",
  password: ""
};

export default function LoginForm({ role }) {
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState({ loading: false, error: "" });
  const router = useRouter();

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setStatus({ loading: true, error: "" });

    try {
      const payload = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ ...form, role })
      });
      setAuthUser(payload.data, payload.token);
      router.push(role === "supplier" ? "/portal/supplier" : "/portal/buyer");
    } catch (error) {
      setStatus({ loading: false, error: error.message });
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
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

      {status.error ? <p className="text-sm text-red-600">{status.error}</p> : null}

      <button
        type="submit"
        disabled={status.loading}
        className="w-full rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {status.loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
