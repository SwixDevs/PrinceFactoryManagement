"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
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
  completed: boolean
  createdAt: string
}

export default function WorkerPanel() {
  const [user, setUser] = useState<User | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "worker") {
      router.push("/")
      return
    }

    setUser(parsedUser)
    fetchTasks()
  }, [router])

  const fetchTasks = async () => {
    try {
      const userData = localStorage.getItem("user")
      if (!userData) return

      const user = JSON.parse(userData)
      const res = await fetch(`/api/tasks/worker/${user._id}`)
      const data = await res.json()
      if (res.ok) {
        setTasks(data.tasks)
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error)
    }
  }

  const handleTaskComplete = async (taskId: string, completed: boolean) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      })

      if (res.ok) {
        fetchTasks()
      } else {
        alert("Failed to update task")
      }
    } catch (error) {
      alert("Failed to update task")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  const completedTasks = tasks.filter((task) => task.completed)
  const pendingTasks = tasks.filter((task) => !task.completed)

  if (!user) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Worker Panel</h1>
            <p className="text-muted-foreground">Welcome, {user.username}</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{tasks.length}</div>
              <p className="text-muted-foreground">Total Tasks</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-orange-600">{pendingTasks.length}</div>
              <p className="text-muted-foreground">Pending Tasks</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600">{completedTasks.length}</div>
              <p className="text-muted-foreground">Completed Tasks</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {pendingTasks.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Pending Tasks</h2>
              <div className="space-y-4">
                {pendingTasks.map((task) => (
                  <Card key={task._id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-3">
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={(checked) => handleTaskComplete(task._id, checked as boolean)}
                          />
                          {task.title}
                        </CardTitle>
                        <Badge variant="secondary">Pending</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-2">{task.description}</p>
                      <p className="text-xs text-muted-foreground">
                        Assigned: {new Date(task.createdAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {completedTasks.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Completed Tasks</h2>
              <div className="space-y-4">
                {completedTasks.map((task) => (
                  <Card key={task._id} className="opacity-75">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-3">
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={(checked) => handleTaskComplete(task._id, checked as boolean)}
                          />
                          <span className="line-through">{task.title}</span>
                        </CardTitle>
                        <Badge>Completed</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-2">{task.description}</p>
                      <p className="text-xs text-muted-foreground">
                        Assigned: {new Date(task.createdAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {tasks.length === 0 && (
            <Card>
              <CardContent className="p-8">
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">No tasks assigned yet</h3>
                  <p className="text-muted-foreground">Your admin will assign tasks to you soon.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
