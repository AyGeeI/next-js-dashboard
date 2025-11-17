"use client";

import { useEffect, useState } from "react";
import { RefreshCcw, TrendingUp, Music, User, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type SpotifyTrack = {
  id: string;
  name: string;
  artists: Array<{ id: string; name: string }>;
  album: {
    id: string;
    name: string;
    images: Array<{ url: string; height?: number; width?: number }>;
  };
  duration_ms: number;
  external_urls: { spotify: string };
};

type SpotifyArtist = {
  id: string;
  name: string;
  genres: string[];
  images: Array<{ url: string; height?: number; width?: number }>;
  external_urls: { spotify: string };
};

const COLORS = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899"];

export function StatisticsTab() {
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);
  const [topArtists, setTopArtists] = useState<SpotifyArtist[]>([]);
  const [timeRange, setTimeRange] = useState<"short_term" | "medium_term" | "long_term">("medium_term");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async (forceRefresh = false) => {
    setLoading(true);

    try {
      const baseUrl = forceRefresh ? "?refresh=true&time_range=" : "?time_range=";

      const [tracksResponse, artistsResponse] = await Promise.all([
        fetch(`/api/spotify/top-tracks${baseUrl}${timeRange}`, { cache: "no-store" }),
        fetch(`/api/spotify/top-artists${baseUrl}${timeRange}`, { cache: "no-store" }),
      ]);

      if (tracksResponse.ok) {
        const tracksData = await tracksResponse.json();
        setTopTracks(tracksData.tracks || []);
      }

      if (artistsResponse.ok) {
        const artistsData = await artistsResponse.json();
        setTopArtists(artistsData.artists || []);
      }
    } catch (err) {
      console.error("Statistics fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for charts
  const topTracksChartData = topTracks.slice(0, 10).map((track, index) => ({
    name: track.name.length > 20 ? track.name.substring(0, 20) + "..." : track.name,
    rank: 10 - index,
  }));

  const topArtistsChartData = topArtists.slice(0, 10).map((artist, index) => ({
    name: artist.name.length > 15 ? artist.name.substring(0, 15) + "..." : artist.name,
    rank: 10 - index,
  }));

  // Genre distribution
  const genreMap = new Map<string, number>();
  topArtists.forEach((artist) => {
    artist.genres.forEach((genre) => {
      genreMap.set(genre, (genreMap.get(genre) || 0) + 1);
    });
  });

  const genreData = Array.from(genreMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([genre, count]) => ({
      name: genre.length > 15 ? genre.substring(0, 15) + "..." : genre,
      value: count,
    }));

  // Calculate total listening time
  const totalDurationMs = topTracks.reduce((sum, track) => sum + track.duration_ms, 0);
  const totalHours = Math.floor(totalDurationMs / (1000 * 60 * 60));
  const totalMinutes = Math.floor((totalDurationMs % (1000 * 60 * 60)) / (1000 * 60));

  const timeRangeLabel =
    timeRange === "short_term"
      ? "Letzte 4 Wochen"
      : timeRange === "medium_term"
      ? "Letzte 6 Monate"
      : "Gesamte Zeit";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Statistiken</h2>
          <p className="text-sm text-muted-foreground">Deine Hör-Gewohnheiten im Überblick</p>
        </div>

        <div className="flex items-center gap-4">
          <Select
            value={timeRange}
            onValueChange={(value: any) => setTimeRange(value)}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="short_term">Letzte 4 Wochen</SelectItem>
              <SelectItem value="medium_term">Letzte 6 Monate</SelectItem>
              <SelectItem value="long_term">Gesamte Zeit</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => fetchData(true)}
            disabled={loading}
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="rounded-md border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Songs</CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topTracks.length}</div>
            <p className="text-xs text-muted-foreground">{timeRangeLabel}</p>
          </CardContent>
        </Card>

        <Card className="rounded-md border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Artists</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topArtists.length}</div>
            <p className="text-xs text-muted-foreground">{timeRangeLabel}</p>
          </CardContent>
        </Card>

        <Card className="rounded-md border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hörzeit (Top 20)</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalHours}h {totalMinutes}m
            </div>
            <p className="text-xs text-muted-foreground">Geschätzte Dauer</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 - Horizontal Bars for better readability */}
      <div className="grid gap-6">
        {/* Top Tracks Chart */}
        <Card className="rounded-md border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Top 10 Tracks</CardTitle>
            <CardDescription>Deine meistgehörten Songs • Sortiert nach Hörzeit</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex h-96 items-center justify-center">
                <RefreshCcw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : topTracksChartData.length === 0 ? (
              <div className="flex h-96 items-center justify-center">
                <p className="text-sm text-muted-foreground">Keine Daten verfügbar</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topTracksChartData} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
                  <XAxis type="number" className="text-xs" />
                  <YAxis type="category" dataKey="name" className="text-xs" width={180} />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--accent))" }}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      padding: "12px",
                    }}
                  />
                  <Bar dataKey="rank" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Artists Chart */}
        <Card className="rounded-md border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Top 10 Artists</CardTitle>
            <CardDescription>Deine meistgehörten Künstler • Sortiert nach Hörzeit</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex h-96 items-center justify-center">
                <RefreshCcw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : topArtistsChartData.length === 0 ? (
              <div className="flex h-96 items-center justify-center">
                <p className="text-sm text-muted-foreground">Keine Daten verfügbar</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topArtistsChartData} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
                  <XAxis type="number" className="text-xs" />
                  <YAxis type="category" dataKey="name" className="text-xs" width={140} />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--accent))" }}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      padding: "12px",
                    }}
                  />
                  <Bar dataKey="rank" fill="#06b6d4" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Genre Distribution */}
      <Card className="rounded-md border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Genre-Verteilung</CardTitle>
          <CardDescription>Deine Top 6 Genres basierend auf gehörten Artists</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-96 items-center justify-center">
              <RefreshCcw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : genreData.length === 0 ? (
            <div className="flex h-96 items-center justify-center">
              <p className="text-sm text-muted-foreground">Keine Genre-Daten verfügbar</p>
            </div>
          ) : (
            <div className="flex flex-col items-center lg:flex-row lg:justify-center lg:gap-12">
              <ResponsiveContainer width="100%" height={450} className="lg:w-1/2">
                <PieChart>
                  <Pie
                    data={genreData}
                    cx="50%"
                    cy="45%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}\n${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={140}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {genreData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      padding: "12px",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-6 space-y-3 lg:mt-0 lg:w-1/3">
                {genreData.map((genre, index) => (
                  <div key={index} className="flex items-center gap-3 rounded-md border bg-card p-3">
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div className="flex-1">
                      <p className="font-semibold">{genre.name}</p>
                      <p className="text-sm text-muted-foreground">{genre.value} Artists</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
