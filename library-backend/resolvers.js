const { GraphQLError } = require("graphql")
const Author = require("./models/author")
const Book = require("./models/book")

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
  },
  Mutation: {
    addBook: async (root, args) => {
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
    editAuthor: async (root, args) => {
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
  },
  Author: {
    bookCount: async (root) => Book.countDocuments({ author: root._id }),
  },
}

module.exports = resolvers
