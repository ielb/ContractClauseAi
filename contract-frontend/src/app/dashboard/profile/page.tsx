"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProfileOverview } from "@/components/user/profile-overview";
import { ProfileForm } from "@/components/user/profile-form";
import { UserTable } from "@/components/user/user-table";
import { useProfile } from "@/hooks/use-user";
import { UserRole } from "@/types/user";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Users, Settings } from "lucide-react";

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function ProfilePageContent() {
  const { data: profile } = useProfile();
  const isAdmin = profile?.role === UserRole.ADMIN;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Profile Management
          </h1>
          <p className="text-muted-foreground">
            Manage your profile information and account settings.
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                User Management
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <ProfileOverview />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <ProfileForm />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="users" className="space-y-6">
              <UserTable />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProfilePageContent />
    </QueryClientProvider>
  );
}
