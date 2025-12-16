import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Download,
    Eye,
    AlertCircle,
    Calendar,
    MapPin,
    FileText,
    CheckCircle2,
    XCircle,
    Clock,
    ShieldAlert,
    Smile,
    AlertTriangle,
    Info
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Toggle for release status (Logic assumes Released if we are in exam period)
const IS_RELEASED = true;

const EXAM_DETAILS = {
    session: "Semester End Examinations",
    center: "Loyola Academy Degree & PG College",
    code: "Exam Hall - Main Block",
    instructions: "Please arrive 30 minutes before your scheduled slot.",
};

export default function HallTicket() {
    const [isLoading, setIsLoading] = useState(false);
    const [disclaimerOpen, setDisclaimerOpen] = useState(false);
    const [jokeOpen, setJokeOpen] = useState(false);
    const [user, setUser] = useState({ name: "Student Name", regNo: "XXXXXXXX", photoUrl: "" });

    // Load Live User Data for authenticity
    useEffect(() => {
        setDisclaimerOpen(true);
        const storedProfile = localStorage.getItem("erp-data-profile");
        if (storedProfile) {
            const p = JSON.parse(storedProfile);
            setUser({
                name: p.name || "Student Name",
                regNo: p.regNo || "XXXXXXXX",
                photoUrl: "/student.png" // Falling back to local static as image scraping is complex securely
            });
        }
    }, []);

    // Prank download function
    const handleDownload = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setJokeOpen(true);
        }, 1200);
    };

    return (
        <div className="space-y-8 animate-in fade-in-50 duration-500 max-w-4xl mx-auto">
            
            {/* PRIMARY DISCLAIMER MODAL (ON LOAD) */}
            <Dialog open={disclaimerOpen} onOpenChange={setDisclaimerOpen}>
                <DialogContent className="border-l-4 border-l-amber-500">
                    <DialogHeader>
                        <div className="flex items-center gap-2 text-amber-600 mb-1">
                            <ShieldAlert className="h-6 w-6" />
                            <DialogTitle>Not a Legal Document</DialogTitle>
                        </div>
                        <DialogDescription className="space-y-3 pt-2 text-foreground">
                            <p>
                                <strong>Important:</strong> This screen is for <u>User Interface demonstration only</u>. 
                            </p>
                            <p className="text-sm text-muted-foreground">
                                It does NOT represent a valid Hall Ticket for entry into any examination. 
                                Security personnel will reject this digital view. 
                            </p>
                            <p className="text-sm font-semibold">
                                You MUST download the official PDF from the college ERP portal for printing.
                            </p>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setDisclaimerOpen(false)}>I Understand</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* SECONDARY PRANK MODAL (ON DOWNLOAD) */}
            <Dialog open={jokeOpen} onOpenChange={setJokeOpen}>
                <DialogContent className="sm:max-w-md text-center">
                    <DialogHeader>
                        <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <Smile className="h-8 w-8 text-blue-600" />
                        </div>
                        <DialogTitle className="text-xl">Nice Try!</DialogTitle>
                        <DialogDescription className="pt-2 text-base">
                            We warned you this was unofficial! 😉 <br/><br/>
                            This app cannot generate legally binding PDF documents signed by the COE. 
                            Please visit the college website for the real deal.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-center mt-4">
                        <Button variant="outline" onClick={() => setJokeOpen(false)}>Okay, fair enough</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Main Content */}
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Examination Hall Ticket</h2>
                <p className="text-muted-foreground mt-1">Status and Details for upcoming exams.</p>
            </div>

            {/* Status Banner */}
            <div className={`flex items-center justify-between p-4 rounded-lg border ${IS_RELEASED ? "bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-900" : "bg-red-50 border-red-200"}`}>
                <div className="flex items-center gap-4">
                    <div className="relative flex h-3 w-3">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${IS_RELEASED ? "bg-green-400" : "bg-red-400"}`}></span>
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${IS_RELEASED ? "bg-green-500" : "bg-red-500"}`}></span>
                    </div>
                    <div>
                        <h4 className={`font-semibold ${IS_RELEASED ? "text-green-700 dark:text-green-400" : "text-red-700"}`}>
                            {IS_RELEASED ? "Status: Released" : "Status: Unavailable"}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                            Generated view based on your current semester registration.
                        </p>
                    </div>
                </div>
            </div>

            {IS_RELEASED ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Basic Info Card */}
                    <Card className="md:col-span-2 shadow-sm border-2 border-dashed">
                        <CardHeader className="pb-3 bg-muted/20 border-b">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-primary" />
                                        {EXAM_DETAILS.session}
                                    </CardTitle>
                                    <CardDescription>Academic Year 2025-2026</CardDescription>
                                </div>
                                {/* Unauthorized Stamp */}
                                <div className="hidden sm:block border-2 border-red-500 text-red-500 px-2 py-1 text-[10px] font-bold uppercase rounded -rotate-12 opacity-50">
                                    Reference Only
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="py-6 space-y-6">
                            
                            {/* Profile Snippet */}
                            <div className="flex items-center gap-4 border p-3 rounded-lg bg-muted/10">
                                <Avatar className="h-16 w-16 border">
                                    <AvatarImage src="/student.png" />
                                    <AvatarFallback>RG</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-bold text-lg">{user.name}</p>
                                    <p className="text-sm text-muted-foreground font-mono">UID: {user.regNo}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Venue</p>
                                    <div className="flex items-center gap-2 font-medium">
                                        <MapPin className="w-4 h-4 text-primary" /> {EXAM_DETAILS.center}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Time</p>
                                    <div className="flex items-center gap-2 font-medium">
                                        <Clock className="w-4 h-4 text-primary" /> 09:30 AM (FN)
                                    </div>
                                </div>
                            </div>
                            
                            <Separator />
                            
                            <div className="flex gap-3 bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded text-yellow-800 dark:text-yellow-200 text-xs border border-yellow-200">
                                <Info className="w-5 h-5 flex-shrink-0" />
                                <p>
                                    <strong>Reminder:</strong> This layout is generated via the API wrapper. 
                                    Subject list and invigilator signature areas are intentionally hidden to prevent misuse.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions Panel */}
                    <Card className="flex flex-col shadow-sm h-fit">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-base">Hall Ticket Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-3">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="w-full h-12 justify-start gap-2">
                                        <Eye className="w-4 h-4" />
                                        Preview Ticket
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-xl text-center">
                                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg bg-muted/10 min-h-[300px]">
                                        <AlertTriangle className="h-12 w-12 text-muted-foreground/30 mb-4" />
                                        <h3 className="text-lg font-bold text-muted-foreground">Preview Restricted</h3>
                                        <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">
                                            The detailed PDF view with QR codes and signatures is not available in this client for security reasons.
                                        </p>
                                    </div>
                                </DialogContent>
                            </Dialog>

                            <Button 
                                className="w-full h-12 justify-start gap-2 bg-primary/90 hover:bg-primary" 
                                onClick={handleDownload} 
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                                        Generating PDF...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4" />
                                        Download PDF
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                // Unreleased State
                <div className="text-center py-20 text-muted-foreground">
                    Exams schedules not yet announced.
                </div>
            )}
        </div>
    );
}