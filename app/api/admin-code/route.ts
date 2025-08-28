import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("factory_management")
    const settings = db.collection("settings")

    // Admin auth code: create default if missing
    let adminCodeDoc = await settings.findOne({ type: "admin_auth_code" })
    if (!adminCodeDoc) {
      await settings.insertOne({
        type: "admin_auth_code",
        code: "ADMIN",
        updatedAt: new Date(),
      })
      adminCodeDoc = { code: "ADMIN" }
    }

    const meta = await settings.findOne({ type: "admin_meta" })
    const firstAdminId = meta?.firstAdminId ? String(meta.firstAdminId) : null

    return NextResponse.json({
      adminCode: adminCodeDoc.code,
      firstAdminId,
    })
  } catch (error) {
    console.error("Get admin code error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code || !String(code).trim()) {
      return NextResponse.json({ error: "Admin code cannot be empty" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("factory_management")
    const settings = db.collection("settings")

    await settings.updateOne(
      { type: "admin_auth_code" },
      {
        $set: {
          code: String(code).trim().toUpperCase(),
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    )

    return NextResponse.json({ message: "Admin code updated successfully" })
  } catch (error) {
    console.error("Update admin code error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
