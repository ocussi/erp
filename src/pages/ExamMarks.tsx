import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Award, Calculator, TrendingUp, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ExamMarks() {
    const [selectedSem, setSelectedSem] = useState("3");

    // Load Data
    const storedData = localStorage.getItem("erp-data-exams");
    const MARK_DATA = storedData ? JSON.parse(storedData) : [];

    const filteredData = MARK_DATA.filter((sub: any) => sub.sem === selectedSem);
    const sessionName = filteredData.length > 0 ? filteredData[0].month : "N/A";

    const totalCredits = filteredData.reduce((acc: number, curr: any) => acc + (curr.credit || 0), 0);
    const validGradedData = filteredData.filter((d: any) => (d.point || 0) > 0);
    const totalPoints = validGradedData.reduce((acc: number, curr: any) => acc + (curr.point * curr.credit), 0);
    const gradedCredits = validGradedData.reduce((acc: number, curr: any) => acc + curr.credit, 0);
    
    const sgpa = gradedCredits > 0 ? (totalPoints / gradedCredits).toFixed(2) : "0.00";
    const hasBacklog = filteredData.some((d: any) => d.result !== "PASS");

    // Badge styling
    const getGradeStyle = (grade: string) => {
        switch(grade) {
            case 'O': return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400";
            case 'A': return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400";
            case 'B': return "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400";
            case 'C': return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400";
            case 'F': return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400";
            default: return "bg-muted text-muted-foreground";
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            {/* Header with Control */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Exam Mark Details</h2>
                    <p className="text-muted-foreground mt-1">Semester End Examinations</p>
                </div>
                <Select value={selectedSem} onValueChange={setSelectedSem}>
                    <SelectTrigger className="w-[180px] h-10 border-primary/20">
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

            {/* Performance Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {/* SGPA Card */}
                 <Card className="col-span-2 md:col-span-1 shadow-md bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
                     <CardContent className="flex flex-col items-center justify-center p-6 text-center h-full">
                        <div className="mb-2 p-2 bg-primary/20 rounded-full text-primary"><Calculator className="w-6 h-6" /></div>
                        <span className="text-4xl font-extrabold tracking-tighter text-foreground">{sgpa}</span>
                        <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mt-1">SGPA Score</span>
                     </CardContent>
                 </Card>
                 <Card className="col-span-2 md:col-span-1 shadow-sm">
                     <CardContent className="flex flex-col justify-center p-6 h-full gap-1">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2"><Calendar className="w-4 h-4" /><span className="text-xs uppercase font-semibold">Session</span></div>
                        <span className="text-xl font-bold">{sessionName}</span>
                     </CardContent>
                 </Card>
                 <Card className="shadow-sm">
                     <CardContent className="p-6 flex flex-col justify-center h-full">
                         <div className="flex items-center gap-2 text-muted-foreground mb-1"><Award className="w-4 h-4" /><span className="text-xs uppercase font-semibold">Total Credits</span></div>
                         <div className="flex items-baseline gap-1"><span className="text-2xl font-bold">{totalCredits}</span></div>
                     </CardContent>
                 </Card>
                 <Card className={`shadow-sm border-l-4 ${hasBacklog ? "border-l-red-500" : "border-l-green-500"}`}>
                     <CardContent className="p-6 flex flex-col justify-center h-full">
                         <div className="flex items-center gap-2 text-muted-foreground mb-1"><TrendingUp className="w-4 h-4" /><span className="text-xs uppercase font-semibold">Overall Result</span></div>
                         <div className="flex items-center gap-2"><span className={`text-xl font-bold ${hasBacklog ? "text-red-600" : "text-green-600"}`}>{hasBacklog ? "FAIL" : "PROMOTED"}</span></div>
                     </CardContent>
                 </Card>
            </div>

            {/* Main Data Table */}
            <div className="rounded-md border bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/40">
                        <TableRow>
                            <TableHead className="w-[100px]">Part</TableHead>
                            <TableHead className="w-[120px]">Code</TableHead>
                            <TableHead className="min-w-[250px]">Description</TableHead>
                            <TableHead className="text-center w-[100px]">Credits</TableHead>
                            <TableHead className="text-center w-[100px]">Points</TableHead>
                            <TableHead className="text-center w-[100px]">Grade</TableHead>
                            <TableHead className="text-right w-[120px]">Result</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.map((row: any) => (
                            <TableRow key={row.code}>
                                <TableCell className="font-medium text-xs text-muted-foreground">{row.part}</TableCell>
                                <TableCell className="font-mono text-sm font-semibold">{row.code}</TableCell>
                                <TableCell className="text-sm font-medium">{row.name}</TableCell>
                                <TableCell className="text-center text-muted-foreground font-mono">{row.credit}</TableCell>
                                <TableCell className="text-center font-bold font-mono">{(row.point || 0).toFixed(2)}</TableCell>
                                <TableCell className="text-center"><div className={cn("inline-flex items-center justify-center rounded-md text-xs font-bold w-8 h-6", getGradeStyle(row.grade))}>{row.grade}</div></TableCell>
                                <TableCell className="text-right">
                                    <Badge variant="outline" className={row.result === 'PASS' ? "text-green-600 border-green-200 bg-green-50" : "text-red-600 border-red-200 bg-red-50"}>{row.result}</Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {filteredData.length === 0 && <div className="h-40 flex flex-col items-center justify-center text-muted-foreground"><p>No records found for this semester. Data sync might be incomplete.</p></div>}
            </div>
        </div>
    );
}