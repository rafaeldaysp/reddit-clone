import { db } from '@/lib/db'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const qParam = url.searchParams.get('q')

  if (!qParam) return new Response('Busca inválida.', { status: 400 })

  const results = await db.subreddit.findMany({
    where: {
      name: {
        contains: qParam,
      },
    },
    include: {
      _count: true,
    },
  })

  return new Response(JSON.stringify(results))
}
