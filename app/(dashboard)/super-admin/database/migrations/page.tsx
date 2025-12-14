"use client";

import React, { useState } from "react";
import {
    FileText,
    Download,
    Upload,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
    Play,
    RefreshCw,
    Code,
    Database,
    GitBranch,
    Eye,
    Copy,
    Trash2,
    MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Sample data
const migrations = [
    {
        id: "001_initial_schema",
        name: "Initial Schema",
        description: "Create initial database schema with all tables",
        status: "applied",
        appliedAt: "2024-01-15T10:00:00Z",
        duration: "2.3s",
        batch: "1",
        checksum: "abc123def456",
        created: "2024-01-15T09:58:00Z",
    },
    {
        id: "002_add_support_tickets",
        name: "Add Support Tickets",
        description: "Add support_tickets table and related indexes",
        status: "applied",
        appliedAt: "2024-01-20T14:30:00Z",
        duration: "1.2s",
        batch: "2",
        checksum: "def456ghi789",
        created: "2024-01-20T14:25:00Z",
    },
    {
        id: "003_add_audit_logs",
        name: "Add Audit Logs",
        description: "Add audit_logs table for tracking system activities",
        status: "applied",
        appliedAt: "2024-01-25T09:15:00Z",
        duration: "1.8s",
        batch: "2",
        checksum: "ghi789jkl012",
        created: "2024-01-25T09:10:00Z",
    },
    {
        id: "004_update_user_roles",
        name: "Update User Roles",
        description: "Add maintenance role and update role permissions",
        status: "pending",
        appliedAt: null,
        duration: null,
        batch: "3",
        checksum: "jkl012mno345",
        created: "2024-02-01T11:00:00Z",
    },
    {
        id: "005_add_booking_settings",
        name: "Add Booking Settings",
        description: "Add booking_settings table for facility booking configurations",
        status: "pending",
        appliedAt: null,
        duration: null,
        batch: "3",
        checksum: "mno345pqr678",
        created: "2024-02-01T11:05:00Z",
    },
];

const seedData = [
    {
        table: "users",
        description: "Default users and permissions",
        records: 25,
        status: "applied",
        lastRun: "2024-01-15T10:05:00Z",
    },
    {
        table: "announcements",
        description: "Sample announcements",
        records: 5,
        status: "applied",
        lastRun: "2024-01-15T10:10:00Z",
    },
    {
        table: "units",
        description: "Building units (A1-D5)",
        records: 150,
        status: "applied",
        lastRun: "2024-01-15T10:15:00Z",
    },
];

const backups = [
    {
        id: "backup_20250115",
        filename: "village1_backup_2025-01-15.sql",
        size: "125.4 MB",
        createdAt: "2025-01-15T02:00:00Z",
        type: "automatic",
    },
    {
        id: "backup_20250114",
        filename: "village1_backup_2025-01-14.sql",
        size: "124.8 MB",
        createdAt: "2025-01-14T02:00:00Z",
        type: "automatic",
    },
    {
        id: "backup_pre_update",
        filename: "village1_manual_2025-01-13.sql",
        size: "123.2 MB",
        createdAt: "2025-01-13T15:30:00Z",
        type: "manual",
    },
];

export default function DatabaseMigrationsPage() {
    const [activeTab, setActiveTab] = useState("migrations");
    const [showRunMigrationDialog, setShowRunMigrationDialog] = useState(false);
    const [showSeedDialog, setShowSeedDialog] = useState(false);
    const [showBackupDialog, setShowBackupDialog] = useState(false);
    const [showRestoreDialog, setShowRestoreDialog] = useState(false);
    const [selectedMigration, setSelectedMigration] = useState<typeof migrations[0] | null>(null);
    const [selectedSeed, setSelectedSeed] = useState<string | null>(null);
    const [selectedBackup, setSelectedBackup] = useState<{
        id: string;
        filename: string;
        size: string;
        createdAt: string;
        type: string;
    } | null>(null);
    const [isRunning, setIsRunning] = useState(false);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "applied":
                return "bg-green-100 text-green-800";
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "failed":
                return "bg-red-100 text-red-800";
            case "running":
                return "bg-blue-100 text-blue-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "applied":
                return "นำไปใช้แล้ว";
            case "pending":
                return "รอดำเนินการ";
            case "failed":
                return "ล้มเหลว";
            case "running":
                return "กำลังรัน";
            default:
                return status;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "applied":
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case "pending":
                return <Clock className="h-4 w-4 text-yellow-500" />;
            case "failed":
                return <XCircle className="h-4 w-4 text-red-500" />;
            case "running":
                return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
            default:
                return null;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString("th-TH", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const handleRunMigration = async (migrationId: string) => {
        setIsRunning(true);
        try {
            // In real app, call API to run migration
            console.log(`Running migration: ${migrationId}`);
            await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate
        } catch (error) {
            console.error("Failed to run migration:", error);
        } finally {
            setIsRunning(false);
            setShowRunMigrationDialog(false);
            setSelectedMigration(null);
        }
    };

    const handleSeedDatabase = async (table: string) => {
        setIsRunning(true);
        try {
            // In real app, call API to seed database
            console.log(`Seeding table: ${table}`);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate
        } catch (error) {
            console.error("Failed to seed database:", error);
        } finally {
            setIsRunning(false);
            setShowSeedDialog(false);
            setSelectedSeed(null);
        }
    };

    const handleCreateBackup = async () => {
        setIsRunning(true);
        try {
            // In real app, call API to create backup
            console.log("Creating database backup...");
            await new Promise(resolve => setTimeout(resolve, 5000)); // Simulate
        } catch (error) {
            console.error("Failed to create backup:", error);
        } finally {
            setIsRunning(false);
            setShowBackupDialog(false);
        }
    };

    const handleRestoreBackup = async (backupId: string) => {
        setIsRunning(true);
        try {
            // In real app, call API to restore backup
            console.log(`Restoring backup: ${backupId}`);
            await new Promise(resolve => setTimeout(resolve, 10000)); // Simulate longer restore
        } catch (error) {
            console.error("Failed to restore backup:", error);
        } finally {
            setIsRunning(false);
            setShowRestoreDialog(false);
            setSelectedBackup(null);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Show toast notification
    };

    const getPendingMigrations = migrations.filter(m => m.status === "pending");
    const getAppliedMigrations = migrations.filter(m => m.status === "applied");
    const getFailedMigrations = migrations.filter(m => m.status === "failed");

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">จัดการฐานข้อมูล</h1>
                    <p className="text-gray-600 mt-1">Migrations, Seeds และ Backups</p>
                </div>
                <Button onClick={() => setShowBackupDialog(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    สร้าง Backup
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Migrations ทั้งหมด</p>
                                <p className="text-2xl font-bold text-gray-900">{migrations.length}</p>
                            </div>
                            <GitBranch className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">นำไปใช้แล้ว</p>
                                <p className="text-2xl font-bold text-green-600">{getAppliedMigrations.length}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">รอดำเนินการ</p>
                                <p className="text-2xl font-bold text-yellow-600">{getPendingMigrations.length}</p>
                            </div>
                            <Clock className="h-8 w-8 text-yellow-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Backups</p>
                                <p className="text-2xl font-bold text-purple-600">{backups.length}</p>
                            </div>
                            <Database className="h-8 w-8 text-purple-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Alert for pending migrations */}
            {getPendingMigrations.length > 0 && (
                <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        มี {getPendingMigrations.length} migrations ที่รอดำเนินการ
                        แนะนำให้รัน migrations ก่อนเพื่อให้ฐานข้อมูลเป็นปัจจุบัน
                    </AlertDescription>
                </Alert>
            )}

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="migrations">Migrations</TabsTrigger>
                    <TabsTrigger value="seeds">Seed Data</TabsTrigger>
                    <TabsTrigger value="backups">Backups</TabsTrigger>
                    <TabsTrigger value="sql">SQL Editor</TabsTrigger>
                </TabsList>

                <TabsContent value="migrations" className="space-y-4">
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                Database Migrations
                                {getPendingMigrations.length > 0 && (
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            if (getPendingMigrations.length === 1) {
                                                setSelectedMigration(getPendingMigrations[0]);
                                                setShowRunMigrationDialog(true);
                                            }
                                        }}
                                        disabled={isRunning}
                                    >
                                        <Play className="h-4 w-4 mr-2" />
                                        Run Pending
                                    </Button>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Migration</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Batch</TableHead>
                                        <TableHead>Duration</TableHead>
                                        <TableHead>Applied At</TableHead>
                                        <TableHead className="w-[100px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {migrations.map((migration) => (
                                        <TableRow key={migration.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{migration.name}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {migration.description}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                            {migration.id}
                                                        </Code>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => copyToClipboard(migration.checksum)}
                                                        >
                                                            <Copy className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(migration.status)}
                                                    <Badge className={getStatusColor(migration.status)}>
                                                        {getStatusText(migration.status)}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">Batch {migration.batch}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {migration.duration ? (
                                                    <span className="text-sm">{migration.duration}</span>
                                                ) : (
                                                    <span className="text-sm text-gray-500">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {migration.appliedAt ? (
                                                    <span className="text-sm">
                                                        {formatDate(migration.appliedAt)}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-gray-500">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View SQL
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            disabled={migration.status === "applied" || isRunning}
                                                            onClick={() => {
                                                                setSelectedMigration(migration);
                                                                setShowRunMigrationDialog(true);
                                                            }}
                                                        >
                                                            <Play className="h-4 w-4 mr-2" />
                                                            Run
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem>
                                                            <Download className="h-4 w-4 mr-2" />
                                                            Export
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-600">
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="seeds" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                Seed Data
                                <Button size="sm" disabled={isRunning}>
                                    <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? "animate-spin" : ""}`} />
                                    {isRunning ? "Seeding..." : "Refresh"}
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Table</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Records</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Last Run</TableHead>
                                        <TableHead className="w-[100px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {seedData.map((seed, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <p className="font-medium">{seed.table}</p>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-gray-600">{seed.description}</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium">{seed.records}</span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(seed.status)}
                                                    <Badge className={getStatusColor(seed.status)}>
                                                        {getStatusText(seed.status)}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {seed.lastRun ? (
                                                    <span className="text-sm">{formatDate(seed.lastRun)}</span>
                                                ) : (
                                                    <span className="text-sm text-gray-500">Never</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View Data
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setSelectedSeed(seed.table);
                                                                setShowSeedDialog(true);
                                                            }}
                                                            disabled={isRunning}
                                                        >
                                                            <Play className="h-4 w-4 mr-2" />
                                                            Seed
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem>
                                                            <Download className="h-4 w-4 mr-2" />
                                                            Export
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="backups" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                Database Backups
                                <Button onClick={() => setShowBackupDialog(true)}>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Create Backup
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Filename</TableHead>
                                        <TableHead>Size</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Created At</TableHead>
                                        <TableHead className="w-[100px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {backups.map((backup) => (
                                        <TableRow key={backup.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-gray-400" />
                                                    <div>
                                                        <p className="font-medium">{backup.filename}</p>
                                                        <p className="text-xs text-gray-500">{backup.id}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm">{backup.size}</span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={
                                                        backup.type === "automatic"
                                                            ? "bg-blue-100 text-blue-800"
                                                            : "bg-gray-100 text-gray-800"
                                                    }
                                                >
                                                    {backup.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm">{formatDate(backup.createdAt)}</span>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>
                                                            <Download className="h-4 w-4 mr-2" />
                                                            Download
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setSelectedBackup(backup);
                                                                setShowRestoreDialog(true);
                                                            }}
                                                            className="text-orange-600"
                                                        >
                                                            <RefreshCw className="h-4 w-4 mr-2" />
                                                            Restore
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-red-600">
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="sql" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>SQL Editor</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Textarea
                                placeholder="Write or paste SQL queries here..."
                                className="min-h-[300px] font-mono text-sm"
                                spellCheck={false}
                            />
                            <div className="flex gap-2">
                                <Button>
                                    <Play className="h-4 w-4 mr-2" />
                                    Execute
                                </Button>
                                <Button variant="outline">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Format
                                </Button>
                                <Button variant="outline">
                                    <Database className="h-4 w-4 mr-2" />
                                    Explain
                                </Button>
                            </div>
                            <Alert>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                    คำเตือน: การรัน SQL โดยตรงส่งผลกระทบต่อฐานข้อมูล
                                    กรุณา backup ข้อมูลก่อนรันคำสั่งที่สำคัญ
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Run Migration Dialog */}
            <Dialog open={showRunMigrationDialog} onOpenChange={setShowRunMigrationDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>รัน Migration</DialogTitle>
                        <DialogDescription>
                            คุณแน่ใจหรือไม่ว่าต้องการรัน migration &quot;{selectedMigration?.name}&quot;?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowRunMigrationDialog(false)}
                            disabled={isRunning}
                        >
                            ยกเลิก
                        </Button>
                        <Button
                            onClick={() => selectedMigration && handleRunMigration(selectedMigration.id)}
                            disabled={isRunning}
                        >
                            {isRunning ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    กำลังรัน...
                                </>
                            ) : (
                                <>
                                    <Play className="h-4 w-4 mr-2" />
                                    รัน Migration
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Seed Database Dialog */}
            <Dialog open={showSeedDialog} onOpenChange={setShowSeedDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Seed Database</DialogTitle>
                        <DialogDescription>
                            คุณแน่ใจหรือไม่ว่าต้องการ seed ข้อมูลในตาราง &quot;{selectedSeed}&quot;?
                            <br />
                            การ seed จะเพิ่มข้อมูลตัวอย่างเข้าไปในตาราง
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowSeedDialog(false)}
                            disabled={isRunning}
                        >
                            ยกเลิก
                        </Button>
                        <Button
                            onClick={() => selectedSeed && handleSeedDatabase(selectedSeed)}
                            disabled={isRunning}
                        >
                            {isRunning ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    กำลัง Seed...
                                </>
                            ) : (
                                "Seed Database"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create Backup Dialog */}
            <Dialog open={showBackupDialog} onOpenChange={setShowBackupDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>สร้าง Database Backup</DialogTitle>
                        <DialogDescription>
                            สร้างไฟล์ backup ของฐานข้อมูลปัจจุบัน
                            ข้อมูลจะถูกบันที่ไวลใน server เป็นเวลา 1-2 ชั่วโมง
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowBackupDialog(false)}
                            disabled={isRunning}
                        >
                            ยกเลิก
                        </Button>
                        <Button
                            onClick={handleCreateBackup}
                            disabled={isRunning}
                        >
                            {isRunning ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    กำลังสร้าง...
                                </>
                            ) : (
                                <>
                                    <Database className="h-4 w-4 mr-2" />
                                    สร้าง Backup
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Restore Backup Dialog */}
            <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>กู้คืน Database</DialogTitle>
                        <DialogDescription>
                            คำเตือน: การกู้นคืน database จะลบข้อมูลทั้งหมดปัจจุบัน
                            และแทนที่ด้วยไปด้วยข้อมูลจาก backup &quot;{selectedBackup?.filename}&quot;
                            <br />
                            <strong className="text-red-600">แนะนำ backup ข้อมูลปัจจุบันก่อนดำเนินการ</strong>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowRestoreDialog(false)}
                            disabled={isRunning}
                        >
                            ยกเลิก
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => selectedBackup && handleRestoreBackup(selectedBackup.id)}
                            disabled={isRunning}
                        >
                            {isRunning ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    กำลังกู้นคืน...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    กู้นคืน Database
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}