const { GraphQLError } = require('graphql/error')
const { PubSub } = require('graphql-subscriptions')
const jwt = require('jsonwebtoken')
const User = require('./models/user')
const Author = require('./models/author')
const Book = require('./models/book')

const pubsub = new PubSub()

const resolvers = {
  Query: {
    booksCount: async () => await Book.collection.countDocuments(),
    authorCount: async () => await Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      let query = {}
      if (args.author) {
        const author = await Author.findOne({ name: args.author })
        query.author = author._id
      }
      if (args.genre) {
        query.genres = { $in: [args.genre] }
      }
      return Book.find(query)
    },
    allAuthors: async () => await Author.find({}),
    me: (root, args, { currentUser }) => currentUser,
    genres: async () => await Book.distinct('genres')
  },
  Book: {
    author: (root, args, context) => {
      if (context?.loaders?.authorsLoader) {
        return context.loaders.authorsLoader.load(root.author)
      }
      return Author.findById(root.author)
    }
  },
  Author: {
    bookCount: async (root, args, context) => {
      if (context?.loaders?.authorsBookCountLoader) {
        return context.loaders.authorsBookCountLoader.load(root._id)
      }
      return await Book.countDocuments({ author: root._id })
    }
  },
  User: {
    recommendations: async (root, args, { currentUser }) => {
      const favoriteGenre = currentUser.favoriteGenre
      return await Book.find({ genres: { $in: [favoriteGenre] } })
    }
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterableIterator('BOOK_ADDED')
    },
    authorAdded: {
      subscribe: () => pubsub.asyncIterableIterator('AUTHOR_ADDED')
    }
  },
  Mutation: {
    addBook: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHORIZED' }
        })
      }
      try {
        let authorAdded = false
        let author = await Author.findOne({ name: args.author })
        if (!author) {
          author = await new Author({ name: args.author }).save()
          authorAdded = true
        }
        const book = await new Book({ ...args, author: author._id }).save()
        await pubsub.publish("BOOK_ADDED", { bookAdded: book })
        if (authorAdded) {
          await pubsub.publish("AUTHOR_ADDED", { authorAdded: author })
        }
        return book
      } catch (error) {
        throw new GraphQLError('Failed to add book', {
          extensions: getErrorExtensions(error)
        })
      }
    },
    editAuthor: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHORIZED' }
        })
      }
      try {
        const author = await Author.findOne({ name: args.name })
        if (!author) {
          return null
        }
        author.born = args.setBornTo
        return await author.save()
      } catch (error) {
        throw new GraphQLError('Failed to edit author', {
          extensions: getErrorExtensions(error)
        })
      }
    },
    createUser: async (root, args) => {
      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre
      })
      return user.save()
        .catch(error => {
          throw new GraphQLError('Failed to create user', {
            extensions: getErrorExtensions(error)
          })
        })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      if (!user || args.password !== 'secret') {
        throw new GraphQLError('Invalid credentials', {
          extensions: {
            code: 'INVALID_CREDENTIALS'
          }
        })
      }
      return {
        value: jwt.sign({
          username: user.username,
          id: user._id
        }, process.env.JWT_SECRET)
      }
    }
  }
}

const getErrorExtensions = (error) => {
  if (error.code === 11000) {
    return { code: "BOOK_ALREADY_EXISTS" }
  }
  if (error.name === 'ValidationError') {
    return { code: "VALIDATION_ERROR", details: error.message }
  }
  return { code: "INTERNAL_SERVER_ERROR", details: error.message }
}

module.exports = resolvers