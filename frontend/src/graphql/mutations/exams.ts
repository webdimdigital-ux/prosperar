import { gql } from '@apollo/client/core'

export const UPDATE_EXAM_STATUS = gql`
  mutation UpdateExamStatus($id: ID!, $status: ExamStatus!) {
    updateExamStatus(id: $id, status: $status) {
      id status
    }
  }
`

export const DELETE_EXAM = gql`
  mutation DeleteExam($id: ID!) {
    deleteExam(id: $id)
  }
`

export const DELETE_EXAMS = gql`
  mutation DeleteExams($ids: [ID!]!) {
    deleteExams(ids: $ids)
  }
`
