import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

// Keep the simple fallback used for worker code if settings doc is missing
const WORKER_FALLBACK_CODE = "FACTORY123"

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, role, authCode } = await request.json()

    const client = await clientPromise
    const db = client.db("factory_management")
    const settings = db.collection("settings")

    if (role === "worker") {
      const authCodeDoc = await settings.findOne({ type: "auth_code" }) // worker code lives here
      const validAuthCode = authCodeDoc?.code || WORKER_FALLBACK_CODE
      if (authCode !== validAuthCode) {
        return NextResponse.json({ error: "Invalid authorization code" }, { status: 400 })
      }
    }

    if (role === "admin") {
      const adminCodeDoc = await settings.findOne({ type: "admin_auth_code" })
      const validAdminCode = adminCodeDoc?.code || "ADMIN" // default for first admin
      if (authCode !== validAdminCode) {
        return NextResponse.json({ error: "Invalid admin authorization code" }, { status: 400 })
      }
    }

    const users = db.collection("users")

    // Check if user already exists
    const existingUser = await users.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Create new user
    const newUser = {
      username,
      email,
      password, // Per user instruction: no hashing/extra features
      role,
      createdAt: new Date(),
    }

    const result = await users.insertOne(newUser)

    if (role === "admin") {
      const meta = await settings.findOne({ type: "admin_meta" })
      if (!meta) {
        await settings.insertOne({
          type: "admin_meta",
          firstAdminId: result.insertedId,
          createdAt: new Date(),
        })
      }
      // Also ensure admin auth code document exists (initialize to ADMIN if missing)
      const adminCodeDoc = await settings.findOne({ type: "admin_auth_code" })
      if (!adminCodeDoc) {
        await settings.insertOne({
          type: "admin_auth_code",
          code: "ADMIN",
          updatedAt: new Date(),
        })
      }
    }

    return NextResponse.json({
      message: "User created successfully",
      userId: result.insertedId,
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
