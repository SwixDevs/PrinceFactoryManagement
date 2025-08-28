import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("factory_management")
    const tasks = db.collection("tasks")
    const users = db.collection("users")

    // Get all tasks with worker names
    const allTasks = await tasks.find({}).toArray()

    // Add worker names to tasks
    const tasksWithNames = await Promise.all(
      allTasks.map(async (task) => {
        const worker = await users.findOne({ _id: new ObjectId(task.assignedTo) })
        return {
          ...task,
          assignedToName: worker?.username || "Unknown",
        }
      }),
    )

    return NextResponse.json({ tasks: tasksWithNames })
  } catch (error) {
    console.error("Get tasks error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, assignedTo } = await request.json()

    const client = await clientPromise
    const db = client.db("factory_management")
    const tasks = db.collection("tasks")

    const newTask = {
      title,
      description,
      assignedTo,
      completed: false,
      createdAt: new Date(),
    }

    const result = await tasks.insertOne(newTask)

    return NextResponse.json({
      message: "Task created successfully",
      taskId: result.insertedId,
    })
  } catch (error) {
    console.error("Create task error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
