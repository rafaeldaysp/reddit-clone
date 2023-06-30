import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import PostComment from './PostComment'
import CreateComment from './CreateComment'

interface CommentSectionProps {
  postId: string
}

const CommentSection = async ({ postId }: CommentSectionProps) => {
  const session = await getAuthSession()
  const user = await db.user.findUnique({
    where: {
      id: session?.user.id,
    },
  })
  const comments = await db.comment.findMany({
    where: {
      postId,
      replyToId: null,
    },
    include: {
      author: true,
      votes: true,
      replies: {
        include: {
          author: true,
          votes: true,
        },
      },
    },
  })
  return (
    <div className="mt-4 flex flex-col gap-y-4">
      <hr className="my-6 h-px w-full" />
      <CreateComment username={user?.username} postId={postId} />
      <div className="mt-4 flex flex-col gap-y-8">
        {comments
          .filter((comment) => !comment.replyToId)
          .map((topLevelComment) => {
            const topLevelCommentAmmount = topLevelComment.votes.reduce(
              (acc, vote) => {
                if (vote.type === 'UP') return acc + 1
                if (vote.type === 'DOWN') return acc - 1
                return acc
              },
              0,
            )
            const topLevelCommentVote = topLevelComment.votes.find(
              (vote) => vote.userId === session?.user.id,
            )
            return (
              <div key={topLevelComment.id} className="flex flex-col">
                <PostComment
                  postId={postId}
                  currentVote={topLevelCommentVote}
                  votesAmount={topLevelCommentAmmount}
                  comment={topLevelComment}
                />

                {topLevelComment.replies
                  .sort((a, b) => b.votes.length - a.votes.length)
                  .map((reply) => {
                    const replyVotesAmmount = reply.votes.reduce(
                      (acc, vote) => {
                        if (vote.type === 'UP') return acc + 1
                        if (vote.type === 'DOWN') return acc - 1
                        return acc
                      },
                      0,
                    )
                    const replyVote = reply.votes.find(
                      (vote) => vote.userId === session?.user.id,
                    )
                    return (
                      <div
                        className="ml-2 border-l-2 border-x-zinc-200 py-2 pl-4"
                        key={reply.id}
                      >
                        <PostComment
                          comment={reply}
                          currentVote={replyVote}
                          votesAmount={replyVotesAmmount}
                          postId={postId}
                        />
                      </div>
                    )
                  })}
              </div>
            )
          })}
      </div>
    </div>
  )
}

export default CommentSection
