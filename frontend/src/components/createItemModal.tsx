"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
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
import { z } from "zod";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { BasicItem, SubType } from "@/lib/types";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { cn } from "@/lib/utils";
import { debounce } from "@/lib/debounce";

const createItemSchemaFrontend = z.object({
  projectId: z.string().uuid({ message: "Please provide a valid projectId" }),
  name: z
    .string()
    .min(1, { message: "Item name is required" })
    .max(100, { message: "Item name must not exceed 100 characters" }),
  unit: z.string().min(1, { message: "Unit is required" }),
  rate: z.string().refine((value) => value === "" || !isNaN(Number(value)), {
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
  subType: z.nativeEnum(SubType, {
    message: "Please select a valid subtype",
  }),
  parentItemId: z.string().optional(),
});

interface CreateItemModalProps {
  projectId: string;
  onItemCreated: () => void;
}

export interface ItemsResponse {
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
  const [subType, setSubType] = useState<SubType>(SubType.civil);
  const [parentItemId, setParentItemId] = useState<string>("0");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const itemsURL = `/api/v1/projects/${projectId}/items?${new URLSearchParams({
    q: debouncedSearchTerm,
  })}`;

  const {
    data: parentItemsData,
    loading: parentItemsLoading,
    error: parentItemsError,
    fetchData: fetchItems,
  } = useFetchItems<{ items: BasicItem[]; totalPages: number }>(itemsURL);

  const debouncedHandleSearch = useMemo(
    () =>
      debounce((value: string) => {
        console.log("🟢 debounced handleSearch called with:", value);
        setDebouncedSearchTerm(value);
      }, 300),
    []
  );

  useEffect(() => {
    fetchItems();
    console.log("Fetched Items Data:", parentItemsData);
  }, [itemsURL, fetchItems]);

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

        if (validatedData.data.rate && validatedData.data.rate !== "") {
          apiPayload.rate = Number(validatedData.data.rate);
        }

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
    setSubType(SubType.civil);
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
            <Select onValueChange={(value) => setSubType(value as SubType)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select subtype" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(SubType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid w-full items-center gap-4">
            <Label htmlFor="parentItemId">Parent Item</Label>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={popoverOpen}
                  className="w-full justify-between"
                >
                  {parentItemId
                    ? parentItemsData?.items.find(
                        (item) => String(item.id) === parentItemId
                      )?.name || "Select..."
                    : "Select Parent Item..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Search parent item..."
                    className="h-9"
                    value={searchTerm}
                    onValueChange={(val) => {
                      setSearchTerm(val);
                      debouncedHandleSearch(val);
                    }}
                  />
                  <CommandList>
                    {/* <CommandEmpty>No parent item found.</CommandEmpty> */}
                    <CommandGroup>
                      <CommandItem
                        key="no-parent"
                        value=""
                        onSelect={() => {
                          setParentItemId("");
                          setPopoverOpen(false);
                        }}
                      >
                        No Parent
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            parentItemId === "" ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                      {parentItemsLoading ? (
                        <CommandItem value="loading" disabled>
                          Loading...
                        </CommandItem>
                      ) : parentItemsError ? (
                        <CommandItem value="error" disabled>
                          Error loading items
                        </CommandItem>
                      ) : (
                        parentItemsData?.items.map((item) => (
                          <CommandItem
                            key={item.id}
                            value={String(item.id)}
                            onSelect={(currentValue) => {
                              setParentItemId(currentValue);
                              setPopoverOpen(false);
                            }}
                          >
                            {`${item.code} - ${item.name}`}
                            <Check
                              className={cn(
                                "ml-auto h-4 w-4",
                                parentItemId === String(item.id)
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))
                      )}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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
