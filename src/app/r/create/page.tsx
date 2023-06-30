'use client'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import { CreateSubredditPayload } from '@/lib/validators/subreddit'
import { toast } from '@/hooks/use-toast'
import { useCustomToast } from '@/hooks/use-custom-toast'

const Page = () => {
  const [input, setInput] = useState<string>('')
  const router = useRouter()
  const { loginToast } = useCustomToast()

  const { mutate: createCommunity, isLoading } = useMutation({
    mutationFn: async () => {
      const payload: CreateSubredditPayload = {
        name: input,
      }
      const { data } = await axios.post('/api/subreddit', payload)
      return data as string
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 409) {
          return toast({
            title: 'Comunidade já existe',
            description:
              'Esse nome já está em uso. Por favor, escolha um nome diferente para uma nova comunidade.',
            variant: 'destructive',
          })
        }

        if (error.response?.status === 422) {
          return toast({
            title: 'Nome inválido',
            description: 'Por favor, escolha um nome entre 3 a 21 caracteres.',
            variant: 'destructive',
          })
        }
        if (error.response?.status === 401) {
          return loginToast()
        }
      }

      toast({
        title: 'Houve um erro',
        description: 'Não foi possível criar uma comunidade.',
      })
    },
    onSuccess: (data) => {
      router.push(`/r/${data}`)
    },
  })

  return (
    <div className="container mx-auto flex h-full max-w-3xl items-center">
      <div className="relative h-fit w-full space-y-6 rounded-lg bg-white p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Nova comunidade</h1>
        </div>

        <hr className="h-px bg-zinc-500" />
        <div>
          <p className="text-lg font-medium">Nome</p>
          <p className="pb-2 text-xs">
            O nome de uma comunidade não poderá ser alterado.
          </p>

          <div className="relative">
            <p className="absolute inset-y-0 left-0 grid w-8 place-items-center text-sm text-zinc-400">
              r/
            </p>

            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="pl-6"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="subtle" onClick={() => router.back()}>
            Cancelar
          </Button>

          <Button
            isLoading={isLoading}
            onClick={() => createCommunity()}
            disabled={input.length === 0}
          >
            Criar comunidade
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Page
