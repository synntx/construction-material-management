"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useFetchItems from "@/hooks/useFetchItems";
import api from "@/lib/apiClient";
import { z } from "zod"; // Import Zod for schema
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { BasicItem } from "@/lib/types";

enum SubTypeEnum {
  civil = "civil",
  ohe = "ohe",
  pway = "pway",
  structural_steel = "structural_steel",
  reinforcement_steel = "reinforcement_steel",
  roofing_sheets = "roofing_sheets",
  flush_doors = "flush_doors",
  mechanical = "mechanical",
}

const createItemSchemaFrontend = z.object({
  projectId: z.string().uuid({ message: "Please provide a valid projectId" }),
  name: z
    .string()
    .min(1, { message: "Item name is required" })
    .max(100, { message: "Item name must not exceed 100 characters" }),
  unit: z.string().min(1, { message: "Unit is required" }),
  rate: z
    .string()
    .optional()
    .refine((value) => value === "" || !isNaN(Number(value)), {
      message: "Rate must be a number if provided",
    }),
  avgLeadTime: z
    .string()
    .refine((value) => !isNaN(Number(value)), {
      message: "Average lead time must be a number",
    })
    .refine((value) => Number(value) > 0, {
      message: "Average lead time must be a positive number",
    }),
  subType: z.nativeEnum(SubTypeEnum, {
    message: "Please select a valid subtype",
  }),
  parentItemId: z.string().optional(),
});

interface CreateItemModalProps {
  projectId: string;
  onItemCreated: () => void;
}

interface ItemsResponse {
  items: BasicItem[];
  totalPages: number;
}

const CreateItemModal: React.FC<CreateItemModalProps> = ({
  projectId,
  onItemCreated,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [unit, setUnit] = useState<string>("");
  const [rate, setRate] = useState<string>("");
  const [avgLeadTime, setAvgLeadTime] = useState<string>("1");
  const [subType, setSubType] = useState<SubTypeEnum>(SubTypeEnum.civil);
  const [parentItemId, setParentItemId] = useState<string>("0");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const parentItemsUrl = `/api/v1/projects/${projectId}/items`;
  const {
    data: parentItemsData,
    loading: parentItemsLoading,
    error: parentItemsError,
    fetchData: fetchParentItems,
  } = useFetchItems<ItemsResponse>(parentItemsUrl);

  useEffect(() => {
    if (open) {
      fetchParentItems();
    }
  }, [open, fetchParentItems]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setIsSubmitting(true);
      setFormError(null);

      const formData = {
        projectId,
        name,
        unit,
        rate,
        avgLeadTime,
        subType,
        parentItemId,
      };

      try {
        const validatedData = createItemSchemaFrontend.safeParse(formData);

        if (!validatedData.success) {
          setIsSubmitting(false);
          const errorMessages = validatedData.error.errors
            .map((error) => error.message)
            .join(", ");
          setFormError(`Validation error: ${errorMessages}`);
          return;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const apiPayload: Record<string, any> = {
          projectId: validatedData.data.projectId,
          name: validatedData.data.name,
          unit: validatedData.data.unit,
          subType: validatedData.data.subType,
          avgLeadTime: Number(validatedData.data.avgLeadTime),
        };

        // Only add rate if it's not empty
        if (validatedData.data.rate && validatedData.data.rate !== "") {
          apiPayload.rate = Number(validatedData.data.rate);
        }

        // Only add parentItemId if it's not "0" (no parent)
        if (
          validatedData.data.parentItemId &&
          validatedData.data.parentItemId !== "0"
        ) {
          apiPayload.parentItemId = Number(validatedData.data.parentItemId);
        }

        await api.post(`/api/v1/projects/${projectId}/items`, apiPayload);
        toast.success("Item created successfully!");
        onItemCreated();
        setOpen(false);
        resetForm();
      } catch (error) {
        setIsSubmitting(false);
        if (isAxiosError(error)) {
          setFormError(error.response?.data?.message || "Error creating item.");
          console.error("API Error:", error);
        } else {
          setFormError("An unexpected error occurred.");
          console.error("Unexpected Error:", error);
        }
      }
    },
    [
      projectId,
      name,
      unit,
      rate,
      avgLeadTime,
      subType,
      parentItemId,
      onItemCreated,
    ]
  );

  const resetForm = () => {
    setName("");
    setUnit("");
    setRate("");
    setAvgLeadTime("1");
    setSubType(SubTypeEnum.civil);
    setParentItemId("");
    setFormError(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Create New Item</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Item</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="grid gap-4 py-4"
          id="createItemForm"
        >
          <div className="grid gap-2">
            <Label htmlFor="name">Item Name</Label>
            <Input
              id="name"
              placeholder="Item name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="unit">Unit</Label>
            <Input
              id="unit"
              placeholder="Unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="rate">Rate (Optional)</Label>
            <Input
              type="text"
              id="rate"
              placeholder="Rate"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="avgLeadTime">Average Lead Time (Days)</Label>
            <Input
              type="text"
              id="avgLeadTime"
              placeholder="Average Lead Time"
              value={avgLeadTime}
              onChange={(e) => setAvgLeadTime(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="subType">Subtype</Label>
            <Select onValueChange={(value) => setSubType(value as SubTypeEnum)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select subtype" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(SubTypeEnum).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="parentItemId">Parent Item (Optional)</Label>
            <Select
              value={parentItemId}
              onValueChange={(value) => setParentItemId(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select parent item (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">No Parent</SelectItem>
                {parentItemsLoading ? (
                  <SelectItem disabled value="loading">
                    Loading parent items...
                  </SelectItem>
                ) : parentItemsError ? (
                  <SelectItem disabled value="error">
                    Error loading parent items
                  </SelectItem>
                ) : (
                  parentItemsData?.items?.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {`${item.code} - ${item.name}`}{" "}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {formError && <p className="text-red-500 text-sm">{formError}</p>}
        </form>
        <DialogFooter>
          <Button type="submit" form="createItemForm" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateItemModal;
