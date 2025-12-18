import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCw, Settings, Save, Lock, Mail, Phone, MapPin } from "lucide-react";

export default function StudentProfile() {
  // Default State
  const [student, setStudent] = useState({
    name: "Loading...",
    regNo: "",
    course: "",
    sem: "",
    institution: "",
    dob: "",
    gender: "",
    aadhaar: "", 
    father: "",
    address: "",
    contact: "",
    email: "", 
    parentContact: "",
    admitted: "", 
    community: "",
    nationality: "",
    hosteller: "No",
    income: "",
    state: ""  // ← Already here, but now populated
  });

  const [editForm, setEditForm] = useState(student);
  const [loading, setLoading] = useState(false);

  // --- HYDRATION FIX: Use useEffect correctly ---
  useEffect(() => {
      const savedData = localStorage.getItem("erp-data-profile");
      if (savedData) {
          const parsed = JSON.parse(savedData);
          setStudent(prev => ({
              ...prev,
              name: parsed.name || prev.name,
              regNo: parsed.regNo || prev.regNo,
              course: parsed.course || prev.course,
              sem: parsed.sem || prev.sem,
              institution: parsed.institution || prev.institution,
              father: parsed.father || prev.father,
              address: parsed.address || prev.address,
              state: parsed.state || prev.state,  // ← NEW: Hydrate state
              // Simple parsing for merged fields if they exist
              contact: parsed.contact ? parsed.contact.split('/')[0].trim() : prev.contact,
              email: parsed.contact && parsed.contact.includes('/') ? parsed.contact.split('/')[1].trim() : prev.email
          }));
          
          // Update edit form to match
          setEditForm(prev => ({ ...prev, ...parsed, state: parsed.state }));  // ← NEW: Include state in edit form
      }
  }, []);

  const handleSave = () => {
      setLoading(true);
      setTimeout(() => {
          setStudent(editForm);
          setLoading(false);
      }, 1000);
  };

  // Dynamic initials from name (bonus)
  const getInitials = (name: string) => {
    if (!name || name === "Loading...") return "LA";
    const words = name.split(' ').filter(w => w.length > 0);
    return words.slice(-2).map(w => w[0].toUpperCase()).join('');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in-50 duration-500">
      
      {/* Main Details Card */}
      <Card className="md:col-span-2 shadow-sm relative">
        <CardHeader className="bg-muted/30 pb-4 flex flex-row items-start justify-between">
          <div>
              <CardTitle className="text-xl font-bold tracking-tight text-primary">General Information</CardTitle>
              <CardDescription>View your basic academic and personal records.</CardDescription>
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
                    <Settings className="w-4 h-4" /> Edit Profile
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                    <SheetTitle>Profile Settings</SheetTitle>
                    <SheetDescription>Make changes to your contact information or account security here.</SheetDescription>
                </SheetHeader>
                
                <Tabs defaultValue="profile" className="w-full mt-6">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="profile">Profile Details</TabsTrigger>
                        <TabsTrigger value="security">Security</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="profile" className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="contact">Mobile Number</Label>
                            <Input 
                                id="contact" 
                                value={editForm.contact}
                                onChange={(e) => setEditForm({...editForm, contact: e.target.value})} 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input 
                                id="email" 
                                value={editForm.email}
                                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Residential Address</Label>
                            <Input 
                                id="address"
                                value={editForm.address}
                                onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">  {/* ← NEW: Add state edit field if needed */}
                            <Label htmlFor="state">State</Label>
                            <Input 
                                id="state"
                                value={editForm.state}
                                onChange={(e) => setEditForm({...editForm, state: e.target.value})}
                            />
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="security" className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Current Password</Label>
                            <Input type="password" />
                        </div>
                        <div className="space-y-2">
                            <Label>New Password</Label>
                            <Input type="password" />
                        </div>
                    </TabsContent>
                </Tabs>

                <SheetFooter className="mt-4 sm:justify-end">
                    <Button type="submit" onClick={handleSave} disabled={loading}>
                        {loading ? "Saving..." : <><Save className="mr-2 h-4 w-4"/> Save Changes</>}
                    </Button>
                </SheetFooter>
            </SheetContent>
          </Sheet>

        </CardHeader>
        <CardContent className="pt-6 grid gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DetailItem label="Full Name" value={student.name} full />
            <DetailItem label="Register No." value={student.regNo} />
            <DetailItem label="Course" value={student.course} />
            <DetailItem label="Academic Year" value={student.sem} />
            <DetailItem label="Institution" value={student.institution} full />
          </div>
          <Separator />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <DetailItem label="Father Name" value={student.father} full />
             <DetailItem label="Residential Address" value={student.address} full />
             <DetailItem label="State" value={student.state} />  {/* ← NEW: Display state */}
             <DetailItem label="Contact Details" value={`${student.contact} / ${student.email}`} full />
          </div>
        </CardContent>
      </Card>
 
      {/* Profile Photo & Status Card */}
      <div className="space-y-6">
        <Card className="shadow-sm overflow-hidden border-2 border-primary/5">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 flex justify-center items-center relative">
                 <Avatar className="w-48 h-48 border-4 border-white shadow-xl">
                    <AvatarImage src="../public/logo.png" /> 
                    <AvatarFallback className="text-4xl">{getInitials(student.name)}</AvatarFallback>  {/* ← NEW: Dynamic initials */}
                </Avatar>
                <div className="absolute top-4 right-4 sm:hidden">
                    {/* Mobile Setting Trigger (icon only) if screen is small */}
                    <Sheet>
                        <SheetTrigger asChild>
                           <Button size="icon" variant="ghost"><Settings className="w-5 h-5"/></Button>
                        </SheetTrigger>
                         {/* Content repeated for structure/access logic omitted for brevity in mobile view specific adjustment */}
                    </Sheet>
                </div>
            </div>
            <CardContent className="text-center pt-6 pb-6">
                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 px-4 py-1 text-sm dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
                    Current Status: Active
                </Badge>
                
                <div className="mt-6 flex flex-col gap-3 justify-center items-center">
                   <p className="text-xs text-muted-foreground">Last updated: Today at 10:25 PM</p>
                   <Button variant="ghost" size="sm" className="w-full text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => window.location.reload()}>
                      <RefreshCw className="w-3.5 h-3.5 mr-2" /> Check for updates
                      </Button>
                </div>
            </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-900 to-blue-950 text-white p-6 text-center shadow-lg relative overflow-hidden">
             {/* Abstract circle decoration */}
             <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
             
             <h3 className="font-semibold text-lg relative z-10">Wisdom & Truth</h3>
             <p className="text-blue-200 text-xs mt-1 relative z-10">Light of the world</p>
        </Card>
      </div>
    </div>
  );
}

const DetailItem = ({ label, value, full }: { label: string, value: string, full?: boolean }) => (
  <div className={full ? "col-span-1 sm:col-span-2" : "col-span-1"}>
    <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold mb-1">{label}</h4>
    <p className="text-sm font-medium text-foreground break-words">{value || "—"}</p>
  </div>
);