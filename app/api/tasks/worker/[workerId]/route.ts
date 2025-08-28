import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request: NextRequest, { params }: { params: { workerId: string } }) {
  try {
    const { workerId } = params

    const client = await clientPromise
    const db = client.db("factory_management")
    const tasks = db.collection("tasks")

    // Get tasks for specific worker
    const workerTasks = await tasks.find({ assignedTo: workerId }).toArray()

    return NextResponse.json({ tasks: workerTasks })
  } catch (error) {
    console.error("Get worker tasks error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
