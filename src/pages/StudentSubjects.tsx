import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { BookOpen, GraduationCap, Microscope, Calculator } from "lucide-react";

// 1. Define Types to fix implicit any errors
interface Subject {
    sem: string;
    type: string;
    code: string;
    name: string;
    credit: number;
}

export default function StudentSubjects() {
    const [selectedSem, setSelectedSem] = useState("3");

    // Load data from Storage
    const allSubjects: Subject[] = (() => {
        const stored = localStorage.getItem("erp-data-subjects");
        if(stored) return JSON.parse(stored);
        return [];
    })();

    // 2. Add Type annotation to filter
    const currentSubjects = allSubjects.filter((sub: Subject) => sub.sem === selectedSem);

    // 3. Fix reduce parameter typing
    const totalCredits = currentSubjects.reduce((acc: number, curr: Subject) => acc + (curr.credit || 0), 0);
    const labCount = currentSubjects.filter((sub: Subject) => sub.name.includes("[PR]")).length;
    const theoryCount = currentSubjects.length - labCount;

    // Helper for Badge Colors
    const getBadgeStyle = (type: string, name: string) => {
        if (name.includes("[PR]")) return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800";
        if (type === "Core") return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800";
        if (type === "AECC") return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800";
        return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300";
    };

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Registered Subjects</h2>
                    <p className="text-muted-foreground text-sm">
                        {currentSubjects.length > 0 ? "Data sourced from ERP" : "No subjects found. Try refreshing."}
                    </p>
                </div>
                <Select value={selectedSem} onValueChange={setSelectedSem}>
                    <SelectTrigger className="w-[180px] bg-card">
                        <SelectValue placeholder="Select Semester" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="1">Semester I</SelectItem>
                        <SelectItem value="2">Semester II</SelectItem>
                        <SelectItem value="3">Semester III</SelectItem>
                        <SelectItem value="4">Semester IV</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="shadow-none border-l-4 border-l-primary bg-card/50">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-full text-primary"><GraduationCap className="w-5 h-5" /></div>
                        <div><p className="text-xs text-muted-foreground font-medium uppercase">Total Credits</p><p className="text-2xl font-bold">{totalCredits}</p></div>
                    </CardContent>
                </Card>
                <Card className="shadow-none border-l-4 border-l-blue-500 bg-card/50">
                     <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-full dark:bg-blue-900 dark:text-blue-300"><BookOpen className="w-5 h-5" /></div>
                        <div><p className="text-xs text-muted-foreground font-medium uppercase">Theory</p><p className="text-2xl font-bold">{theoryCount}</p></div>
                    </CardContent>
                </Card>
                <Card className="shadow-none border-l-4 border-l-purple-500 bg-card/50">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-full dark:bg-purple-900 dark:text-purple-300"><Microscope className="w-5 h-5" /></div>
                        <div><p className="text-xs text-muted-foreground font-medium uppercase">Labs</p><p className="text-2xl font-bold">{labCount}</p></div>
                    </CardContent>
                </Card>
                <Card className="shadow-none border-l-4 border-l-green-500 bg-card/50">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-full dark:bg-green-900 dark:text-green-300"><Calculator className="w-5 h-5" /></div>
                        <div><p className="text-xs text-muted-foreground font-medium uppercase">Total</p><p className="text-2xl font-bold">{currentSubjects.length}</p></div>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card className="border shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                            <TableHead className="w-[80px]">Type</TableHead>
                            <TableHead className="w-[120px]">Code</TableHead>
                            <TableHead>Subject Title</TableHead>
                            <TableHead className="text-right">Credits</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentSubjects.map((sub) => (
                            <TableRow key={sub.code}>
                                <TableCell>
                                    <Badge variant="outline" className={getBadgeStyle(sub.type, sub.name)}>{sub.type}</Badge>
                                </TableCell>
                                <TableCell className="font-mono text-muted-foreground font-medium">{sub.code}</TableCell>
                                <TableCell className="font-medium">
                                    {sub.name}
                                    {sub.name.includes("[PR]") && <Badge variant="secondary" className="ml-2 text-[10px] h-5">Lab</Badge>}
                                </TableCell>
                                <TableCell className="text-right font-bold text-foreground/80">{sub.credit}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}