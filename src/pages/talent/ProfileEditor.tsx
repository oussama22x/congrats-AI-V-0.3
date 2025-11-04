import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BasicInfoEditor } from "@/components/profile/editor/BasicInfoEditor";
import { WorkPreferencesEditor } from "@/components/profile/editor/WorkPreferencesEditor";
import { CompensationEditor } from "@/components/profile/editor/CompensationEditor";
import { ResumeEditor } from "@/components/profile/editor/ResumeEditor";
import { User, Briefcase, DollarSign, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const ProfileEditor = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    // Handle hash navigation (e.g., /talent/profile#resume)
    if (location.hash === "#resume") {
      setActiveTab("resume");
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Edit Profile</h1>
            <p className="text-xl text-muted-foreground">
              Manage your professional information
            </p>
          </div>

          {/* Tabbed Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Basic Info</span>
              </TabsTrigger>
              <TabsTrigger value="work" className="gap-2">
                <Briefcase className="h-4 w-4" />
                <span className="hidden sm:inline">Work Prefs</span>
              </TabsTrigger>
              <TabsTrigger value="compensation" className="gap-2">
                <DollarSign className="h-4 w-4" />
                <span className="hidden sm:inline">Salary</span>
              </TabsTrigger>
              <TabsTrigger value="resume" className="gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Resume</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <BasicInfoEditor />
            </TabsContent>

            <TabsContent value="work">
              <WorkPreferencesEditor />
            </TabsContent>

            <TabsContent value="compensation">
              <CompensationEditor />
            </TabsContent>

            <TabsContent value="resume">
              <ResumeEditor />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileEditor;
