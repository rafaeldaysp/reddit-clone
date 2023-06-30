'use client'

import { useForm } from 'react-hook-form'
import { UsernameRequest, usernameValidator } from '@/lib/validators/username'
import { zodResolver } from '@hookform/resolvers/zod'
import { User } from '@prisma/client'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/Card'
import { Label } from './ui/Label'
import { Input } from './ui/Input'
import { Button } from './ui/Button'
import { useMutation } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import { toast } from '@/hooks/use-toast'

interface UsernameProps {
  user: Pick<User, 'id' | 'username'>
}

const UsernameForm = ({ user }: UsernameProps) => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<UsernameRequest>({
    resolver: zodResolver(usernameValidator),
    defaultValues: {
      name: user.username || '',
    },
  })

  const { mutate: changeUsername, isLoading } = useMutation({
    mutationFn: async ({ name }: UsernameRequest) => {
      const payload: UsernameRequest = { name }

      const { data } = await axios.patch(`/api/username`, payload)

      return data
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 409) {
          return toast({
            title: 'Nome de exibição já em uso.',
            description:
              'Esse nome já está em uso. Por favor, escolha um nome diferente.',
            variant: 'destructive',
          })
        }
      }
      return toast({
        title: 'Algo deu errado',
        description:
          'Não foi possível alterar seu nome de exibição. Por favor, tente novamente mais tarde.',
        variant: 'destructive',
      })
    },
    onSuccess: () => {
      toast({
        title: 'Sucesso',
        description: 'Nome de exibição alterado com sucesso.',
      })
    },
  })
  return (
    <form
      onSubmit={handleSubmit((data) => {
        changeUsername(data)
      })}
    >
      <Card>
        <CardHeader>
          <CardTitle>Seu nome de usuário</CardTitle>
          <CardDescription>Insira um nome de exibição desejado</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="relative grid gap-1">
            <div className="absolute left-0 top-0 grid h-10 w-8 place-items-center">
              <span className="text-sm text-zinc-400">u/</span>
            </div>
            <Label className="sr-only" htmlFor="name"></Label>
            <Input
              id="name"
              size={32}
              className="w-[400px] pl-6"
              {...register('name')}
            />
            {errors.name && (
              <p className="px-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <Button isLoading={isLoading}>Alterar</Button>
        </CardFooter>
      </Card>
    </form>
  )
}

export default UsernameForm
