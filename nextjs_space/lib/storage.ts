import fs from 'fs'
import path from 'path'
import { Readable } from 'stream'
import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createS3Client, getBucketConfig } from './aws-config'
import { prisma } from './db'

// ============================================================
// Interface unificada
// ============================================================

export interface StorageProvider {
  upload(fileName: string, buffer: Buffer, contentType: string): Promise<string>
  getUrl(cloudStoragePath: string, contentType: string): Promise<string>
  delete(cloudStoragePath: string): Promise<void>
  label: string
}

// ============================================================
// Provider Local
// ============================================================

const UPLOAD_DIR = path.join(process.cwd(), 'uploads')

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

class LocalProvider implements StorageProvider {
  label = 'Servidor Local'

  async upload(fileName: string, buffer: Buffer, _contentType: string): Promise<string> {
    ensureUploadDir()
    const safeName = Date.now() + '-' + fileName.replace(/[^\w.\-]+/g, '_')
    const filePath = path.join(UPLOAD_DIR, safeName)
    fs.writeFileSync(filePath, new Uint8Array(buffer))
    return 'local:' + safeName
  }

  async getUrl(cloudStoragePath: string, _contentType: string): Promise<string> {
    const name = cloudStoragePath.replace('local:', '')
    return '/api/documents/file/' + encodeURIComponent(name)
  }

  async delete(cloudStoragePath: string): Promise<void> {
    const name = cloudStoragePath.replace('local:', '')
    const filePath = path.join(UPLOAD_DIR, name)
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  }
}

// ============================================================
// Provider S3
// ============================================================

class S3Provider implements StorageProvider {
  label = 'AWS S3'

  async upload(fileName: string, buffer: Buffer, contentType: string): Promise<string> {
    const s3 = createS3Client()
    const { bucketName, folderPrefix } = getBucketConfig()
    const safeName = Date.now() + '-' + fileName.replace(/[^\w.\-]+/g, '_')
    const key = `${folderPrefix}uploads/${safeName}`

    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })
    )

    return key
  }

  async getUrl(cloudStoragePath: string, contentType: string): Promise<string> {
    const s3 = createS3Client()
    const { bucketName } = getBucketConfig()
    const region = process.env.AWS_REGION ?? 'us-west-2'

    const inline =
      (contentType.startsWith('image/') && contentType !== 'image/svg+xml') ||
      contentType.startsWith('video/') ||
      contentType.startsWith('audio/')

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: cloudStoragePath,
      ResponseContentDisposition: inline ? 'inline' : 'attachment',
    })
    return getSignedUrl(s3, command, { expiresIn: 3600 })
  }

  async delete(cloudStoragePath: string): Promise<void> {
    const s3 = createS3Client()
    const { bucketName } = getBucketConfig()
    await s3.send(new DeleteObjectCommand({ Bucket: bucketName, Key: cloudStoragePath }))
  }
}

// ============================================================
// Provider Google Drive
// ============================================================

class GoogleDriveProvider implements StorageProvider {
  label = 'Google Drive'

  private async getDrive(): Promise<any> {
    const { google } = await import('googleapis')
    const settings = await prisma.settings.findFirst()

    if (!settings?.googleServiceAccountJson) {
      throw new Error('Credenciais do Google Drive não configuradas.')
    }

    const credentials = JSON.parse(settings.googleServiceAccountJson)
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    })

    return google.drive({ version: 'v3', auth })
  }

  async upload(fileName: string, buffer: Buffer, contentType: string): Promise<string> {
    const drive = await this.getDrive()
    const settings = await prisma.settings.findFirst()
    const folderId = settings?.googleDriveFolderId ?? 'root'

    const safeName = Date.now() + '-' + fileName.replace(/[^\w.\-]+/g, '_')

    const res = await drive.files.create({
      requestBody: {
        name: safeName,
        parents: [folderId],
      },
      media: {
        mimeType: contentType,
        body: Readable.from(buffer),
      },
      fields: 'id',
    })

    return 'gdrive:' + (res.data.id ?? safeName)
  }

  async getUrl(cloudStoragePath: string, _contentType: string): Promise<string> {
    const fileId = cloudStoragePath.replace('gdrive:', '')
    const drive = await this.getDrive()

    try {
      await drive.permissions.create({
        fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      })
    } catch {
      // ignora se não conseguir tornar público
    }

    const res = await drive.files.get({
      fileId,
      fields: 'webViewLink, webContentLink',
    })

    return (
      res.data.webContentLink ??
      res.data.webViewLink ??
      'https://drive.google.com/file/d/' + fileId + '/view'
    )
  }

  async delete(cloudStoragePath: string): Promise<void> {
    const fileId = cloudStoragePath.replace('gdrive:', '')
    const drive = await this.getDrive()
    await drive.files.delete({ fileId })
  }
}

// ============================================================
// Factory
// ============================================================

let cachedProviderType: string | null = null
let lastFetch = 0

async function getSettings() {
  const now = Date.now()
  if (!cachedProviderType || now - lastFetch > 30000) {
    const settings = await prisma.settings.findFirst()
    cachedProviderType = settings?.storageProvider ?? 'LOCAL'
    lastFetch = now
  }
  return cachedProviderType
}

const providers: Record<string, StorageProvider> = {}

export async function getStorageProvider(): Promise<StorageProvider> {
  const provider = await getSettings()

  if (!providers[provider]) {
    switch (provider) {
      case 'S3':
        providers[provider] = new S3Provider()
        break
      case 'GOOGLE_DRIVE':
        providers[provider] = new GoogleDriveProvider()
        break
      default:
        providers[provider] = new LocalProvider()
    }
  }

  return providers[provider]
}

export async function getStorageLabel(): Promise<string> {
  const provider = await getStorageProvider()
  return provider.label
}