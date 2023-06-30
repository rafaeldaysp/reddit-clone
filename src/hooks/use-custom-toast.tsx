import Link from 'next/link'
import { toast } from './use-toast'
import { buttonVariants } from '@/components/ui/Button'

export const useCustomToast = () => {
  const loginToast = () => {
    const { dismiss } = toast({
      title: 'Entre para continuar',
      description: 'É preciso entrar em sua conta para continuar.',
      variant: 'destructive',
      action: (
        <Link
          href="/sign-in"
          onClick={() => dismiss()}
          className={buttonVariants({ variant: 'outline' })}
        >
          Entrar
        </Link>
      ),
    })
  }

  return { loginToast }
}
