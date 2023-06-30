import Link from 'next/link'
import { Icons } from './Icons'
import UserAuthForm from './UserAuthForm'

const SignIn = () => {
  return (
    <div className="container mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
      <div className="flex flex-col space-y-2 text-center">
        <Icons.logo className="mx-auto h-6 w-6" />
        <h1 className="text-2xl font-semibold tracking-tight">
          Entrar no Reddit Clone
        </h1>
        <p className="mx-auto max-w-xs text-sm">
          Ao continuar, você está entrando em sua conta no Reddit Clone e
          concorda com nossas Políticas de Privacidade.
        </p>

        <UserAuthForm />

        <p className="px-8 text-center text-sm text-zinc-700">
          Novo no Reddit Clone?{' '}
          <Link
            href="sign-up"
            className="text-sm underline underline-offset-4 hover:text-zinc-800"
          >
            Criar uma conta
          </Link>
        </p>
      </div>
    </div>
  )
}

export default SignIn
