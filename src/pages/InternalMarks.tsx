import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ClipboardList, AlertCircle, ShieldCheck } from "lucide-react";

export default function InternalMarks() {
  const [subjects, setSubjects] = useState<any[]>([]);

  // Load Data
  useEffect(() => {
      const stored = localStorage.getItem("erp-data-internals");
      if (stored) {
          setSubjects(JSON.parse(stored));
      }
  }, []);

  const totalMax = subjects.reduce((acc, curr) => acc + (curr.max || 0), 0);
  const totalObtained = subjects.reduce((acc, curr) => acc + (curr.obtained || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
         <div>
            <h2 className="text-3xl font-bold tracking-tight">Internal Marks</h2>
            <p className="text-muted-foreground mt-1">Continuous Internal Assessment</p>
         </div>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="bg-muted/40 py-4 border-b">
           <div className="flex justify-between items-center px-2">
              <span className="font-semibold text-sm uppercase text-muted-foreground tracking-wider">Subject List</span>
              <span className="font-semibold text-sm uppercase text-muted-foreground tracking-wider">Marks</span>
           </div>
        </CardHeader>
        <Accordion type="single" collapsible className="w-full">
          {subjects.length === 0 && <div className="p-8 text-center text-muted-foreground">No records found</div>}
          {subjects.map((subject) => (
            <AccordionItem key={subject.code} value={subject.code} className="border-b last:border-0 px-2">
              <AccordionTrigger className="hover:no-underline py-4 px-4 hover:bg-muted/20 transition-colors rounded-lg data-[state=open]:bg-muted/30">
                 <div className="flex flex-col md:flex-row md:items-center w-full gap-4 text-left">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="h-10 w-10 rounded bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 flex items-center justify-center font-bold text-xs shadow-sm">
                            {subject.code.slice(0, 2)}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-sm md:text-base leading-tight">{subject.name}</span>
                            <span className="text-xs font-mono text-muted-foreground mt-0.5">{subject.code}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 md:mr-4">
                        <div className="flex flex-col items-end gap-1 w-24">
                            <span className="text-xs text-muted-foreground uppercase">Obtained</span>
                            <span className="font-mono font-bold text-lg leading-none">{subject.obtained?.toFixed(2) || "0.00"}</span>
                        </div>
                        <div className="hidden md:block h-8 w-px bg-border" />
                        <div className="flex flex-col items-end gap-1 w-20">
                             <span className="text-xs text-muted-foreground uppercase">Max</span>
                             <span className="font-mono text-muted-foreground text-sm">/ {subject.max}</span>
                        </div>
                    </div>
                 </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2">
                  <div className="mt-4 rounded-lg border bg-card p-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                          <ClipboardList className="w-4 h-4" /> <span>Status</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900">
                           <div className="flex items-center gap-2">
                               <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                               <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase">Target</span>
                           </div>
                           <div className="flex items-center gap-4 text-right">
                                <div><span className="block text-[10px] text-muted-foreground">Safe Zone</span><span className="text-sm font-bold text-green-600">20.00</span></div>
                           </div>
                      </div>
                  </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>
    </div>
  );
}