const DataLoader = require('dataloader')
const Author = require('./models/author')
const Book = require('./models/book')

const authorsBookCountLoader = new DataLoader((async (authorIds) => {
  const distinctIds = [...new Set(authorIds.map(id => id.toString()))]
  const books = await Book.find({ author: { $in: distinctIds } })
    .select('author')
  return authorIds.map(authorId =>
    books.filter(book => book.author.toString() === authorId.toString()).length
  )
}))

const authorsLoader = new DataLoader(async (authorIds) => {
  const distinctIds = [...new Set(authorIds.map(id => id.toString()))]
  const authors = await Author.find({ _id: { $in: distinctIds } })
  return authorIds.map(authorId => authors.find(author => author._id.toString() === authorId.toString()))
})

module.exports = { authorsLoader, authorsBookCountLoader }