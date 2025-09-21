import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Target,
  Plus,
  Search,
  Filter,
  Download,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Clock,
  User,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Circle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  X,
  CalendarDays,
  CalendarRange,
  CalendarCheck,
  List,
  Grid3X3,
  Lock,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { tasksAPI, teamAPI } from "@/services/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";
import TeamManagementModal from "@/components/TeamManagementModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "completed";
  dueDate?: string;
  assignedTo?: string;
  category?: string;
  duration?: string;
  createdAt: string;
  updatedAt: string;
}

const TasksPage: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const {
    hasSectionAccess,
    getSectionLockMessage,
    subscription,
    testUpgradeToGrowth,
    testUpgradeToScale,
  } = useSubscription();

  // State for upgrade modal
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // State for delete confirmation
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Helper functions for upgrade modal
  const getUpgradePlan = () => {
    if (!subscription) return "Growth";
    if (subscription.isFreePlan) return "Growth";
    if (subscription.plan.name.toLowerCase() === "growth") return "Scale";
    return "Growth";
  };

  const getUpgradePrice = () => {
    if (!subscription) return "299 EGP/month";
    if (subscription.isFreePlan) return "299 EGP/month";
    if (subscription.plan.name.toLowerCase() === "growth")
      return "399 EGP/month";
    return "299 EGP/month";
  };

  const handleActionClick = () => {
    if (subscription?.isFreePlan && !hasSectionAccess("tasks")) {
      setShowUpgradeModal(true);
      return false;
    }
    return true;
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showManageTeamModal, setShowManageTeamModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [calendarView, setCalendarView] = useState<"month" | "week" | "day">(
    "month"
  );
  const [currentDate, setCurrentDate] = useState(new Date());
  const [assignedToOpen, setAssignedToOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    dueDate: "",
    assignedTo: "",
    category: "",
  });

  const priorities = ["low", "medium", "high"];
  const categories = [
    "finance",
    "meeting",
    "presentation",
    "operations",
    "marketing",
    "development",
    "sales",
  ];
  // Fetch team members for assignees
  const {
    data: teamMembersData,
    isLoading: teamMembersLoading,
    error: teamMembersError,
  } = useQuery({
    queryKey: ["teamMembers"],
    queryFn: () => teamAPI.getAll(),
    enabled: true,
  });

  const teamMembers = teamMembersData?.teamMembers || [];

  // React Query for tasks
  const {
    data: tasksData,
    isLoading: loading,
    error,
    refetch: loadTasks,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      console.log("Loading tasks...");
      const data = await tasksAPI.getAll();
      console.log("Raw API response:", data);

      // Handle the response structure: { tasks: [...], pagination: {...} }
      const tasks = data?.tasks || data?.data || [];
      console.log("Extracted tasks:", tasks);
      return tasks;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const tasks = tasksData || [];

  // Mutations for CRUD operations
  const createTaskMutation = useMutation({
    mutationFn: tasksAPI.create,
    onSuccess: (data) => {
      console.log("Task created successfully:", data);
      toast({
        title: "Success",
        description: t("tasks.messages.taskCreated"),
      });
      setShowAddTaskModal(false);
      resetForm();
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error: any) => {
      console.error("Error creating task:", error);
      toast({
        title: "Error",
        description: error.message || t("tasks.messages.failedToCreate"),
        variant: "destructive",
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      tasksAPI.update(id, data),
    onSuccess: (data) => {
      console.log("Task updated successfully:", data);
      toast({
        title: "Success",
        description: t("tasks.messages.taskUpdated"),
      });
      setShowEditTaskModal(false);
      resetForm();
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error: any) => {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: error.message || t("tasks.messages.failedToUpdate"),
        variant: "destructive",
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: tasksAPI.delete,
    onSuccess: () => {
      toast({
        title: "Success",
        description: t("tasks.messages.taskDeleted"),
      });
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || t("tasks.messages.failedToDelete"),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const submitData = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        dueDate: formData.dueDate,
        assignedTo: formData.assignedTo,
        category: formData.category,
      };

      console.log("Submitting task data:", submitData);

      if (selectedTask) {
        // Update existing task
        updateTaskMutation.mutate({ id: selectedTask.id, data: submitData });
      } else {
        // Create new task
        createTaskMutation.mutate(submitData);
      }
    } catch (error: any) {
      console.error("Error in handleSubmit:", error);
      toast({
        title: "Error",
        description: error.message || t("tasks.messages.failedToSave"),
        variant: "destructive",
      });
    }
  };

  const handleDelete = (task: Task) => {
    setTaskToDelete(task);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = () => {
    if (!taskToDelete) return;

    deleteTaskMutation.mutate(taskToDelete.id);
    setShowDeleteConfirmation(false);
    setTaskToDelete(null);
  };

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().split("T")[0]
        : "",
      assignedTo: task.assignedTo || "",
      category: task.category || "",
    });
    setShowEditTaskModal(true);
  };

  const handleEventClick = (task: Task) => {
    setSelectedTask(task);
    setShowEventModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      dueDate: "",
      assignedTo: "",
      category: "",
    });
    setSelectedTask(null);
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDate = new Date(startDate);

    while (currentDate <= lastDay || currentDate.getDay() !== 0) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const calendarDays = useMemo(
    () => getDaysInMonth(currentDate),
    [currentDate]
  );

  // Memoize tasks for specific dates to prevent unnecessary recalculations
  const tasksForDateMap = useMemo(() => {
    const map = new Map<string, Task[]>();
    calendarDays.forEach((date) => {
      const dateString = date.toDateString();
      const dayTasks = tasks.filter((task) => {
        // Show tasks on their creation date OR due date
        const taskCreatedDate = new Date(task.createdAt);
        const taskDueDate = task.dueDate ? new Date(task.dueDate) : null;

        const createdDateString = taskCreatedDate.toDateString();
        const dueDateString = taskDueDate ? taskDueDate.toDateString() : null;

        return dateString === createdDateString || dateString === dueDateString;
      });
      map.set(dateString, dayTasks);
    });
    return map;
  }, [tasks, calendarDays]);

  const getTasksForDate = (date: Date) => {
    const dateString = date.toDateString();
    return tasksForDateMap.get(dateString) || [];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  // Filtered tasks for list view - memoized to prevent unnecessary recalculations
  const filteredTasks = useMemo(() => {
    if (!tasks.length) return [];

    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description &&
          task.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (task.assignedTo &&
          task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesPriority =
        filterPriority === "all" || task.priority === filterPriority;

      const matchesStatus =
        filterStatus === "all" || task.status === filterStatus;

      const matchesCategory =
        filterCategory === "all" || task.category === filterCategory;

      return (
        matchesSearch && matchesPriority && matchesStatus && matchesCategory
      );
    });
  }, [tasks, searchTerm, filterPriority, filterStatus, filterCategory]);

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">{t("tasks.loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">
              {error.message || t("tasks.failedToLoad")}
            </p>
            <Button
              onClick={() => loadTasks()}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              {loading ? t("tasks.retrying") : t("tasks.retry")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-6 space-y-6 bg-gray-50 min-h-screen ${
        isRTL ? "rtl" : "ltr"
      } ${!hasSectionAccess("tasks") ? "relative" : ""}`}
    >
      {/* Header */}
      <motion.div
        className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
          createTaskMutation.isPending ||
          updateTaskMutation.isPending ||
          deleteTaskMutation.isPending
            ? "opacity-75"
            : ""
        }`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("tasks.title")}
          </h1>
          <p className="text-gray-600 mt-1">{t("tasks.subtitle")}</p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => {
              if (!handleActionClick()) return;
              setShowAddTaskModal(true);
            }}
            className="gap-2"
            disabled={createTaskMutation.isPending}
          >
            <Plus className="h-4 w-4" />
            {t("tasks.newTask")}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (!handleActionClick()) return;
              setShowManageTeamModal(true);
            }}
            className="gap-2"
          >
            <User className="h-4 w-4" />
            Manage Team
          </Button>
        </div>
      </motion.div>

      {/* View Toggle */}
      <motion.div
        className={`flex items-center justify-between ${
          createTaskMutation.isPending ||
          updateTaskMutation.isPending ||
          deleteTaskMutation.isPending
            ? "opacity-75"
            : ""
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="flex items-center space-x-2">
          <Button
            variant={view === "calendar" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("calendar")}
            disabled={
              createTaskMutation.isPending ||
              updateTaskMutation.isPending ||
              deleteTaskMutation.isPending
            }
          >
            <Calendar className="h-4 w-4 mr-2" />
            {t("tasks.calendar")}
          </Button>
          <Button
            variant={view === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("list")}
            disabled={
              createTaskMutation.isPending ||
              updateTaskMutation.isPending ||
              deleteTaskMutation.isPending
            }
          >
            <List className="h-4 w-4 mr-2" />
            {t("tasks.list")}
          </Button>
        </div>

        {view === "calendar" && (
          <div className="flex items-center space-x-2">
            <Button
              variant={calendarView === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => setCalendarView("month")}
              disabled={
                createTaskMutation.isPending ||
                updateTaskMutation.isPending ||
                deleteTaskMutation.isPending
              }
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              {t("tasks.month")}
            </Button>
            <Button
              variant={calendarView === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => setCalendarView("week")}
              disabled={
                createTaskMutation.isPending ||
                updateTaskMutation.isPending ||
                deleteTaskMutation.isPending
              }
            >
              <CalendarRange className="h-4 w-4 mr-2" />
              {t("tasks.week")}
            </Button>
            <Button
              variant={calendarView === "day" ? "default" : "outline"}
              size="sm"
              onClick={() => setCalendarView("day")}
              disabled={
                createTaskMutation.isPending ||
                updateTaskMutation.isPending ||
                deleteTaskMutation.isPending
              }
            >
              <CalendarCheck className="h-4 w-4 mr-2" />
              {t("tasks.day")}
            </Button>
          </div>
        )}
      </motion.div>

      {/* Calendar View */}
      {view === "calendar" && (
        <motion.div
          className={
            createTaskMutation.isPending ||
            updateTaskMutation.isPending ||
            deleteTaskMutation.isPending
              ? "opacity-75"
              : ""
          }
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Calendar Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth("prev")}
                  disabled={
                    createTaskMutation.isPending ||
                    updateTaskMutation.isPending ||
                    deleteTaskMutation.isPending
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-xl font-semibold text-gray-900">
                  {formatDate(currentDate)}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth("next")}
                  disabled={
                    createTaskMutation.isPending ||
                    updateTaskMutation.isPending ||
                    deleteTaskMutation.isPending
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
                disabled={
                  createTaskMutation.isPending ||
                  updateTaskMutation.isPending ||
                  deleteTaskMutation.isPending
                }
              >
                {t("tasks.today")}
              </Button>
            </div>
          </div>

          {/* Calendar */}
          <Card
            className={
              createTaskMutation.isPending ||
              updateTaskMutation.isPending ||
              deleteTaskMutation.isPending
                ? "opacity-75"
                : ""
            }
          >
            <CardContent className="p-0">
              {/* Calendar Header */}
              <div
                className={`grid grid-cols-7 gap-px bg-gray-200 ${
                  createTaskMutation.isPending ||
                  updateTaskMutation.isPending ||
                  deleteTaskMutation.isPending
                    ? "opacity-75"
                    : ""
                }`}
              >
                {(isRTL
                  ? ["أحد", "اثن", "ثلث", "أرب", "خمس", "جمعة", "سبت"]
                  : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
                ).map((day) => (
                  <div
                    key={day}
                    className={`bg-white p-3 text-center text-sm font-medium text-gray-500 ${
                      createTaskMutation.isPending ||
                      updateTaskMutation.isPending ||
                      deleteTaskMutation.isPending
                        ? "opacity-75"
                        : ""
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div
                className={`grid grid-cols-7 gap-px bg-gray-200 ${
                  createTaskMutation.isPending ||
                  updateTaskMutation.isPending ||
                  deleteTaskMutation.isPending
                    ? "opacity-75"
                    : ""
                }`}
              >
                {calendarDays.map((date, index) => {
                  const dayTasks = getTasksForDate(date);
                  return (
                    <div
                      key={index}
                      className={`bg-white min-h-[120px] p-2 ${
                        !isCurrentMonth(date) ? "bg-gray-50" : ""
                      } ${isToday(date) ? "bg-blue-50" : ""} ${
                        createTaskMutation.isPending ||
                        updateTaskMutation.isPending ||
                        deleteTaskMutation.isPending
                          ? "opacity-75"
                          : ""
                      }`}
                    >
                      <div
                        className={`text-sm font-medium mb-1 ${
                          !isCurrentMonth(date)
                            ? "text-gray-400"
                            : isToday(date)
                            ? "text-blue-600"
                            : "text-gray-900"
                        } ${
                          createTaskMutation.isPending ||
                          updateTaskMutation.isPending ||
                          deleteTaskMutation.isPending
                            ? "opacity-50"
                            : ""
                        }`}
                      >
                        {date.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayTasks.slice(0, 3).map((task) => (
                          <div
                            key={task.id}
                            className={`text-xs p-1 rounded cursor-pointer truncate ${
                              task.priority === "high"
                                ? "bg-red-100 text-red-800"
                                : task.priority === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            } ${
                              createTaskMutation.isPending ||
                              updateTaskMutation.isPending ||
                              deleteTaskMutation.isPending
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                            onClick={() => {
                              if (
                                !createTaskMutation.isPending &&
                                !updateTaskMutation.isPending &&
                                !deleteTaskMutation.isPending
                              ) {
                                handleEventClick(task);
                              }
                            }}
                          >
                            {task.title}
                          </div>
                        ))}
                        {dayTasks.length > 3 && (
                          <div
                            className={`text-xs text-gray-500 text-center ${
                              createTaskMutation.isPending ||
                              updateTaskMutation.isPending ||
                              deleteTaskMutation.isPending
                                ? "opacity-50"
                                : ""
                            }`}
                          >
                            +{dayTasks.length - 3} {t("tasks.more")}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* List View */}
      {view === "list" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Search and Filters */}
          <Card
            className={`mb-6 ${
              createTaskMutation.isPending ||
              updateTaskMutation.isPending ||
              deleteTaskMutation.isPending
                ? "opacity-75"
                : ""
            }`}
          >
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={t("tasks.searchPlaceholder")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    disabled={
                      createTaskMutation.isPending ||
                      updateTaskMutation.isPending ||
                      deleteTaskMutation.isPending
                    }
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Select
                    value={filterPriority}
                    onValueChange={setFilterPriority}
                    disabled={
                      createTaskMutation.isPending ||
                      updateTaskMutation.isPending ||
                      deleteTaskMutation.isPending
                    }
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder={t("tasks.filters.priority")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t("tasks.filters.allPriorities")}
                      </SelectItem>
                      {priorities.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {t(`tasks.priorities.${priority}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={filterStatus}
                    onValueChange={setFilterStatus}
                    disabled={
                      createTaskMutation.isPending ||
                      updateTaskMutation.isPending ||
                      deleteTaskMutation.isPending
                    }
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder={t("tasks.filters.status")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t("tasks.filters.allStatus")}
                      </SelectItem>
                      <SelectItem value="pending">
                        {t("tasks.statuses.pending")}
                      </SelectItem>
                      <SelectItem value="in-progress">
                        {t("tasks.statuses.inProgress")}
                      </SelectItem>
                      <SelectItem value="completed">
                        {t("tasks.statuses.completed")}
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filterCategory}
                    onValueChange={setFilterCategory}
                    disabled={
                      createTaskMutation.isPending ||
                      updateTaskMutation.isPending ||
                      deleteTaskMutation.isPending
                    }
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder={t("tasks.filters.category")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t("tasks.filters.allCategories")}
                      </SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {t(`tasks.categories.${category}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tasks List */}
          <div className="space-y-4">
            {filteredTasks.length === 0 ? (
              <Card
                className={
                  createTaskMutation.isPending ||
                  updateTaskMutation.isPending ||
                  deleteTaskMutation.isPending
                    ? "opacity-75"
                    : ""
                }
              >
                <CardContent className="p-12 text-center">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {t("tasks.emptyState.noTasks")}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm ||
                    filterPriority !== "all" ||
                    filterStatus !== "all" ||
                    filterCategory !== "all"
                      ? t("tasks.emptyState.noTasksSearch")
                      : t("tasks.emptyState.noTasksDescription")}
                  </p>
                  <Button
                    onClick={() => {
                      if (!handleActionClick()) return;
                      setShowAddTaskModal(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={createTaskMutation.isPending}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t("tasks.addTask")}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 + index * 0.05 }}
                >
                  <Card
                    className={`hover:shadow-lg transition-all duration-300 ${
                      createTaskMutation.isPending ||
                      updateTaskMutation.isPending ||
                      deleteTaskMutation.isPending
                        ? "opacity-75"
                        : ""
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h3 className="font-semibold text-lg text-gray-900">
                              {task.title}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <div
                                className={`w-3 h-3 rounded-full ${getPriorityColor(
                                  task.priority
                                )}`}
                              ></div>
                              <Badge className={getStatusColor(task.status)}>
                                {t(
                                  `tasks.statuses.${
                                    task.status === "in-progress"
                                      ? "inProgress"
                                      : task.status
                                  }`
                                )}
                              </Badge>
                            </div>
                          </div>

                          {task.description && (
                            <p className="text-gray-600 mb-3">
                              {task.description}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            {task.dueDate && (
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {t("tasks.details.due")}{" "}
                                  {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            {task.assignedTo && (
                              <div className="flex items-center space-x-1">
                                <User className="h-4 w-4" />
                                <span>{task.assignedTo}</span>
                              </div>
                            )}
                            {task.category && (
                              <div className="flex items-center space-x-1">
                                <Target className="h-4 w-4" />
                                <span>{task.category}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {t("tasks.details.created")}{" "}
                                {new Date(task.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(task)}
                            disabled={updateTaskMutation.isPending}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(task.id)}
                            className="text-red-600 hover:text-red-700"
                            disabled={deleteTaskMutation.isPending}
                          >
                            {deleteTaskMutation.isPending ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      )}

      {/* Add/Edit Task Modal */}
      {(showAddTaskModal || showEditTaskModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            className={`bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto ${
              createTaskMutation.isPending || updateTaskMutation.isPending
                ? "opacity-75"
                : ""
            }`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {selectedTask ? t("tasks.editTask") : t("tasks.newTask")}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAddTaskModal(false);
                  setShowEditTaskModal(false);
                  resetForm();
                }}
                disabled={
                  createTaskMutation.isPending || updateTaskMutation.isPending
                }
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("tasks.form.title")} *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder={t("tasks.form.titlePlaceholder")}
                  required
                  disabled={
                    createTaskMutation.isPending || updateTaskMutation.isPending
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("tasks.form.description")}
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder={t("tasks.form.descriptionPlaceholder")}
                  rows={3}
                  disabled={
                    createTaskMutation.isPending || updateTaskMutation.isPending
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("tasks.form.priority")}
                  </label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: "low" | "medium" | "high") =>
                      setFormData({ ...formData, priority: value })
                    }
                    disabled={
                      createTaskMutation.isPending ||
                      updateTaskMutation.isPending
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {t(`tasks.priorities.${priority}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("tasks.form.category")}
                  </label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                    disabled={
                      createTaskMutation.isPending ||
                      updateTaskMutation.isPending
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t("tasks.form.categoryPlaceholder")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {t(`tasks.categories.${category}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("tasks.form.dueDate")}
                </label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  disabled={
                    createTaskMutation.isPending || updateTaskMutation.isPending
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("tasks.form.assignedTo")}
                </label>
                <Popover open={assignedToOpen} onOpenChange={setAssignedToOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={assignedToOpen}
                      className="w-full justify-between"
                      disabled={
                        createTaskMutation.isPending ||
                        updateTaskMutation.isPending
                      }
                    >
                      {formData.assignedTo ||
                        t("tasks.form.assignedToPlaceholder")}
                      <ChevronRight className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput
                        placeholder={t("tasks.form.searchAssignees")}
                        disabled={
                          createTaskMutation.isPending ||
                          updateTaskMutation.isPending
                        }
                      />
                      <CommandList>
                        <CommandEmpty>
                          {t("tasks.form.noAssigneeFound")}
                        </CommandEmpty>
                        <CommandGroup>
                          {teamMembersLoading ? (
                            <CommandItem disabled>
                              Loading team members...
                            </CommandItem>
                          ) : teamMembers.length === 0 ? (
                            <CommandItem disabled>
                              No team members found. Add team members first.
                            </CommandItem>
                          ) : (
                            teamMembers.map((member) => {
                              const memberName =
                                `${member.user?.firstName || ""} ${
                                  member.user?.lastName || ""
                                }`.trim() ||
                                member.user?.email ||
                                "Unknown";
                              return (
                                <CommandItem
                                  key={member.id}
                                  value={memberName}
                                  onSelect={(currentValue) => {
                                    setFormData({
                                      ...formData,
                                      assignedTo: currentValue,
                                    });
                                    setAssignedToOpen(false);
                                  }}
                                  disabled={
                                    createTaskMutation.isPending ||
                                    updateTaskMutation.isPending
                                  }
                                >
                                  <CheckCircle
                                    className={`mr-2 h-4 w-4 ${
                                      formData.assignedTo === memberName
                                        ? "opacity-100"
                                        : "opacity-0"
                                    }`}
                                  />
                                  {memberName} ({member.role})
                                </CommandItem>
                              );
                            })
                          )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddTaskModal(false);
                    setShowEditTaskModal(false);
                    resetForm();
                  }}
                  className="flex-1"
                  disabled={
                    createTaskMutation.isPending || updateTaskMutation.isPending
                  }
                >
                  {t("tasks.form.cancel")}
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={
                    createTaskMutation.isPending || updateTaskMutation.isPending
                  }
                >
                  {createTaskMutation.isPending ||
                  updateTaskMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      {selectedTask
                        ? t("tasks.form.updating")
                        : t("tasks.form.creating")}
                    </>
                  ) : selectedTask ? (
                    t("tasks.updateTask")
                  ) : (
                    t("tasks.createTask")
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Event Details Modal */}
      {showEventModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            className={`bg-white rounded-lg p-6 w-full max-w-md ${
              deleteTaskMutation.isPending ? "opacity-75" : ""
            }`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{t("tasks.taskDetails")}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowEventModal(false);
                  setSelectedTask(null);
                }}
                disabled={deleteTaskMutation.isPending}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  {selectedTask.title}
                </h3>
                {selectedTask.description && (
                  <p className="text-gray-600 text-sm mb-4">
                    {selectedTask.description}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {t("tasks.details.due")}{" "}
                    {selectedTask.dueDate
                      ? new Date(selectedTask.dueDate).toLocaleDateString()
                      : t("tasks.details.noDueDate")}
                  </span>
                </div>

                {selectedTask.assignedTo && (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {t("tasks.details.assignedTo")} {selectedTask.assignedTo}
                    </span>
                  </div>
                )}

                {selectedTask.category && (
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {t("tasks.details.category")} {selectedTask.category}
                    </span>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${getPriorityColor(
                      selectedTask.priority
                    )}`}
                  ></div>
                  <span className="text-sm text-gray-600">
                    {t("tasks.details.priority")}{" "}
                    {t(`tasks.priorities.${selectedTask.priority}`)}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(selectedTask.status)}>
                    {t(
                      `tasks.statuses.${
                        selectedTask.status === "in-progress"
                          ? "inProgress"
                          : selectedTask.status
                      }`
                    )}
                  </Badge>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {t("tasks.details.created")}{" "}
                    {new Date(selectedTask.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEventModal(false);
                    handleEdit(selectedTask);
                  }}
                  className="flex-1"
                  disabled={updateTaskMutation.isPending}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {t("tasks.details.edit")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEventModal(false);
                    handleDelete(selectedTask);
                  }}
                  className="flex-1 text-red-600 hover:text-red-700"
                  disabled={deleteTaskMutation.isPending}
                >
                  {deleteTaskMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  {t("tasks.details.delete")}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Blur overlay for locked sections - only for Free plan users */}
      {subscription?.isFreePlan && !hasSectionAccess("tasks") && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg border max-w-md">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              🔒 Section Locked
            </h3>
            <p className="text-gray-600 mb-4">
              {getSectionLockMessage("tasks")}
            </p>
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {getUpgradePrice()}
              </div>
              <div className="text-sm text-gray-600">
                {getUpgradePlan()} Plan
              </div>
            </div>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                if (subscription?.isFreePlan) {
                  testUpgradeToGrowth();
                } else if (subscription?.plan.name.toLowerCase() === "growth") {
                  testUpgradeToScale();
                } else {
                  window.location.href = "/pricing";
                }
              }}
            >
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Upgrade Now
            </Button>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              🔒 Action Locked
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <Lock className="h-8 w-8 text-yellow-600" />
              </div>
              <p className="text-gray-600 text-base">
                {getSectionLockMessage("tasks")}
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {getUpgradePrice()}
              </div>
              <div className="text-sm text-gray-600">
                {getUpgradePlan()} Plan
              </div>
            </div>

            <div className="space-y-2">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  if (subscription?.isFreePlan) {
                    testUpgradeToGrowth();
                    setShowUpgradeModal(false);
                  } else if (
                    subscription?.plan.name.toLowerCase() === "growth"
                  ) {
                    testUpgradeToScale();
                    setShowUpgradeModal(false);
                  } else {
                    window.location.href = "/pricing";
                  }
                }}
              >
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Upgrade Now
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowUpgradeModal(false)}
              >
                Maybe Later
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={showDeleteConfirmation}
        onClose={() => {
          setShowDeleteConfirmation(false);
          setTaskToDelete(null);
        }}
        onConfirm={confirmDelete}
        title={t("tasks.messages.taskDeleteConfirm")}
        description={t("common.deleteConfirmation.description")}
        itemName={taskToDelete?.title}
      />

      {/* Manage Team Modal */}
      <Dialog open={showManageTeamModal} onOpenChange={setShowManageTeamModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Team</DialogTitle>
          </DialogHeader>
          <TeamManagementModal
            onClose={() => setShowManageTeamModal(false)}
            onTeamUpdated={() => {
              // Refresh team members when team is updated
              queryClient.invalidateQueries({ queryKey: ["teamMembers"] });
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TasksPage;
