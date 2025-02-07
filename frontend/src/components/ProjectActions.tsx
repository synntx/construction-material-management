"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoreVertical, Edit, Trash } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/apiClient";
import { isAxiosError } from "axios";
import { Project } from "@/lib/types";

interface ProjectActionsProps {
  project: Project;
  onProjectUpdated: () => void;
  onProjectDeleted: () => void;
}

export function ProjectActions({
  project,
  onProjectUpdated,
  onProjectDeleted,
}: ProjectActionsProps) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [newName, setNewName] = useState(project.name);
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleModalClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);
    setIsEditing(true);

    try {
      await api.put(`/api/v1/project/${project.id}`, {
        name: newName.trim(),
      });

      toast.success("Project updated successfully!");
      setEditModalOpen(false);
      onProjectUpdated();
    } catch (err) {
      console.error("Error updating project:", err);
      if (isAxiosError(err)) {
        setEditError(err.response?.data?.message || "Error updating project");
      } else {
        setEditError("An unexpected error occurred");
      }
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    setDeleteError(null);
    setIsDeleting(true);

    try {
      await api.delete(`/api/v1/project/${project.id}`);

      toast.success("Project deleted successfully!");
      setDeleteModalOpen(false);
      onProjectDeleted();
    } catch (err) {
      console.error("Error deleting project:", err);
      if (isAxiosError(err)) {
        setDeleteError(err.response?.data?.message || "Error deleting project");
      } else {
        setDeleteError("An unexpected error occurred");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div onClick={handleModalClick}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={handleModalClick}>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={handleModalClick}>
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setEditModalOpen(true);
            }}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDeleteModalOpen(true);
            }}
            className="text-red-600"
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={editModalOpen}
        onOpenChange={(open) => {
          setEditModalOpen(open);
          if (!open) {
            setNewName(project.name);
            setEditError(null);
          }
        }}
      >
        <DialogContent onClick={handleModalClick}>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter project name"
                disabled={isEditing}
              />
            </div>
            {editError && <p className="text-sm text-red-500">{editError}</p>}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditModalOpen(false)}
                disabled={isEditing}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleEdit}
                type="submit"
                disabled={isEditing || !newName.trim()}
              >
                {isEditing ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteModalOpen}
        onOpenChange={(open) => {
          setDeleteModalOpen(open);
          if (!open) {
            setDeleteError(null);
          }
        }}
      >
        <DialogContent onClick={handleModalClick}>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{project.name}&quot;? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deleteError && <p className="text-sm text-red-500">{deleteError}</p>}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Project"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
