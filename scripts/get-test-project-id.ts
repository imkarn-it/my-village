import { db } from '../lib/db'
import { projects } from '../lib/db/schema'
import { eq } from 'drizzle-orm'

async function getProjectId() {
    const project = await db.query.projects.findFirst({
        where: eq(projects.name, 'Test Village'),
    })
    console.log('PROJECT_ID:', project?.id)
    process.exit(0)
}

getProjectId()
