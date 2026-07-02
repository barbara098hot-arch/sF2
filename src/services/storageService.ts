const IMGBB_API_KEY = '248c4e59d9f89f31877e188a787e9109';

export const uploadFileToStorage = async (file: Blob | File, _storagePath?: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1]; // remove data:image/...;base64,

      const formData = new FormData();
      formData.append('key', IMGBB_API_KEY);
      formData.append('image', base64);

      fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData,
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            resolve(data.data.url);
          } else {
            reject(new Error(data.error?.message || 'Erro ao fazer upload no imgBB'));
          }
        })
        .catch(err => reject(err));
    };

    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsDataURL(file);
  });
};

export const uploadBase64ToStorage = async (base64DataUrl: string, _storagePath?: string): Promise<string> => {
  const base64 = base64DataUrl.split(',')[1];

  const formData = new FormData();
  formData.append('key', IMGBB_API_KEY);
  formData.append('image', base64);

  const res = await fetch('https://api.imgbb.com/1/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();

  if (data.success) {
    return data.data.url;
  }

  throw new Error(data.error?.message || 'Erro ao fazer upload no imgBB');
};
