'use client';

import Fuse from 'fuse.js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState, useTransition } from 'react';
import { Dataset } from '@/app/types';
import { deleteDataset } from '@/lib/actions/deleteDataset';
import { Icon, IconName } from '@/lib/components/IconSVG';
import { Button, ButtonVariant } from '@/lib/components/button';
import { debounce } from '@/lib/utils/debounce';
import { cn } from '@/lib/utils/twmerge';
import { Column, DataGrid } from './DataGrid';
import { Filters } from './Filters';

type DatasetListProps = {
  datasets: Dataset[];
  className?: string;
};

const columns: Column<Dataset>[] = [
  {
    field: 'fileType' as keyof Dataset,
    headerName: 'Type',
    renderCell: (row: Dataset) => (
      <Icon
        name={row.fileType === 'file' ? IconName.File : IconName.Folder}
        size={20}
        svgClassName="stroke-white"
      />
    ),
  },
  { field: 'name', headerName: 'Name' },
  { field: 'numRows', headerName: 'Rows' },
  { field: 'numCols', headerName: 'Columns' },
  { field: 'updated_at', headerName: 'Date' },
];

function DatasetList({ datasets, className }: DatasetListProps) {
  const [filteredDatasets, setFilteredDatasets] = useState(datasets);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | undefined>();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    setFilteredDatasets(datasets);
  }, [datasets]);

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        const result = await deleteDataset(id);
        if (result.success) {
          router.refresh();
        }
        setSelectedDataset(undefined);
      } catch (error) {
        console.error('Error deleting dataset:', error);
      }
    });
  }

  const fuse = useMemo(() => {
    const options = {
      keys: ['name'],
      includeScore: true,
      threshold: 0.7,
    };
    return new Fuse(datasets, options);
  }, [datasets]);

  const handleSearchInputChange = useMemo(
    () =>
      debounce((value: string) => {
        if (value.length === 0) {
          setFilteredDatasets(datasets);
          return;
        }
        const result = fuse.search(value);
        setFilteredDatasets(result.map((r) => r.item));
      }, 300),
    [fuse, setFilteredDatasets]
  );

  function handleRowClick(dataset: Dataset) {
    setSelectedDataset(dataset);
  }

  const dataGrid = (
    <DataGrid<Dataset>
      columns={columns}
      rows={filteredDatasets}
      pageSizeOptions={[10, 25, 50, 100]}
      onRowClick={handleRowClick}
      highlightRow={selectedDataset}
    />
  );

  return (
    <section className={cn('flex flex-col gap-2', className)}>
      <Filters onSearchInputChange={handleSearchInputChange} />
      <div className="flex flex-grow gap-4">
        <div className="h-[500px] flex-grow overflow-y-auto">{dataGrid}</div>
        {selectedDataset && (
          <div className="flex min-w-[40%] flex-col rounded-lg bg-secondary-950 px-6 py-4 shadow-md">
            <div className="flex w-full flex-col gap-2">
              <div className="flex gap-3">
                <span className="text-secondary-400">File Type:</span>
                <span>{selectedDataset.fileType}</span>
              </div>
              <div className="flex gap-3">
                <span className="text-secondary-400">File Name:</span>
                <span>{selectedDataset.filename}</span>
              </div>
              <div className="flex gap-3">
                <span className="text-secondary-400">Size:</span>
                <span>{selectedDataset.size} bytes</span>
              </div>
              <div className="flex gap-3">
                <span className="text-secondary-400">Data Format:</span>
                <span>{selectedDataset.dataFormat || 'N/A'}</span>
              </div>
              <div className="flex gap-3">
                <span className="text-secondary-400">Rows:</span>
                <span>{selectedDataset.numRows || 'N/A'}</span>
              </div>
              <div className="flex gap-3">
                <span className="text-secondary-400">Columns:</span>
                <span>{selectedDataset.numCols || 'N/A'}</span>
              </div>
              <div className="flex gap-3">
                <span className="text-secondary-400">Status:</span>
                <span>{selectedDataset.status}</span>
              </div>
              <div className="flex gap-3">
                <span className="text-secondary-400">Created:</span>
                <span>
                  {new Date(selectedDataset.created_at).toLocaleString()}
                </span>
              </div>
              <div className="flex gap-3">
                <span className="text-secondary-400">Last Updated:</span>
                <span>
                  {new Date(selectedDataset.updated_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="mt-5 flex w-full justify-end gap-3">
        {selectedDataset && (
          <Button
            type="button"
            variant={ButtonVariant.SECONDARY}
            text="Delete"
            size="md"
            pill
            onClick={() => handleDelete(selectedDataset.id)}
            disabled={isPending}
          />
        )}
        <Link href="/datasets/upload">
          <Button
            type="button"
            variant={ButtonVariant.PRIMARY}
            text="Upload"
            size="md"
            pill
            disabled={isPending}
          />
        </Link>
      </div>
    </section>
  );
}

export { DatasetList };
