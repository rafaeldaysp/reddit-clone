'use client'

import { useState } from 'react'
import { Label } from './ui/Label'
import { Textarea } from './ui/Textarea'
import { Button } from './ui/Button'
import { useMutation } from '@tanstack/react-query'
import { CommentRequest } from '@/lib/validators/comment'
import axios, { AxiosError } from 'axios'
import { toast } from '@/hooks/use-toast'
import { useCustomToast } from '@/hooks/use-custom-toast'
import error from 'next/error'
import { useRouter } from 'next/navigation'

interface CreateCommentProps {
  username?: string | null
  postId: string
  replyToId?: string
}

const CreateComment = ({ username, postId, replyToId }: CreateCommentProps) => {
  const [input, setInput] = useState<string>('')
  const { loginToast } = useCustomToast()
  const router = useRouter()

  const { mutate: comment, isLoading } = useMutation({
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
    },
  })

  return (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="comment">
        Comentar como{' '}
        <a href={`/user/${username}`} className="text-blue-700 hover:underline">
          {username}
        </a>
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
        <div className="mt-2 flex justify-end">
          <Button
            isLoading={isLoading}
            disabled={input.length === 0}
            onClick={() => comment({ postId, text: input, replyToId })}
          >
            Comentar
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CreateComment
