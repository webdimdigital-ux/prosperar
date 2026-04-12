import { gql } from '@apollo/client/core'

export const GET_EXAMS = gql`
  query GetExams($filter: ExamFilterInput, $sort: ExamSortInput, $search: String, $first: Int, $page: Int) {
    exams(filter: $filter, sort: $sort, search: $search, first: $first, page: $page) {
      data {
        id name exam_date status cpf technician sex birth_date medico crm sex weight
        client { id name }
        hospital { id name }
      }
      paginatorInfo { total currentPage lastPage hasMorePages perPage }
    }
  }
`

export const UPLOAD_EXAM = gql`
  mutation UploadExam($input: UploadExamInput!) {
    uploadExam(input: $input) {
      total processed failed
      errors { page reason }
      exams { id name status }
    }
  }
`

export const UPDATE_EXAM_STATUS = gql`
  mutation UpdateExamStatus($id: ID!, $status: ExamStatus!) {
    updateExamStatus(id: $id, status: $status) {
      id status
    }
  }
`
