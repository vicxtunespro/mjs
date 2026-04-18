"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Star } from "lucide-react";

const subjectSchema = z.object({
  metadata: z.object({
    name: z.string().min(1, "Name is required"),
    code: z.string().min(1, "Code is required").toUpperCase(),
    category: z.string().min(1, "Category is required"),
    level: z.string().min(1, "Level is required"),
    description: z.string().min(10, "Description must be at least 10 characters"),
  }),
  configuration: z.object({
    status: z.enum(["Active", "Inactive", "Archived"]),
    isCore: z.boolean(),
  }),
});

type SubjectFormData = z.infer<typeof subjectSchema>;

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SubjectFormData) => void;
  initialData?: any;
}

export function SubjectModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: SubjectModalProps) {
  const form = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      metadata: {
        name: "",
        code: "",
        category: "",
        level: "",
        description: "",
      },
      configuration: {
        status: "Active",
        isCore: false,
      },
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        metadata: {
          name: initialData.metadata.name || "",
          code: initialData.metadata.code || "",
          category: initialData.metadata.category || "",
          level: initialData.metadata.level || "",
          description: initialData.metadata.description || "",
        },
        configuration: {
          status: initialData.configuration.status || "Active",
          isCore: initialData.configuration.isCore || false,
        },
      });
    } else {
      form.reset({
        metadata: {
          name: "",
          code: "",
          category: "",
          level: "",
          description: "",
        },
        configuration: {
          status: "Active",
          isCore: false,
        },
      });
    }
  }, [initialData, form]);

  const handleSubmit = (data: SubjectFormData) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-primary">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-secondary mt-4 mb-6 text-left border-b pb-2">
            {initialData ? "Edit Subject" : "Create New Subject"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Name and Code */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="metadata.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-secondary">Subject Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Mathematics" {...field} className="text-secondary/80" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metadata.code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-secondary">Subject Code *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., MATH101" 
                        {...field}
                        className="text-secondary/80"
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="metadata.description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-secondary">Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the subject..."
                      className="min-h-[80px] text-secondary/80"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a clear description of what this subject covers
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category and Level */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="metadata.category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-secondary">Category *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="text-secondary/80">
                        <SelectItem value="Core">Core</SelectItem>
                        <SelectItem value="Elective">Elective</SelectItem>
                        <SelectItem value="Optional">Optional</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metadata.level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-secondary">Level *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Lower Primary">Lower Primary</SelectItem>
                        <SelectItem value="Upper Primary">Upper Primary</SelectItem>
                        <SelectItem value="Junior Secondary">Junior Secondary</SelectItem>
                        <SelectItem value="Senior Secondary">Senior Secondary</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Status and Core Subject */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="configuration.status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-secondary">Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="text-secondary/80">
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="configuration.isCore"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm text-secondary/20">
                    <div className="space-y-0.5">
                      <FormLabel className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-amber-500" />
                        Core Subject
                      </FormLabel>
                      <FormDescription className="text-xs">
                        Mark as required subject
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Info Box */}
            <div className="rounded-lg bg-red-50 p-4 border border-blue-100">
              <p className="text-sm text-gray-900">
                <strong>Note:</strong> Core subjects are mandatory for student.
                Elective and Optional subjects can be chosen by students based on their preferences.
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} className="bg-cta">
                Cancel
              </Button>
              <Button type="submit" className="bg-foreground hover:bg-foreground/90">
                {initialData ? "Update Subject" : "Create Subject"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}