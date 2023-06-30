import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import dayjs from 'dayjs'
import ptBr from 'dayjs/locale/pt-br'
import SubscribeLeaveToggle from '@/components/SubscribeLeaveToggle'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/Button'

dayjs.locale(ptBr)

const Layout = async ({
  children,
  params: { slug },
}: {
  children: React.ReactNode
  params: { slug: string }
}) => {
  const session = await getAuthSession()
  const subreddit = await db.subreddit.findFirst({
    where: {
      name: slug,
    },
    include: {
      posts: {
        include: {
          author: true,
          votes: true,
        },
      },
    },
  })

  const subscription = !session?.user
    ? undefined
    : await db.subscription.findFirst({
        where: {
          subreddit: {
            name: slug,
          },
          user: {
            id: session.user.id,
          },
        },
      })

  const isSubscribed = !!subscription
  if (!subreddit) return notFound()

  const membersCount = await db.subscription.count({
    where: {
      subreddit: {
        name: slug,
      },
    },
  })
  return (
    <div className="mx-auto h-full max-w-7xl pt-12 sm:container">
      <div>
        <div className="grid grid-cols-1 gap-y-4 py-6 md:grid-cols-3 md:gap-x-4">
          <div className="col-span-2 flex flex-col space-y-6">{children}</div>

          <div className="order-first hidden h-fit overflow-hidden rounded-lg border-gray-200 md:order-last md:block">
            <div className="px-6 py-4">
              <p className="py-3 font-semibold">Sobre r/</p>
            </div>

            <div className="divide-y divide-gray-200 bg-white px-6 py-4 text-sm leading-6">
              <div className="flex justify-between gap-x-4 py-3">
                {' '}
                <dt className="text-gray-500">Criado</dt>
                <dd className="text-gray-700">
                  <time dateTime={subreddit.createdAt.toDateString()}>
                    {dayjs(subreddit.createdAt).format('D[ de] MMMM, YYYY')}
                  </time>
                </dd>
              </div>

              <div className="flex justify-between gap-x-4 py-3">
                <dt className="text-gray-500">Membros</dt>
                <dd className="text-gray-700">
                  <div className="text-gray-900">{membersCount}</div>
                </dd>
              </div>

              {subreddit.creatorId === session?.user.id && (
                <div className="flex justify-between gap-x-4 py-3">
                  <p className="text-gray-500">Você criou esta comunidade</p>
                </div>
              )}

              {subreddit.creatorId !== session?.user.id && (
                <SubscribeLeaveToggle
                  isSubscribed={isSubscribed}
                  subredditId={subreddit.id}
                  subredditName={subreddit.name}
                />
              )}

              <Link
                href={`/r/${slug}/submit`}
                className={buttonVariants({
                  variant: 'outline',
                  className: 'mb-6 w-full',
                })}
              >
                Postar
              </Link>

              {/* {subreddit.creatorId !== session?.user.id &&
                subreddit.subscribers.find(() => session?.user.id) && (
                  <div className="flex justify-between gap-x-4 py-3">
                    <p className="text-gray-500">
                      Você é membro desta comunidade.
                    </p>
                  </div>
                )} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Layout
