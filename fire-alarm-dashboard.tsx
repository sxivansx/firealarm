"use client"

import type React from "react"
import { useState, useEffect, createContext, useContext, useCallback } from "react"
import {
  Bell,
  BellOff,
  BellRing,
  Flame,
  Home,
  Info,
  Menu,
  Phone,
  RefreshCw,
  Settings,
  Shield,
  ThermometerSun,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

// Create context for alarm system state
type AlarmContextType = {
  zones: Zone[]
  devices: Device[]
  alerts: SystemAlert[]
  temperature: number
  smokeLevel: number
  batteryLevel: number
  status: "normal" | "warning" | "critical" | "offline"
  activeAlerts: number
  testAlarm: () => void
  silenceAlarm: () => void
  systemCheck: () => void
  refreshData: () => void
}

type Zone = {
  id: number
  name: string
  status: "normal" | "warning" | "critical" | "offline"
  devices: number
}

type Device = {
  id: number
  name: string
  type: "smoke" | "heat" | "sprinkler" | "co" | "panel"
  status: "normal" | "warning" | "critical" | "offline"
  lastChecked: string
  zoneId: number
}

type SystemAlert = {
  id: number
  time: string
  message: string
  level: "info" | "warning" | "critical"
}

const AlarmContext = createContext<AlarmContextType | undefined>(undefined)

// Custom hook to use the alarm context
function useAlarm() {
  const context = useContext(AlarmContext)
  if (context === undefined) {
    throw new Error("useAlarm must be used within an AlarmProvider")
  }
  return context
}

// Alarm Provider component
function AlarmProvider({ children }: { children: React.ReactNode }) {
  const [temperature, setTemperature] = useState(24)
  const [smokeLevel, setSmokeLevel] = useState(15)
  const [batteryLevel, setBatteryLevel] = useState(78)
  const [activeAlerts, setActiveAlerts] = useState(2)
  const [isAlarming, setIsAlarming] = useState(false)
  const [isSilenced, setIsSilenced] = useState(false)

  // Initial data
  const [zones, setZones] = useState<Zone[]>([
    { id: 1, name: "Zone 1 - Main Office", status: "normal", devices: 4 },
    { id: 2, name: "Zone 2 - Conference Room", status: "normal", devices: 2 },
    { id: 3, name: "Zone 3 - Kitchen", status: "normal", devices: 3 },
    { id: 4, name: "Zone 4 - Hallway", status: "offline", devices: 2 },
    { id: 5, name: "Zone 5 - Server Room", status: "normal", devices: 5 },
    { id: 6, name: "Zone 6 - Reception", status: "normal", devices: 3 },
  ])

  const [devices, setDevices] = useState<Device[]>([
    {
      id: 1,
      name: "Smoke Detector - Main Office",
      type: "smoke",
      status: "normal",
      lastChecked: "2 min ago",
      zoneId: 1,
    },
    {
      id: 2,
      name: "Heat Sensor - Conference Room",
      type: "heat",
      status: "normal",
      lastChecked: "5 min ago",
      zoneId: 2,
    },
    { id: 3, name: "Smoke Detector - Kitchen", type: "smoke", status: "normal", lastChecked: "3 min ago", zoneId: 3 },
    {
      id: 4,
      name: "Sprinkler System - Hallway",
      type: "sprinkler",
      status: "offline",
      lastChecked: "1 hour ago",
      zoneId: 4,
    },
    { id: 5, name: "CO Detector - Server Room", type: "co", status: "normal", lastChecked: "10 min ago", zoneId: 5 },
    { id: 6, name: "Alarm Panel - Reception", type: "panel", status: "normal", lastChecked: "1 min ago", zoneId: 6 },
  ])

  const [alerts, setAlerts] = useState<SystemAlert[]>([
    { id: 1, time: "10:23 AM", message: "Smoke level above threshold in Zone 1", level: "warning" },
    { id: 2, time: "09:45 AM", message: "System test completed successfully", level: "info" },
    { id: 3, time: "Yesterday, 6:12 PM", message: "Battery level low on Zone 4 detector", level: "warning" },
    { id: 4, time: "Yesterday, 3:30 PM", message: "Scheduled maintenance completed", level: "info" },
    { id: 5, time: "2 days ago", message: "Fire alarm triggered in Zone 3", level: "critical" },
  ])

  // Determine status based on smoke level
  const getStatus = useCallback((level: number) => {
    if (level > 50) return "critical"
    if (level > 25) return "warning"
    return "normal"
  }, [])

  const status = getStatus(smokeLevel)

  // Update zone status based on smoke level
  useEffect(() => {
    if (status !== "normal") {
      setZones((prev) => prev.map((zone) => (zone.id === 1 ? { ...zone, status } : zone)))

      setDevices((prev) => prev.map((device) => (device.zoneId === 1 ? { ...device, status } : device)))
    } else {
      setZones((prev) => prev.map((zone) => (zone.id === 1 ? { ...zone, status: "normal" } : zone)))

      setDevices((prev) => prev.map((device) => (device.zoneId === 1 ? { ...device, status: "normal" } : device)))
    }
  }, [status])

  // Simulate changing data
  useEffect(() => {
    const interval = setInterval(() => {
      setTemperature((prev) => Math.max(20, Math.min(35, prev + (Math.random() > 0.5 ? 1 : -1))))
      setSmokeLevel((prev) => {
        // If alarm is active, increase smoke level more rapidly
        if (isAlarming && !isSilenced) {
          return Math.min(100, prev + Math.random() * 10)
        }
        return Math.max(0, Math.min(100, prev + (Math.random() > 0.7 ? 5 : -2)))
      })
      setBatteryLevel((prev) => Math.max(0, Math.min(100, prev - 0.1)))
    }, 3000)

    return () => clearInterval(interval)
  }, [isAlarming, isSilenced])

  // Update active alerts count
  useEffect(() => {
    let count = 0
    zones.forEach((zone) => {
      if (zone.status === "warning" || zone.status === "critical") count++
    })
    setActiveAlerts(count)
  }, [zones])

  // Add new alert when status changes
  useEffect(() => {
    if (status === "warning" || status === "critical") {
      const newAlert = {
        id: Date.now(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        message:
          status === "critical" ? "EMERGENCY: Fire detected in Zone 1" : "Warning: Elevated smoke levels in Zone 1",
        level: status as "warning" | "critical",
      }

      setAlerts((prev) => [newAlert, ...prev.slice(0, 9)])
    }
  }, [status])

  // Test alarm function
  const testAlarm = useCallback(() => {
    setIsAlarming(true)
    setSmokeLevel(60)

    // Add test alert
    const newAlert = {
      id: Date.now(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      message: "Alarm test initiated",
      level: "info",
    }

    setAlerts((prev) => [newAlert, ...prev.slice(0, 9)])

    // Reset after 10 seconds
    setTimeout(() => {
      setIsAlarming(false)
      setSmokeLevel(15)
    }, 10000)
  }, [])

  // Silence alarm function
  const silenceAlarm = useCallback(() => {
    setIsSilenced(!isSilenced)

    // Add silence alert
    const newAlert = {
      id: Date.now(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      message: isSilenced ? "Alarm unsilenced" : "Alarm silenced",
      level: "info",
    }

    setAlerts((prev) => [newAlert, ...prev.slice(0, 9)])
  }, [isSilenced])

  // System check function
  const systemCheck = useCallback(() => {
    // Add system check alert
    const newAlert = {
      id: Date.now(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      message: "System check initiated",
      level: "info",
    }

    setAlerts((prev) => [newAlert, ...prev.slice(0, 9)])

    // Update last checked time for all devices
    setDevices((prev) =>
      prev.map((device) => ({
        ...device,
        lastChecked: "Just now",
      })),
    )
  }, [])

  // Refresh data function
  const refreshData = useCallback(() => {
    // Add refresh alert
    const newAlert = {
      id: Date.now(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      message: "Data refreshed",
      level: "info",
    }

    setAlerts((prev) => [newAlert, ...prev.slice(0, 9)])
  }, [])

  const value = {
    zones,
    devices,
    alerts,
    temperature,
    smokeLevel,
    batteryLevel,
    status,
    activeAlerts,
    testAlarm,
    silenceAlarm,
    systemCheck,
    refreshData,
  }

  return <AlarmContext.Provider value={value}>{children}</AlarmContext.Provider>
}

// Status indicator component
function StatusIndicator({ status }: { status: "normal" | "warning" | "critical" | "offline" }) {
  return (
    <Badge
      className={cn(
        "text-white",
        status === "normal"
          ? "bg-green-500"
          : status === "warning"
            ? "bg-orange-500"
            : status === "critical"
              ? "bg-red-500 animate-pulse"
              : "bg-gray-500",
      )}
    >
      {status === "offline" ? "Offline" : status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

// Mobile navigation component
function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[80%] sm:w-[350px] p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            FireGuard
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <div className="flex flex-col gap-1 p-2">
            <Button variant="ghost" className="justify-start" onClick={() => setOpen(false)}>
              <Home className="mr-2 h-5 w-5" />
              Dashboard
            </Button>
            <Button variant="ghost" className="justify-start" onClick={() => setOpen(false)}>
              <BellRing className="mr-2 h-5 w-5" />
              Alerts
            </Button>
            <Button variant="ghost" className="justify-start" onClick={() => setOpen(false)}>
              <ThermometerSun className="mr-2 h-5 w-5" />
              Sensors
            </Button>
            <Button variant="ghost" className="justify-start" onClick={() => setOpen(false)}>
              <Settings className="mr-2 h-5 w-5" />
              Settings
            </Button>
          </div>

          <div className="border-t mt-4 p-4">
            <div className="text-sm text-muted-foreground">System Status: Online</div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

// Main dashboard component
export default function FireAlarmDashboard() {
  return (
    <AlarmProvider>
      <FireAlarmApp />
    </AlarmProvider>
  )
}

function FireAlarmApp() {
  const {
    zones,
    devices,
    alerts,
    temperature,
    smokeLevel,
    batteryLevel,
    status,
    activeAlerts,
    testAlarm,
    silenceAlarm,
    systemCheck,
    refreshData,
  } = useAlarm()

  const [isRefreshing, setIsRefreshing] = useState(false)

  // Handle refresh with animation
  const handleRefresh = () => {
    setIsRefreshing(true)
    refreshData()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <header className="sticky top-0 z-10 bg-background border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MobileNav />
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary hidden sm:block" />
            <h1 className="font-bold text-lg">FireGuard</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            <span className="sr-only">Refresh</span>
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notifications</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 pb-20 max-w-5xl mx-auto w-full">
        <div className="flex flex-col gap-4">
          {status === "critical" && (
            <Alert variant="destructive" className="animate-pulse">
              <Flame className="h-5 w-5" />
              <AlertTitle className="font-bold">EMERGENCY: Fire Detected!</AlertTitle>
              <AlertDescription>
                High smoke levels detected in Zone 1. Please evacuate immediately and call emergency services.
              </AlertDescription>
            </Alert>
          )}

          {status === "warning" && (
            <Alert variant="warning" className="border-orange-500 text-orange-500">
              <Info className="h-5 w-5" />
              <AlertTitle className="font-bold">Warning: Elevated Smoke Levels</AlertTitle>
              <AlertDescription>
                Smoke levels are above normal in Zone 1. Please investigate immediately.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card
              className={cn(
                "col-span-2 sm:col-span-4",
                status === "critical" ? "border-red-500 shadow-red-500/20 shadow-lg" : "",
              )}
            >
              <CardHeader className="p-3">
                <CardTitle className="text-sm font-medium">System Status</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="flex items-center justify-between">
                  <div className="text-xl font-bold">
                    {status === "normal" ? "Normal" : status === "warning" ? "Warning" : "ALERT"}
                  </div>
                  <StatusIndicator status={status} />
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {activeAlerts > 0
                    ? `${activeAlerts} active alert${activeAlerts > 1 ? "s" : ""}`
                    : "All systems normal"}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-3">
                <CardTitle className="text-sm font-medium">Temperature</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="text-xl font-bold">{temperature}°C</div>
                <Progress
                  value={((temperature - 20) * 100) / 15}
                  className="mt-2 h-2"
                  indicatorClassName={
                    temperature > 30 ? "bg-red-500" : temperature > 25 ? "bg-orange-500" : "bg-green-500"
                  }
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-3">
                <CardTitle className="text-sm font-medium">Smoke Level</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="text-xl font-bold">{smokeLevel}%</div>
                <Progress
                  value={smokeLevel}
                  className="mt-2 h-2"
                  indicatorClassName={
                    smokeLevel > 50 ? "bg-red-500" : smokeLevel > 25 ? "bg-orange-500" : "bg-green-500"
                  }
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-3">
                <CardTitle className="text-sm font-medium">Battery</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="text-xl font-bold">{batteryLevel.toFixed(0)}%</div>
                <Progress
                  value={batteryLevel}
                  className="mt-2 h-2"
                  indicatorClassName={
                    batteryLevel < 20 ? "bg-red-500" : batteryLevel < 50 ? "bg-orange-500" : "bg-green-500"
                  }
                />
              </CardContent>
            </Card>

            <Card className="col-span-2 sm:col-span-4">
              <CardHeader className="p-3">
                <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 grid grid-cols-2 gap-2">
                <Button variant="destructive" className="w-full" onClick={testAlarm}>
                  <BellRing className="mr-2 h-4 w-4" />
                  Test Alarm
                </Button>
                <Button variant="outline" className="w-full" onClick={silenceAlarm}>
                  <BellOff className="mr-2 h-4 w-4" />
                  Silence Alarm
                </Button>
                <Button variant="outline" className="w-full" onClick={systemCheck}>
                  <Shield className="mr-2 h-4 w-4" />
                  System Check
                </Button>
                <Button variant="outline" className="w-full">
                  <Phone className="mr-2 h-4 w-4" />
                  Emergency Call
                </Button>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="zones" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="zones">Zones</TabsTrigger>
              <TabsTrigger value="devices">Devices</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            <TabsContent value="zones" className="mt-4">
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                {zones.map((zone) => (
                  <Card key={zone.id} className={zone.status === "critical" ? "border-red-500" : ""}>
                    <CardHeader className="p-3">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-sm font-medium">{zone.name}</CardTitle>
                        <StatusIndicator status={zone.status} />
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <div className="text-xs text-muted-foreground">{zone.devices} devices connected</div>
                    </CardContent>
                    <CardFooter className="p-3 pt-0">
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="devices" className="mt-4">
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                {devices.map((device) => (
                  <Card key={device.id} className={device.status === "critical" ? "border-red-500" : ""}>
                    <CardHeader className="p-3">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-sm font-medium">{device.name}</CardTitle>
                        <StatusIndicator status={device.status} />
                      </div>
                      <CardDescription className="text-xs">
                        {device.type.charAt(0).toUpperCase() + device.type.slice(1)} Detector
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <div className="text-xs text-muted-foreground">Last checked: {device.lastChecked}</div>
                    </CardContent>
                    <CardFooter className="p-3 pt-0">
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        Test Device
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="history" className="mt-4">
              <Card>
                <CardHeader className="p-3">
                  <CardTitle className="text-sm font-medium">Alert History</CardTitle>
                  <CardDescription className="text-xs">Recent alerts and system events</CardDescription>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <div key={alert.id} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                        <div
                          className={cn(
                            "mt-0.5 h-2 w-2 rounded-full",
                            alert.level === "critical"
                              ? "bg-red-500"
                              : alert.level === "warning"
                                ? "bg-orange-500"
                                : "bg-blue-500",
                          )}
                        />
                        <div className="grid gap-1">
                          <p className="text-sm font-medium">{alert.message}</p>
                          <p className="text-xs text-muted-foreground">{alert.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Mobile action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-3 md:hidden">
        <div className="grid grid-cols-4 gap-2">
          <Button variant="outline" size="sm" className="flex flex-col items-center h-auto py-2">
            <Home className="h-4 w-4 mb-1" />
            <span className="text-xs">Home</span>
          </Button>
          <Button variant="outline" size="sm" className="flex flex-col items-center h-auto py-2">
            <BellRing className="h-4 w-4 mb-1" />
            <span className="text-xs">Alerts</span>
          </Button>
          <Button variant="outline" size="sm" className="flex flex-col items-center h-auto py-2">
            <ThermometerSun className="h-4 w-4 mb-1" />
            <span className="text-xs">Sensors</span>
          </Button>
          <Button variant="outline" size="sm" className="flex flex-col items-center h-auto py-2">
            <Phone className="h-4 w-4 mb-1" />
            <span className="text-xs">Call</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

