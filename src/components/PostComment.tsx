'use client'

import { useRef, useState } from 'react'
import UserAvatar from './UserAvatar'
import { Comment, CommentVote, User } from '@prisma/client'
import { formatTimeToNow } from '@/lib/utils'
import CommentVotes from './CommentVotes'
import { Button } from './ui/Button'
import { MessageSquare } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Label } from './ui/Label'
import { Textarea } from './ui/Textarea'
import { useMutation } from '@tanstack/react-query'
import { toast } from '@/hooks/use-toast'
import { CommentRequest } from '@/lib/validators/comment'
import axios, { AxiosError } from 'axios'
import { useCustomToast } from '@/hooks/use-custom-toast'

type ExtendedComment = Comment & {
  votes: CommentVote[]
  author: User
}

interface PostCommentProps {
  comment: ExtendedComment
  votesAmount: number
  currentVote: CommentVote | undefined
  postId: string
}

const PostComment = ({
  comment,
  votesAmount,
  currentVote,
  postId,
}: PostCommentProps) => {
  const commentRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { loginToast } = useCustomToast()
  const { data: session } = useSession()
  const [isReplying, setIsReplying] = useState<boolean>(false)
  const [input, setInput] = useState<string>('')
  const { mutate: replyComment, isLoading } = useMutation({
    mutationFn: async ({ postId, text, replyToId }: CommentRequest) => {
      const payload: CommentRequest = {
        postId,
        text,
        replyToId,
      }
      const { data } = await axios.patch('/api/subreddit/post/comment', payload)

      return data
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) return loginToast()
      }

      return toast({
        title: 'Houve um erro',
        description: 'Algo deu errado. Por favor, tente novamente.',
        variant: 'destructive',
      })
    },
    onSuccess: () => {
      router.refresh()
      setInput('')
      setIsReplying(false)
    },
  })

  return (
    <div ref={commentRef} className="flex flex-col">
      <div className="flex items-center">
        <UserAvatar
          user={{
            name: comment.author.name || null,
            image: comment.author.image || null,
          }}
        />

        <div className="ml-2 flex items-center gap-x-2">
          <p className="text-sm font-medium text-gray-900">
            u/{comment.author.username}
          </p>
          <p className="max-h-40 truncate text-xs text-zinc-500">
            {formatTimeToNow(new Date(comment.createdAt))}
          </p>
        </div>
      </div>

      <p className="mt-2 text-sm text-zinc-900">{comment.text}</p>

      <div className="flex flex-wrap items-center gap-2">
        <CommentVotes
          commentId={comment.id}
          initialVotesAmount={votesAmount}
          initialVote={currentVote}
        />

        <Button
          onClick={() => {
            if (!session?.user) return router.push('/sign-in')
            setIsReplying(true)
          }}
          variant={'ghost'}
          size="xs"
          aria-label="responder"
        >
          <MessageSquare className="mr-1.5 h-4 w-4" /> Responder
        </Button>
        {isReplying && (
          <div className="grid w-full gap-1.5">
            <Label>
              Comentar como{' '}
              <a
                href={`/user/${session?.user.username}`}
                className="text-blue-700 hover:underline"
              >
                {session?.user.username}
              </a>{' '}
            </Label>
            <div className="mt-2">
              <Textarea
                id="comment"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                }}
                rows={1}
                placeholder="No que você está pensando?"
              />
              <div className="mt-2 flex justify-end gap-2">
                <Button
                  tabIndex={-1}
                  variant={'subtle'}
                  onClick={() => setIsReplying(false)}
                >
                  Cancelar
                </Button>
                <Button
                  isLoading={isLoading}
                  disabled={input.length === 0}
                  onClick={() => {
                    if (!input) return
                    replyComment({
                      postId,
                      text: input,
                      replyToId: comment.replyToId ?? comment.id,
                    })
                  }}
                >
                  Comentar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PostComment
