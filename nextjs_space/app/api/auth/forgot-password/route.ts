import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { generatePassword } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const email = (body?.email ?? '').toString().toLowerCase().trim()
    const secretWord = (body?.secretWord ?? '').toString().trim()

    if (!email || !secretWord) {
      return NextResponse.json(
        { error: 'Informe e-mail e palavra secreta.' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({ where: { email } })

    // Apenas CONTADOR pode recuperar senha sozinho
    if (!user || user.role !== 'CONTADOR') {
      return NextResponse.json({
        success: true,
        message:
          'Se você for um contador cadastrado, a senha será redefinida se a palavra secreta estiver correta. Clientes devem solicitar ao administrador.',
        password: null,
        hint: null,
      })
    }

    // Valida a palavra secreta (case-insensitive)
    if (
      !user.secretWord ||
      user.secretWord.toLowerCase().trim() !== secretWord.toLowerCase().trim()
    ) {
      return NextResponse.json({
        success: true,
        message: 'Palavra secreta incorreta. Dica: ' + (user.secretHint || 'definida por você'),
        password: null,
        hint: user.secretHint || null,
      })
    }

    const newPassword = generatePassword(10)
    const hashed = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    })

    return NextResponse.json({
      success: true,
      message: 'Senha redefinida com sucesso!',
      password: newPassword,
      name: user.name,
      hint: null,
    })
  } catch {
    return NextResponse.json(
      { error: 'Erro ao processar. Tente novamente.' },
      { status: 500 }
    )
  }
}