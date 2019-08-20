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
    name,
    creationTime,
    pledgesInfos {
      id
      token
      lifetimeReceived
      balance
    }
    projectInfo{
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
query Projects($type: String! = "PROJECT"){
  profiles(first: 5, where: {type: $type}) {
    id
    addr
    canceled
    commitTime
    type
    url
    profileId
    projectInfo {
      id
      title
      subtitle
      creator
    }
  }
}
`
