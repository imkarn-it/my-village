import { db } from '../lib/db'
import { users } from '../lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

async function checkPassword() {
    const email = 'resident@test.com'
    const password = 'TestPass123!'

    const user = await db.query.users.findFirst({
        where: eq(users.email, email),
    })

    if (!user) {
        console.log('❌ User not found')
        return
    }

    console.log('📧 User:', user.email)
    console.log('🔑 Hash in DB:', user.password)

    const match = await bcrypt.compare(password, user.password!)
    console.log('✅ Match:', match)

    // Also try hashing manually and comparing
    const newHash = await bcrypt.hash(password, 12)
    console.log('🆕 New Hash:', newHash)
    const newMatch = await bcrypt.compare(password, newHash)
    console.log('✅ New Match:', newMatch)
}

checkPassword().then(() => process.exit(0)).catch(err => {
    console.error(err)
    process.exit(1)
})
