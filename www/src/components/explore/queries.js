import { gql } from '@apollo/client'

import { InstallationFragment, RepoFragment } from '../../models/repo'
import { PageInfo } from '../../models/misc'

export const EXPLORE_QUERY = gql`
  query Repos($publisherId: ID, $tag: String, $cursor: String) {
    repositories(publisherId: $publisherId, tag: $tag, after: $cursor, first: 50) {
      pageInfo {
        ...PageInfo
      }
      edges {
        node {
          ...RepoFragment
          installation {
            ...InstallationFragment
          }
          tags {
            tag
          }
        }
      }
    }
  }
  ${PageInfo}
  ${RepoFragment}
  ${InstallationFragment}
`
