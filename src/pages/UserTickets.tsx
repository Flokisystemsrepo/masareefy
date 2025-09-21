import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  MessageSquare,
  Calendar,
  Tag,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  Paperclip,
  Download,
  Send,
  Phone,
  Video,
  MoreVertical,
  ArrowLeft,
  Check,
  CheckCheck,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
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
}

const UserTickets: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [newMessage, setNewMessage] = useState("");

  // Fetch user's tickets
  const { data: ticketsData, isLoading } = useQuery({
    queryKey: ["user-tickets", user?.id],
    queryFn: async () => {
      if (!user?.id) return { tickets: [], pagination: { total: 0 } };

      const response = await fetch(
        `http://localhost:3001/api/tickets/user/${user.id}`,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch tickets");
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Add response mutation
  const addResponseMutation = useMutation({
    mutationFn: async ({
      ticketId,
      message,
    }: {
      ticketId: string;
      message: string;
    }) => {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3001/api/tickets/user/${ticketId}/response`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({ message }),
        }
      );

      if (!response.ok) throw new Error("Failed to add response");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-tickets"] });
      setNewMessage("");
      toast.success("Message sent successfully");
    },
    onError: () => toast.error("Failed to send message"),
  });

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowTicketModal(true);
  };

  const handleAddResponse = () => {
    if (!selectedTicket || !newMessage.trim()) return;
    addResponseMutation.mutate({
      ticketId: selectedTicket.id,
      message: newMessage.trim(),
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

  if (isLoading) {
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
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 p-2"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">
              {t("tickets.mySupportChats")}
            </h1>
            <p className="text-sm text-green-100">
              {tickets.length}{" "}
              {tickets.length !== 1
                ? t("tickets.conversationsPlural")
                : t("tickets.conversations")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
            onClick={() => (window.location.href = "/brand/1/support")}
          >
            <Plus className="h-5 w-5" />
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

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No conversations yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md">
              You haven't started any support conversations yet. Start a new
              chat to get help with your questions.
            </p>
            <Button
              onClick={() => (window.location.href = "/brand/1/support")}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Start New Chat
            </Button>
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
                      <MessageSquare className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {ticket.subject}
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
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {ticket.description}
                      </p>
                      {ticket.responses.length > 0 && (
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
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">
                      {selectedTicket.subject}
                    </h2>
                    <p className="text-sm text-green-100">
                      #{selectedTicket.ticketId}
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
                <div className="flex justify-end">
                  <div className="max-w-[70%]">
                    <div className="bg-green-500 text-white rounded-2xl rounded-tr-md p-3">
                      <p className="text-sm">{selectedTicket.description}</p>
                    </div>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-xs text-gray-500">
                        {formatTime(selectedTicket.createdAt)}
                      </span>
                      <CheckCheck className="h-3 w-3 text-blue-500" />
                    </div>
                  </div>
                </div>

                {/* Attachments */}
                {selectedTicket.attachments?.length > 0 && (
                  <div className="flex justify-end">
                    <div className="max-w-[70%]">
                      <div className="bg-green-500 text-white rounded-2xl rounded-tr-md p-3">
                        <div className="space-y-2">
                          {selectedTicket.attachments.map(
                            (attachment, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 bg-white/20 rounded-lg p-2"
                              >
                                <Paperclip className="h-4 w-4" />
                                <span className="text-sm">
                                  {attachment.originalName}
                                </span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-white hover:bg-white/20 h-6 w-6 p-0"
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
                {selectedTicket.responses?.map((response) => (
                  <div
                    key={response.id}
                    className={`flex ${
                      response.isFromAdmin ? "justify-start" : "justify-end"
                    }`}
                  >
                    <div className="max-w-[70%]">
                      <div
                        className={`rounded-2xl p-3 ${
                          response.isFromAdmin
                            ? "bg-white text-gray-900 rounded-tl-md border"
                            : "bg-green-500 text-white rounded-tr-md"
                        }`}
                      >
                        <p className="text-sm">{response.message}</p>
                      </div>
                      <div
                        className={`flex items-center gap-1 mt-1 ${
                          response.isFromAdmin ? "justify-start" : "justify-end"
                        }`}
                      >
                        <span className="text-xs text-gray-500">
                          {formatTime(response.createdAt)}
                        </span>
                        {!response.isFromAdmin && (
                          <CheckCheck className="h-3 w-3 text-blue-500" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              {selectedTicket.status !== "Closed" && (
                <div className="bg-white border-t p-4">
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
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
                        !newMessage.trim() || addResponseMutation.isPending
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
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserTickets;
