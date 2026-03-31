import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import RichText from '@/components/RichText'

export default async function WikiPage({
  params,
}: {
  params: { slug: Promise<{ slug: string }> }
}) {
  const { slug } = await params

  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'wiki-pages',
    where: {
      slug: { equals: slug },
    },
    limit: 1,
  })

  const page = docs[0]
  if (!page) return notFound()

  return (
    <article className="prose dark:prose-invert">
      <h1>{page.title}</h1>
      <RichText enableGutter={false} data={page.content} />
    </article>
  )
}
