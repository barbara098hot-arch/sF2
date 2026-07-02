// catbox.moe - upload gratuito, sem chave, sem CORS
export const uploadFileToStorage = async (file: Blob | File, _storagePath?: string): Promise<string> => {
  const formData = new FormData();

  // catbox.moe precisa de um nome de arquivo válido
  const filename = file instanceof File ? file.name : `upload-${Date.now()}.jpg`;

  formData.append('reqtype', 'fileupload');
  formData.append('fileToUpload', file, filename);

  const res = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Erro no upload: ${res.status} ${res.statusText}`);
  }

  const url = await res.text();
  return url.trim();
};
