import { gql } from 'apollo-boost'

export const pledgeLifetimeReceived = gql`
fragment PledgeLifetimeReceived on PledgesInfo {
  lifetimeReceived
}
`
export const pledgesInfosFields = gql`
${pledgeLifetimeReceived}
fragment PledgesInfoFields on PledgesInfo {
  id
  ...PledgeLifetimeReceived
  token
}
`

export const getProfileById = gql`
${pledgesInfosFields}

query Profile($id: ID!) {
  profile(id: $id) {
    id
    addr
    commitTime
    url
    profileId
    type
    name
    creationTime
    pledgesInfos {
      ...PledgesInfoFields
    }
    projectInfo {
      id
      title
      subtitle
      creator
      repo
      avatar
      goal
      goalToken
      description
      chatRoom
      file
      type
      isPlaying
    }
  }
}
`
export const getProjects = gql`
${pledgesInfosFields}

query Projects($type: String! = "PROJECT", $limit: Int, $offset: Int){
  profiles(where: {type: $type, projectInfo_not: null}, first: $limit, skip: $offset) {
    id
    addr
    canceled
    commitTime
    type
    url
    profileId
    creationTime
    projectInfo {
      id
      title
      subtitle
      creator
      goalToken
      goal
    }
    pledgesInfos{
     ...PledgesInfoFields
    }
  }
}
`
