import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function Home() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const role = session.user.role

  if (role === "admin" || role === "super_admin") {
    redirect("/admin")
  } else if (role === "security") {
    redirect("/security")
  } else {
    redirect("/resident")
  }
}
