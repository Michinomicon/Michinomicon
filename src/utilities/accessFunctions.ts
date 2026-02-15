import type { Access, BasePayload, PaginatedDocs, TypedUser } from 'payload'
import { isObject } from './deepMerge'
import { Slug } from '@/payload-types'

export type AccessType = 'create' | 'read' | 'upd' | 'del'

export const hasAccess =
  (collection: string, access_type: AccessType): Access =>
  async ({ req: { user, payload } }) => {
    const reqUser: TypedUser | null = user
    const reqPayload: BasePayload = payload
    const accessType: AccessType = access_type

    // console.log(
    //   `Checking access:
    //     Collection:   "${collection}"
    //     Access Type:  "${accessType}"
    //     User:         "${reqUser ? JSON.stringify(reqUser) : null}"
    //   `,
    // )

    try {
      if (reqUser) {
        if (reqUser.admin) {
          return true
        }

        if (reqUser.role && accessType) {
          const collectionIDs: PaginatedDocs<Slug> = await reqPayload.find({
            collection: 'slugs',
            where: {
              slug: {
                equals: collection,
              },
            },
          })

          if (collectionIDs.totalDocs === 0) {
            return false
          }

          const collecID = collectionIDs.docs[0].id
          const userRoleId = isObject(reqUser.role) ? reqUser.role.id : undefined

          const rights = await reqPayload.find({
            select: {
              'rights-list': true,
            },
            collection: 'rights',
            pagination: false,
            limit: 1,
            where: {
              id: {
                equals: userRoleId,
              },
              'rights-list.collections': {
                in: [collecID],
              },
            },
          })

          console.log('Fetched rights:', rights)
          console.log(collecID)

          if (rights.totalDocs > 0) {
            const rights_list = rights.docs[0]['rights-list']

            console.log('rights_list', rights_list)

            const collection_rights = rights_list?.filter((right) => {
              return (
                right.collections?.filter((col) =>
                  typeof col === 'string' ? col === collecID : col.id === collecID,
                ).length || 0 > 0
              )
            })

            if (collection_rights && collection_rights.length > 0) {
              const rights = collection_rights[0]
              const userId = reqUser.id

              switch (accessType) {
                case 'create':
                  const right_own: boolean = Boolean(rights['create-collection-own']) || false
                  return right_own
                case 'del':
                  const del_right_own: boolean = Boolean(rights['del-collection-own']) || false
                  const del_right_others: boolean =
                    Boolean(rights['del-collection-others']) || false
                  console.log(
                    'delete access',
                    del_right_own && canAccessOthersOrSelf(Boolean(del_right_others), userId),
                  )
                  return del_right_own && canAccessOthersOrSelf(Boolean(del_right_others), userId)
                case 'read':
                  const read_right_own: boolean = Boolean(rights['read-collection-own']) || false
                  const read_right_others: boolean =
                    Boolean(rights['read-collection-others']) || false
                  console.log(
                    'read access',
                    read_right_own && canAccessOthersOrSelf(Boolean(read_right_others), userId),
                    rights,
                  )
                  return read_right_own && canAccessOthersOrSelf(Boolean(read_right_others), userId)
                case 'upd':
                  const upd_right_own: boolean = Boolean(rights['upd-collection-own']) || false
                  const upd_right_others: boolean =
                    Boolean(rights['upd-collection-others']) || false

                  return upd_right_own && canAccessOthersOrSelf(Boolean(upd_right_others), userId)
              }
            }
          }
        }
      }
    } catch (err) {
      console.log(`Error checking user access`, err)
    }
    return false
  }

const canAccessOthersOrSelf = (accessOthers: boolean, userid: string) => {
  if (accessOthers) {
    return true
  }

  return { id: { equals: userid } }
}
