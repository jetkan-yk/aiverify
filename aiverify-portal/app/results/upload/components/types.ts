export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export type FileUpload = {
  file: File;
  progress: number;
  status: UploadStatus;
  id: string;
};
