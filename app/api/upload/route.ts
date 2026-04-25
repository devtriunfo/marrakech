import { put } from '@vercel/blob'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de arquivo não permitido. Use JPG, PNG, WebP ou GIF.' }, { status: 400 })
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Arquivo muito grande. Máximo 5MB.' }, { status: 400 })
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()?.toLowerCase() || 'bin'
    const filename = `produtos/${timestamp}.${extension}`

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(filename, file, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      })

      return NextResponse.json({ url: blob.url })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const relativeDir = path.join('uploads', 'produtos')
    const uploadDir = path.join(process.cwd(), 'public', relativeDir)
    const localFilename = `${timestamp}-${crypto.randomUUID()}.${extension}`
    const localFilePath = path.join(uploadDir, localFilename)

    await mkdir(uploadDir, { recursive: true })
    await writeFile(localFilePath, buffer)

    return NextResponse.json({ url: `/${relativeDir.replace(/\\/g, '/')}/${localFilename}` })
  } catch (error) {
    console.error('Erro no upload:', error)
    return NextResponse.json({ error: 'Falha no upload' }, { status: 500 })
  }
}
