const { ApolloServer } = require("@apollo/server")
const { startStandaloneServer } = require("@apollo/server/standalone")
const jwt = require("jsonwebtoken")

const typeDefs = require("./schema")
const resolvers = require("./resolvers")
const User = require("./models/user")

const getUserFromAuthHeader = async (auth) => {
  if (!auth || !auth.startsWith("Bearer ")) {
    return null
  }

  try {
    const decoded = jwt.verify(auth.substring(7), process.env.JWT_SECRET)
    return await User.findById(decoded.id)
  } catch (error) {
    return null
  }
}

const startServer = async (port) => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  })

  const { url } = await startStandaloneServer(server, {
    listen: { port },
    context: async ({ req }) => ({
      currentUser: await getUserFromAuthHeader(req.headers.authorization),
    }),
  })
  console.log(`Server ready at ${url}`)
}

module.exports = startServer
