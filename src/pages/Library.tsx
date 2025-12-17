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
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Book,
    Search,
    ExternalLink,
    GraduationCap,
    Code2,
    Globe,
    Library as LibraryIcon,
    History,
    AlertCircle,
    Clock
} from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

// --- Mock Data: Physical Library Status ---
const MY_ISSUED_BOOKS = [
    { title: "Operating System Concepts", author: "Silberschatz", due: "15 Dec 2025", status: "Due Soon" },
    { title: "Intro to Algorithms (CLRS)", author: "Cormen", due: "20 Dec 2025", status: "Active" },
    { title: "Artificial Intelligence: A Modern Approach", author: "Russell & Norvig", due: "10 Nov 2025", status: "Overdue" },
];

// --- Mock Data: Curated Resources ---
const DIGITAL_RESOURCES = [
    {
        category: "Institutional Access",
        items: [
            { name: "DELNET", desc: "Developing Library Network. Access to millions of bibliographic records.", link: "https://delnet.in/index.html", tag: "Premium", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
            { name: "N-LIST (INFLIBNET)", desc: "Access e-ShodhSindhu e-resources (6,000+ journals, 1,99,500+ ebooks).", link: "https://nlist.inflibnet.ac.in/", tag: "Institutional", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300" }
        ]
    },
    {
        category: "Computer Science Research",
        items: [
            { name: "IEEE Xplore", desc: "Technical literature in engineering and technology.", link: "https://ieeexplore.ieee.org/", tag: "Research" },
            { name: "ACM Digital Library", desc: "Full-text access to the world's largest computing database.", link: "https://dl.acm.org/", tag: "Research" },
            { name: "Google Scholar", desc: "Broadly search for scholarly literature.", link: "https://scholar.google.com/", tag: "Open Access" }
        ]
    },
    {
        category: "Learning Platforms",
        items: [
            { name: "NPTEL / SWAYAM", desc: "Video courses from IITs and IISc.", link: "https://nptel.ac.in/", tag: "MOOC" },
            { name: "Roadmap.sh", desc: "Community-driven roadmaps and articles for developers.", link: "https://roadmap.sh/", tag: "Dev Tools" },
            { name: "GitHub Student Pack", desc: "Free access to the best developer tools.", link: "https://education.github.com/pack", tag: "Dev Tools" }
        ]
    }
];

export default function Library() {
    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500 max-w-[1600px]">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Digital Library</h2>
                    <p className="text-muted-foreground mt-1">OPAC System & E-Resources Portal</p>
                </div>
                <div className="flex items-center w-full md:w-auto gap-2">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search OPAC (Books, Journals, Projects)..."
                            className="pl-8 bg-background"
                        />
                    </div>
                    <Button variant="default">Search</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* --- Left Column: Digital Gateways (2/3 width) --- */}
                <div className="xl:col-span-2 space-y-6">
                    
                    {/* Primary Gateways (DELNET/N-List) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {DIGITAL_RESOURCES[0].items.map((item) => {
                            const colorClass = "color" in item ? item.color : "bg-secondary text-foreground";
                            return (
                                <Card key={item.name} className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-primary group">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <div className={`p-2 rounded-lg ${colorClass}`}>
                                                <LibraryIcon className="w-6 h-6" />
                                            </div>
                                            <Badge variant="outline">{item.tag}</Badge>
                                        </div>
                                        <CardTitle className="pt-4 flex items-center gap-2 group-hover:text-primary transition-colors">
                                            {item.name} <ExternalLink className="w-4 h-4 opacity-50" />
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="text-xs md:text-sm line-clamp-2">
                                            {item.desc}
                                        </CardDescription>
                                    </CardContent>
                                    <CardFooter className="bg-muted/10 pt-4">
                                        <Button size="sm" variant="ghost" className="w-full justify-between" onClick={() => window.open(item.link, '_blank')}>
                                            Access Portal
                                            <span className="sr-only">Open {item.name}</span>
                                            <Globe className="w-4 h-4" />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>

                    <Separator />

                    {/* Secondary Resources (Research & Learning) */}
                    <div className="space-y-4">
                         <h3 className="text-lg font-semibold flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-primary" /> Curated for B.Sc. CS
                         </h3>
                         
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                             {DIGITAL_RESOURCES.slice(1).flatMap(cat => cat.items).map((item) => (
                                 <Card key={item.name} className="flex flex-col justify-between hover:bg-muted/50 transition-colors">
                                     <CardHeader className="p-4 pb-0">
                                         <div className="flex justify-between items-center mb-2">
                                            {item.tag === "Research" ? <Book className="w-4 h-4 text-muted-foreground"/> : <Code2 className="w-4 h-4 text-muted-foreground"/>}
                                            <Badge variant="secondary" className="text-[10px]">{item.tag}</Badge>
                                         </div>
                                         <CardTitle className="text-sm font-semibold">{item.name}</CardTitle>
                                         <CardDescription className="text-xs mt-1 line-clamp-2">{item.desc}</CardDescription>
                                     </CardHeader>
                                     <CardFooter className="p-4 pt-4">
                                         <Button size="sm" variant="outline" className="w-full text-xs h-8" onClick={() => window.open(item.link, '_blank')}>
                                            Visit <ExternalLink className="w-3 h-3 ml-2" />
                                         </Button>
                                     </CardFooter>
                                 </Card>
                             ))}
                         </div>
                    </div>
                </div>


            </div>
        </div>
    );
}