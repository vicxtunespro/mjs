// components/subjects/SubjectsManagement.tsx
"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Plus,
    Search,
    MoreVertical,
    Edit,
    Trash2,
    Copy,
    Download,
    Upload,
    Eye,
    Filter,
    RefreshCw,
    FileText,
    Grid3X3,
    List,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    Book,
    StopCircle,
    PlayCircle,
} from "lucide-react";
import { SubjectModal } from "./SubjectModal";
import { SubjectDetailsModal } from "./SubjectDetailsModal";
import { SubjectCard } from "./SubjectCard";
import { ExportMenu } from "./ExportMenu";
import { BulkActions } from "./BulkActions";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import SectionHeader from "../ui/sectionHeader";

interface Subject {
    _id: string;
    subjectId: string;
    metadata: {
        name: string;
        code: string;
        category: string;
        level: string;
        description: string;
    };
    configuration: {
        isCore: boolean;
        status: "Active" | "Inactive" | "Archived";
    };
    createdAt: string;
    updatedAt: string;
}

type ViewMode = "table" | "grid" | "list";

export function SubjectsManagement() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
    const [isReactivateDialogOpen, setIsReactivateDialogOpen] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>("table");
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        status: "all",
        category: "all",
        level: "all",
        isCore: "all",
    });
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

    // Fetch subjects
    useEffect(() => {
        fetchSubjects();
    }, []);

    // Apply filters and search
    useEffect(() => {
        let filtered = [...subjects];

        // Apply search
        if (searchQuery) {
            filtered = filtered.filter(
                (subject) =>
                    subject.metadata.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    subject.metadata.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    subject.subjectId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    subject.metadata.description?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply status filter
        if (filters.status !== "all") {
            filtered = filtered.filter(
                (subject) => subject.configuration.status === filters.status
            );
        }

        // Apply category filter
        if (filters.category !== "all") {
            filtered = filtered.filter(
                (subject) => subject.metadata.category === filters.category
            );
        }

        // Apply level filter
        if (filters.level !== "all") {
            filtered = filtered.filter(
                (subject) => subject.metadata.level === filters.level
            );
        }

        // Apply isCore filter
        if (filters.isCore !== "all") {
            const isCoreValue = filters.isCore === "true";
            filtered = filtered.filter(
                (subject) => subject.configuration.isCore === isCoreValue
            );
        }

        setFilteredSubjects(filtered);
    }, [subjects, searchQuery, filters]);

    const fetchSubjects = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subjects`);
            const results = await response.json();
            setSubjects(results.data || []);
        } catch (error) {
            toast.error("Failed to fetch subjects");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateSubject = async (data: Partial<Subject>) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subjects`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (result.success) {
                setSubjects([result.data, ...subjects]);
                setIsModalOpen(false);
                toast.success("Subject created successfully");
            } else {
                toast.error(result.message || "Failed to create subject");
            }
        } catch (error) {
            toast.error("Failed to create subject");
            console.error(error);
        }
    };

    const handleUpdateSubject = async (id: string, data: Partial<Subject>) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subjects/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (result.success) {
                setSubjects(
                    subjects.map((subject) =>
                        subject._id === id ? result.data : subject
                    )
                );
                setIsModalOpen(false);
                toast.success("Subject updated successfully");
            } else {
                toast.error(result.message || "Failed to update subject");
            }
        } catch (error) {
            toast.error("Failed to update subject");
            console.error(error);
        }
    };

    const handleDeleteSubject = async (id: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subjects/${id}/delete`, {
                method: "DELETE",
            });
            const result = await response.json();
            if (result.success) {
                setSubjects(subjects.filter((subject) => subject._id !== id));
                setIsDeleteDialogOpen(false);
                setSelectedSubject(null);
                toast.success("Subject deleted successfully");
            } else {
                toast.error(result.message || "Failed to delete subject");
            }
        } catch (error) {
            toast.error("Failed to delete subject");
            console.error(error);
        }
    };

    const handleDeactivateSubject = async (id: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subjects/${id}/deactivate`, {
                method: "PATCH",
            });
            const result = await response.json();
            if (result.success) {
                setSubjects(subjects.filter((subject) => subject._id !== id));
                setIsDeactivateDialogOpen(false);
                setSelectedSubject(null);
                toast.success("Subject deactivated successfully");
            } else {
                toast.error(result.message || "Failed to deactivate subject");
            }
        } catch (error) {
            toast.error("Failed to deactivate subject");
            console.error(error);
        }
    };
    
    const handleReactivateSubject = async (id: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subjects/${id}/activate`, {
                method: "PATCH",
            });
            const result = await response.json();
            if (result.success) {
                setSubjects(subjects.filter((subject) => subject._id !== id));
                setIsDeactivateDialogOpen(false);
                setSelectedSubject(null);
                toast.success("Subject reactivated successfully");
            } else {
                
                toast.error(result.message  || "Something went wrong while reactivating the subject");
            }
        } catch (error) {
            toast.error("Failed to reactivate subject");
            console.error(error);
        }
    };

    const handleBulkDelete = async () => {
        try {
            await Promise.all(
                selectedSubjects.map((id) =>
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/subjects/${id}`, {
                        method: "DELETE"
                    })
                )
            );
            setSubjects(
                subjects.filter((subject) => !selectedSubjects.includes(subject._id))
            );
            setSelectedSubjects([]);
            toast.success("Selected subjects deleted successfully");
        } catch (error) {
            toast.error("Failed to delete subjects");
            console.error(error);
        }
    };

    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(
            filteredSubjects.map((subject) => ({
                "Subject ID": subject.subjectId,
                Name: subject.metadata.name,
                Code: subject.metadata.code,
                Category: subject.metadata.category,
                Level: subject.metadata.level,
                "Is Core": subject.configuration.isCore ? "Yes" : "No",
                Status: subject.configuration.status,
                Description: subject.metadata.description,
                "Created At": new Date(subject.createdAt).toLocaleDateString(),
            }))
        );
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Subjects");
        XLSX.writeFile(workbook, `subjects_${new Date().toISOString()}.xlsx`);
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();

        doc.text("Subjects List", 14, 15);

        const tableData = filteredSubjects.map((subject) => [
            subject.subjectId,
            subject.metadata.name,
            subject.metadata.code,
            subject.metadata.category,
            subject.metadata.level,
            subject.configuration.isCore ? "Yes" : "No",
            subject.configuration.status,
        ]);

        (doc as any).autoTable({
            head: [["ID", "Name", "Code", "Category", "Level", "Core", "Status"]],
            body: tableData,
            startY: 25,
        });

        doc.save(`subjects_${new Date().toISOString()}.pdf`);
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            Active: {
                icon: CheckCircle2,
                className: "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
            },
            Inactive: {
                icon: Clock,
                className: "border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
            },
            Archived: {
                icon: XCircle,
                className: "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
            },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || {
            icon: AlertCircle,
            className: "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
        };

        const Icon = config.icon;

        return (
            <Badge variant="outline" className={`flex w-fit items-center gap-1 ${config.className}`}>
                <Icon className="h-3 w-3" />
                {status}
            </Badge>
        );
    };

    const categories = Array.from(
        new Set(subjects.map((subject) => subject.metadata.category))
    );

    const levels = Array.from(
        new Set(subjects.map((subject) => subject.metadata.level))
    );

    return (
        <div className="container bg-primary mx-auto space-y-6 p-6">
            {/* Header */}
            <div className="flex md:items-center md:flex-row flex-col justify-between">
                <SectionHeader title="Subjects Management" subtitle="Create, update, and manage your subjects" Icon={Book} />
                <div className="flex gap-2 justify-end">
                    <ExportMenu
                        onExportExcel={handleExportExcel}
                        onExportPDF={handleExportPDF}
                    />
                    <Button className="bg-secondary text-primary hover:bg-secondary/80" onClick={() => {
                        setSelectedSubject(null);
                        setIsModalOpen(true);

                    }}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Subject
                    </Button>
                </div>
            </div>

            {/* Filters and Search */}
            <Card className="p-4">
                <div className="space-y-4">
                    {/* Search and Actions Row */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative w-full sm:flex-1">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search subjects..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 w-full"
                            />
                        </div>

                        <div className="flex items-center justify-center sm:justify-end gap-2">
                            {/* Filter Toggle for Mobile */}
                            <Button
                                variant="outline"
                                size="icon"
                                className="lg:hidden"
                                onClick={() => setShowFilters(!showFilters)}
                                title="Toggle filters"
                            >
                                <Filter className="h-4 w-4" />
                            </Button>

                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                    setSearchQuery("");
                                    setFilters({
                                        status: "all",
                                        category: "all",
                                        level: "all",
                                        isCore: "all",
                                    });
                                }}
                                title="Reset filters"
                            >
                                <RefreshCw className="h-4 w-4" />
                            </Button>

                            <div className="flex rounded-md border shrink-0">
                                <Button
                                    variant={viewMode === "table" ? "secondary" : "ghost"}
                                    className={viewMode == "table" ? "text-primary" : "text-secondary"}
                                    size="icon"
                                    onClick={() => setViewMode("table")}
                                    title="Table view"
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                                    className={viewMode == "grid" ? "text-primary" : "text-secondary"}
                                    size="icon"
                                    onClick={() => setViewMode("grid")}
                                    title="Grid view"
                                >
                                    <Grid3X3 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Filters Section */}
                    <div className={`
      ${showFilters ? 'block' : 'hidden lg:block'}
      transition-all duration-200
    `}>
                        {/* Mobile View - Vertical Stack */}
                        <div className="space-y-3 lg:hidden">
                            <Select
                                value={filters.status}
                                onValueChange={(value) =>
                                    setFilters({ ...filters, status: value })
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <Filter className="mr-2 h-4 w-4 shrink-0" />
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                    <SelectItem value="Archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={filters.category}
                                onValueChange={(value) =>
                                    setFilters({ ...filters, category: value })
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map((category) => (
                                        <SelectItem key={category} value={category}>
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={filters.level}
                                onValueChange={(value) =>
                                    setFilters({ ...filters, level: value })
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Levels</SelectItem>
                                    {levels.map((level) => (
                                        <SelectItem key={level} value={level}>
                                            {level}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={filters.isCore}
                                onValueChange={(value) =>
                                    setFilters({ ...filters, isCore: value })
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="true">Core</SelectItem>
                                    <SelectItem value="false">Elective</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Desktop View - Horizontal Row */}
                        <div className="hidden lg:flex lg:flex-wrap lg:items-center lg:gap-2">
                            <Select
                                value={filters.status}
                                onValueChange={(value) =>
                                    setFilters({ ...filters, status: value })
                                }
                            >
                                <SelectTrigger className="w-[130px]">
                                    <Filter className="mr-2 h-4 w-4 shrink-0" />
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                    <SelectItem value="Archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={filters.category}
                                onValueChange={(value) =>
                                    setFilters({ ...filters, category: value })
                                }
                            >
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map((category) => (
                                        <SelectItem key={category} value={category}>
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={filters.level}
                                onValueChange={(value) =>
                                    setFilters({ ...filters, level: value })
                                }
                            >
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Levels</SelectItem>
                                    {levels.map((level) => (
                                        <SelectItem key={level} value={level}>
                                            {level}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={filters.isCore}
                                onValueChange={(value) =>
                                    setFilters({ ...filters, isCore: value })
                                }
                            >
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="true">Core</SelectItem>
                                    <SelectItem value="false">Elective</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Active Filters Summary */}
                    {(filters.status !== "all" || filters.category !== "all" ||
                        filters.level !== "all" || filters.isCore !== "all") && (
                            <div className="flex flex-wrap items-center gap-2 text-sm pt-2 border-t">
                                <span className="font-medium text-muted-foreground">Active filters:</span>
                                {filters.status !== "all" && (
                                    <Badge variant="secondary" className="gap-1">
                                        Status: {filters.status}
                                        <button
                                            onClick={() => setFilters({ ...filters, status: "all" })}
                                            className="ml-1 hover:text-foreground"
                                        >
                                            ×
                                        </button>
                                    </Badge>
                                )}
                                {filters.category !== "all" && (
                                    <Badge variant="secondary" className="gap-1">
                                        Category: {filters.category}
                                        <button
                                            onClick={() => setFilters({ ...filters, category: "all" })}
                                            className="ml-1 hover:text-foreground"
                                        >
                                            ×
                                        </button>
                                    </Badge>
                                )}
                                {filters.level !== "all" && (
                                    <Badge variant="secondary" className="gap-1">
                                        Level: {filters.level}
                                        <button
                                            onClick={() => setFilters({ ...filters, level: "all" })}
                                            className="ml-1 hover:text-foreground"
                                        >
                                            ×
                                        </button>
                                    </Badge>
                                )}
                                {filters.isCore !== "all" && (
                                    <Badge variant="secondary" className="gap-1">
                                        Type: {filters.isCore === "true" ? "Core" : "Elective"}
                                        <button
                                            onClick={() => setFilters({ ...filters, isCore: "all" })}
                                            className="ml-1 hover:text-foreground"
                                        >
                                            ×
                                        </button>
                                    </Badge>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={() => setFilters({
                                        status: "all",
                                        category: "all",
                                        level: "all",
                                        isCore: "all",
                                    })}
                                >
                                    Clear all
                                </Button>
                            </div>
                        )}
                </div>
            </Card>

            {/* Bulk Actions */}
            {selectedSubjects.length > 0 && (
                <BulkActions
                    selectedCount={selectedSubjects.length}
                    onClearSelection={() => setSelectedSubjects([])}
                    onDelete={handleBulkDelete}
                    onExport={() => {
                        const selectedData = subjects.filter((s) =>
                            selectedSubjects.includes(s._id)
                        );
                        // Handle export of selected items
                    }}
                />
            )}

            {/* Content */}
            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
            ) : filteredSubjects.length === 0 ? (
                <Card className="p-12 text-center">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No subjects found</h3>
                    <p className="text-sm text-muted-foreground">
                        Try adjusting your filters or search query
                    </p>
                </Card>
            ) : (
                <>
                    {viewMode === "table" && (
                        <Card className="p-0 rounded-none">
                            <Table>
                                <TableHeader className="bg-foreground/30 text-primary">
                                    <TableRow >
                                        <TableHead className="w-12">
                                            <input
                                                type="checkbox"
                                                checked={selectedSubjects.length === filteredSubjects.length}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedSubjects(filteredSubjects.map((s) => s._id));
                                                    } else {
                                                        setSelectedSubjects([]);
                                                    }
                                                }}
                                                className="h-4 w-4"
                                            />
                                        </TableHead>
                                        <TableHead>Subject ID</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Level</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredSubjects.map((subject) => (
                                        <TableRow key={subject._id}>
                                            <TableCell>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedSubjects.includes(subject._id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedSubjects([...selectedSubjects, subject._id]);
                                                        } else {
                                                            setSelectedSubjects(
                                                                selectedSubjects.filter((id) => id !== subject._id)
                                                            );
                                                        }
                                                    }}
                                                    className="h-4 w-4"
                                                />
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {subject.subjectId}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {subject.metadata.name}
                                            </TableCell>
                                            <TableCell className="font-mono">
                                                {subject.metadata.code}
                                            </TableCell>
                                            <TableCell>
                                                {subject.metadata.category}
                                            </TableCell>
                                            <TableCell>{subject.metadata.level}</TableCell>
                                            <TableCell>{getStatusBadge(subject.configuration.status)}</TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setSelectedSubject(subject);
                                                                setIsDetailsModalOpen(true);
                                                            }}
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setSelectedSubject(subject);
                                                                setIsModalOpen(true);
                                                            }}
                                                        >
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>

                                                        <DropdownMenuSeparator />
                                                        {subject.configuration.status === 'Active' ? (
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    setSelectedSubject(subject);
                                                                    setIsDeactivateDialogOpen(true);
                                                                }}
                                                                className="text-red-600"
                                                            >
                                                                <StopCircle className="mr-2 h-4 w-4" />
                                                                Deactivate
                                                            </DropdownMenuItem>
                                                        ):(
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    setSelectedSubject(subject);
                                                                    setIsReactivateDialogOpen(true);
                                                                }}
                                                                className="text-success"
                                                            >
                                                                <PlayCircle className="mr-2 h-4 w-4" />
                                                                Reactivate
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem
                                                            className="text-cta"
                                                            onClick={() => {
                                                                setSelectedSubject(subject);
                                                                setIsDeleteDialogOpen(true);
                                                            }}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    )}

                    {viewMode === "grid" && (
                        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                            {filteredSubjects.map((subject) => (
                                <SubjectCard
                                    key={subject._id}
                                    subject={subject}
                                    onView={() => {
                                        setSelectedSubject(subject);
                                        setIsDetailsModalOpen(true);
                                    }}
                                    onEdit={() => {
                                        setSelectedSubject(subject);
                                        setIsModalOpen(true);
                                    }}
                                    onDelete={() => {
                                        setSelectedSubject(subject);
                                        setIsDeleteDialogOpen(true);
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {viewMode === "list" && (
                        <div className="space-y-2">
                            {filteredSubjects.map((subject) => (
                                <Card key={subject._id} className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <Avatar>
                                                <AvatarFallback>
                                                    {subject.metadata.name.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className="font-medium">{subject.metadata.name}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {subject.metadata.code} • {subject.metadata.level}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    setSelectedSubject(subject);
                                                    setIsDetailsModalOpen(true);
                                                }}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Modals */}
            <SubjectModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedSubject(null);
                }}
                onSubmit={(data) => {
                    if (selectedSubject) {
                        handleUpdateSubject(selectedSubject._id, data);
                    } else {
                        handleCreateSubject(data);
                    }
                }}
                initialData={selectedSubject}
            />

            <SubjectDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedSubject(null);
                }}
                subject={selectedSubject}
            />

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="bg-primary text-secondary">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the subject
                            "{selectedSubject?.metadata.name}" and remove all associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => selectedSubject && handleDeleteSubject(selectedSubject._id)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog open={isDeactivateDialogOpen} onOpenChange={setIsDeactivateDialogOpen}>
                <AlertDialogContent className="bg-primary">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-secondary">Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will temporarily deactivate the subject
                            "{selectedSubject?.metadata.name}" For some time.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-secondary hover:bg-secondary-foreground">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => selectedSubject && handleDeactivateSubject(selectedSubject._id)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Deactivate
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog open={isReactivateDialogOpen} onOpenChange={setIsReactivateDialogOpen}>
                <AlertDialogContent className="bg-primary">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-secondary">Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will temporarily deactivate the subject
                            "{selectedSubject?.metadata.name}" For some time.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-secondary hover:bg-secondary-foreground">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => selectedSubject && handleReactivateSubject(selectedSubject._id)}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            Reactivate
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}