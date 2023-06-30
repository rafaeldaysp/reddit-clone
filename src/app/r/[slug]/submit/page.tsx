import Editor from '@/components/Editor'
import { Button } from '@/components/ui/Button'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'

interface pageProps {
  params: {
    slug: string
  }
}

const page = async ({ params }: pageProps) => {
  const { slug } = params
  const subreddit = await db.subreddit.findFirst({
    where: {
      name: slug,
    },
  })

  if (!subreddit) return notFound()
  return (
    <div className="flex flex-col items-start gap-6">
      <div className="border-b border-gray-200 pb-5">
        <div className="-ml-2 -mt-2 flex flex-wrap items-baseline">
          <h3 className="ml-2 mt-2 text-base font-semibold leading-6 text-gray-900">
            Postar
          </h3>
          <p className="ml-2 mt-1 truncate text-sm text-gray-500">
            em r/{slug}
          </p>
        </div>
      </div>

      <Editor subredditId={subreddit.id} />

      <div className="flex w-full justify-end">
        <Button className="w-full" type="submit" form="subreddit-post-form">
          Compartilhar
        </Button>
      </div>
    </div>
  )
}

export default page
