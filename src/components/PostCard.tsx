import { formatTimeToNow } from '@/lib/utils'
import { Post, User, Vote } from '@prisma/client'
import { MessageSquare } from 'lucide-react'
import { useRef } from 'react'
import EditorOutput from './EditorOutput'
import PostVoteClient from './post-vote/PostVoteClient'

type PartialVote = Pick<Vote, 'type'>

interface PostProps {
  subredditName: string
  post: Post & {
    author: User
    votes: Vote[]
  }
  commentAmount: number
  votesAmount: number
  currentVote?: PartialVote
}

const PostCard = ({
  subredditName,
  post,
  commentAmount,
  votesAmount,
  currentVote,
}: PostProps) => {
  const postRef = useRef<HTMLParagraphElement>(null)
  return (
    <div className="rounded-md bg-white shadow">
      <div className="flex justify-between px-6 py-4">
        <PostVoteClient
          postId={post.id}
          initialVote={currentVote?.type}
          initialVotesAmount={votesAmount}
        />
        <div className="w-0 flex-1">
          <div className="mt-1 max-h-40 text-xs text-gray-500">
            {subredditName && (
              <>
                <a
                  href={`/r/${subredditName}`}
                  className="text-sm text-zinc-900 underline underline-offset-2"
                >
                  r/{subredditName}
                </a>
                <span className="px-1 text-[8px]">•</span>
              </>
            )}
            <span>Enviado por u/{post.author.username}</span>{' '}
            {formatTimeToNow(new Date(post.createdAt))}
          </div>
          <a href={`/r/${subredditName}/post/${post.id}`}>
            <h1 className="py-2 text-lg font-semibold leading-6 text-gray-900">
              {post.title}
            </h1>
          </a>
          <div
            className="relative max-h-40 w-full overflow-clip text-sm"
            ref={postRef}
          >
            {/* <EditorOutput content={post.content} /> */}
            {postRef?.current?.clientHeight === 160 ? (
              <div className="absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-white to-transparent" />
            ) : null}
          </div>
        </div>
      </div>

      <div className="z-20 bg-gray-50 p-4 text-sm sm:px-6">
        <a
          className="flex w-fit items-center gap-2"
          href={`/r/${subredditName}/post/${post.id}`}
        >
          <MessageSquare className="h-4 w-4" />
          {commentAmount} comentários
        </a>
      </div>
    </div>
  )
}

export default PostCard
