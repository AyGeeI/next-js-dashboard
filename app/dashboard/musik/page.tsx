"use client";

import { useState } from "react";
import Link from "next/link";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { OverviewTab } from "@/components/spotify/overview-tab";
import { StatisticsTab } from "@/components/spotify/statistics-tab";
import { DiscoverTab } from "@/components/spotify/discover-tab";
import { PlaybackBar } from "@/components/spotify/playback-bar";
import { DeviceSelectorModal } from "@/components/spotify/device-selector-modal";

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
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview">Übersicht</TabsTrigger>
            <TabsTrigger value="statistics">Statistiken</TabsTrigger>
            <TabsTrigger value="discover">Entdecken</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <OverviewTab />
          </TabsContent>

          <TabsContent value="statistics" className="mt-6">
            <StatisticsTab />
          </TabsContent>

          <TabsContent value="discover" className="mt-6">
            <DiscoverTab />
          </TabsContent>
        </Tabs>
      </div>

      <PlaybackBar onDeviceSelect={() => setDeviceModalOpen(true)} />
      <DeviceSelectorModal open={deviceModalOpen} onOpenChange={setDeviceModalOpen} />
    </>
  );
}
