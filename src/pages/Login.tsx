import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Login() {
  const [rollNo, setRollNo] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();


  // Inside src/pages/Login.tsx

const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Connect to Backend
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: rollNo, password: password }),
      });

      const result = await response.json();

      if (result.success) {
        localStorage.setItem("erp-auth", "true");
        localStorage.setItem("erp-user", JSON.stringify({ uid: rollNo }));

        // --- SAVE ALL 6 SNAPSHOTS ---
        localStorage.setItem("erp-data-profile", JSON.stringify(result.data.profile));
        localStorage.setItem("erp-data-hourly", JSON.stringify(result.data.hourly));
        localStorage.setItem("erp-data-subjects", JSON.stringify(result.data.subjects));
        localStorage.setItem("erp-data-attendance", JSON.stringify(result.data.attendance));
        localStorage.setItem("erp-data-internals", JSON.stringify(result.data.internals));
        localStorage.setItem("erp-data-exams", JSON.stringify(result.data.exams));
        localStorage.setItem("erp-data-fees", JSON.stringify(result.data.fees));

        navigate("/");
      } else {
        setError(result.message || "Invalid credentials.");
      }
    } catch (err) {
      setError("Connection refused. Ensure backend is running.");
    } finally {
      setIsLoading(false);
    }
};
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 p-4 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <Card className="w-full max-w-md shadow-xl border-primary/10 relative z-10 animate-in zoom-in-95 duration-500">
        <CardHeader className="text-center space-y-1">
          <div className="mx-auto w-12 h-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center font-bold text-xl mb-2 shadow-lg">
            LA
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Enter your Roll Number and Password to access the Student Portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rollno">Roll Number / User ID</Label>
              <Input 
                id="rollno" 
                placeholder="1117..." 
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            {error && (
                <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">{error}</AlertDescription>
                </Alert>
            )}

            <Button type="submit" className="w-full h-10 transition-all" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fetching Live Data...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 text-center text-xs text-muted-foreground">
          <p>
            Secure connection established with college ERP.
          </p>
          <p>© 2025 Loyola Academy. Powered by Shadcn ERP.</p>
        </CardFooter>
      </Card>
    </div>
  );
}