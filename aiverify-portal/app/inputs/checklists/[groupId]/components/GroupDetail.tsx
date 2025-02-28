'use client';
import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/lib/components/card/card';
import { useChecklists } from '@/app/inputs/context/ChecklistsContext';
import { Icon, IconName } from '@/lib/components/IconSVG';
import { useMDXSummaryBundle } from '../hooks/useMDXSummaryBundle';
import * as ReactJSXRuntime from 'react/jsx-runtime';
import { Checklist } from '@/app/inputs/utils/types';

const ChecklistMDX: React.FC<{ checklist: Checklist }> = ({ checklist }) => {
  const {
    data: mdxSummaryBundle,
    isLoading,
    error,
  } = useMDXSummaryBundle(checklist.gid, checklist.cid);

  const MDXComponent = useMemo(() => {
    if (!mdxSummaryBundle?.code) return null;

    try {
      const context = {
        React,
        jsx: ReactJSXRuntime.jsx,
        jsxs: ReactJSXRuntime.jsxs,
        _jsx_runtime: ReactJSXRuntime,
        Fragment: ReactJSXRuntime.Fragment,
      };

      const moduleFactory = new Function(
        ...Object.keys(context),
        `${mdxSummaryBundle.code}`
      );
      const moduleExports = moduleFactory(...Object.values(context));
      const progress = moduleExports.progress;
      const summary = moduleExports.summary;

      return { progress, summary };
    } catch (error) {
      console.error('Error creating MDX component:', error);
      return null;
    }
  }, [mdxSummaryBundle]);

  if (isLoading) {
    return <div className="text-sm text-gray-400">Loading...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-400">Error loading content</div>;
  }

  if (!MDXComponent) {
    return <div className="text-sm text-gray-400">No content available</div>;
  }

  return (
    <div className="mdx-content">
      {MDXComponent.summary && (
        <div className="mt-4 text-sm text-gray-400">
          {MDXComponent.summary(checklist.data)}
        </div>
      )}
      {MDXComponent.progress && (
        <div className="mt-4 text-sm text-gray-400">
          {MDXComponent.progress(checklist.data)}%
        </div>
      )}
    </div>
  );
};

const GroupDetail: React.FC<{
  groupChecklists: Checklist[];
  groupName: string;
}> = ({ groupChecklists, groupName }) => {
  const { checklists, setSelectedChecklist } = useChecklists();
  const router = useRouter();

  const handleChecklistClick = (checklistId: number) => {
    const selectedChecklist = groupChecklists.find(
      (checklist) => checklist.id === checklistId
    );
    if (selectedChecklist) {
      setSelectedChecklist(selectedChecklist);
      router.push(`/inputs/checklists/${groupName}/${checklistId}`);
    }
  };

  const createMDXComponent = (code: string, checklistData: any) => {
    try {
      // Define the context with all necessary runtime dependencies
      const context = {
        React,
        jsx: ReactJSXRuntime.jsx,
        jsxs: ReactJSXRuntime.jsxs,
        _jsx_runtime: ReactJSXRuntime,
        Fragment: ReactJSXRuntime.Fragment,
      };

      // Execute the code to get the module
      const moduleFactory = new Function(...Object.keys(context), `${code}`);

      // Get the module with all exports
      const moduleExports = moduleFactory(...Object.values(context));

      // Extract the component and metadata
      const MDXContent = moduleExports.default;
      const progress = moduleExports.progress;
      const summary = moduleExports.summary;

      // Create a wrapper component that includes both the content and metadata
      return function MDXWrapper(props: any) {
        return (
          <div className="mdx-content">
            {summary && (
              <div className="mt-4 text-sm text-gray-400">
                {summary(props.data)}
              </div>
            )}
            {progress && (
              <div className="mt-4 text-sm text-gray-400">
                {progress(props.data)}%
              </div>
            )}
          </div>
        );
      };
    } catch (error) {
      console.error('Error creating MDX component:', error);
      return null;
    }
  };
  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto bg-secondary-950 p-1 scrollbar-hidden">
      {groupChecklists.map((checklist) => (
        <Card
          key={checklist.id}
          size="md"
          className="mb-4 w-full cursor-pointer shadow-md transition-shadow duration-200 hover:shadow-lg"
          style={{
            border: '1px solid var(--color-secondary-300)',
            borderRadius: '0.5rem',
            padding: '1rem',
            width: '100%',
            height: 'auto',
          }}
          cardColor="var(--color-secondary-950)"
          enableTiltEffect={false}
          onClick={() => handleChecklistClick(checklist.id)}>
          <div className="flex flex-col gap-2">
            <div className="text-lg font-medium">{checklist.name}</div>
            <div className="text-sm text-gray-500">
              Last updated:{' '}
              {new Date(checklist.updated_at).toLocaleDateString()}
            </div>
            <ChecklistMDX checklist={checklist} />
          </div>
        </Card>
      ))}
    </div>
  );
};

export default GroupDetail;
