import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { postValidator } from '@/lib/validators/post'

import { z } from 'zod'

export async function POST(req: Request) {
  try {
    const session = await getAuthSession()
    if (!session?.user) return new Response('Não autorizado.', { status: 401 })

    const body = await req.json()

    const { subredditId, title, content } = postValidator.parse(body)

    const subscriptionExists = await db.subscription.findFirst({
      where: {
        subredditId,
        userId: session.user.id,
      },
    })

    if (!subscriptionExists)
      return new Response(
        'Você não está inscrito nesta comunidade. Inscreva-se para compartilhar!',
        {
          status: 400,
        },
      )

    await db.post.create({
      data: {
        title,
        content,
        subredditId,
        authorId: session.user.id,
      },
    })

    return new Response('OK')
  } catch (error) {
    if (error instanceof z.ZodError)
      return new Response('Dados inválidos.', { status: 422 })
    return new Response(
      'Não foi possível compartilhar, por favor tente mais tarde.',
      {
        status: 500,
      },
    )
  }
}
