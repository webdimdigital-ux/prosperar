import { gql } from '@apollo/client/core'

export const GET_HOSPITALS = gql`
  query GetHospitals($search: String, $filter: HospitalFilterInput, $sort: HospitalSortInput, $first: Int, $page: Int) {
    hospitals(search: $search, filter: $filter, sort: $sort, first: $first, page: $page) {
      data { id name cnpj city state phone email status }
      paginatorInfo { total currentPage lastPage hasMorePages perPage }
    }
  }
`

export const CREATE_HOSPITAL = gql`
  mutation CreateHospital($input: HospitalInput!) {
    createHospital(input: $input) {
      id name cnpj
    }
  }
`

export const UPDATE_HOSPITAL = gql`
  mutation UpdateHospital($id: ID!, $input: HospitalInput!) {
    updateHospital(id: $id, input: $input) {
      id name cnpj status
    }
  }
`
