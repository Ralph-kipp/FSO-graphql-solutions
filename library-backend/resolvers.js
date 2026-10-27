const { GraphQLError } = require("graphql")
const jwt = require("jsonwebtoken")
const Author = require("./models/author")
const Book = require("./models/book")
const User = require("./models/user")

const requireLogin = (context) => {
  if (!context?.currentUser) {
    throw new GraphQLError("not authenticated", {
      extensions: { code: "UNAUTHENTICATED" },
    })
  }
}

const badInput = (message, invalidArgs, error) =>
  new GraphQLError(message, {
    extensions: {
      code: "BAD_USER_INPUT",
      invalidArgs,
      ...(error && { error: error.message }),
    },
  })

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      const filter = {}

      if (args.genre) {
        filter.genres = args.genre
      }

      if (args.author) {
        const author = await Author.findOne({ name: args.author })
        if (!author) {
          return []
        }
        filter.author = author._id
      }

      return Book.find(filter).populate("author")
    },
    allAuthors: async () => Author.find({}),
    me: (root, args, context) => context?.currentUser ?? null,
  },
  Mutation: {
    addBook: async (root, args, context) => {
      requireLogin(context)

      if (await Book.exists({ title: args.title })) {
        throw badInput(`Title must be unique: ${args.title}`, args.title)
      }

      const invalidArgs = [args.title, args.author]

      try {
        let author = await Author.findOne({ name: args.author })
        const isNewAuthor = !author
        if (isNewAuthor) {
          author = new Author({ name: args.author })
        }

        const book = new Book({
          title: args.title,
          published: args.published,
          author: author._id,
          genres: args.genres,
        })

        // validate everything first, so an invalid book leaves nothing behind
        if (isNewAuthor) {
          await author.validate()
        }
        await book.validate()

        if (isNewAuthor) {
          await author.save()
        }
        await book.save()

        return book.populate("author")
      } catch (error) {
        throw badInput(`Saving book failed: ${error.message}`, invalidArgs, error)
      }
    },
    editAuthor: async (root, args, context) => {
      requireLogin(context)

      const author = await Author.findOne({ name: args.name })
      if (!author) {
        return null
      }

      author.born = args.setBornTo
      try {
        return await author.save()
      } catch (error) {
        throw badInput(`Saving author failed: ${error.message}`, args.name, error)
      }
    },
    createUser: async (root, args) => {
      if (await User.exists({ username: args.username })) {
        throw badInput(`Username must be unique: ${args.username}`, args.username)
      }

      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre,
      })

      try {
        await user.validate()
        return await user.save()
      } catch (error) {
        throw badInput(
          `Creating the user failed: ${error.message}`,
          args.username,
          error,
        )
      }
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password !== "secret") {
        throw badInput("wrong credentials", args.username)
      }

      const userForToken = { username: user.username, id: user._id }

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
    },
  },
  Author: {
    bookCount: async (root) => Book.countDocuments({ author: root._id }),
  },
}

module.exports = resolvers
