import { eq } from "drizzle-orm"
import { db } from "../db"
import { user } from "../schema"


export async function getUserByUsername(username: string) {
  const [found] = await db
    .select()
    .from(user)
    .where(eq(user.username, username))

  return found ?? null
}


export async function updateUserUsername(userId: string, username: string) {
  const [updated] = await db
    .update(user)
    .set({ username })
    .where(eq(user.id, userId))
    .returning()

  return updated
}
