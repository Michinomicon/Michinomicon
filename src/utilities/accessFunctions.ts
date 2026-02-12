import { User } from '@/payload-types'
import type { Access } from 'payload'

type AccessType = 'create' | 'read' | 'upd' | 'del'

const getUserRoleID = (user: User): string | undefined => {
  if (user.role && typeof user.role === 'object') {
    return user.role.id
  }
}

export const hasAccess =
  (collection: string, access_type: AccessType): Access =>
  async ({ req: { user, payload } }) => {
    console.log(user)
    console.log(`Checking access for collection: ${collection}, access type: ${access_type}`)
    if (user) {
      if (user.admin) {
        return true
      }

      if (user.role && access_type) {
        const collectionIDs = await payload.find({
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

        const rights = await payload.find({
          select: {
            'rights-list': true,
          },
          collection: 'rights',
          pagination: false,
          limit: 1,
          where: {
            id: {
              equals: getUserRoleID(user),
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

            if (access_type === 'create') {
              const right_own: boolean = Boolean(rights['create-collection-own']) || false
              return right_own
            }
            if (access_type === 'read') {
              const right_own: boolean = Boolean(rights['read-collection-own']) || false
              const right_others: boolean = Boolean(rights['read-collection-others']) || false

              return right_own && canAccessOthersOrSelf(Boolean(right_others), user.id)
            }
            if (access_type === 'upd') {
              const right_own: boolean = Boolean(rights['upd-collection-own']) || false
              const right_others: boolean = Boolean(rights['upd-collection-others']) || false

              return right_own && canAccessOthersOrSelf(Boolean(right_others), user.id)
            }
            if (access_type === 'del') {
              const right_own: boolean = Boolean(rights['del-collection-own']) || false
              const right_others: boolean = Boolean(rights['del-collection-others']) || false
              console.log(
                'delete access',
                right_own && canAccessOthersOrSelf(Boolean(right_others), user.id),
              )
              return right_own && canAccessOthersOrSelf(Boolean(right_others), user.id)
            }
          }
        }
      }
    }
    return false
  }

const canAccessOthersOrSelf = (accessOthers: boolean, userid: string) => {
  if (accessOthers) {
    return true
  }

  return { id: { equals: userid } }
}
