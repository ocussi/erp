import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { 
    AlertTriangle, 
    CheckCircle2, 
    XCircle, 
    CalendarDays, 
    Clock, 
    AlertCircle, 
    TrendingUp 
} from "lucide-react";
import { cn } from "@/lib/utils";

// 1. Define Interface
interface SubjectData {
    code: string;
    name: string;
    total: number;
    present: number;
    absent: number;
    pct: number;
}

export default function Attendance() {
    
    // Load from Storage
    const stored = localStorage.getItem("erp-data-attendance");
    const subjectData: SubjectData[] = stored ? JSON.parse(stored) : [];

    // Fallback: Currently Scraper doesn't fetch monthly history, so we use empty for now to prevent crashes.
    // In next steps, we can parse tblCumulativeDetails from index.js
    const cumulativeData: any[] = []; 

    // Stats
    const grandTotal = subjectData.reduce((acc, curr) => acc + (curr.total || 0), 0);
    const grandPresent = subjectData.reduce((acc, curr) => acc + (curr.present || 0), 0);
    const grandAbsent = subjectData.reduce((acc, curr) => acc + (curr.absent || 0), 0);
    const grandPct = grandTotal > 0 ? Number(((grandPresent / grandTotal) * 100).toFixed(2)) : 0;

    // Helpers
    const calculateStatus = (pct: number) => {
        if (pct >= 75) return { color: "bg-green-600", text: "text-green-600", bg: "bg-green-50 dark:bg-green-900/10", label: "Safe" };
        if (pct >= 65) return { color: "bg-yellow-500", text: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-900/10", label: "Warning" };
        return { color: "bg-destructive", text: "text-destructive", bg: "bg-red-50 dark:bg-red-900/10", label: "Critical" };
    };

    const getClassesToRecover = (total: number, present: number) => {
        const needed = Math.ceil((0.75 * total - present) / 0.25);
        return needed > 0 ? needed : 0;
    };

    return (
        <div className="space-y-8 animate-in fade-in-50 duration-500">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Attendance Details</h2>
                    <p className="text-muted-foreground mt-1">Academic Year Snapshot</p>
                </div>
                {grandPct < 75 && (
                    <Alert variant="destructive" className="max-w-lg bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Attendance Warning</AlertTitle>
                        <AlertDescription>Your overall attendance is <strong>{grandPct}%</strong>. You need to attend upcoming classes to avoid detainment (75% Required).</AlertDescription>
                    </Alert>
                )}
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                 <Card className="bg-primary text-primary-foreground shadow-lg border-none col-span-2 md:col-span-1">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-primary-foreground/80 font-medium">Overall Percentage</CardDescription>
                        <CardTitle className="text-4xl font-bold">{grandPct}%</CardTitle>
                    </CardHeader>
                    <CardFooter className="text-xs text-primary-foreground/60">
                        {grandPct < 75 ? "Condomation Required" : "Promoted"}
                    </CardFooter>
                 </Card>
                 <Card>
                    <CardHeader className="pb-2"><CardDescription>Total Classes Conducted</CardDescription><CardTitle className="flex items-center gap-2 text-2xl"><Clock className="w-5 h-5 text-muted-foreground"/>{grandTotal}</CardTitle></CardHeader>
                     <CardFooter className="text-xs text-muted-foreground">Academic hours total</CardFooter>
                 </Card>
                 <Card>
                    <CardHeader className="pb-2"><CardDescription>Classes Present</CardDescription><CardTitle className="flex items-center gap-2 text-2xl text-green-600"><CheckCircle2 className="w-5 h-5"/>{grandPresent}</CardTitle></CardHeader>
                    <CardFooter className="text-xs text-muted-foreground">Total hours attended</CardFooter>
                 </Card>
                 <Card>
                    <CardHeader className="pb-2"><CardDescription>Classes Absent</CardDescription><CardTitle className="flex items-center gap-2 text-2xl text-destructive"><XCircle className="w-5 h-5"/>{grandAbsent}</CardTitle></CardHeader>
                    <CardFooter className="text-xs text-muted-foreground">~{Math.round(grandAbsent / 7)} days lost</CardFooter>
                
                 </Card>
            </div>

            {/* Subject Table */}
            <Card className="shadow-sm border">
                <CardHeader>
                    <CardTitle>Subject-wise Breakdown</CardTitle>
                    <CardDescription>Real-time subject stats</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50 hover:bg-muted/50">
                                <TableHead>Code</TableHead>
                                <TableHead className="min-w-[200px]">Subject Name</TableHead>
                                <TableHead className="text-center hidden sm:table-cell">Hours (P/T)</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {subjectData.map((sub) => {
                                const status = calculateStatus(sub.pct);
                                const recover = getClassesToRecover(sub.total, sub.present);
                                return (
                                    <TableRow key={sub.code}>
                                        <TableCell className="font-mono text-muted-foreground font-medium text-xs">{sub.code}</TableCell>
                                        <TableCell className="text-sm font-medium">{sub.name}</TableCell>
                                        <TableCell className="text-center text-sm hidden sm:table-cell">{sub.present} / {sub.total}</TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="text-xs font-bold">{sub.pct.toFixed(1)}%</div>
                                                <Progress value={sub.pct} className={cn("h-1.5", status.bg)} indicatorClassName={status.color} />
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {recover > 0 
                                              ? <Badge variant="destructive" className="text-xs">Attend +{recover}</Badge>
                                              : <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200 text-xs">Safe</Badge>
                                            }
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Monthly History - Static / Empty for now until scraper updated */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border">
                    <CardHeader className="pb-3 border-b bg-muted/20">
                         <div className="flex items-center gap-2"><CalendarDays className="w-5 h-5 text-muted-foreground"/><CardTitle className="text-base">History</CardTitle></div>
                    </CardHeader>
                    <Table>
                        <TableHeader><TableRow><TableHead>Month</TableHead><TableHead className="text-right">Present</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {/* Rendering blank or future cumulative data */}
                            {cumulativeData.map((row: any, i) => (
                                <TableRow key={i}>
                                    <TableCell>{row.month}</TableCell>
                                    <TableCell className="text-right">{row.present}</TableCell>
                                </TableRow>
                            ))}
                            {cumulativeData.length === 0 && <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground text-xs py-4">No monthly history data available</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </Card>
                <Card className="border">
                     <CardHeader className="pb-3 border-b bg-muted/20">
                         <div className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-muted-foreground"/><CardTitle className="text-base">Co-Curricular</CardTitle></div>
                    </CardHeader>
                    <div className="h-[150px] flex items-center justify-center text-center p-4">
                        <p className="text-xs text-muted-foreground">OD/ML details coming soon.</p>
                    </div>
                </Card>
            </div>
        </div>
    );
}