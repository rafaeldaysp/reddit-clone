'use client'

import { PostCreationRequest, postValidator } from '@/lib/validators/post'
import { useForm } from 'react-hook-form'
import TextareaAutosize from 'react-textarea-autosize'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useRef, useState } from 'react'
import type EditorJS from '@editorjs/editorjs'
import { uploadFiles } from '@/lib/uploadthing'
import { toast } from '@/hooks/use-toast'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { usePathname, useRouter } from 'next/navigation'

interface EditorProps {
  subredditId: string
}

const Editor = ({ subredditId }: EditorProps) => {
  const pathname = usePathname()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PostCreationRequest>({
    resolver: zodResolver(postValidator),
    defaultValues: {
      subredditId,
      title: '',
      content: null,
    },
  })

  const ref = useRef<EditorJS>()

  const [isMounted, setIsMounted] = useState<boolean>(false)

  const _titleRef = useRef<HTMLTextAreaElement>(null)

  const { ref: titleRef, ...rest } = register('title')

  const initializeEditor = useCallback(async () => {
    const EditorJS = (await import('@editorjs/editorjs')).default
    const Header = (await import('@editorjs/header')).default
    const Embed = (await import('@editorjs/embed')).default
    const Table = (await import('@editorjs/table')).default
    const List = (await import('@editorjs/list')).default
    const Code = (await import('@editorjs/code')).default
    const LinkTool = (await import('@editorjs/link')).default
    const InlineCode = (await import('@editorjs/inline-code')).default
    const ImageTool = (await import('@editorjs/image')).default

    if (!ref.current) {
      const editor = new EditorJS({
        holder: 'editor',
        onReady() {
          ref.current = editor
        },
        placeholder: 'O que gostaria de compartilhar?',
        inlineToolbar: true,
        data: {
          blocks: [],
        },
        tools: {
          header: Header,
          LinkTool: {
            class: LinkTool,
            config: {
              endpoint: '/api/link',
            },
          },
          image: {
            class: ImageTool,
            config: {
              uploader: {
                async uploadByFile(file: File) {
                  const [res] = await uploadFiles([file], 'imageUploader')

                  return {
                    success: 1,
                    file: {
                      url: res.fileUrl,
                    },
                  }
                },
              },
            },
          },
          list: List,
          code: Code,
          InlineCode,
          table: Table,
          embed: Embed,
        },
      })
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') setIsMounted(true)
  }, [])

  useEffect(() => {
    const init = async () => {
      await initializeEditor()
      setTimeout(() => {})
    }

    setTimeout(() => {
      _titleRef.current?.focus()
    }, 0)

    if (isMounted) {
      init()
      return () => {
        ref.current?.destroy()
        ref.current = undefined
      }
    }
  }, [isMounted, initializeEditor])

  useEffect(() => {
    if (Object.keys(errors).length) {
      for (const [_key, value] of Object.entries(errors)) {
        toast({
          title: 'Houve um erro',
          description: (value as { message: string }).message,
          variant: 'destructive',
        })
      }
    }
  }, [errors])

  const { mutate: createPost } = useMutation({
    mutationFn: async (payload: PostCreationRequest) => {
      const { data } = await axios.post('/api/subreddit/post/create', {
        ...payload,
      })
      return data
    },
    onError: () => {
      return toast({
        title: 'Algo deu errado',
        description:
          'Seu conteúdo não pôde ser publicado. Tente novamente mais tarde.',
        variant: 'destructive',
      })
    },
    onSuccess: () => {
      const newPathname = pathname.split('/').slice(0, -1).join('/')
      router.push(newPathname)
      router.refresh()

      return toast({
        description: 'Seu conteúdo foi publicado com sucesso.',
      })
    },
  })

  async function onSubmit(data: PostCreationRequest) {
    const blocks = await ref.current?.save()

    const payload: PostCreationRequest = {
      title: data.title,
      content: blocks,
      subredditId,
    }
    createPost(payload)
  }

  return (
    <div className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <form
        id="subreddit-post-form"
        className="w-fit"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="prose prose-stone dark:prose-invert">
          <TextareaAutosize
            ref={(e) => {
              titleRef(e)
              // @ts-ignore
              _titleRef.current = e
            }}
            {...rest}
            placeholder="Título"
            className="w-full resize-none appearance-none overflow-hidden bg-transparent text-5xl font-bold focus:outline-none"
          />
          <div id="editor" className="min-h-[500px]" />
        </div>
      </form>
    </div>
  )
}

export default Editor
