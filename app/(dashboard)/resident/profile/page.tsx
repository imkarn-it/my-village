import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"
import { ProfileForm } from "@/components/profile-form"
import type { Role } from "@/lib/constants"

export default async function ResidentProfilePage(): Promise<React.JSX.Element> {
    const session = await auth()
    if (!session?.user?.id) {
        redirect("/login")
    }

    const user = await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
        columns: {
            name: true,
            email: true,
            phone: true,
            avatar: true,
            role: true,
        },
    })

    if (!user) {
        redirect("/login")
    }

    // Cast role to proper type since DB returns string
    const userProfile = {
        id: session.user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role as Role,
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                    โปรไฟล์ของฉัน
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-lg">
                    จัดการข้อมูลส่วนตัวและรหัสผ่าน
                </p>
            </div>

            <ProfileForm user={userProfile} />
        </div>
    )
}
