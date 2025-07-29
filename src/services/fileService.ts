import { Attachment } from '../types';
import { v4 as uuidv4 } from 'uuid';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const SUPPORTED_DOCUMENT_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const SUPPORTED_FILE_TYPES = [...SUPPORTED_IMAGE_TYPES, ...SUPPORTED_DOCUMENT_TYPES];

export class FileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileError';
  }
}

const validateFile = (file: File): void => {
  if (file.size > MAX_FILE_SIZE) {
    throw new FileError(`File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)} MB`);
  }

  if (!SUPPORTED_FILE_TYPES.includes(file.type)) {
    throw new FileError(`File type '${file.type}' is not supported`);
  }
};

export const processFile = async (file: File): Promise<Attachment> => {
  try {
    validateFile(file);

    const url = URL.createObjectURL(file);

    let type: 'image' | 'pdf' | 'document';
    if (SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      type = 'image';
    } else if (file.type === 'application/pdf') {
      type = 'pdf';
    } else {
      type = 'document';
    }

    const attachment: Attachment = {
      id: uuidv4(),
      type,
      name: file.name,
      size: file.size,
      url
    };

    return attachment;
  } catch (error) {
    if (error instanceof FileError) {
      throw error;
    }
    console.error('Error processing file:', error);
    throw new FileError('Failed to process file');
  }
};

export const getFileTypeIcon = (type: string): string => {
  switch (type) {
    case 'image':
      return 'image';
    case 'pdf':
      return 'file-text';
    case 'document':
      return 'file';
    default:
      return 'file';
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
};

export const revokeFileUrl = (url: string): void => {
  URL.revokeObjectURL(url);
};
