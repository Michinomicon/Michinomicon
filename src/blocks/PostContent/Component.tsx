import type { Post, PostContentBlock as PostContentBlockProps } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import RichText from '@/components/RichText'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import Link from 'next/link'

function formatPostDate(dateString: string | null | undefined): string | null {
  return dateString
    ? new Date(dateString).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null
}

function getPostDates(post: Post) {
  return {
    publishedAt: formatPostDate(post.publishedAt),
    createdAt: formatPostDate(post.createdAt),
    updatedAt: formatPostDate(post.updatedAt),
  }
}

function sortPosts(
  posts: Post[],
  sortPostsBy: PostContentBlockProps['sortPostsBy'],
  sortDir: PostContentBlockProps['sortDir'],
): Post[] {
  if (sortPostsBy === 'title') {
    posts.sort((a, b) => {
      if (a.title && b.title) {
        if (sortDir === 'desc') {
          return b.title.localeCompare(a.title)
        }
        return a.title.localeCompare(b.title)
      }
      return 0
    })
  } else if (sortPostsBy === 'publishedAt') {
    posts.sort((a, b) => {
      if (a.publishedAt && b.publishedAt) {
        if (sortDir === 'desc') {
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        }
        return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
      }
      return 0
    })
  } else if (sortPostsBy === 'createdAt') {
    posts.sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        if (sortDir === 'desc') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        }
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }
      return 0
    })
  } else if (sortPostsBy === 'updatedAt') {
    posts.sort((a, b) => {
      if (a.updatedAt && b.updatedAt) {
        if (sortDir === 'desc') {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        }
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      }
      return 0
    })
  }

  return posts
}

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
    showUpdatedDate = false,
    showCreatedDate = false,
    showPublishedDate = false,
    showCategories = false,
    sortPostsBy = 'title',
    sortDir = 'asc',
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
    <div className="post-content-block my-16" id={`block-${id}`}>
      <div className="container">
        {sortPosts(posts, sortPostsBy, sortDir).map((post, index) => {
          const authors = post.populatedAuthors || []

          const formattedPostDates = getPostDates(post)

          const categoryTags = (post.categories || [])
            .map((cat) => (typeof cat === 'object' && cat !== null ? cat.title : null))
            .filter(Boolean)

          return (
            <div
              id={post.id}
              key={post.id || index}
              data-post="true"
              data-post-slug={post.slug}
              className="mb-24 border-b pb-16 last:mb-0 last:border-b-0"
            >
              <div className="mb-8">
                {showTitle && (
                  <div
                    className={
                      'group mb-4 flex w-full items-center justify-items-start gap-1 hover:bg-black/5'
                    }
                  >
                    <h2
                      id={post.slug}
                      data-post-title="true"
                      className="mb-0 scroll-mt-48 text-3xl font-bold tracking-tight text-foreground md:text-4xl"
                    >
                      <span>{post.title}</span>{' '}
                    </h2>

                    <Tooltip delayDuration={800} disableHoverableContent={true}>
                      <TooltipTrigger>
                        <Button
                          variant={'ghost'}
                          size={'icon'}
                          className="opacity-0 transition-opacity group-hover:opacity-100"
                          asChild
                        >
                          <Link href={`posts/${post.slug}`} target={'_blank'}>
                            <ExternalLink size={38} />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Open {post.title} in new tab.</TooltipContent>
                    </Tooltip>
                  </div>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {/* Conditionally render Author */}
                  {showAuthor && authors.length > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-foreground">By:</span>
                      {authors.map((a) => a.name).join(', ')}
                    </div>
                  )}

                  {/* Conditionally render Published at Date */}
                  {showPublishedDate && formattedPostDates.publishedAt && (
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-foreground">Published:</span>
                      <time dateTime={post.publishedAt!}>{formattedPostDates.publishedAt}</time>
                    </div>
                  )}

                  {/* Conditionally render Updated at Date */}
                  {showUpdatedDate && formattedPostDates.updatedAt && (
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-foreground">Updated:</span>
                      <time dateTime={post.updatedAt!}>{formattedPostDates.updatedAt}</time>
                    </div>
                  )}

                  {/* Conditionally render Created at Date */}
                  {showCreatedDate && formattedPostDates.createdAt && (
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-foreground">Created:</span>
                      <time dateTime={post.createdAt!}>{formattedPostDates.createdAt}</time>
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
                <div className="prose max-w-none dark:prose-invert">
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
