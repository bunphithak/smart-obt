// Upload Service - รองรับการเปลี่ยนระบบในอนาคต
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

// Upload Provider Interface - สำหรับการเปลี่ยนระบบในอนาคต
class UploadProvider {
  async uploadFile(file, path) {
    throw new Error('UploadProvider.uploadFile must be implemented');
  }
  
  async deleteFile(path) {
    throw new Error('UploadProvider.deleteFile must be implemented');
  }
  
  async getFileUrl(path) {
    throw new Error('UploadProvider.getFileUrl must be implemented');
  }
}

// Firebase Storage Implementation
class FirebaseUploadProvider extends UploadProvider {
  async uploadFile(file, path) {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        success: true,
        url: downloadURL,
        path: path,
        name: file.name,
        size: file.size,
        type: file.type
      };
    } catch (error) {
      console.error('Firebase upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async deleteFile(path) {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
      return { success: true };
    } catch (error) {
      console.error('Firebase delete error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async getFileUrl(path) {
    try {
      const storageRef = ref(storage, path);
      const url = await getDownloadURL(storageRef);
      return {
        success: true,
        url: url
      };
    } catch (error) {
      console.error('Firebase get URL error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// AWS S3 Implementation (สำหรับอนาคต)
class S3UploadProvider extends UploadProvider {
  async uploadFile(file, path) {
    // TODO: Implement AWS S3 upload
    throw new Error('S3UploadProvider not implemented yet');
  }
  
  async deleteFile(path) {
    // TODO: Implement AWS S3 delete
    throw new Error('S3UploadProvider not implemented yet');
  }
  
  async getFileUrl(path) {
    // TODO: Implement AWS S3 get URL
    throw new Error('S3UploadProvider not implemented yet');
  }
}

// Local Storage Implementation (สำหรับอนาคต)
class LocalUploadProvider extends UploadProvider {
  async uploadFile(file, path) {
    // TODO: Implement local storage upload
    throw new Error('LocalUploadProvider not implemented yet');
  }
  
  async deleteFile(path) {
    // TODO: Implement local storage delete
    throw new Error('LocalUploadProvider not implemented yet');
  }
  
  async getFileUrl(path) {
    // TODO: Implement local storage get URL
    throw new Error('LocalUploadProvider not implemented yet');
  }
}

// Upload Service Manager
class UploadService {
  constructor() {
    // เปลี่ยน provider ได้ง่ายๆ ที่นี่
    this.provider = new FirebaseUploadProvider();
    // this.provider = new S3UploadProvider();
    // this.provider = new LocalUploadProvider();
  }
  
  // เปลี่ยน provider ในอนาคต
  setProvider(provider) {
    this.provider = provider;
  }
  
  // Upload file
  async uploadFile(file, folder = 'uploads') {
    if (!file) {
      return { success: false, error: 'No file provided' };
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const filename = `${timestamp}_${randomString}.${extension}`;
    const path = `${folder}/${filename}`;
    
    return await this.provider.uploadFile(file, path);
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
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = filename.split('.').pop();
    const newFilename = `${timestamp}_${randomString}.${extension}`;
    
    switch (type) {
      case 'report':
        return `reports/${newFilename}`;
      case 'repair':
        return `repairs/${newFilename}`;
      case 'asset':
        return `assets/${newFilename}`;
      case 'user':
        return `users/${newFilename}`;
      default:
        return `uploads/${newFilename}`;
    }
  }
  
  // Validate file
  validateFile(file, options = {}) {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB default
      allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
    } = options;
    
    if (!file) {
      return { valid: false, error: 'No file provided' };
    }
    
    if (file.size > maxSize) {
      return { valid: false, error: `File size must be less than ${maxSize / 1024 / 1024}MB` };
    }
    
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: `File type must be one of: ${allowedTypes.join(', ')}` };
    }
    
    const extension = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      return { valid: false, error: `File extension must be one of: ${allowedExtensions.join(', ')}` };
    }
    
    return { valid: true };
  }
}

// Export singleton instance
const uploadService = new UploadService();
export default uploadService;

// Export classes for testing
export { UploadProvider, FirebaseUploadProvider, S3UploadProvider, LocalUploadProvider, UploadService };
