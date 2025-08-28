import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    const client = await clientPromise
    const db = client.db("factory_management")
    const users = db.collection("users")

    // Find user
    const user = await users.findOne({ email, password })

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: "Login successful",
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
