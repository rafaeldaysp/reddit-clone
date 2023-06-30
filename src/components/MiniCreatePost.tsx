'use client'

import { Session } from 'next-auth'
import { usePathname, useRouter } from 'next/navigation'
import UserAvatar from './UserAvatar'
import { Input } from './ui/Input'
import { Button } from './ui/Button'
import { ImageIcon, Link2 } from 'lucide-react'

interface MiniCreatePostProps {
  session: Session | null
}

const MiniCreatePost = ({ session }: MiniCreatePostProps) => {
  const router = useRouter()
  const pathname = usePathname()
  return (
    <div className="overflow-hidden rounded-md bg-white shadow">
      <div className="flex h-full justify-between gap-6 px-6 py-6">
        <div className="relative">
          <UserAvatar
            user={{
              name: session?.user.name || null,
              image: session?.user.image || null,
            }}
          />

          <span className="absolute bottom-0 h-3 w-3 rounded-full bg-green-500 outline outline-2 outline-white"></span>
        </div>

        <Input
          readOnly
          onClick={() => router.push(pathname + '/submit')}
          placeholder="O que gostaria de compartilhar?"
        />

        <Button
          variant="ghost"
          onClick={() => router.push(pathname + '/submit')}
        >
          <ImageIcon className="text-zinc-600" />
        </Button>

        <Button
          variant="ghost"
          onClick={() => router.push(pathname + '/submit')}
        >
          <Link2 className="text-zinc-600" />
        </Button>
      </div>
    </div>
  )
}

export default MiniCreatePost
