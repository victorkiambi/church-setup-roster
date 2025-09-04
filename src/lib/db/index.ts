import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null

// Create a function to get the database connection
function createDbConnection() {
  if (_db) return _db
  
  const databaseUrl = process.env.DATABASE_URL
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required')
  }

  const sql = neon(databaseUrl)
  _db = drizzle(sql, { schema })
  return _db
}

// Export a getter function that returns the properly typed drizzle instance
export const getDb = () => createDbConnection()

// For backward compatibility, create a proxy object that creates connection on first access
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_, prop) {
    const connection = createDbConnection()
    return connection[prop as keyof typeof connection]
  }
})

export * from './schema'