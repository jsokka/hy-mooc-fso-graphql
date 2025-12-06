const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { GraphQLError } = require('graphql/error')
const { mongoose } = require('mongoose')
const jwt = require('jsonwebtoken')
const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')

require('dotenv').config()

const MONGODB_URI = process.env.MONGODB_URI

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

const typeDefs = /* gql */`
  type Query {
    booksCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
    genres: [String!]!
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book!
    editAuthor(name: String!, setBornTo: Int!): Author
    createUser(
      username: String!
      favoriteGenre: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
  } 

  type Book {
    id: ID!
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
  }

  type Author {
    id: ID!
    name: String!
    born: Int
    bookCount: Int!
  }

  type User {
  username: String!
  favoriteGenre: String!
  recommendations: [Book!]!
  id: ID!
}

  type Token {
    value: String!
  }
`

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
    author: async (root) => {
      return await Author.findById(root.author)
    }
  },
  Author: {
    bookCount: async (root) => {
      return await Book.countDocuments({ author: root._id })
    }
  },
  User: {
    recommendations: async (root, args, { currentUser }) => {
      const favoriteGenre = currentUser.favoriteGenre
      return await Book.find({ genres: { $in: [favoriteGenre] } })
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
        let author = await Author.findOne({ name: args.author })
        if (!author) {
          author = await new Author({ name: args.author }).save()
        }
        return await new Book({ ...args, author: author._id }).save()
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

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req, res }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.startsWith('Bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), process.env.JWT_SECRET
      )
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  }
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})