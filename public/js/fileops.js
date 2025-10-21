// Helper: optional client-side resize to limit size (maxWidth in px)
async function fileToDataUrlWithResize(file, maxWidth = 1024) {
  if (!file.type.startsWith('image/')) throw new Error('Not an image');

  // Quick path: small files, no resize
  if (file.size < 200 * 1024) { // 200 KB threshold; adjust as needed
    return await new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
  }

  // Resize using canvas to cap width and reduce size
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        // Choose quality for jpeg to reduce size (0.8). For PNG this param is ignored.
        const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mime, 0.8);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// Wire up UI: add this after your editors are initialized (ed_html etc.)
const addImageBtn = document.getElementById('addImage');
const imageInput = document.getElementById('imageUpload');

if (addImageBtn && imageInput) {
  addImageBtn.addEventListener('click', () => imageInput.click());

  imageInput.addEventListener('change', async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      // optional validation
      const MAX_SIZE_BYTES = 3 * 1024 * 1024; // 3MB limit
      if (f.size > MAX_SIZE_BYTES) {
        alert('Image too large (max 3MB). Please choose a smaller image.');
        return;
      }

      const dataUrl = await fileToDataUrlWithResize(f, 1024);
      
      // Insert into the HTML editor at the end (you can change insertion point)
      const cur = ed_html.getValue();
      const safeName = f.name.replace(/"/g, '&#34;');
      
      //Save to session storage
      addImageToSessionStorage(safeName, dataUrl);
      addImageToPanel(safeName, true);
      
    } catch (err) {
      console.error('Failed to load image:', err);
      alert('Unable to add image: ' + err.message);
    } finally {
      imageInput.value = ''; // clear selection
    }
  });
}