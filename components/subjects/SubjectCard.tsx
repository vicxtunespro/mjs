"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Copy,
  BookOpen,
  Tag,
  Layers,
  Star,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";

interface SubjectCardProps {
  subject: any;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function SubjectCard({
  subject,
  onView,
  onEdit,
  onDelete,
}: SubjectCardProps) {
  const getStatusColor = (status: string) => {
    const colors = {
      Active: "bg-green-100 text-green-800 border-green-200",
      Inactive: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Archived: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[status as keyof typeof colors] || colors.Archived;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      Active: CheckCircle2,
      Inactive: AlertCircle,
      Archived: XCircle,
    };
    const Icon = icons[status as keyof typeof icons] || AlertCircle;
    return <Icon className="h-3 w-3" />;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      Core: "bg-red-100 text-gray-800 border-blue-200",
      Elective: "bg-purple-100 text-purple-800 border-purple-200",
      Optional: "bg-orange-100 text-orange-800 border-orange-200",
    };
    return colors[category as keyof typeof colors] || colors.Core;
  };

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
      {/* Header with gradient */}
      <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-600" />
      
      <div className="p-6">
        {/* Actions */}
        <div className="absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onView}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Avatar and Title */}
        <div className="mb-4 flex items-start gap-4">
          <Avatar className="h-12 w-12 border-2 border-blue-100">
            <AvatarFallback className="bg-red-50 text-gray-700">
              {subject.metadata.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold leading-tight">{subject.metadata.name}</h3>
            <p className="text-sm text-muted-foreground font-mono">{subject.metadata.code}</p>
          </div>
        </div>

        {/* Badges */}
        <div className="mb-4 flex flex-wrap gap-2">
          <Badge 
            variant="outline" 
            className={`flex items-center gap-1 ${getStatusColor(subject.configuration.status)}`}
          >
            {getStatusIcon(subject.configuration.status)}
            {subject.configuration.status}
          </Badge>
          <Badge 
            variant="outline" 
            className={getCategoryColor(subject.metadata.category)}
          >
            {subject.configuration.isCore && <Star className="h-3 w-3 mr-1" />}
            {subject.metadata.category}
          </Badge>
          {subject.configuration.isCore && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              Core Subject
            </Badge>
          )}
        </div>

        {/* Description */}
        {subject.metadata.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
            {subject.metadata.description}
          </p>
        )}

        {/* Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Tag className="h-4 w-4" />
            <span className="font-medium">Category:</span>
            <span>{subject.metadata.category}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Layers className="h-4 w-4" />
            <span className="font-medium">Level:</span>
            <span>{subject.metadata.level}</span>
          </div>
          {subject.configuration.isCore && (
            <div className="flex items-center gap-2 text-amber-600">
              <Star className="h-4 w-4 fill-amber-600" />
              <span className="font-medium text-xs">Required Core Subject</span>
            </div>
          )}
        </div>

        {/* Subject ID */}
        <div className="mt-4 border-t pt-3">
          <p className="text-xs text-muted-foreground">
            Subject ID: <span className="font-mono font-medium">{subject.subjectId}</span>
          </p>
        </div>
      </div>
    </Card>
  );
}