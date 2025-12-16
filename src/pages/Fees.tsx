import { useState, useEffect } from "react";
import {
    Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Download, History, Wallet, AlertTriangle, Printer, Landmark, ShieldAlert, Smile } from "lucide-react";

export default function Fees() {
    const [disclaimerOpen, setDisclaimerOpen] = useState(false);
    const [jokeOpen, setJokeOpen] = useState(false);
    const [paymentType, setPaymentType] = useState("full");
    const [isPaying, setIsPaying] = useState(false);

    // Data Load
    const stored = localStorage.getItem("erp-data-fees");
    const data = stored ? JSON.parse(stored) : { due: { list: [], totalDue: 0 }, paid: { history: [], totalPaid: 0 } };
    
    const { due, paid } = data;
    const pendingAmount = due.totalDue || 0;
    const paidAmount = paid.totalPaid || 0;
    // Estimated Total is tricky if we don't have it explicitly, so we sum Paid + Due
    const totalFee = paidAmount + pendingAmount; 
    const progressPct = totalFee > 0 ? (paidAmount / totalFee) * 100 : 0;

    const mainDueItem = due.list[0] || { head: "Tuition Fee", amount: 0, dueDate: "N/A" };

    useEffect(() => {
        setDisclaimerOpen(true);
    }, []);

    const handleFakePayment = () => {
        setIsPaying(true);
        setTimeout(() => {
            setIsPaying(false);
            setJokeOpen(true); // Open "Gotcha" modal
        }, 1500);
    };

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500 max-w-7xl mx-auto">
            
            {/* DISCLAIMER MODAL */}
            <Dialog open={disclaimerOpen} onOpenChange={setDisclaimerOpen}>
                <DialogContent>
                    <DialogHeader>
                        <div className="flex items-center gap-2 text-amber-600 mb-2">
                            <ShieldAlert className="h-6 w-6" />
                            <DialogTitle className="text-xl">Unofficial Interface</DialogTitle>
                        </div>
                        <DialogDescription className="space-y-4 pt-2 text-foreground/90">
                            <p><strong>This page is strictly for viewing purposes only.</strong></p>
                            <p>
                                It is not connected to any payment gateway. Do not use this screen as official proof of payment or for submitting dues. 
                                It purely helps you visualize data fetched from the legacy portal.
                            </p>
                            <p className="text-muted-foreground text-xs border-t pt-4">
                                "If you try to pay money here, it won't go anywhere. Seriously."
                            </p>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setDisclaimerOpen(false)}>I Understand</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* JOKE MODAL */}
            <Dialog open={jokeOpen} onOpenChange={setJokeOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex flex-col items-center gap-4 text-center">
                            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                                <Smile className="h-8 w-8 text-blue-600" />
                            </div>
                            <DialogTitle>Seriously?..</DialogTitle>
                            <DialogDescription>
                                You really thought this would work? 😭😭🥀 <br/><br/>
                                To actually pay fees, you must return to the ancient and painful college ERP like everyone else.
                            </DialogDescription>
                        </div>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-center">
                        <Button variant="secondary" onClick={() => setJokeOpen(false)}>Okay, my bad.</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* --- Summary Dashboard --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-100/50 dark:from-green-900/10 dark:to-transparent border-green-200 dark:border-green-800 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-green-700 dark:text-green-400 font-medium">Total Paid</CardDescription>
                        <CardTitle className="text-3xl font-bold">₹{paidAmount.toLocaleString()}</CardTitle>
                    </CardHeader>
                    <CardFooter>
                         <div className="w-full space-y-1">
                             <div className="flex justify-between text-xs text-muted-foreground">
                                 <span>Academic Progress</span>
                                 <span>{progressPct.toFixed(0)}%</span>
                             </div>
                             <Progress value={progressPct} className="h-2 bg-green-200 dark:bg-green-900/50" indicatorClassName="bg-green-600 dark:bg-green-400" />
                         </div>
                    </CardFooter>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-rose-100/50 dark:from-red-900/10 dark:to-transparent border-red-200 dark:border-red-800 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-red-700 dark:text-red-400 font-medium">Total Due</CardDescription>
                        <CardTitle className="text-3xl font-bold">₹{pendingAmount.toLocaleString()}</CardTitle>
                    </CardHeader>
                    <CardFooter>
                         <p className="text-xs text-red-600/80 dark:text-red-400/80 flex items-center gap-1 font-semibold">
                            <AlertTriangle className="w-3 h-3" /> Due by {mainDueItem.dueDate}
                         </p>
                    </CardFooter>
                </Card>

                <Card className="flex flex-col justify-center border-l-4 border-l-primary shadow-sm">
                    <CardContent className="py-6 space-y-2">
                         <div className="flex items-center gap-2 text-muted-foreground">
                             <Wallet className="w-5 h-5" />
                             <span className="font-semibold text-sm">Estimated Total Fee</span>
                         </div>
                         <div className="text-2xl font-bold">₹{totalFee.toLocaleString()}</div>
                         <p className="text-xs text-muted-foreground">Academic Year Estimate</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="pay" className="w-full">
                <TabsList className="w-full grid grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="pay">Make Payment</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
                
                <TabsContent value="pay" className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        <Card className="lg:col-span-2 shadow-sm border-2 border-primary/10">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5 text-primary" /> Fee Payment Portal</CardTitle>
                                <CardDescription>Simulation Only</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="p-4 bg-muted/40 rounded-lg space-y-3">
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold uppercase text-muted-foreground">Fee Head</p>
                                        <p className="text-sm font-medium leading-snug">{mainDueItem.head}</p>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs font-semibold uppercase text-muted-foreground">Due Amount</p>
                                        <p className="font-mono text-xl font-bold">₹{mainDueItem.amount.toLocaleString()}</p>
                                    </div>
                                </div>

                                <RadioGroup defaultValue="full" onValueChange={setPaymentType} className="grid grid-cols-2 gap-4">
                                    <div>
                                        <RadioGroupItem value="full" id="full" className="peer sr-only" />
                                        <Label htmlFor="full" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-all">
                                            <span className="mb-2 text-sm font-bold">Full Payment</span>
                                            <span className="font-mono text-lg">₹{mainDueItem.amount.toLocaleString()}</span>
                                        </Label>
                                    </div>
                                    <div>
                                        <RadioGroupItem value="partial" id="partial" className="peer sr-only" />
                                        <Label htmlFor="partial" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-all">
                                            <span className="mb-2 text-sm font-bold">Partial Payment</span>
                                            <span className="font-mono text-sm text-muted-foreground">Custom</span>
                                        </Label>
                                    </div>
                                </RadioGroup>

                                {paymentType === 'partial' && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                        <Label htmlFor="amount">Enter Amount (INR)</Label>
                                        <div className="relative"><span className="absolute left-3 top-2.5 text-muted-foreground">₹</span><Input id="amount" type="number" className="pl-7" placeholder="0.00" /></div>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="flex flex-col md:flex-row gap-3 bg-muted/20 py-4">
                                <Button className="w-full md:w-auto text-base" size="lg" onClick={handleFakePayment} disabled={isPaying}>
                                    {isPaying ? "Processing..." : "Pay via Gateway"}
                                </Button>
                                <Button variant="outline" className="w-full md:w-auto" onClick={() => setJokeOpen(true)}>
                                    <Printer className="w-4 h-4 mr-2" /> Challan
                                </Button>
                            </CardFooter>
                        </Card>

                        <div className="space-y-4">
                            <Alert variant="destructive" className="bg-red-50 text-red-900 border-red-200 dark:bg-red-900/10 dark:text-red-300 dark:border-red-900">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Prerequisites</AlertTitle>
                                <AlertDescription className="text-xs leading-relaxed mt-2 list-disc pl-4 space-y-1">
                                    <li>Use official ERP portal for actual payments.</li>
                                    <li>This is a simulation interface only.</li>
                                    <li>Do not share sensitive payment info here.</li>
                                    <li>Ensure secure connection when paying online.</li>
                                    <li>Clear all earlier Semester/Year dues.</li>
                                    <li>Clear at least 50% of current Academic Year's fee to be eligible for Exam Fee generation.
</li>
                                </AlertDescription>
                            </Alert>

                            <Alert className="bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-900/10 dark:text-amber-300 dark:border-amber-900">
                                <Landmark className="h-4 w-4" />
                                <AlertTitle>Reconciliation Delay</AlertTitle>
                                <AlertDescription className="text-xs leading-relaxed mt-2">
                                    Payments made online typically reflect immediately. However, challan or bank payments may take up to <strong>2-3 working days</strong> for Accounts confirmation.
                                </AlertDescription>
                            </Alert>
                        </div>
                    </div>
                </TabsContent>
                
                <TabsContent value="history" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><History className="w-5 h-5"/> Transaction Logs</CardTitle>
                            <CardDescription>Live data fetched from ERP</CardDescription>
                        </CardHeader>
                        <div className="relative w-full overflow-auto">
                            <Table>
                                <TableHeader className="bg-muted/40">
                                    <TableRow><TableHead>Date</TableHead><TableHead>Receipt No</TableHead><TableHead>Mode</TableHead><TableHead className="text-right">Amount (₹)</TableHead></TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paid.history.map((txn: any, idx: number) => (
                                        <TableRow key={idx}>
                                            <TableCell className="font-medium text-muted-foreground text-xs">{txn.date}</TableCell>
                                            <TableCell className="font-mono text-xs">{txn.number}</TableCell>
                                            <TableCell><Badge variant="outline" className="font-normal text-xs text-muted-foreground">{txn.mode}</Badge></TableCell>
                                            <TableCell className="text-right font-bold text-sm">{txn.amount.toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}