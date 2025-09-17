const upload = document.getElementById('upload');
const qualityInput = document.getElementById('quality');
const qualityValue = document.getElementById('quality-value');
const compressBtn = document.getElementById('compressBtn');
const preview = document.getElementById('preview');
const status = document.getElementById('status');

let images = [];

qualityInput.addEventListener('input', () => {
  qualityValue.textContent = `${qualityInput.value}%`;
});

// Pré-visualização das imagens
upload.addEventListener('change', (e) => {
  images = Array.from(e.target.files);
  preview.innerHTML = '';

  images.forEach(file => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = document.createElement('img');
      img.src = event.target.result;
      preview.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
});

compressBtn.addEventListener('click', async () => {
  if (images.length === 0) {
    alert('Selecione imagens primeiro.');
    return;
  }

  status.textContent = 'Comprimindo imagens... aguarde...';
  const quality = qualityInput.value / 100;
  const zip = new JSZip();

  for (let i = 0; i < images.length; i++) {
    const file = images[i];
    const dataUrl = await readFileAsDataURL(file);
    const compressedBlob = await compressImage(dataUrl, quality);
    zip.file(`comprimida-${file.name}`, compressedBlob);
    status.textContent = `Comprimindo imagem ${i + 1} de ${images.length}...`;
  }

  status.textContent = 'Gerando arquivo ZIP...';
  const content = await zip.generateAsync({ type: "blob" });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(content);
  link.download = "imagens-comprimidas.zip";
  link.click();

  status.textContent = 'Download pronto!';
});

// Função para ler arquivo como DataURL
function readFileAsDataURL(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}

// Função para comprimir imagem usando canvas
function compressImage(dataUrl, quality) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(blob => {
        resolve(blob);
      }, 'image/jpeg', quality);
    };
    img.src = dataUrl;
  });
}
