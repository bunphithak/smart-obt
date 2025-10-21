// Upload Service - Local Storage Only
import { validateFile, generatePath } from './uploadConfig';
import { getDefaultProvider } from './uploadProviders';

// Upload Service Manager
class UploadService {
  constructor() {
    this.provider = getDefaultProvider();
  }
  
  // Upload file
  async uploadFile(file, folder = 'uploads') {
    if (!file) {
      return { success: false, error: 'No file provided' };
    }
    
    // Generate unique filename and path
    const uploadPath = generatePath(folder, file.name);
    
    return await this.provider.uploadFile(file, uploadPath);
  }
  
  // Upload multiple files
  async uploadFiles(files, folder = 'uploads') {
    const results = [];
    
    for (let i = 0; i < files.length; i++) {
      const result = await this.uploadFile(files[i], folder);
      results.push(result);
    }
    
    return results;
  }
  
  // Delete file
  async deleteFile(path) {
    return await this.provider.deleteFile(path);
  }
  
  // Get file URL
  async getFileUrl(path) {
    return await this.provider.getFileUrl(path);
  }
  
  // Generate path for different types
  generatePath(type, filename) {
    return generatePath(type, filename);
  }
  
  // Validate file
  validateFile(file, options = {}) {
    return validateFile(file, options);
  }
  
  // Get current provider (always local)
  getCurrentProvider() {
    return 'local';
  }
}

// Export singleton instance
const uploadService = new UploadService();
export default uploadService;

// Export classes for testing
export { UploadService };
