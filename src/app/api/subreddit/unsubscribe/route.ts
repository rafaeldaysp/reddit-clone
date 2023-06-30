import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { subredditSubscriptionValidator } from '@/lib/validators/subreddit'
import { z } from 'zod'

export async function POST(req: Request) {
  try {
    const session = await getAuthSession()
    if (!session?.user) return new Response('Não autorizado.', { status: 401 })

    const body = await req.json()

    const { subredditId } = subredditSubscriptionValidator.parse(body)

    const subscriptionExists = await db.subscription.findFirst({
      where: {
        subredditId,
        userId: session.user.id,
      },
    })

    if (!subscriptionExists)
      return new Response('Você não está inscrito nesta comunidade.', {
        status: 400,
      })

    const isSubredditCreator = await db.subreddit.findFirst({
      where: {
        id: subredditId,
        creatorId: session.user.id,
      },
    })

    if (isSubredditCreator)
      return new Response(
        'Você não pode se desinscrever da sua própria comunidade.',
        { status: 400 },
      )

    await db.subscription.delete({
      where: {
        userId_subredditId: {
          userId: session.user.id,
          subredditId,
        },
      },
    })

    return new Response(subredditId)
  } catch (error) {
    if (error instanceof z.ZodError)
      return new Response('Dados inválidos.', { status: 422 })
    return new Response(
      'Não foi possível deixar esta comunidade, por favor tente mais tarde.',
      {
        status: 500,
      },
    )
  }
}
