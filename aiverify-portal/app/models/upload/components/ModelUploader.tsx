'use client';

import { useState } from 'react';
import FileUploader from '@/app/models/upload/components/FileUploader';
import FolderUpload from '@/app/models/upload/components/FolderUploader';
import { Icon, IconName } from '@/lib/components/IconSVG';
import { Button, ButtonVariant } from '@/lib/components/button';

const ModelUploader = ({ onBack }: { onBack: () => void }) => {
  const [activeTab, setActiveTab] = useState<'file' | 'folder'>('file');

  return (
    <div className="h-[calc(100%-2rem)] overflow-y-auto pl-6 pr-6">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center">
          <Icon
            name={IconName.ArrowLeft}
            color="white"
            onClick={onBack}
          />
          <h1 className="ml-4 text-2xl font-semibold text-white">
            Add New AI Model {'>'} Upload Model
          </h1>
        </div>
        <div className="inline-flex p-1">
          <div className="flex items-center">
            <Button
              pill
              textColor="white"
              variant={
                activeTab === 'file'
                  ? ButtonVariant.PRIMARY
                  : ButtonVariant.OUTLINE
              }
              size="sm"
              text="FILE"
              className="!rounded-r-none rounded-l-full"
              onClick={() => setActiveTab('file')}
            />
            <Button
              pill
              textColor="white"
              variant={
                activeTab === 'folder'
                  ? ButtonVariant.PRIMARY
                  : ButtonVariant.OUTLINE
              }
              size="sm"
              text="FOLDER"
              className="!rounded-l-none rounded-r-full"
              onClick={() => setActiveTab('folder')}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg">
        {activeTab === 'file' ? (
          <FileUploader />
        ) : (
          <FolderUpload onBack={onBack} />
        )}
      </div>
    </div>
  );
};

export default ModelUploader;
