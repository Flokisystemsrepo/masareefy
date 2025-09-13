import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  X,
  FileText,
  Image,
  File,
  CheckCircle,
  AlertCircle,
  Send,
  User,
  Mail,
  Tag,
  MessageSquare,
  Paperclip,
  ArrowRight,
  Plus,
  Phone,
  Video,
  MoreVertical,
  Smile,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

interface TicketFormData {
  fullName: string;
  email: string;
  category: string;
  subject: string;
  description: string;
  attachments: File[];
}

const Support: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<TicketFormData>({
    fullName:
      user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : "",
    email: user?.email || "",
    category: "",
    subject: "",
    description: "",
    attachments: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [errors, setErrors] = useState<Partial<TicketFormData>>({});

  const categories = [
    "billing",
    "technicalIssue",
    "featureRequest",
    "account",
    "other",
  ];

  const handleInputChange = (field: keyof TicketFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter((file) => {
      const isValidType =
        file.type.startsWith("image/") || file.type === "application/pdf";
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      toast.error(t("support.fileUpload.someFilesRejected"));
    }

    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles].slice(0, 5),
    }));
  };

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<TicketFormData> = {};

    if (!formData.fullName.trim())
      newErrors.fullName = t("support.validation.fullNameRequired");
    if (!formData.email.trim())
      newErrors.email = t("support.validation.emailRequired");
    if (!formData.category)
      newErrors.category = t("support.validation.categoryRequired");
    if (!formData.subject.trim())
      newErrors.subject = t("support.validation.subjectRequired");
    if (!formData.description.trim())
      newErrors.description = t("support.validation.descriptionRequired");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setShowConsentModal(true);
  };

  const handleConsentConfirm = async () => {
    setShowConsentModal(false);
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("fullName", formData.fullName);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("subject", formData.subject);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("userId", user?.id || "");

      formData.attachments.forEach((file) => {
        formDataToSend.append("attachments", file);
      });

      const response = await fetch("http://localhost:3001/api/tickets/create", {
        method: "POST",
        body: formDataToSend,
      });

      const result = await response.json();

      if (result.success) {
        setTicketId(result.data.ticketId);
        setShowConfirmationModal(true);
        setFormData({
          fullName:
            user?.firstName && user?.lastName
              ? `${user.firstName} ${user.lastName}`
              : "",
          email: user?.email || "",
          category: "",
          subject: "",
          description: "",
          attachments: [],
        });
      } else {
        toast.error(result.message || t("support.messages.failedToCreate"));
      }
    } catch (error) {
      console.error("Error creating ticket:", error);
      toast.error(t("support.messages.failedToCreateGeneric"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 " + t("support.fileUpload.fileSize.bytes");
    const k = 1024;
    const sizes = [
      t("support.fileUpload.fileSize.bytes"),
      t("support.fileUpload.fileSize.kb"),
      t("support.fileUpload.fileSize.mb"),
      t("support.fileUpload.fileSize.gb"),
    ];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return <Image className="h-4 w-4" />;
    if (file.type === "application/pdf")
      return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  return (
    <div
      className={`h-screen flex flex-col bg-gray-50 ${isRTL ? "rtl" : "ltr"}`}
    >
      {/* WhatsApp-like Header */}
      <div className="bg-green-600 text-white p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">{t("support.title")}</h1>
            <p className="text-sm text-green-100">{t("support.subtitle")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            <Phone className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            <Video className="h-5 w-5" />
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

      {/* Chat-like Form */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto">
          {/* Welcome Message */}
          <div className="mb-6">
            <div className="bg-white rounded-2xl rounded-tl-md p-4 shadow-sm border">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {t("support.welcomeMessage")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form as Chat Messages */}
          <div className="space-y-4">
            {/* Personal Info */}
            <div className="bg-white rounded-2xl rounded-tl-md p-4 shadow-sm border">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 space-y-3">
                  <p className="text-sm font-medium text-gray-700">
                    {t("support.personalInfo")}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label
                        htmlFor="fullName"
                        className="text-xs text-gray-500"
                      >
                        {t("support.form.fullName")} *
                      </Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) =>
                          handleInputChange("fullName", e.target.value)
                        }
                        placeholder={t("support.form.fullNamePlaceholder")}
                        className={`mt-1 ${
                          errors.fullName ? "border-red-500" : ""
                        }`}
                      />
                      {errors.fullName && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.fullName}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-xs text-gray-500">
                        {t("support.form.email")} *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        placeholder={t("support.form.emailPlaceholder")}
                        className={`mt-1 ${
                          errors.email ? "border-red-500" : ""
                        }`}
                      />
                      {errors.email && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Details */}
            <div className="bg-white rounded-2xl rounded-tl-md p-4 shadow-sm border">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Tag className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1 space-y-3">
                  <p className="text-sm font-medium text-gray-700">
                    {t("support.whatCanIHelp")}
                  </p>
                  <div className="space-y-3">
                    <div>
                      <Label
                        htmlFor="category"
                        className="text-xs text-gray-500"
                      >
                        {t("support.form.category")} *
                      </Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          handleInputChange("category", value)
                        }
                      >
                        <SelectTrigger
                          className={`mt-1 ${
                            errors.category ? "border-red-500" : ""
                          }`}
                        >
                          <SelectValue
                            placeholder={t("support.form.categoryPlaceholder")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {t(`support.categories.${category}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.category && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.category}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="subject"
                        className="text-xs text-gray-500"
                      >
                        {t("support.form.subject")} *
                      </Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) =>
                          handleInputChange("subject", e.target.value)
                        }
                        placeholder={t("support.form.subjectPlaceholder")}
                        className={`mt-1 ${
                          errors.subject ? "border-red-500" : ""
                        }`}
                      />
                      {errors.subject && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.subject}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="description"
                        className="text-xs text-gray-500"
                      >
                        {t("support.form.description")} *
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        placeholder={t("support.form.descriptionPlaceholder")}
                        rows={4}
                        className={`mt-1 resize-none ${
                          errors.description ? "border-red-500" : ""
                        }`}
                      />
                      {errors.description && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* File Attachments */}
            <div className="bg-white rounded-2xl rounded-tl-md p-4 shadow-sm border">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Paperclip className="h-4 w-4 text-orange-600" />
                </div>
                <div className="flex-1 space-y-3">
                  <p className="text-sm font-medium text-gray-700">
                    {t("support.attachFiles")}
                  </p>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {t("support.form.clickToUpload")}
                    </p>
                    <p className="text-xs text-gray-500">
                      {t("support.form.fileRestrictions")}
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {formData.attachments.length > 0 && (
                    <div className="space-y-2">
                      {formData.attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            {getFileIcon(file)}
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-gray-500">
                              ({formatFileSize(file.size)})
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp-like Footer */}
      <div className="bg-white border-t p-4">
        <div className="max-w-2xl mx-auto">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-full h-12"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                {t("support.form.sending")}
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                {t("support.form.sendMessage")}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Consent Modal */}
      <Dialog open={showConsentModal} onOpenChange={setShowConsentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              {t("support.consent.title")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              {t("support.consent.message")}
            </p>
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-blue-700">
                {t("support.consent.privacyNote")}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConsentModal(false)}
            >
              {t("support.consent.cancel")}
            </Button>
            <Button
              onClick={handleConsentConfirm}
              className="bg-green-600 hover:bg-green-700"
            >
              {t("support.consent.sendMessage")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      <Dialog
        open={showConfirmationModal}
        onOpenChange={setShowConfirmationModal}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              {t("support.confirmation.title")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-gray-600">
                {t("support.confirmation.message")}
              </p>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="font-semibold text-green-800">
                  {t("support.confirmation.ticketId")} {ticketId}
                </p>
                <p className="text-sm text-green-600">
                  {t("support.confirmation.saveId")}
                </p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>{t("support.confirmation.whatHappensNext")}</strong>
              </p>
              <ul className="space-y-1 ml-4">
                <li>• {t("support.confirmation.steps.review")}</li>
                <li>• {t("support.confirmation.steps.updates")}</li>
                <li>• {t("support.confirmation.steps.viewTickets")}</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowConfirmationModal(false)}>
              {t("support.confirmation.close")}
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/brand/1/my-tickets")}
            >
              {t("support.confirmation.viewMyTickets")}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Support;
