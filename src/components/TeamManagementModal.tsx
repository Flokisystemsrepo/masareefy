import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { teamAPI } from "@/services/api";
import { toast } from "sonner";
import { Plus, Edit, Trash2, User, Mail, Shield } from "lucide-react";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";

interface TeamMember {
  id: string;
  userId: string;
  role: string;
  permissions: string[];
  joinedAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface TeamManagementModalProps {
  onClose: () => void;
  onTeamUpdated: () => void;
}

const TeamManagementModal: React.FC<TeamManagementModalProps> = ({
  onClose,
  onTeamUpdated,
}) => {
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showEditMemberModal, setShowEditMemberModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    permissions: [] as string[],
  });

  const queryClient = useQueryClient();

  // Fetch team members
  const {
    data: teamData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["teamMembers"],
    queryFn: () => teamAPI.getAll(),
  });

  const teamMembers = teamData?.teamMembers || [];

  // Create team member mutation
  const createMemberMutation = useMutation({
    mutationFn: teamAPI.create,
    onSuccess: () => {
      toast.success("Team member added successfully");
      queryClient.invalidateQueries({ queryKey: ["teamMembers"] });
      onTeamUpdated();
      setShowAddMemberModal(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add team member");
    },
  });

  // Update team member mutation
  const updateMemberMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      teamAPI.update(id, data),
    onSuccess: () => {
      toast.success("Team member updated successfully");
      queryClient.invalidateQueries({ queryKey: ["teamMembers"] });
      onTeamUpdated();
      setShowEditMemberModal(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update team member");
    },
  });

  // Delete team member mutation
  const deleteMemberMutation = useMutation({
    mutationFn: teamAPI.delete,
    onSuccess: () => {
      toast.success("Team member removed successfully");
      queryClient.invalidateQueries({ queryKey: ["teamMembers"] });
      onTeamUpdated();
      setShowDeleteConfirmation(false);
      setSelectedMember(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to remove team member");
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "",
      permissions: [],
    });
  };

  const handleAddMember = () => {
    if (!formData.name || !formData.email || !formData.role) {
      toast.error("Please fill in all required fields");
      return;
    }

    createMemberMutation.mutate({
      name: formData.name,
      email: formData.email,
      role: formData.role,
      permissions: formData.permissions,
    });
  };

  const handleEditMember = () => {
    if (
      !selectedMember ||
      !formData.name ||
      !formData.email ||
      !formData.role
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    updateMemberMutation.mutate({
      id: selectedMember.id,
      data: {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        permissions: formData.permissions,
      },
    });
  };

  const handleDeleteMember = () => {
    if (selectedMember) {
      deleteMemberMutation.mutate(selectedMember.id);
    }
  };

  const openEditModal = (member: TeamMember) => {
    setSelectedMember(member);
    setFormData({
      name:
        `${member.user?.firstName || ""} ${
          member.user?.lastName || ""
        }`.trim() ||
        member.user?.email ||
        "",
      email: member.user?.email || "",
      role: member.role,
      permissions: member.permissions,
    });
    setShowEditMemberModal(true);
  };

  const openDeleteModal = (member: TeamMember) => {
    setSelectedMember(member);
    setShowDeleteConfirmation(true);
  };

  const availableRoles = [
    "Admin",
    "Manager",
    "Developer",
    "Designer",
    "Marketing",
    "Sales",
    "Support",
    "Viewer",
  ];

  const availablePermissions = [
    "tasks.create",
    "tasks.edit",
    "tasks.delete",
    "inventory.view",
    "inventory.edit",
    "financial.view",
    "financial.edit",
    "team.manage",
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading team members...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-600">Failed to load team members</p>
          <Button
            variant="outline"
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["teamMembers"] })
            }
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Team Members</h3>
          <p className="text-sm text-gray-600">
            Manage your team members and their permissions
          </p>
        </div>
        <Button onClick={() => setShowAddMemberModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Member
        </Button>
      </div>

      {/* Team Members List */}
      <div className="grid gap-4">
        {teamMembers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No team members yet
              </h3>
              <p className="text-gray-600 mb-4">
                Add team members to start collaborating on tasks
              </p>
              <Button onClick={() => setShowAddMemberModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Member
              </Button>
            </CardContent>
          </Card>
        ) : (
          teamMembers.map((member) => (
            <Card key={member.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">
                        {`${member.user?.firstName || ""} ${
                          member.user?.lastName || ""
                        }`.trim() ||
                          member.user?.email ||
                          "Unknown"}
                      </h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="h-3 w-3" />
                        <span>{member.user?.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Shield className="h-3 w-3 text-gray-400" />
                        <Badge variant="secondary">{member.role}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(member)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDeleteModal(member)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Team Member</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddMemberModal(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddMember}
                disabled={createMemberMutation.isPending}
              >
                {createMemberMutation.isPending ? "Adding..." : "Add Member"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {showEditMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Team Member</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="edit-role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditMemberModal(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditMember}
                disabled={updateMemberMutation.isPending}
              >
                {updateMemberMutation.isPending
                  ? "Updating..."
                  : "Update Member"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={showDeleteConfirmation}
        onClose={() => {
          setShowDeleteConfirmation(false);
          setSelectedMember(null);
        }}
        onConfirm={handleDeleteMember}
        title="Remove Team Member"
        description="Are you sure you want to remove this team member? This action cannot be undone."
        itemName={
          selectedMember
            ? `${selectedMember.user?.firstName || ""} ${
                selectedMember.user?.lastName || ""
              }`.trim() ||
              selectedMember.user?.email ||
              "Unknown"
            : ""
        }
      />
    </div>
  );
};

export default TeamManagementModal;
