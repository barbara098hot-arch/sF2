// catbox.moe - upload gratuito, sem chave. Em caso de falha de rede/CORS,
// devolve um fallback (data URL) para não quebrar o fluxo de cadastro.
export const uploadFileToStorage = async (file: Blob | File, _storagePath?: string): Promise<string> => {
  const filename = file instanceof File ? file.name : `upload-${Date.now()}.jpg`;

  // Fallback: converter para data URL (sempre funciona, mas aumenta o tamanho do documento)
  const toDataURL = (): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Falha ao ler arquivo localmente'));
      reader.readAsDataURL(file);
    });

  try {
    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', file, filename);

    const res = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Erro no upload: ${res.status} ${res.statusText}`);
    }

    const url = (await res.text()).trim();
    if (!url) throw new Error('Resposta vazia do serviço de upload');
    return url;
  } catch (err) {
    console.warn('Upload remoto falhou, usando fallback data URL:', err);
    return await toDataURL();
  }
};
