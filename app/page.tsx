"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [signupData, setSignupData] = useState({
    username: "",
    email: "",
    password: "",
    authCode: "",
  })
  const [adminSignup, setAdminSignup] = useState({
    username: "",
    email: "",
    password: "",
    authCode: "",
  })
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      })
      const data = await res.json()

      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data.user))
        if (data.user.role === "admin") {
          router.push("/admin")
        } else {
          router.push("/worker")
        }
      } else {
        alert(data.error)
      }
    } catch (error) {
      alert("Login failed")
    }
  }

  const handleWorkerSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...signupData, role: "worker" }),
      })
      const data = await res.json()

      if (res.ok) {
        alert("Worker account created successfully!")
        setSignupData({ username: "", email: "", password: "", authCode: "" })
      } else {
        alert(data.error)
      }
    } catch (error) {
      alert("Signup failed")
    }
  }

  const handleAdminSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...adminSignup, role: "admin" }),
      })
      const data = await res.json()

      if (res.ok) {
        alert("Admin account created successfully!")
        setAdminSignup({ username: "", email: "", password: "", authCode: "" })
      } else {
        alert(data.error)
      }
    } catch (error) {
      alert("Admin signup failed")
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Prince Factory Management System</h1>
          {/* Removed the subheading per request */}
          {/* <p className="text-muted-foreground mt-2">Manage tasks and workers efficiently</p> */}
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="worker-signup">Worker Signup</TabsTrigger>
            <TabsTrigger value="admin-signup">Admin Signup</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>Enter your credentials to access your account</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Login
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="worker-signup">
            <Card>
              <CardHeader>
                <CardTitle>Worker Signup</CardTitle>
                <CardDescription>Create a worker account with admin authorization</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleWorkerSignup} className="space-y-4">
                  <div>
                    <Label htmlFor="worker-username">Username</Label>
                    <Input
                      id="worker-username"
                      value={signupData.username}
                      onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="worker-email">Email</Label>
                    <Input
                      id="worker-email"
                      type="email"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="worker-password">Password</Label>
                    <Input
                      id="worker-password"
                      type="password"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="auth-code">Worker Authorization Code</Label>
                    <Input
                      id="auth-code"
                      value={signupData.authCode}
                      onChange={(e) => setSignupData({ ...signupData, authCode: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Create Worker Account
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admin-signup">
            <Card>
              <CardHeader>
                <CardTitle>Admin Signup</CardTitle>
                <CardDescription>Create an admin account</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAdminSignup} className="space-y-4">
                  <div>
                    <Label htmlFor="admin-username">Username</Label>
                    <Input
                      id="admin-username"
                      value={adminSignup.username}
                      onChange={(e) => setAdminSignup({ ...adminSignup, username: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="admin-email">Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      value={adminSignup.email}
                      onChange={(e) => setAdminSignup({ ...adminSignup, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="admin-password">Password</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      value={adminSignup.password}
                      onChange={(e) => setAdminSignup({ ...adminSignup, password: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="admin-auth-code">Admin Authorization Code</Label>
                    <Input
                      id="admin-auth-code"
                      value={adminSignup.authCode}
                      onChange={(e) => setAdminSignup({ ...adminSignup, authCode: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Button type="submit" className="w-full">
                      Create Admin Account
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
