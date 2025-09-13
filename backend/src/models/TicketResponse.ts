// This file defines the TicketResponse interface for TypeScript
// The actual database model is defined in Prisma schema

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
