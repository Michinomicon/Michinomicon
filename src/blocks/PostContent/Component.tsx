import type { Post, PostContentBlock as PostContentBlockProps } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import RichText from '@/components/RichText'

export const PostContentBlock: React.FC<
  PostContentBlockProps & {
    id?: string
  }
> = async (props) => {
  const {
    id,
    categories,
    limit: limitFromProps,
    populateBy,
    selectedDocs,
    showTitle = true,
    showAuthor = false,
    showDate = false,
    showCategories = false,
  } = props

  const limit = limitFromProps || 10
  let posts: Post[] = []

  if (populateBy === 'collection') {
    const payload = await getPayload({ config: configPromise })

    const flattenedCategories = categories?.map((category) => {
      if (typeof category === 'object') return category.id
      else return category
    })

    const fetchedPosts = await payload.find({
      collection: 'posts',
      depth: 1,
      limit,
      ...(flattenedCategories && flattenedCategories.length > 0
        ? {
            where: {
              categories: {
                in: flattenedCategories,
              },
            },
          }
        : {}),
    })

    posts = fetchedPosts.docs
  } else {
    if (selectedDocs?.length) {
      const filteredSelectedPosts = selectedDocs.map((post) => {
        if (typeof post.value === 'object') return post.value
      }) as Post[]

      posts = filteredSelectedPosts
    }
  }

  return (
    <div className="my-16 post-content-block" id={`block-${id}`}>
      <div className="container">
        {posts.map((post, index) => {
          const authors = post.populatedAuthors || []

          const formattedDate = post.publishedAt
            ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })
            : null

          const categoryTags = (post.categories || [])
            .map((cat) => (typeof cat === 'object' && cat !== null ? cat.title : null))
            .filter(Boolean)

          const anchorId = post.slug || `post-${post.id}`

          return (
            <div key={post.id || index} className="mb-24 last:mb-0 border-b pb-16 last:border-b-0">
              <div className="mb-8">
                {showTitle && (
                  <h2
                    id={anchorId}
                    className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-foreground scroll-mt-48"
                  >
                    {post.title}
                  </h2>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {/* Conditionally render Author */}
                  {showAuthor && authors.length > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-foreground">By:</span>
                      {authors.map((a) => a.name).join(', ')}
                    </div>
                  )}

                  {/* Conditionally render Date */}
                  {showDate && formattedDate && (
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-foreground">Published:</span>
                      <time dateTime={post.publishedAt!}>{formattedDate}</time>
                    </div>
                  )}

                  {/* Conditionally render Categories */}
                  {showCategories && categoryTags.length > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-foreground">Categories:</span>
                      {categoryTags.join(', ')}
                    </div>
                  )}
                </div>
              </div>

              {post.content && (
                <div className="prose dark:prose-invert max-w-none">
                  <RichText data={post.content} enableGutter={false} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
