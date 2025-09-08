const { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

// Configuração do AWS S3 para Supabase Storage
const s3Client = new S3Client({
  forcePathStyle: true,
  region: 'sa-east-1',
  endpoint: 'https://fdopxrrcvbzhwszsluwm.storage.supabase.co/storage/v1/s3',
  credentials: {
    accessKeyId: 'c578fed07ab1fc703af6a41e641be381',
    secretAccessKey: '22759983e14c47e0b12507be788dfe45ca2a6252de1afe80b66d51134eb3b8d4',
  }
});

const bucketName = 'portifolio';

/**
 * Sanitiza o nome do arquivo para ser compatível com S3
 * @param {string} filename - Nome original do arquivo
 * @returns {string} - Nome sanitizado
 */
function sanitizeFilename(filename) {
  // Remove caracteres especiais e substitui por underscore
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Verifica se uma pasta existe no bucket
 * @param {string} folderPath - Caminho da pasta
 * @returns {Promise<boolean>} - True se a pasta existe
 */
async function folderExists(folderPath) {
  try {
    const command = new HeadObjectCommand({
      Bucket: bucketName,
      Key: `${folderPath}/.keep`
    });
    
    await s3Client.send(command);
    return true;
  } catch (error) {
    if (error.name === 'NotFound') {
      return false;
    }
    throw error;
  }
}

/**
 * Faz upload de um arquivo para o Supabase Storage usando AWS SDK
 * @param {Object} file - Arquivo do multer
 * @param {string} filePath - Caminho do arquivo no bucket
 * @returns {Promise<Object>} - Resultado do upload
 */
async function uploadFile(file, filePath) {
  try {
    // Sanitizar o nome do arquivo
    const sanitizedPath = filePath.replace(/[^a-zA-Z0-9._/-]/g, '_').replace(/_+/g, '_');
    
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: sanitizedPath,
      Body: file.buffer,
      ContentType: file.mimetype,
      ContentLength: file.size
    });

    const result = await s3Client.send(command);

    // Construir URL pública do arquivo
    const publicUrl = `https://fdopxrrcvbzhwszsluwm.storage.supabase.co/storage/v1/object/public/${bucketName}/${sanitizedPath}`;

    return {
      success: true,
      path: sanitizedPath,
      publicUrl: publicUrl,
      etag: result.ETag
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Cria uma pasta no bucket (criando um arquivo .keep) se ela não existir
 * @param {string} folderPath - Caminho da pasta
 */
async function createFolder(folderPath) {
  try {
    // Verificar se a pasta já existe
    const exists = await folderExists(folderPath);
    if (exists) {
      console.log(`Pasta já existe: ${folderPath}`);
      return;
    }

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: `${folderPath}/.keep`,
      Body: '',
      ContentType: 'text/plain'
    });

    await s3Client.send(command);
    console.log(`Pasta criada: ${folderPath}`);
  } catch (error) {
    console.warn(`Erro ao criar pasta ${folderPath}:`, error.message);
  }
}

/**
 * Deleta um arquivo do Supabase Storage
 * @param {string} filePath - Caminho do arquivo no bucket
 * @returns {Promise<Object>} - Resultado da operação
 */
async function deleteFile(filePath) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: filePath
    });

    await s3Client.send(command);
    console.log(`Arquivo deletado: ${filePath}`);
    
    return {
      success: true,
      path: filePath
    };
  } catch (error) {
    console.warn(`Erro ao deletar arquivo ${filePath}:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Extrai o caminho do arquivo da URL pública do Supabase Storage
 * @param {string} publicUrl - URL pública do arquivo
 * @returns {string} - Caminho do arquivo no bucket
 */
function extractFilePathFromUrl(publicUrl) {
  try {
    // URL format: https://fdopxrrcvbzhwszsluwm.storage.supabase.co/storage/v1/object/public/portifolio/usuario_1/experiencia_123/arquivo.pdf
    const urlParts = publicUrl.split('/storage/v1/object/public/');
    if (urlParts.length === 2) {
      return urlParts[1]; // Retorna: portifolio/usuario_1/experiencia_123/arquivo.pdf
    }
    return null;
  } catch (error) {
    console.warn(`Erro ao extrair caminho da URL: ${publicUrl}`, error.message);
    return null;
  }
}

module.exports = {
  s3Client,
  bucketName,
  uploadFile,
  createFolder,
  folderExists,
  sanitizeFilename,
  deleteFile,
  extractFilePathFromUrl
};