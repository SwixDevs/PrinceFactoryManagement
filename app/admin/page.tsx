"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

interface User {
  _id: string
  username: string
  email: string
  role: string
}

interface Task {
  _id: string
  title: string
  description: string
  assignedTo: string
  assignedToName: string
  completed: boolean
  createdAt: string
}

export default function AdminPanel() {
  const [user, setUser] = useState<User | null>(null)
  const [workers, setWorkers] = useState<User[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState({ title: "", description: "", assignedTo: "" })
  const [authCode, setAuthCode] = useState("")
  const [newAuthCode, setNewAuthCode] = useState("")
  const [isEditingAuthCode, setIsEditingAuthCode] = useState(false)

  // Admin code states
  const [adminAuthCode, setAdminAuthCode] = useState("")
  const [newAdminAuthCode, setNewAdminAuthCode] = useState("")
  const [isEditingAdminAuthCode, setIsEditingAdminAuthCode] = useState(false)

  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "admin") {
      router.push("/")
      return
    }

    setUser(parsedUser)
    fetchWorkers()
    fetchTasks()
    fetchAuthCode()
    // Fetch admin auth code and first admin id
    fetchAdminAuthCode()
  }, [router])

  const fetchWorkers = async () => {
    try {
      const res = await fetch("/api/users/workers")
      const data = await res.json()
      if (res.ok) {
        setWorkers(data.workers)
      }
    } catch (error) {
      console.error("Failed to fetch workers:", error)
    }
  }

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks")
      const data = await res.json()
      if (res.ok) {
        setTasks(data.tasks)
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error)
    }
  }

  const fetchAuthCode = async () => {
    try {
      const res = await fetch("/api/auth-code")
      const data = await res.json()
      if (res.ok) {
        setAuthCode(data.authCode)
        setNewAuthCode(data.authCode)
      }
    } catch (error) {
      console.error("Failed to fetch auth code:", error)
    }
  }

  // Fetch admin auth code details
  const fetchAdminAuthCode = async () => {
    try {
      const res = await fetch("/api/admin-code")
      const data = await res.json()
      if (res.ok) {
        setAdminAuthCode(data.adminCode)
        setNewAdminAuthCode(data.adminCode)
      }
    } catch (error) {
      console.error("Failed to fetch admin auth code:", error)
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      })

      if (res.ok) {
        setNewTask({ title: "", description: "", assignedTo: "" })
        fetchTasks()
        alert("Task created successfully!")
      } else {
        const data = await res.json()
        alert(data.error)
      }
    } catch (error) {
      alert("Failed to create task")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  const handleUpdateAuthCode = async () => {
    if (!newAuthCode.trim()) {
      alert("Auth code cannot be empty")
      return
    }

    try {
      const res = await fetch("/api/auth-code", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: newAuthCode }),
      })

      if (res.ok) {
        setAuthCode(newAuthCode.trim().toUpperCase())
        setIsEditingAuthCode(false)
        alert("Auth code updated successfully!")
      } else {
        const data = await res.json()
        alert(data.error)
      }
    } catch (error) {
      alert("Failed to update auth code")
    }
  }

  // Update admin auth code only if first admin
  const handleUpdateAdminAuthCode = async () => {
    if (!newAdminAuthCode.trim()) {
      alert("Admin code cannot be empty")
      return
    }
    try {
      const res = await fetch("/api/admin-code", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: newAdminAuthCode }),
      })
      if (res.ok) {
        setAdminAuthCode(newAdminAuthCode.trim().toUpperCase())
        setIsEditingAdminAuthCode(false)
        alert("Admin code updated successfully!")
      } else {
        const data = await res.json()
        alert(data.error)
      }
    } catch (error) {
      alert("Failed to update admin code")
    }
  }

  const getWorkerTasks = (workerId: string) => {
    return tasks.filter((task) => task.assignedTo === workerId)
  }

  if (!user) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">Welcome, {user.username}</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Create New Task</CardTitle>
              <CardDescription>Assign a task to a worker</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <Label htmlFor="title">Task Title</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="assignedTo">Assign to Worker</Label>
                  <select
                    id="assignedTo"
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Select a worker</option>
                    {workers.map((worker) => (
                      <option key={worker._id} value={worker._id}>
                        {worker.username} ({worker.email})
                      </option>
                    ))}
                  </select>
                </div>
                <Button type="submit" className="w-full">
                  Create Task
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Worker Authorization Code</CardTitle>
              <CardDescription>Share this code with new workers for registration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                {isEditingAuthCode ? (
                  <div className="space-y-4">
                    <Input
                      value={newAuthCode}
                      onChange={(e) => setNewAuthCode(e.target.value)}
                      className="text-center font-mono text-lg"
                      placeholder="Enter new auth code"
                    />
                    <div className="flex gap-2 justify-center">
                      <Button onClick={handleUpdateAuthCode}>Save</Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditingAuthCode(false)
                          setNewAuthCode(authCode)
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-2xl font-mono font-bold bg-muted p-4 rounded-lg mb-4">{authCode}</div>
                    <Button onClick={() => setIsEditingAuthCode(true)} variant="outline">
                      Change Code
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Admin Authorization Code</CardTitle>
              <CardDescription>
                Used when creating new admin accounts. All admins can change this code. Default: ADMIN.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                {isEditingAdminAuthCode ? (
                  <div className="space-y-4">
                    <Input
                      value={newAdminAuthCode}
                      onChange={(e) => setNewAdminAuthCode(e.target.value)}
                      className="text-center font-mono text-lg"
                      placeholder="Enter new admin code"
                    />
                    <div className="flex gap-2 justify-center">
                      <Button onClick={handleUpdateAdminAuthCode}>Save</Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditingAdminAuthCode(false)
                          setNewAdminAuthCode(adminAuthCode)
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-2xl font-mono font-bold bg-muted p-4 rounded-lg mb-4">{adminAuthCode}</div>
                    <Button onClick={() => setIsEditingAdminAuthCode(true)} variant="outline">
                      Change Admin Code
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Workers and Their Tasks</h2>
          {workers.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">No workers registered yet</p>
              </CardContent>
            </Card>
          ) : (
            workers.map((worker) => {
              const workerTasks = getWorkerTasks(worker._id)
              return (
                <Card key={worker._id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {worker.username}
                      <Badge variant="secondary">{workerTasks.length} tasks</Badge>
                    </CardTitle>
                    <CardDescription>{worker.email}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {workerTasks.length === 0 ? (
                      <p className="text-muted-foreground">No tasks assigned</p>
                    ) : (
                      <div className="space-y-3">
                        {workerTasks.map((task) => (
                          <div key={task._id} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{task.title}</h4>
                              <Badge variant={task.completed ? "default" : "secondary"}>
                                {task.completed ? "Completed" : "Pending"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{task.description}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Created: {new Date(task.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
