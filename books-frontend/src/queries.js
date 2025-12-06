import { gql } from '@apollo/client'

export const ALL_BOOKS = gql`
  query GetAllBooks($genre: String) {
    allBooks(genre: $genre) {
      id
      title
      published
      genres
      author {
        name
      }
    }
  }
`

export const ALL_AUTHORS = gql`
  query {
    allAuthors {
      id
      name
      born
      bookCount
    }
  }
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
      title
      author {
        name
      }
      published
      genres
    }
  }
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
        id
        title
        author {
          name
        }
        published
      }
    }
  }
`
export const GENRES = gql`
  query {
    genres
  }
`
