import { gql } from 'apollo-boost'

export const getProfileById = gql`
query Profile($id: ID!){
  profile(id: $id) {
    id
    addr
    commitTime
    url,
    profileId,
    type,
    name
    pledgesInfos {
      id
      token
      lifetimeReceived
      balance
    }
  }
}
`
