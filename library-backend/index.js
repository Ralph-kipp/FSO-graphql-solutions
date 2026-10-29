require("dotenv").config()

const connectToDatabase = require("./db")
const startServer = require("./server")

const MONGODB_URI = process.env.MONGODB_URI
const PORT = process.env.PORT || 4000

const main = async () => {
  if (!process.env.JWT_SECRET) {
    console.log("JWT_SECRET is not set")
    process.exit(1)
  }

  await connectToDatabase(MONGODB_URI)
  await startServer(PORT)
}

main()
