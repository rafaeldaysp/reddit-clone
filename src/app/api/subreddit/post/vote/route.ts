import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { redis } from '@/lib/redis'
import { PostVoteValidator } from '@/lib/validators/vote'
import { CachedPost } from '@/types/redis'
import { z } from 'zod'

const CACHE_AFTER_UPVOTES = 1

export async function PATCH(req: Request) {
  try {
    const body = await req.json()

    const { postId, voteType } = PostVoteValidator.parse(body)

    const session = await getAuthSession()

    if (!session) return new Response('Não autorizado.', { status: 401 })

    const existingVote = await db.vote.findFirst({
      where: {
        userId: session.user.id,
        postId,
      },
    })

    const post = await db.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        author: true,
        votes: true,
      },
    })

    if (!post) return new Response('Post não encontrado.', { status: 404 })

    if (existingVote) {
      if (existingVote.type === voteType) {
        await db.vote.delete({
          where: {
            userId_postId: {
              postId,
              userId: session.user.id,
            },
          },
        })
        return new Response('OK')
      }

      await db.vote.update({
        where: {
          userId_postId: {
            postId,
            userId: session.user.id,
          },
        },
        data: {
          type: voteType,
        },
      })

      const votesAmount = post.votes.reduce((acc, vote) => {
        if (vote.type === 'UP') return acc + 1
        if (vote.type === 'DOWN') return acc - 1
        return acc
      }, 0)

      if (votesAmount >= CACHE_AFTER_UPVOTES) {
        const cachePayload: CachedPost = {
          authorUsername: session.user.username!,
          content: JSON.stringify(post.content),
          createdAt: post.createdAt,
          currentVote: voteType,
          id: post.id,
          title: post.title,
        }
        await redis.hset(`post:${postId}`, cachePayload)
      }

      return new Response('OK')
    }

    await db.vote.create({
      data: {
        type: voteType,
        postId,
        userId: session.user.id,
      },
    })

    const votesAmount = post.votes.reduce((acc, vote) => {
      if (vote.type === 'UP') return acc + 1
      if (vote.type === 'DOWN') return acc - 1
      return acc
    }, 0)

    if (votesAmount >= CACHE_AFTER_UPVOTES) {
      const cachePayload: CachedPost = {
        authorUsername: session.user.username!,
        content: JSON.stringify(post.content),
        createdAt: post.createdAt,
        currentVote: voteType,
        id: post.id,
        title: post.title,
      }
      await redis.hset(`post:${postId}`, cachePayload)
    }

    return new Response('OK')
  } catch (error) {
    if (error instanceof z.ZodError)
      return new Response('Dados inválidos.', { status: 422 })
    return new Response(
      'Não foi possível atribuir seu voto, por favor tente mais tarde.',
      {
        status: 500,
      },
    )
  }
}
