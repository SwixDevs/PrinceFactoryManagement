import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("factory_management")
    const settings = db.collection("settings")

    let authCodeDoc = await settings.findOne({ type: "auth_code" })

    // If no auth code exists, create default one
    if (!authCodeDoc) {
      const defaultCode = "FACTORY123"
      await settings.insertOne({
        type: "auth_code",
        code: defaultCode,
        updatedAt: new Date(),
      })
      authCodeDoc = { code: defaultCode }
    }

    return NextResponse.json({ authCode: authCodeDoc.code })
  } catch (error) {
    console.error("Get auth code error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code || code.trim().length === 0) {
      return NextResponse.json({ error: "Auth code cannot be empty" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("factory_management")
    const settings = db.collection("settings")

    await settings.updateOne(
      { type: "auth_code" },
      {
        $set: {
          code: code.trim().toUpperCase(),
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    )

    return NextResponse.json({ message: "Auth code updated successfully" })
  } catch (error) {
    console.error("Update auth code error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
