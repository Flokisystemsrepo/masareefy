// This file defines the Ticket interface for TypeScript
// The actual database model is defined in Prisma schema

export interface ITicket {
  id: string;
  ticketId: string;
  fullName: string;
  email: string;
  category:
    | "Billing"
    | "Technical Issue"
    | "Feature Request"
    | "Account"
    | "Other";
  subject: string;
  description: string;
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  priority: "Low" | "Medium" | "High" | "Urgent";
  attachments: {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    url: string;
  }[];
  assignedToId?: string;
  userId?: string;
  responses: ITicketResponse[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  closedAt?: Date;
}

export interface ITicketResponse {
  id: string;
  ticketId: string;
  message: string;
  isInternal: boolean;
  isFromAdmin: boolean;
  authorId?: string;
  authorName: string;
  authorEmail?: string;
  attachments: {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    url: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}
