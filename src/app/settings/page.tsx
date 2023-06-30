import UsernameForm from '@/components/UserNameForm'
import { authOptions, getAuthSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

const page = async () => {
  const session = await getAuthSession()
  if (!session?.user) return redirect(authOptions.pages?.signIn || '/sign-in')
  return (
    <div className="mx-auto max-w-4xl py-12">
      <div className="grid items-start gap-8">
        <h1 className="text-3xl font-bold md:text-4xl">Configuarções</h1>

        <div className="grid gap-10">
          <UsernameForm
            user={{
              id: session.user.id,
              username: session.user.username || '',
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default page
