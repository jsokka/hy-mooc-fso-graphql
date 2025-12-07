import { gql } from '@apollo/client'

const BOOK_FRAGMENT = gql`
  fragment BookFields on Book {
    id
    title
    published
    genres
    author {
      id
      name
    }
  }
`

const AUTHOR_FRAGMENT = gql`
  fragment AuthorFields on Author {
      id
      name
      born
      bookCount
  }
`

export const ALL_BOOKS = gql`
  query GetAllBooks($genre: String) {
    allBooks(genre: $genre) {
      ...BookFields
    }
  }
  ${BOOK_FRAGMENT}
`

export const ALL_AUTHORS = gql`
  query {
    allAuthors {
      ...AuthorFields
    }
  }
  ${AUTHOR_FRAGMENT}
`

export const ADD_BOOK = gql`
  mutation addBook(
    $title: String!
    $author: String!
    $published: Int!
    $genres: [String!]!
  ) {
    addBook(
      title: $title
      author: $author
      published: $published
      genres: $genres
    ) {
      ...BookFields
    }
  }
  ${BOOK_FRAGMENT}
`

export const UPDATE_AUTHOR_BIRTH_YEAR = gql`
  mutation updateAuthorBirthYear($name: String!, $setBornTo: Int!) {
    editAuthor(name: $name, setBornTo: $setBornTo) {
      name
      born
    }
  }
`

export const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`

export const MY_RECOMMENDATIONS = gql`
  query MyRecommendations {
    me {
      favoriteGenre
      recommendations {
        ...BookFields
      }
    }
  }
  ${BOOK_FRAGMENT}
`

export const GENRES = gql`
  query {
    genres
  }
`

export const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      ...BookFields
    }
  }
  ${BOOK_FRAGMENT}
`

export const AUTHOR_ADDED = gql`
  subscription {
    authorAdded {
      ...AuthorFields
    }
  }
  ${AUTHOR_FRAGMENT}
`
