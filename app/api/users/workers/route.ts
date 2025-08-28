import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("factory_management")
    const users = db.collection("users")

    // Get all workers
    const workers = await users.find({ role: "worker" }).toArray()

    return NextResponse.json({
      workers: workers.map((worker) => ({
        _id: worker._id,
        username: worker.username,
        email: worker.email,
        role: worker.role,
      })),
    })
  } catch (error) {
    console.error("Get workers error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
