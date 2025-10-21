// Upload Providers - Local Storage Only
import { validateFile } from './uploadConfig';

// Base Upload Provider
class BaseUploadProvider {
  async uploadFile(file, path) {
    throw new Error('uploadFile must be implemented');
  }
  
  async deleteFile(path) {
    throw new Error('deleteFile must be implemented');
  }
  
  async getFileUrl(path) {
    throw new Error('getFileUrl must be implemented');
  }
}

// Local Storage Provider (ปัจจุบันใช้)
class LocalUploadProvider extends BaseUploadProvider {
  async uploadFile(file, uploadPath) {
    try {
      // Validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', uploadPath);
      
      // Upload to local API endpoint
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.success) {
        return {
          success: true,
          url: result.url,
          path: result.path,
          name: file.name,
          size: file.size,
          type: file.type
        };
      } else {
        return {
          success: false,
          error: result.error || 'Upload failed'
        };
      }
    } catch (error) {
      console.error('Local upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async deleteFile(filePath) {
    try {
      const response = await fetch('/api/upload', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: filePath }),
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Local delete error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async getFileUrl(filePath) {
    try {
      // For local storage, the URL is just the path
      return {
        success: true,
        url: filePath
      };
    } catch (error) {
      console.error('Local get URL error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Export providers
export {
  BaseUploadProvider,
  LocalUploadProvider
};

// Export default provider (Local Storage only)
export const getDefaultProvider = () => {
  return new LocalUploadProvider();
};
