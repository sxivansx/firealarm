"use client"

import { useState, useEffect } from "react"
import { Bell, BellRing, Flame, Home, Info, Settings, Shield, ThermometerSun } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default function Dashboard() {
  const [activeAlerts, setActiveAlerts] = useState(2)
  const [temperature, setTemperature] = useState(24)
  const [smokeLevel, setSmokeLevel] = useState(15)
  const [batteryLevel, setBatteryLevel] = useState(78)

  // Simulate changing data
  useEffect(() => {
    const interval = setInterval(() => {
      setTemperature((prev) => Math.max(20, Math.min(35, prev + (Math.random() > 0.5 ? 1 : -1))))
      setSmokeLevel((prev) => Math.max(0, Math.min(100, prev + (Math.random() > 0.7 ? 5 : -2))))
      setBatteryLevel((prev) => Math.max(0, Math.min(100, prev - 0.1)))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Determine status based on smoke level
  const getStatus = (level: number) => {
    if (level > 50) return "critical"
    if (level > 25) return "warning"
    return "normal"
  }

  const status = getStatus(smokeLevel)

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-muted/30">
        <Sidebar>
          <SidebarHeader className="flex items-center justify-center py-4">
            <div className="flex items-center gap-2 px-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">FireGuard</h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive tooltip="Dashboard">
                  <Home className="h-5 w-5" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Alerts">
                  <BellRing className="h-5 w-5" />
                  <span>Alerts</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Sensors">
                  <ThermometerSun className="h-5 w-5" />
                  <span>Sensors</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Settings">
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <div className="text-xs text-muted-foreground">System Status: Online</div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 p-4 md:p-6">
          <div className="flex flex-col gap-4">
            <header className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Fire Alarm Dashboard</h1>
                <p className="text-muted-foreground">Monitor and manage your building's fire safety system</p>
              </div>
              <div className="flex items-center gap-2">
                <SidebarTrigger className="md:hidden" />
                <Button variant="outline" size="icon">
                  <Bell className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </div>
            </header>

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

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className={`${status === "critical" ? "border-red-500 shadow-red-500/20 shadow-lg" : ""}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">System Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">
                      {status === "normal" ? "Normal" : status === "warning" ? "Warning" : "ALERT"}
                    </div>
                    <Badge
                      className={
                        status === "normal"
                          ? "bg-green-500"
                          : status === "warning"
                            ? "bg-orange-500"
                            : "bg-red-500 animate-pulse"
                      }
                    >
                      {activeAlerts > 0 ? `${activeAlerts} Active` : "All Clear"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Temperature</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{temperature}°C</div>
                  <Progress
                    value={((temperature - 20) * 100) / 15}
                    className="mt-2"
                    indicatorClassName={
                      temperature > 30 ? "bg-red-500" : temperature > 25 ? "bg-orange-500" : "bg-green-500"
                    }
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Smoke Level</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{smokeLevel}%</div>
                  <Progress
                    value={smokeLevel}
                    className="mt-2"
                    indicatorClassName={
                      smokeLevel > 50 ? "bg-red-500" : smokeLevel > 25 ? "bg-orange-500" : "bg-green-500"
                    }
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Battery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{batteryLevel.toFixed(0)}%</div>
                  <Progress
                    value={batteryLevel}
                    className="mt-2"
                    indicatorClassName={
                      batteryLevel < 20 ? "bg-red-500" : batteryLevel < 50 ? "bg-orange-500" : "bg-green-500"
                    }
                  />
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="zones">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="zones">Zones</TabsTrigger>
                <TabsTrigger value="devices">Devices</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              <TabsContent value="zones" className="mt-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[
                    { name: "Zone 1 - Main Office", status: status, devices: 4 },
                    { name: "Zone 2 - Conference Room", status: "normal", devices: 2 },
                    { name: "Zone 3 - Kitchen", status: "normal", devices: 3 },
                    { name: "Zone 4 - Hallway", status: "offline", devices: 2 },
                    { name: "Zone 5 - Server Room", status: "normal", devices: 5 },
                    { name: "Zone 6 - Reception", status: "normal", devices: 3 },
                  ].map((zone, i) => (
                    <Card key={i} className={zone.status === "critical" ? "border-red-500" : ""}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-sm font-medium">{zone.name}</CardTitle>
                          <Badge
                            className={
                              zone.status === "normal"
                                ? "bg-green-500"
                                : zone.status === "warning"
                                  ? "bg-orange-500"
                                  : zone.status === "critical"
                                    ? "bg-red-500 animate-pulse"
                                    : "bg-gray-500"
                            }
                          >
                            {zone.status === "offline"
                              ? "Offline"
                              : zone.status.charAt(0).toUpperCase() + zone.status.slice(1)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-muted-foreground">{zone.devices} devices connected</div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" size="sm" className="w-full">
                          View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="devices" className="mt-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[
                    { name: "Smoke Detector - Main Office", type: "smoke", status: status },
                    { name: "Heat Sensor - Conference Room", type: "heat", status: "normal" },
                    { name: "Smoke Detector - Kitchen", type: "smoke", status: "normal" },
                    { name: "Sprinkler System - Hallway", type: "sprinkler", status: "offline" },
                    { name: "CO Detector - Server Room", type: "co", status: "normal" },
                    { name: "Alarm Panel - Reception", type: "panel", status: "normal" },
                  ].map((device, i) => (
                    <Card key={i} className={device.status === "critical" ? "border-red-500" : ""}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-sm font-medium">{device.name}</CardTitle>
                          <Badge
                            className={
                              device.status === "normal"
                                ? "bg-green-500"
                                : device.status === "warning"
                                  ? "bg-orange-500"
                                  : device.status === "critical"
                                    ? "bg-red-500 animate-pulse"
                                    : "bg-gray-500"
                            }
                          >
                            {device.status === "offline"
                              ? "Offline"
                              : device.status.charAt(0).toUpperCase() + device.status.slice(1)}
                          </Badge>
                        </div>
                        <CardDescription>
                          {device.type.charAt(0).toUpperCase() + device.type.slice(1)} Detector
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-muted-foreground">Last checked: 2 minutes ago</div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" size="sm" className="w-full">
                          Test Device
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="history" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Alert History</CardTitle>
                    <CardDescription>Recent alerts and system events</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { time: "10:23 AM", message: "Smoke level above threshold in Zone 1", level: "warning" },
                        { time: "09:45 AM", message: "System test completed successfully", level: "info" },
                        {
                          time: "Yesterday, 6:12 PM",
                          message: "Battery level low on Zone 4 detector",
                          level: "warning",
                        },
                        { time: "Yesterday, 3:30 PM", message: "Scheduled maintenance completed", level: "info" },
                        { time: "2 days ago", message: "Fire alarm triggered in Zone 3", level: "critical" },
                      ].map((alert, i) => (
                        <div key={i} className="flex items-start gap-4 pb-4 border-b last:border-0">
                          <div
                            className={`mt-0.5 h-2 w-2 rounded-full ${
                              alert.level === "critical"
                                ? "bg-red-500"
                                : alert.level === "warning"
                                  ? "bg-orange-500"
                                  : "bg-blue-500"
                            }`}
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

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-2">
                  <Button variant="destructive" className="w-full">
                    <BellRing className="mr-2 h-4 w-4" />
                    Test Alarm
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Shield className="mr-2 h-4 w-4" />
                    System Check
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Bell className="mr-2 h-4 w-4" />
                    Silence Alarm
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    Configure
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Emergency Contacts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Fire Department</p>
                      <p className="text-sm text-muted-foreground">Emergency Response</p>
                    </div>
                    <Button>Call Now</Button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Building Security</p>
                      <p className="text-sm text-muted-foreground">24/7 Support</p>
                    </div>
                    <Button variant="outline">Call</Button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">System Maintenance</p>
                      <p className="text-sm text-muted-foreground">Technical Support</p>
                    </div>
                    <Button variant="outline">Call</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}

