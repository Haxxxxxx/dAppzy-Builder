import { cleanElementData } from './elementUtils';
import { generateProjectHtml } from './htmlGenerator';
import { pinDirectoryToPinata } from '../../utils/ipfs';

const isPinataConfigured = () => {
  // Pinata uploads now go through server-side CF proxy
  // Just check that the CF base URL is configured
  return !!import.meta.env.VITE_CF_BASE_URL;
};

/**
 * Validates a URL is safe to fetch (prevents SSRF via file:/data:/private IPs)
 */
const isAllowedUrl = (url) => {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    // Block private/internal IP ranges
    const host = parsed.hostname;
    if (
      host === 'localhost' ||
      host.startsWith('127.') ||
      host.startsWith('10.') ||
      host.startsWith('192.168.') ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
      host === '0.0.0.0' ||
      host === '[::1]' ||
      host.endsWith('.local')
    ) return false;
    return true;
  } catch {
    return false;
  }
};

/**
 * Validates Pinata configuration before making API calls
 * @throws {Error} If Pinata configuration is invalid
 */
const validatePinataConfig = () => {
  if (!isPinataConfigured()) {
    throw new Error('IPFS upload not configured: Please check REACT_APP_CF_BASE_URL environment variable');
  }
};

/**
 * Generates a preview URL for a project
 * @param {string} userId - User ID
 * @param {string} projectId - Project ID
 * @param {Array} elements - Project elements
 * @param {Object} websiteSettings - Website settings
 * @returns {Promise<string>} - Preview URL
 */
export const generatePreviewUrl = async (userId, projectId, elements, websiteSettings) => {
  try {
    if (!userId || !projectId) {
      throw new Error('Missing required parameters: userId and projectId');
    }

    const sanitizedUserId = userId.toString().trim();
    const sanitizedProjectId = projectId.toString().trim();

    if (!sanitizedUserId || !sanitizedProjectId) {
      throw new Error('Invalid userId or projectId format');
    }

    // Clean and validate elements data
    const cleanedElements = elements
      .map(cleanElementData)
      .filter(Boolean)
      .map(element => {
        if (!element.id || !element.type) {
          return null;
        }
        return element;
      })
      .filter(Boolean);

    // Clean and validate website settings
    const cleanedWebsiteSettings = {
      siteTitle: websiteSettings?.siteTitle || 'My Website',
      faviconUrl: websiteSettings?.faviconUrl || '',
      metaDescription: websiteSettings?.metaDescription || '',
      metaKeywords: websiteSettings?.metaKeywords || '',
      customStyles: websiteSettings?.customStyles || '',
      customScripts: websiteSettings?.customScripts || '',
    };

    const fullHtml = generateProjectHtml(cleanedElements, cleanedWebsiteSettings);
    const htmlBlob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    
    const files = [{
      file: htmlBlob,
      fileName: 'index.html',
      type: 'text/html'
    }];

    const metadata = {
      name: cleanedWebsiteSettings.siteTitle,
      keyvalues: {
        userId: sanitizedUserId,
        timestamp: new Date().toISOString(),
        size: htmlBlob.size.toString(),
        isPreview: "true",
        projectId: sanitizedProjectId,
        contentType: "text/html"
      },
    };

    const ipfsHash = await pinDirectoryToPinata(files, metadata);
    
    if (!ipfsHash) {
      throw new Error('No IPFS hash returned from Pinata');
    }

    return `https://ipfs.io/ipfs/${ipfsHash}`;
  } catch (error) {
    throw error;
  }
};

/**
 * Deploys a project to IPFS
 * @param {string} userId - User ID
 * @param {string} projectId - Project ID
 * @param {Array} elements - Project elements
 * @param {Object} websiteSettings - Website settings
 * @returns {Promise<{ipfsUrl: string, ipfsHash: string}>} - Deployment result
 */
export const deployToIPFS = async (userId, projectId, elements, websiteSettings) => {
  try {
    if (!userId || !projectId) {
      throw new Error('Missing required parameters: userId and projectId');
    }

    const sanitizedUserId = userId.toString().trim();
    const sanitizedProjectId = projectId.toString().trim();

    if (!sanitizedUserId || !sanitizedProjectId) {
      throw new Error('Invalid userId or projectId format');
    }

    if (!Array.isArray(elements)) {
      throw new Error('Invalid elements data');
    }

    // Clean and validate elements data
    const cleanedElements = elements
      .map(cleanElementData)
      .filter(Boolean)
      .map(element => {
        if (!element.id || !element.type) {
          return null;
        }
        return element;
      })
      .filter(Boolean);

    // Clean and validate website settings
    const cleanedWebsiteSettings = {
      siteTitle: websiteSettings?.siteTitle || 'My Website',
      faviconUrl: websiteSettings?.faviconUrl || '',
      metaDescription: websiteSettings?.metaDescription || '',
      metaKeywords: websiteSettings?.metaKeywords || '',
      customStyles: websiteSettings?.customStyles || '',
      customScripts: websiteSettings?.customScripts || '',
      ogImage: websiteSettings?.ogImage || '',
      author: websiteSettings?.author || 'Dappzy',
    };

    // Generate HTML content
    const fullHtml = generateProjectHtml(cleanedElements, cleanedWebsiteSettings);

    // Create a directory structure for IPFS
    const files = [];

    // Add main HTML file
    const htmlBlob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    files.push({
      file: htmlBlob,
      fileName: 'index.html',
      type: 'text/html'
    });

    // Add favicon if exists
    if (cleanedWebsiteSettings.faviconUrl && isAllowedUrl(cleanedWebsiteSettings.faviconUrl)) {
      try {
        const faviconResponse = await fetch(cleanedWebsiteSettings.faviconUrl);
        const faviconBlob = await faviconResponse.blob();
        files.push({
          file: faviconBlob,
          fileName: 'favicon.ico',
          type: 'image/x-icon'
        });
      } catch (error) {
        // Favicon fetch failed; skip
      }
    }

    // Add OG image if exists
    if (cleanedWebsiteSettings.ogImage && isAllowedUrl(cleanedWebsiteSettings.ogImage)) {
      try {
        const ogImageResponse = await fetch(cleanedWebsiteSettings.ogImage);
        const ogImageBlob = await ogImageResponse.blob();
        files.push({
          file: ogImageBlob,
          fileName: 'og-image.jpg',
          type: 'image/jpeg'
        });
      } catch (error) {
        // OG image fetch failed; skip
      }
    }

    // Add assets from elements
    const assetPromises = cleanedElements
      .filter(element => element.type === 'image' && element.src && isAllowedUrl(element.src))
      .map(async (element) => {
        try {
          const response = await fetch(element.src);
          const blob = await response.blob();
          const fileName = `assets/${element.id}-${Date.now()}.${blob.type.split('/')[1]}`;
          files.push({
            file: blob,
            fileName,
            type: blob.type
          });
          // Update element src to use IPFS path
          element.src = `ipfs://${fileName}`;
        } catch (error) {
          // Asset fetch failed; skip
        }
      });

    // Wait for all asset uploads to complete
    await Promise.all(assetPromises);

    // Add metadata
    const metadata = {
      name: cleanedWebsiteSettings.siteTitle,
      keyvalues: {
        userId: sanitizedUserId,
        timestamp: new Date().toISOString(),
        size: htmlBlob.size.toString(),
        projectId: sanitizedProjectId,
        contentType: "text/html",
        version: "1.0.0",
        assets: files.length.toString()
      },
    };

    // Upload to IPFS
    const ipfsHash = await pinDirectoryToPinata(files, metadata);
    
    if (!ipfsHash) {
      throw new Error('No IPFS hash returned from Pinata');
    }

    const ipfsUrl = `https://ipfs.io/ipfs/${ipfsHash}`;

    return {
      ipfsUrl,
      ipfsHash
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Format IPFS URL for display
 */
export function formatIpfsUrl(url) {
  if (!url) return '';
  try {
    const hash = url.split('/').pop();
    return `ipfs://${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
  } catch {
    return url;
  }
} 