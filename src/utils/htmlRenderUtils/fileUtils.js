export function getFileExtension(url) {
    if (!url || typeof url !== 'string') {
      console.warn(`Invalid URL provided to getFileExtension: ${url}. Using default 'png' extension.`);
      return 'png'; // Default extension or handle as needed
    }
    return url.split('.').pop().split(/\#|\?/)[0];
  }
  
  export async function convertImageToBase64(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${url}`);
      }
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => {
          reader.abort();
          reject(new Error('Problem parsing input file.'));
        };
        reader.onload = () => {
          resolve(reader.result);
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to Base64:', error);
      return '';
    }
  }
  