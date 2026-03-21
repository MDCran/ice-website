import { createClient } from "@/lib/supabase/server";

export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Buffer,
  contentType?: string
) {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType, upsert: true });
  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);
  return { path: data.path, publicUrl: urlData.publicUrl };
}

export async function deleteFile(bucket: string, path: string) {
  const supabase = await createClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}

export async function listFiles(bucket: string, folder: string = "") {
  const supabase = await createClient();
  const { data, error } = await supabase.storage.from(bucket).list(folder);
  if (error) throw error;
  return data || [];
}

export function getPublicUrl(bucket: string, path: string) {
  // This is sync because it just constructs the URL
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${url}/storage/v1/object/public/${bucket}/${path}`;
}
