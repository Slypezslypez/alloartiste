import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.S3_REGION || "auto",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string
  }
});

/** Retourne une URL PUT pré-signée valable 5 minutes, et l'URL publique finale de la photo. */
export async function createPresignedUpload(artistId: string, fileExt: string, contentType: string) {
  const key = `artists/${artistId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    ContentType: contentType
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
  const publicUrl = `${process.env.S3_PUBLIC_BASE_URL}/${key}`;

  return { uploadUrl, publicUrl, key };
}

export async function deleteObjectByUrl(publicUrl: string) {
  const base = process.env.S3_PUBLIC_BASE_URL as string;
  if (!publicUrl.startsWith(base)) return; // sécurité : n'efface que nos propres objets
  const key = publicUrl.slice(base.length + 1);
  await s3.send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }));
}

/** Upload d'image pour le contenu du site (articles de blog...), réservé à l'admin. */
export async function createPresignedArticleUpload(fileExt: string, contentType: string) {
  const key = `articles/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    ContentType: contentType
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
  const publicUrl = `${process.env.S3_PUBLIC_BASE_URL}/${key}`;

  return { uploadUrl, publicUrl };
}
