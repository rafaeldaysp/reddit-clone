import CustomFeed from '@/components/CustomFeed'
import GeneralFeed from '@/components/GeneralFeed'
import { buttonVariants } from '@/components/ui/Button'
import { getAuthSession } from '@/lib/auth'
import { HomeIcon } from 'lucide-react'
import Link from 'next/link'

export default async function Home() {
  const session = await getAuthSession()
  return (
    <>
      <h1 className="text-3xl font-bold md:text-4xl">Página inicial</h1>
      <div className="grid grid-cols-1 gap-y-4 py-6 md:grid-cols-3 md:gap-x-4">
        {/* @ts-expect-error server component */}
        {session ? <CustomFeed /> : <GeneralFeed />}

        <div className="order-first h-fit overflow-hidden rounded-lg border border-gray-200 md:order-last">
          <div className="bg-emerald-100 px-6 py-4">
            <p className="flex items-center gap-1.5 py-3 font-semibold">
              <HomeIcon />
              Início
            </p>
          </div>

          <div className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6">
            <div className="flex justify-between gap-x-4 py-3">
              <p className="text-zinc-500">
                Sua página inicial Reddit Clone. Venha verificar suas
                comunidades favoritas.
              </p>
            </div>

            <Link
              href="/r/create"
              className={buttonVariants({ className: 'mb-6 mt-4 w-full' })}
            >
              Nova comunidade
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
