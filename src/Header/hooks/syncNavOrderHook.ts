// import { MainMenu } from '@/payload-types'
// import type { GlobalAfterChangeHook } from 'payload'

// export const syncNavOrderHook: GlobalAfterChangeHook = async ({ doc, req: { payload } }) => {
//   if (!doc?.navItems) return doc

//   // Helper function to iterate and update documents
//   const updatePriorities = async (items: string | NonNullable<MainMenu['menuItems']>[number][]) => {
//     console.log('syncNavOrderHook.updatePriorities => items', items)
//     if (!Array.isArray(items)) return

//     for (let i = 0; i < items.length; i++) {
//       const item = items[i]

//       if (item.reference && item.reference.value) {
//         const collection: 'categories' | 'pages' = item.reference.relationTo
//         const id: string =
//           typeof item.reference.value === 'object' ? item.reference.value.id : item.reference.value

//         try {
//           // Update the underlying document with its new index
//           await payload.update({
//             collection,
//             id,
//             data: {
//               sortPriority: i,
//             },
//           })
//         } catch (error) {
//           console.error(`Failed to update sortPriority for ${collection} ${id}`, error)
//         }
//       }

//       // If you are using nested children in the Global, recurse through them
//       if (item.children && item.children.length > 0) {
//         console.log('item.children', item.children)
//         await updatePriorities(item.children)
//       }
//     }
//   }

//   // Fire the update process
//   await updatePriorities(doc.navItems)

//   return doc
// }
