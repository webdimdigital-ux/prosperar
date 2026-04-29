import { gql } from '@apollo/client/core'

export const GET_CLIENTS = gql`
  query GetClients($search: String, $filter: ClientFilterInput, $sort: ClientSortInput, $first: Int, $page: Int) {
    clients(search: $search, filter: $filter, sort: $sort, first: $first, page: $page) {
      data { id name email cpf phone birth_date status created_at }
      paginatorInfo { total currentPage lastPage hasMorePages perPage }
    }
  }
`

export const CREATE_CLIENT = gql`
  mutation CreateClient($input: CreateClientInput!) {
    createClient(input: $input) {
      id name email cpf
    }
  }
`

export const UPDATE_CLIENT = gql`
  mutation UpdateClient($id: ID!, $input: UpdateClientInput!) {
    updateClient(id: $id, input: $input) {
      id name email phone birth_date status
    }
  }
`

export const DELETE_CLIENT = gql`
  mutation DeleteClient($id: ID!) {
    deleteClient(id: $id)
  }
`
