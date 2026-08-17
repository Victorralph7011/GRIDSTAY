"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useAuth } from "@/lib/firebase/useAuth";
import {
  subscribeToProviderProperties,
  type Property,
} from "@/lib/firebase/properties";
import {
  subscribeToProviderTickets,
  createTicket,
  updateTicketStatus,
  TICKET_STATUSES,
  TICKET_PRIORITIES,
  STATUS_LABEL,
  PRIORITY_LABEL,
  type MaintenanceTicket,
  type TicketStatus,
  type TicketPriority,
} from "@/lib/firebase/maintenance";
import MarketplaceHeader from "@/components/marketplace/MarketplaceHeader";

const inputClass =
  "w-full rounded-xl border border-gs-lightgrey bg-gs-white px-4 py-3 text-[15px] text-gs-charcoal placeholder:text-gs-midgrey focus:outline-none focus:border-gs-charcoal transition-colors";
const labelClass =
  "text-[11px] font-bold tracking-[0.1em] uppercase text-gs-midgrey";

const STATUS_CLASSES: Record<TicketStatus, string> = {
  open: "bg-gs-charcoal text-white",
  in_progress: "bg-gs-offwhite text-gs-darkgrey",
  resolved: "bg-gs-lightgrey text-gs-midgrey",
};

const PRIORITY_CLASSES: Record<TicketPriority, string> = {
  high: "text-red-600",
  medium: "text-gs-darkgrey",
  low: "text-gs-midgrey",
};

export default function MaintenancePage() {
  const { user, loading: authLoading } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TicketStatus | "all">("all");

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({
    propertyId: "",
    roomLabel: "",
    title: "",
    description: "",
    priority: "medium" as TicketPriority,
  });

  useEffect(() => {
    if (!user) return;
    return subscribeToProviderProperties(user.uid, setProperties);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    return subscribeToProviderTickets(
      user.uid,
      (t) => {
        setTickets(t);
        setLoading(false);
      },
      () => {
        setLoadError("Couldn't load your tickets. Please try again.");
        setLoading(false);
      }
    );
  }, [user]);

  const visible = useMemo(
    () => (filter === "all" ? tickets : tickets.filter((t) => t.status === filter)),
    [tickets, filter]
  );

  const openCount = tickets.filter((t) => t.status !== "resolved").length;
  const propertyName = (id: string) =>
    properties.find((p) => p.id === id)?.name ?? "Unknown property";

  const canSubmit =
    form.propertyId && form.title.trim().length > 2 && form.description.trim().length > 5;

  const handleCreate = async () => {
    if (!user || !canSubmit) return;
    setSaving(true);
    setFormError(null);
    try {
      await createTicket({
        providerId: user.uid,
        propertyId: form.propertyId,
        roomLabel: form.roomLabel.trim() || undefined,
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
      });
      setForm({
        propertyId: "",
        roomLabel: "",
        title: "",
        description: "",
        priority: "medium",
      });
      setShowForm(false);
    } catch {
      setFormError("Couldn't raise that ticket. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gs-white">
        <MarketplaceHeader />
        <p className="text-center text-gs-midgrey text-sm py-24">
          Loading maintenance queue…
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gs-white text-gs-charcoal">
      <MarketplaceHeader />

      <div className="gs-container py-10 flex flex-col gap-6">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[clamp(28px,4vw,40px)] tracking-[-0.02em]">
              Maintenance
            </h1>
            <p className="text-gs-midgrey text-[15px] mt-1">
              {openCount} unresolved {openCount === 1 ? "issue" : "issues"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowForm((s) => !s)}
            disabled={properties.length === 0}
            className="flex items-center gap-2 bg-gs-charcoal text-white text-[12px] font-bold uppercase tracking-[0.08em] px-6 py-3 rounded-full hover:bg-gs-black transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={15} /> {showForm ? "Cancel" : "Raise ticket"}
          </button>
        </div>

        {properties.length === 0 && (
          <div className="py-16 text-center flex flex-col items-center gap-2">
            <p className="text-gs-charcoal font-medium">No properties yet.</p>
            <p className="text-gs-midgrey text-sm">
              List a property before raising maintenance tickets.
            </p>
            <Link
              href="/onboarding"
              className="text-sm text-gs-midgrey underline mt-1"
            >
              List your property
            </Link>
          </div>
        )}

        {/* New ticket */}
        {showForm && properties.length > 0 && (
          <div className="rounded-2xl border border-gs-lightgrey p-5 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className={labelClass}>Property</label>
                <select
                  className={inputClass}
                  value={form.propertyId}
                  onChange={(e) =>
                    setForm({ ...form, propertyId: e.target.value })
                  }
                >
                  <option value="">Select a property…</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className={labelClass}>Room / area (optional)</label>
                <input
                  className={inputClass}
                  value={form.roomLabel}
                  onChange={(e) => setForm({ ...form, roomLabel: e.target.value })}
                  placeholder="e.g. Room 204, Common kitchen"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className={labelClass}>Issue</label>
              <input
                className={inputClass}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Geyser not heating"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className={labelClass}>Details</label>
              <textarea
                className={`${inputClass} min-h-[90px] resize-y`}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="What's wrong, and anything the technician should know"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className={labelClass}>Priority</label>
              <div className="flex gap-2">
                {TICKET_PRIORITIES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setForm({ ...form, priority: p })}
                    className={`px-4 py-2.5 rounded-full border text-[11px] font-bold uppercase tracking-[0.08em] transition-colors cursor-pointer ${
                      form.priority === p
                        ? "bg-gs-charcoal text-white border-gs-charcoal"
                        : "bg-transparent text-gs-charcoal border-gs-lightgrey hover:border-gs-midgrey"
                    }`}
                  >
                    {PRIORITY_LABEL[p]}
                  </button>
                ))}
              </div>
            </div>

            {formError && <p className="text-sm text-red-600">{formError}</p>}

            <button
              type="button"
              disabled={!canSubmit || saving}
              onClick={handleCreate}
              className="self-start bg-gs-charcoal text-white text-[12px] font-bold uppercase tracking-[0.1em] px-8 py-3.5 rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gs-black transition-colors cursor-pointer"
            >
              {saving ? "Raising…" : "Raise ticket"}
            </button>
          </div>
        )}

        {/* Filter */}
        {tickets.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {(["all", ...TICKET_STATUSES] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilter(s)}
                className={`px-4 py-2.5 rounded-full border text-[11px] font-bold uppercase tracking-[0.08em] transition-colors cursor-pointer ${
                  filter === s
                    ? "bg-gs-charcoal text-white border-gs-charcoal"
                    : "bg-transparent text-gs-charcoal border-gs-lightgrey hover:border-gs-midgrey"
                }`}
              >
                {s === "all" ? "All" : STATUS_LABEL[s]}
              </button>
            ))}
          </div>
        )}

        {/* Queue */}
        {loadError ? (
          <p className="text-gs-midgrey text-sm py-16 text-center">{loadError}</p>
        ) : tickets.length === 0 && properties.length > 0 ? (
          <div className="py-16 text-center flex flex-col items-center gap-2">
            <p className="text-gs-charcoal font-medium">No tickets yet.</p>
            <p className="text-gs-midgrey text-sm">
              Raise one when something needs fixing.
            </p>
          </div>
        ) : visible.length === 0 ? (
          <p className="text-gs-midgrey text-sm py-16 text-center">
            No {filter === "all" ? "" : STATUS_LABEL[filter as TicketStatus].toLowerCase()}{" "}
            tickets.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-gs-lightgrey">
            {visible.map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-start justify-between gap-4 py-5 flex-wrap"
              >
                <div className="flex flex-col gap-1 flex-1 min-w-[220px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[15px] font-semibold text-gs-charcoal">
                      {ticket.title}
                    </span>
                    <span
                      className={`text-[11px] font-bold uppercase tracking-[0.06em] ${PRIORITY_CLASSES[ticket.priority]}`}
                    >
                      {PRIORITY_LABEL[ticket.priority]}
                    </span>
                  </div>
                  <span className="text-[13px] text-gs-midgrey">
                    {propertyName(ticket.propertyId)}
                    {ticket.roomLabel ? ` · ${ticket.roomLabel}` : ""}
                  </span>
                  <p className="text-[13px] text-gs-darkgrey mt-1 max-w-xl">
                    {ticket.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.08em] ${STATUS_CLASSES[ticket.status]}`}
                  >
                    {STATUS_LABEL[ticket.status]}
                  </span>

                  <select
                    value={ticket.status}
                    onChange={(e) =>
                      updateTicketStatus(
                        ticket.id,
                        e.target.value as TicketStatus
                      )
                    }
                    className="rounded-xl border border-gs-lightgrey px-3 py-2 text-[13px] cursor-pointer focus:outline-none focus:border-gs-charcoal"
                  >
                    {TICKET_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
