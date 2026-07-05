import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Settings singleton
  const existingSettings = await prisma.settings.findFirst()
  if (!existingSettings) {
    await prisma.settings.create({
      data: { officeName: 'Contabilidade Prime', primaryColor: '#2563EB' },
    })
  }

  // Default accountant (admin)
  const contadorPass = await bcrypt.hash('johndoe123', 10)
    await prisma.user.upsert({
      where: { email: 'john@doe.com' },
      update: { secretWord: 'abacaxi' },
      create: {
        email: 'john@doe.com',
        password: contadorPass,
        name: 'Carlos Andrade',
        role: 'CONTADOR',
        secretWord: 'abacaxi',
        secretHint: 'fruta amarela',
      },
    })

  // Sample clients
  const sampleClients = [
    {
      email: 'contato@padariabomsabor.com.br',
      name: 'Maria Souza',
      razaoSocial: 'Padaria Bom Sabor LTDA',
      nomeFantasia: 'Padaria Bom Sabor',
      documento: '12.345.678/0001-90',
      regimeTributario: 'SIMPLES_NACIONAL' as const,
      telefone: '(11) 98765-4321',
      status: 'ATIVO' as const,
    },
    {
      email: 'financeiro@techlog.com.br',
      name: 'João Pereira',
      razaoSocial: 'TechLog Soluções em TI LTDA',
      nomeFantasia: 'TechLog',
      documento: '98.765.432/0001-10',
      regimeTributario: 'LUCRO_PRESUMIDO' as const,
      telefone: '(11) 91234-5678',
      status: 'ATIVO' as const,
    },
    {
      email: 'admin@constructa.com.br',
      name: 'Ana Lima',
      razaoSocial: 'Constructa Engenharia S.A.',
      nomeFantasia: 'Constructa',
      documento: '11.222.333/0001-44',
      regimeTributario: 'LUCRO_REAL' as const,
      telefone: '(21) 99999-8888',
      status: 'SUSPENSO' as const,
    },
  ]

  for (const c of sampleClients) {
    const pass = await bcrypt.hash('cliente123', 10)
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: {
        email: c.email,
        password: pass,
        name: c.name,
        role: 'CLIENTE',
      },
    })
    const existingClient = await prisma.client.findUnique({
      where: { userId: user.id },
    })
    if (!existingClient) {
      await prisma.client.create({
        data: {
          userId: user.id,
          razaoSocial: c.razaoSocial,
          nomeFantasia: c.nomeFantasia,
          documento: c.documento,
          regimeTributario: c.regimeTributario,
          email: c.email,
          telefone: c.telefone,
          status: c.status,
        },
      })
    }
  }

  // Sample notice
  const noticeCount = await prisma.notice.count()
  if (noticeCount === 0) {
    await prisma.notice.create({
      data: {
        title: 'Prazo para entrega de documentos — DAS',
        description:
          'Lembramos que os documentos referentes ao faturamento do mês devem ser enviados até o dia 5 para o correto cálculo das guias. Em caso de dúvidas, utilize o chat.',
      },
    })
  }

  // Sample message thread with first client
  const contador = await prisma.user.findUnique({ where: { email: 'john@doe.com' } })
  const firstClient = await prisma.client.findFirst({
    where: { email: 'contato@padariabomsabor.com.br' },
    include: { user: true },
  })
  if (contador && firstClient) {
    const msgCount = await prisma.message.count({ where: { clientId: firstClient.id } })
    if (msgCount === 0) {
      await prisma.message.create({
        data: {
          clientId: firstClient.id,
          senderId: contador.id,
          senderRole: 'CONTADOR',
          content: 'Olá! Seja bem-vindo ao nosso portal. Qualquer dúvida estou à disposição.',
          isRead: true,
        },
      })
      await prisma.message.create({
        data: {
          clientId: firstClient.id,
          senderId: firstClient.userId,
          senderRole: 'CLIENTE',
          content: 'Obrigado! Vou enviar os documentos ainda hoje.',
          isRead: false,
        },
      })
    }
  }

  console.log('Seed concluído com sucesso.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
