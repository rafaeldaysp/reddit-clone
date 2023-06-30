'use client'

import { useMutation } from '@tanstack/react-query'
import { Button } from './ui/Button'
import { SubscribeSubredditPayload } from '@/lib/validators/subreddit'
import axios, { AxiosError } from 'axios'
import { useCustomToast } from '@/hooks/use-custom-toast'
import { toast } from '@/hooks/use-toast'
import { startTransition } from 'react'
import { useRouter } from 'next/navigation'

interface SubscribeLeaveToggleProps {
  subredditId: string
  subredditName: string
  isSubscribed: boolean
}

const SubscribeLeaveToggle = ({
  subredditId,
  subredditName,
  isSubscribed,
}: SubscribeLeaveToggleProps) => {
  const { loginToast } = useCustomToast()
  const router = useRouter()
  const { mutate: subscribe, isLoading: isSubLoading } = useMutation({
    mutationFn: async () => {
      const payload: SubscribeSubredditPayload = {
        subredditId,
      }

      const { data } = await axios.post('/api/subreddit/subscribe', payload)

      return data as string
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
      startTransition(() => {
        router.refresh()
      })
      return toast({
        title: 'Sucesso!',
        description: `Você agora é membro da comunidade r/${subredditName}.`,
      })
    },
  })

  const { mutate: unsubscribe, isLoading: isUnsubLoading } = useMutation({
    mutationFn: async () => {
      const payload: SubscribeSubredditPayload = {
        subredditId,
      }

      const { data } = await axios.post('/api/subreddit/unsubscribe', payload)

      return data as string
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
      startTransition(() => {
        router.refresh()
      })
      return toast({
        title: 'Sucesso!',
        description: `Você se desinscreveu da comunidade r/${subredditName} com sucesso.`,
      })
    },
  })

  return isSubscribed ? (
    <Button
      onClick={() => unsubscribe()}
      isLoading={isUnsubLoading}
      className="mb-4 mt-1 w-full"
    >
      Deixar comunidade
    </Button>
  ) : (
    <Button
      onClick={() => subscribe()}
      className="mb-4 mt-1 w-full"
      isLoading={isSubLoading}
    >
      Unir-se à comunidade
    </Button>
  )
}

export default SubscribeLeaveToggle
