import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardHeader, 
    CardTitle, 
    CardFooter
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarDays, Info, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Chart Imports ---
import { Label, Pie, PieChart } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

// Fallback Mock data
const MOCK_LOGS = [
    { date: "No Data", hours: [null, null, null, null, null] },
];

export default function HourWiseAttendance() {
    
    // --- KEY FIX: LOAD 'erp-data-hourly', NOT 'attendance' ---
    const storedData = localStorage.getItem("erp-data-hourly");
    const parsedData = storedData ? JSON.parse(storedData) : null;

    // Use Safe Chaining (?.) to prevent crashes
    const summary = parsedData?.summary || { workingDays: 0, present: 0, absent: 0, percentage: 0 };
    const logs = parsedData?.logs || MOCK_LOGS;

    const totalWorkingDays = summary.workingDays;
    const hoursPresent = summary.present;
    const hoursAbsent = summary.absent;
    const percentage = summary.percentage; // Fixed percentage number

    // -- CHART CONFIG --
    const chartData = [
      { status: "present", hours: hoursPresent, fill: "var(--color-present)" },
      { status: "absent", hours: hoursAbsent, fill: "var(--color-absent)" },
    ]

    const chartConfig = {
      hours: { label: "Hours" },
      present: {
        label: "Present",
        color: "#86EFAC", 
      },
      absent: {
        label: "Absent",
        color: "#FCA5A5", 
      },
    } satisfies ChartConfig

    const getStatusStyle = (status: string | null) => {
        switch (status) {
            case "P": return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800";
            case "A": return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800";
            case "":
            case null: return "bg-slate-200 border-slate-300 text-slate-400 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-600";
            case "OD": return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300";
            default: return "bg-secondary text-secondary-foreground";
        }
    };

    const LegendItem = ({ label, desc, colorClass }: { label: string, desc: string, colorClass: string }) => (
        <div className="flex items-center gap-3 text-sm">
            <span className={cn("flex items-center justify-center w-8 h-8 rounded border font-bold text-xs shadow-sm", colorClass)}>
                {label}
            </span>
            <span className="text-muted-foreground">{desc}</span>
        </div>
    );

    return (
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 h-auto lg:h-[calc(100vh-120px)] animate-in fade-in-50 duration-500 min-h-0 lg:min-h-[600px] pb-10 lg:pb-0">
            
            {/* LEFT COLUMN: Table */}
            <Card className="flex flex-col shadow-sm border overflow-hidden h-[500px] lg:h-full relative order-2 lg:order-1">
                <CardHeader className="py-4 border-b bg-muted/40 flex-shrink-0 flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CalendarDays className="w-5 h-5 text-primary" />
                        <div>
                            <CardTitle className="text-base font-semibold">Hourly Logs</CardTitle>
                            <CardDescription className="text-xs">
                                {logs === MOCK_LOGS ? "Sample Data" : "Live Session Tracking"}
                            </CardDescription>
                        </div>
                    </div>
                    
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                <HelpCircle className="w-5 h-5" />
                                <span className="sr-only">Toggle Legend</span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-80 p-0 shadow-lg border-2">
                            <div className="bg-muted p-4 border-b">
                                <h4 className="font-semibold leading-none flex items-center gap-2">
                                    <Info className="w-4 h-4 text-primary"/> Legends
                                </h4>
                                <p className="text-xs text-muted-foreground mt-1">Status code guide</p>
                            </div>
                            <div className="p-4 grid grid-cols-1 gap-2">
                                <LegendItem label="P" desc="Present" colorClass="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-800" />
                                <LegendItem label="A" desc="Absent" colorClass="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800" />
                                <LegendItem label="OD" desc="On Duty" colorClass="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200" />
                                <LegendItem label="ML" desc="Medical Leave" colorClass="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-200" />
                                <LegendItem label="CL" desc="Casual Leave" colorClass="bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200" />
                                <LegendItem label="DA" desc="Disciplinary Action" colorClass="bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200" />
                                <LegendItem label="LA" desc="Late Comer" colorClass="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200" />
                            </div>
                        </PopoverContent>
                    </Popover>
                </CardHeader>
                
                <div className="bg-muted/40 border-b flex font-semibold text-xs text-muted-foreground py-3 px-4 flex-shrink-0">
                     <div className="w-24 flex-shrink-0">Date</div>
                     <div className="grid grid-cols-5 gap-2 flex-1 text-center">
                        <span>1</span>
                        <span>2</span>
                        <span>3</span>
                        <span>4</span>
                        <span>5</span>
                     </div>
                </div>

                <ScrollArea className="flex-1 bg-card">
                    <div className="p-4 space-y-2">
                        {logs.map((log: any, i: number) => (
                            <div 
                                key={i} 
                                className="flex items-center p-2 rounded-lg border bg-background/50 hover:bg-muted/30 transition-all text-sm group"
                            >
                                <div className="w-24 flex-shrink-0 font-medium text-xs font-mono text-muted-foreground">
                                    {log.date}
                                </div>
                                <div className="grid grid-cols-5 gap-2 flex-1">
                                    {/* Handle potentially fewer than 5 hours with checks */}
                                    {[0,1,2,3,4].map((hIndex) => (
                                        <div 
                                            key={hIndex} 
                                            className={cn(
                                                "h-8 flex items-center justify-center rounded border font-bold text-xs shadow-sm",
                                                getStatusStyle(log.hours ? log.hours[hIndex] : null)
                                            )}
                                        >
                                            {log.hours && log.hours[hIndex] ? log.hours[hIndex] : "•"}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </Card>

            {/* RIGHT COLUMN */}
            <div className="flex flex-col gap-6 h-auto lg:h-full order-1 lg:order-2">
                
                <Card className="flex-1 shadow-sm flex flex-col justify-between max-h-[200px]">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-lg">Overview</CardTitle>
                                <CardDescription>Live from ERP</CardDescription>
                            </div>
                            <Badge variant={Number(percentage) < 75 ? "destructive" : "default"} className="ml-auto">
                                {Number(percentage).toFixed(2)}% Average
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                         <div className="flex flex-col">
                             <span className="text-muted-foreground text-xs uppercase font-medium">Working Days</span>
                             <span className="text-2xl font-bold tracking-tight">{totalWorkingDays}</span>
                         </div>
                         <div className="flex flex-col text-right lg:text-left">
                             <span className="text-muted-foreground text-xs uppercase font-medium">Status</span>
                             <span className={cn("text-2xl font-bold tracking-tight", Number(percentage) < 75 ? "text-red-500" : "text-green-500")}>
                                 {Number(percentage) < 75 ? "Detained" : "Safe"}
                             </span>
                         </div>
                    </CardContent>
                </Card>

                {/* Donut Chart */}
                <Card className="flex-1 flex flex-col shadow-sm min-h-0 h-[300px] lg:h-auto">
                    <CardHeader className="items-center pb-0">
                        <CardTitle className="text-sm font-medium uppercase text-muted-foreground tracking-wider">Attendance Distribution</CardTitle>
                        <CardDescription>Academic Year 2025-2026</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pb-0">
                        <ChartContainer
                          config={chartConfig}
                          className="mx-auto aspect-square h-[220px]"
                        >
                          <PieChart>
                            <ChartTooltip
                              cursor={false}
                              content={<ChartTooltipContent hideLabel />}
                            />
                            <Pie
                              data={chartData}
                              dataKey="hours"
                              nameKey="status"
                              innerRadius={60}
                              strokeWidth={5}
                            >
                              <Label
                                content={({ viewBox }) => {
                                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                    return (
                                      <text
                                        x={viewBox.cx}
                                        y={viewBox.cy}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                      >
                                        <tspan
                                          x={viewBox.cx}
                                          y={viewBox.cy}
                                          className="fill-foreground text-3xl font-bold"
                                        >
                                          {Number(percentage).toFixed(1)}%
                                        </tspan>
                                        <tspan
                                          x={viewBox.cx}
                                          y={(viewBox.cy || 0) + 24}
                                          className="fill-muted-foreground text-xs font-semibold uppercase"
                                        >
                                          Attendance
                                        </tspan>
                                      </text>
                                    )
                                  }
                                }}
                              />
                            </Pie>
                          </PieChart>
                        </ChartContainer>
                    </CardContent>
                    <CardFooter className="flex-col gap-2 text-sm pt-4">
                        <div className="flex w-full items-center justify-center gap-4 text-xs font-medium">
                            <div className="flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-full bg-[#86EFAC]" />
                                <span>Present ({hoursPresent}h)</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-full bg-[#FCA5A5]" />
                                <span>Absent ({hoursAbsent}h)</span>
                            </div>
                        </div>
                    </CardFooter>
                </Card>

            </div>
        </div>
    );
}