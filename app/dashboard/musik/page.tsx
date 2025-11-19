"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { OverviewTab } from "@/components/spotify/overview-tab";
import { LibraryTab } from "@/components/spotify/library-tab";
import { TopChartsTab } from "@/components/spotify/top-charts-tab";
import { StatisticsTab } from "@/components/spotify/statistics-tab";
import { PlaybackBar } from "@/components/spotify/playback-bar";
import { DeviceSelectorModal } from "@/components/spotify/device-selector-modal";
import { Toaster } from "@/components/ui/toaster";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function MusikPage() {
  const router = useRouter();
  const [deviceModalOpen, setDeviceModalOpen] = useState(false);
  const [settingsMissing, setSettingsMissing] = useState(false);

  return (
    <>
      <div className="space-y-10 pb-24">
        {/* Breadcrumbs */}
        <div className="hidden sm:block">
          <Breadcrumbs />
        </div>

        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between motion-safe:animate-in motion-safe:fade-in-50">
          <div className="space-y-2">
            {/* Mobile Back Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="mb-2 sm:hidden"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Zurück
            </Button>
            <h1 className="text-2xl font-semibold">Musik</h1>
            <p className="text-sm text-muted-foreground">
              Deine Spotify-Statistiken und Musik-Verwaltung
            </p>
          </div>
        </div>

        {settingsMissing && (
          <NotificationBanner
            variant="warning"
            title="Spotify-Verbindung fehlt"
            description="Bitte verbinde dein Spotify-Konto in den Einstellungen."
            action={
              <Link
                href="/dashboard/settings"
                className="text-sm font-medium text-warning hover:underline"
              >
                Zu den Einstellungen
              </Link>
            }
          />
        )}

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full max-w-3xl grid-cols-4">
            <TabsTrigger value="overview">Übersicht</TabsTrigger>
            <TabsTrigger value="library">Bibliothek</TabsTrigger>
            <TabsTrigger value="charts">Top Charts</TabsTrigger>
            <TabsTrigger value="statistics">Statistiken</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-8">
            <OverviewTab />
          </TabsContent>

          <TabsContent value="library" className="mt-8">
            <LibraryTab />
          </TabsContent>

          <TabsContent value="charts" className="mt-8">
            <TopChartsTab />
          </TabsContent>

          <TabsContent value="statistics" className="mt-8">
            <StatisticsTab />
          </TabsContent>
        </Tabs>
      </div>

      <PlaybackBar onDeviceSelect={() => setDeviceModalOpen(true)} />
      <DeviceSelectorModal open={deviceModalOpen} onOpenChange={setDeviceModalOpen} />
      <Toaster />
    </>
  );
}
