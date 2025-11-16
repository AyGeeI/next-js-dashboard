"use client";

import { useState } from "react";
import Link from "next/link";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { OverviewTab } from "@/components/spotify/overview-tab";
import { LibraryTab } from "@/components/spotify/library-tab";
import { TopChartsTab } from "@/components/spotify/top-charts-tab";
import { StatisticsTab } from "@/components/spotify/statistics-tab";
import { PlaybackBar } from "@/components/spotify/playback-bar";
import { DeviceSelectorModal } from "@/components/spotify/device-selector-modal";
import { Toaster } from "@/components/ui/toaster";

export default function MusikPage() {
  const [deviceModalOpen, setDeviceModalOpen] = useState(false);
  const [settingsMissing, setSettingsMissing] = useState(false);

  return (
    <>
      <div className="space-y-6 pb-24">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Musik</h1>
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

          <TabsContent value="overview" className="mt-6">
            <OverviewTab />
          </TabsContent>

          <TabsContent value="library" className="mt-6">
            <LibraryTab />
          </TabsContent>

          <TabsContent value="charts" className="mt-6">
            <TopChartsTab />
          </TabsContent>

          <TabsContent value="statistics" className="mt-6">
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
