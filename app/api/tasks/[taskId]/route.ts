import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PATCH(request: NextRequest, { params }: { params: { taskId: string } }) {
  try {
    const { taskId } = params
    const { completed } = await request.json()

    const client = await clientPromise
    const db = client.db("factory_management")
    const tasks = db.collection("tasks")

    // Update task completion status
    const result = await tasks.updateOne({ _id: new ObjectId(taskId) }, { $set: { completed } })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Task updated successfully" })
  } catch (error) {
    console.error("Update task error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
