/**
 * Firebase: Maintenance Tickets
 *
 * The operational half of the provider OS — issues raised against a
 * property (optionally a specific room) and tracked to resolution.
 */

import { db } from "./config";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

export type TicketStatus = "open" | "in_progress" | "resolved";
export type TicketPriority = "low" | "medium" | "high";

export interface MaintenanceTicket {
  id: string;
  /** Denormalized owner id so rules authorize without a lookup —
   *  same rationale as rooms/beds. */
  providerId: string;
  propertyId: string;
  /** Optional: which room the issue is in, when it's localized. */
  roomLabel?: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt?: unknown;
  resolvedAt?: unknown;
}

export const TICKET_STATUSES: TicketStatus[] = ["open", "in_progress", "resolved"];
export const TICKET_PRIORITIES: TicketPriority[] = ["low", "medium", "high"];

export const STATUS_LABEL: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
};

export const PRIORITY_LABEL: Record<TicketPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

/**
 * Live ticket queue for one provider, newest first.
 * Needs a composite index on (providerId asc, createdAt desc).
 */
export function subscribeToProviderTickets(
  providerId: string,
  callback: (tickets: MaintenanceTicket[]) => void,
  onError?: (error: Error) => void
): () => void {
  const q = query(
    collection(db, "maintenanceTickets"),
    where("providerId", "==", providerId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      callback(
        snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as MaintenanceTicket
        )
      );
    },
    (error) => {
      console.error("[GridStay] subscribeToProviderTickets failed:", error);
      onError?.(error);
    }
  );
}

export async function createTicket(data: {
  providerId: string;
  propertyId: string;
  roomLabel?: string;
  title: string;
  description: string;
  priority: TicketPriority;
}): Promise<string> {
  const ref = await addDoc(collection(db, "maintenanceTickets"), {
    ...data,
    status: "open" as TicketStatus,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateTicketStatus(
  ticketId: string,
  status: TicketStatus
): Promise<void> {
  await updateDoc(doc(db, "maintenanceTickets", ticketId), {
    status,
    // Stamped only on resolve so "how long was this open" stays
    // answerable; reopening clears it.
    resolvedAt: status === "resolved" ? serverTimestamp() : null,
  });
}
