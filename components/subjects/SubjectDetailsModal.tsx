"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Clock,
  Calendar,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Code,
  Users,
  Award,
  Tag,
  Layers,
  Star,
} from "lucide-react";

interface SubjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: any;
}

export function SubjectDetailsModal({
  isOpen,
  onClose,
  subject,
}: SubjectDetailsModalProps) {
  if (!subject) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "Inactive":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "Archived":
        return <XCircle className="h-5 w-5 text-gray-500" />;
      default:
        return null;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      Core: "bg-red-100 text-gray-800 border-blue-200",
      Elective: "bg-purple-100 text-purple-800 border-purple-200",
      Optional: "bg-orange-100 text-orange-800 border-orange-200",
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-primary text-foreground">
        <DialogHeader className="mt-6">
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Subject Details
          </DialogTitle>
        </DialogHeader>

        

        <div className="space-y-6">
          {/* Header Section */}
          <div className="rounded-lg bg-gradient-to-r from-cta to-secondary p-6">
            <div className="flex items-start justify-between text-primary">
              <div>
                <h2 className="text-2xl font-bold">{subject.metadata.name}</h2>
                <div className="mt-1 flex items-center gap-2 text-primary">
                  <Code className="h-4 w-4" />
                  <span className="font-mono text-sm">
                    {subject.metadata.code}
                  </span>
                  <span>•</span>
                  <span className="font-mono text-sm ">
                    {subject.subjectId}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(subject.configuration.status)}
                <Badge
                  variant="outline"
                  className={
                    subject.configuration.status === "Active"
                      ? "border-green-200 bg-green-50 text-green-700"
                      : subject.configuration.status === "Inactive"
                      ? "border-yellow-200 bg-yellow-50 text-yellow-700"
                      : "border-gray-200 bg-gray-50 text-gray-700"
                  }
                >
                  {subject.configuration.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="font-semibold">Basic Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <Badge 
                      variant="outline" 
                      className={getCategoryColor(subject.metadata.category)}
                    >
                      {subject.configuration.isCore && <Star className="mr-1 h-3 w-3" />}
                      {subject.metadata.category}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Level</p>
                    <p className="font-medium">{subject.metadata.level}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="font-medium">
                      {new Date(subject.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p className="font-medium">
                      {new Date(subject.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="font-semibold">Configuration</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Subject Type</p>
                    <Badge 
                      variant="outline"
                      className={
                        subject.configuration.isCore 
                          ? "border-amber-200 bg-amber-50 text-amber-700" 
                          : "border-blue-200 bg-red-50 text-gray-700"
                      }
                    >
                      {subject.configuration.isCore ? (
                        <>
                          <Star className="mr-1 h-3 w-3" />
                          Core Subject
                        </>
                      ) : (
                        "Elective"
                      )}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Code className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Subject Code</p>
                    <p className="font-mono font-medium">{subject.metadata.code}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Subject ID</p>
                    <p className="font-mono font-medium text-xs">{subject.subjectId}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {subject.metadata.description && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">Description</h3>
              </div>
              <div className="rounded-lg bg-muted/50 p-4 border">
                <p className="text-sm leading-relaxed">{subject.metadata.description}</p>
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div className="rounded-lg bg-red-50 p-4 border border-blue-100">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900">Subject Information</h4>
                <p className="text-sm text-gray-700 mt-1">
                  This subject is classified as a <strong>{subject.metadata.category}</strong> subject
                  at the <strong>{subject.metadata.level}</strong> level
                  {subject.configuration.isCore && " and is a core requirement for the curriculum"}.
                </p>
              </div>
            </div>
          </div>

          {/* Statistics - Placeholder for future implementation */}
          <Separator />
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-red-50 border border-blue-100">
              <Users className="h-6 w-6 text-gray-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-600">-</p>
              <p className="text-xs text-muted-foreground">Enrolled Students</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-50 border border-green-100">
              <Award className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">-</p>
              <p className="text-xs text-muted-foreground">Average Grade</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-purple-50 border border-purple-100">
              <CheckCircle2 className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-600">-</p>
              <p className="text-xs text-muted-foreground">Pass Rate</p>
            </div>
          </div>

          {/* Metadata Footer */}
          <div className="rounded-lg bg-gray-50 p-3 border">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>MongoDB ID: <code className="font-mono">{subject._id}</code></span>
              <span>Version: {subject.__v || 0}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}