import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  MessageSquare,
  User,
  Mail,
  Calendar,
  Tag,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Paperclip,
  Send,
  Eye,
  Edit,
  Download,
  RefreshCw,
  Phone,
  Video,
  MoreVertical,
  ArrowLeft,
  Check,
  CheckCheck,
  Users,
  MessageCircle,
} from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import { toast } from "sonner";

interface Ticket {
  id: string;
  ticketId: string;
  fullName: string;
  email: string;
  category: string;
  subject: string;
  description: string;
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  priority: "Low" | "Medium" | "High" | "Urgent";
  attachments: Array<{
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    url: string;
  }>;
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  responses: Array<{
    id: string;
    message: string;
    isInternal: boolean;
    isFromAdmin: boolean;
    authorName: string;
    authorEmail?: string;
    attachments: Array<{
      filename: string;
      originalName: string;
      mimetype: string;
      size: number;
      url: string;
    }>;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
}

interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  statusBreakdown: Array<{ _id: string; count: number }>;
  categoryBreakdown: Array<{ _id: string; count: number }>;
  priorityBreakdown: Array<{ _id: string; count: number }>;
}

const AdminTickets: React.FC = () => {
  const { adminToken, admin, isAuthenticated } = useAdmin();
  const queryClient = useQueryClient();

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [isInternalResponse, setIsInternalResponse] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    category: "",
    priority: "",
    startDate: "",
    endDate: "",
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch tickets
  const {
    data: ticketsData,
    isLoading: ticketsLoading,
    refetch: refetchTickets,
  } = useQuery({
    queryKey: ["admin-tickets", filters, currentPage],
    queryFn: async () => {
      console.log(
        "Fetching tickets with token:",
        adminToken ? "Token exists" : "No token"
      );
      console.log("Token value:", adminToken);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value)
        ),
      });

      const url = `http://localhost:3001/api/tickets/admin/all?${params}`;
      console.log("Fetching from URL:", url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to fetch tickets:", errorText);
        throw new Error("Failed to fetch tickets");
      }

      const data = await response.json();
      console.log("Tickets data:", data);
      return data;
    },
    enabled: !!adminToken,
  });

  // Fetch ticket statistics
  const { data: statsData } = useQuery({
    queryKey: ["admin-ticket-stats"],
    queryFn: async () => {
      const response = await fetch(
        "http://localhost:3001/api/tickets/admin/stats",
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch ticket statistics");
      }

      return response.json();
    },
    enabled: !!adminToken,
  });

  // Update ticket status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      ticketId,
      status,
    }: {
      ticketId: string;
      status: string;
    }) => {
      const response = await fetch(
        `http://localhost:3001/api/tickets/admin/${ticketId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${adminToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update ticket status");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["admin-ticket-stats"] });
      toast.success("Ticket status updated successfully");
    },
    onError: () => {
      toast.error("Failed to update ticket status");
    },
  });

  // Add response mutation
  const addResponseMutation = useMutation({
    mutationFn: async ({
      ticketId,
      message,
      isInternal,
    }: {
      ticketId: string;
      message: string;
      isInternal: boolean;
    }) => {
      const response = await fetch(
        `http://localhost:3001/api/tickets/admin/${ticketId}/response`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${adminToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message, isInternal }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add response");
      }

      return response.json();
    },
    onMutate: async ({ ticketId, message, isInternal }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["admin-tickets"] });

      // Snapshot the previous value
      const previousTickets = queryClient.getQueryData([
        "admin-tickets",
        filters,
        currentPage,
      ]);

      // Optimistically update the selected ticket
      if (selectedTicket && selectedTicket.id === ticketId) {
        const optimisticResponse = {
          id: `temp-${Date.now()}`,
          message,
          isInternal,
          isFromAdmin: true,
          authorName:
            admin?.firstName && admin?.lastName
              ? `${admin.firstName} ${admin.lastName}`
              : "Admin",
          authorEmail: admin?.email,
          attachments: [],
          createdAt: new Date().toISOString(),
        };

        const updatedTicket = {
          ...selectedTicket,
          responses: [...(selectedTicket.responses || []), optimisticResponse],
        };

        setSelectedTicket(updatedTicket);
      }

      return { previousTickets };
    },
    onSuccess: (data) => {
      console.log("Response added successfully:", data);
      // Invalidate all admin-tickets queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
      setResponseMessage("");
      toast.success("Response added successfully");
    },
    onError: (err, variables, context) => {
      // Revert the optimistic update
      if (context?.previousTickets) {
        queryClient.setQueryData(
          ["admin-tickets", filters, currentPage],
          context.previousTickets
        );
      }
      toast.error("Failed to add response");
    },
  });

  const handleTicketClick = (ticket: Ticket) => {
    console.log("Selected ticket:", ticket);
    console.log("Ticket responses:", ticket.responses);
    setSelectedTicket(ticket);
    setShowTicketModal(true);
  };

  const handleStatusChange = (ticketId: string, status: string) => {
    updateStatusMutation.mutate({ ticketId, status });
  };

  const handleAddResponse = () => {
    if (!selectedTicket || !responseMessage.trim()) return;

    addResponseMutation.mutate({
      ticketId: selectedTicket.id,
      message: responseMessage.trim(),
      isInternal: isInternalResponse,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Open":
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case "In Progress":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "Resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "Closed":
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "High":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const tickets = ticketsData?.data?.tickets || [];
  const pagination = ticketsData?.data?.pagination;
  const stats: TicketStats = statsData?.data;

  console.log("Admin context:", { adminToken, admin, isAuthenticated });
  console.log("Query state:", { ticketsLoading, ticketsData });
  console.log("Tickets array:", tickets);
  console.log("Tickets count:", tickets.length);

  if (ticketsLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* WhatsApp-like Header */}
      <div className="bg-green-600 text-white p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <MessageCircle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Support Center</h1>
            <p className="text-sm text-green-100">
              {tickets.length} active conversations
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-4 bg-white border-b">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {stats?.total || 0}
            </div>
            <div className="text-sm text-gray-500">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats?.open || 0}
            </div>
            <div className="text-sm text-gray-500">Open</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {stats?.inProgress || 0}
            </div>
            <div className="text-sm text-gray-500">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats?.resolved || 0}
            </div>
            <div className="text-sm text-gray-500">Resolved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {stats?.closed || 0}
            </div>
            <div className="text-sm text-gray-500">Closed</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 bg-white border-b">
        <div className="flex flex-wrap gap-2">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search conversations..."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className="h-9"
            />
          </div>
          <Select
            value={filters.status}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, status: value }))
            }
          >
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.category}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, category: value }))
            }
          >
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Billing">Billing</SelectItem>
              <SelectItem value="Technical Issue">Technical</SelectItem>
              <SelectItem value="Feature Request">Feature</SelectItem>
              <SelectItem value="Account">Account</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No conversations yet
            </h3>
            <p className="text-gray-600 max-w-md">
              No support tickets have been submitted yet. When customers reach
              out, their conversations will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {tickets.map((ticket: Ticket) => (
              <Card
                key={ticket.id}
                className="cursor-pointer hover:bg-gray-50 transition-colors border-0 shadow-sm"
                onClick={() => handleTicketClick(ticket)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {ticket.fullName}
                        </h3>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(ticket.status)}
                          <span className="text-xs text-gray-500">
                            {formatTime(ticket.updatedAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          #{ticket.ticketId}
                        </span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">
                          {ticket.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {ticket.subject}
                      </p>
                      {ticket.responses?.length > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <CheckCheck className="h-3 w-3 text-blue-500" />
                          <span className="text-xs text-gray-500">
                            {ticket.responses.length} message
                            {ticket.responses.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Chat Modal */}
      <Dialog open={showTicketModal} onOpenChange={setShowTicketModal}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
          {selectedTicket && (
            <>
              {/* Chat Header */}
              <div className="bg-green-600 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">
                      {selectedTicket.fullName}
                    </h2>
                    <p className="text-sm text-green-100">
                      {selectedTicket.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getPriorityColor(selectedTicket.priority)}>
                    {selectedTicket.priority}
                  </Badge>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(selectedTicket.status)}
                    <span className="text-sm">{selectedTicket.status}</span>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {/* Original Message */}
                <div className="flex justify-start">
                  <div className="max-w-[70%]">
                    <div className="bg-white text-gray-900 rounded-2xl rounded-tl-md p-3 border">
                      <p className="text-sm font-medium mb-1">
                        {selectedTicket.subject}
                      </p>
                      <p className="text-sm">{selectedTicket.description}</p>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-gray-500">
                        {formatTime(selectedTicket.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Attachments */}
                {selectedTicket.attachments?.length > 0 && (
                  <div className="flex justify-start">
                    <div className="max-w-[70%]">
                      <div className="bg-white text-gray-900 rounded-2xl rounded-tl-md p-3 border">
                        <div className="space-y-2">
                          {selectedTicket.attachments.map(
                            (attachment, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 bg-gray-50 rounded-lg p-2"
                              >
                                <Paperclip className="h-4 w-4" />
                                <span className="text-sm">
                                  {attachment.originalName}
                                </span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  asChild
                                >
                                  <a
                                    href={`http://localhost:3001${attachment.url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Download className="h-3 w-3" />
                                  </a>
                                </Button>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Responses */}
                {selectedTicket.responses?.map((response) => {
                  console.log("Rendering response:", response);
                  return (
                    <div
                      key={response.id}
                      className={`flex ${
                        response.isFromAdmin ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div className="max-w-[70%]">
                        <div
                          className={`rounded-2xl p-3 ${
                            response.isFromAdmin
                              ? "bg-green-500 text-white rounded-tr-md"
                              : "bg-white text-gray-900 rounded-tl-md border"
                          }`}
                        >
                          {response.isInternal && (
                            <div className="text-xs opacity-75 mb-1">
                              [Internal Note]
                            </div>
                          )}
                          <p className="text-sm">{response.message}</p>
                        </div>
                        <div
                          className={`flex items-center gap-1 mt-1 ${
                            response.isFromAdmin
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <span className="text-xs text-gray-500">
                            {formatTime(response.createdAt)}
                          </span>
                          {response.isFromAdmin && (
                            <CheckCheck className="h-3 w-3 text-blue-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input */}
              {selectedTicket.status !== "Closed" && (
                <div className="bg-white border-t p-4">
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Textarea
                        value={responseMessage}
                        onChange={(e) => setResponseMessage(e.target.value)}
                        placeholder="Type a message..."
                        rows={1}
                        className="resize-none border-0 focus:ring-0 bg-gray-100 rounded-2xl"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleAddResponse();
                          }
                        }}
                      />
                    </div>
                    <Button
                      onClick={handleAddResponse}
                      disabled={
                        !responseMessage.trim() || addResponseMutation.isPending
                      }
                      className="bg-green-600 hover:bg-green-700 text-white rounded-full h-10 w-10 p-0"
                    >
                      {addResponseMutation.isPending ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="internal"
                      checked={isInternalResponse}
                      onChange={(e) => setIsInternalResponse(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="internal" className="text-xs text-gray-500">
                      Internal note (customer won't see this)
                    </Label>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTickets;
