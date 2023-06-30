import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import PostFeed from './PostFeed'
import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config'

const CustomFeed = async () => {
  const session = await getAuthSession()

  const followedCommunities = await db.subscription.findMany({
    where: {
      userId: session?.user.id,
    },
    include: {
      subreddit: true,
    },
  })
  const posts = await db.post.findMany({
    where: {
      subreddit: {
        name: {
          in: followedCommunities.map(
            (followedCommunity) => followedCommunity.subredditId,
          ),
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      author: true,
      comments: true,
      subreddit: true,
      votes: true,
    },
    take: INFINITE_SCROLL_PAGINATION_RESULTS,
  })
  return <PostFeed initialPosts={posts} />
}

export default CustomFeed
