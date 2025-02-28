import Link from 'next/link';
import { QueryProvider } from '@/app/inputs/fairnesstree/components/QueryProvider';
import { ChevronLeftIcon } from '@/app/inputs/utils/icons';
import { Icon, IconName } from '@/lib/components/IconSVG';
import { getAllFairnessTrees } from '@/lib/fetchApis/getAllFairnessTrees';
import ActionButtons from './components/ActionButtons';
import FairnessTreeHydration from './components/FairnessTreeHydration';
import { FairnessTreeProvider } from './context/FairnessTreeContext';

export default async function FairnessTreePage() {
  const trees = await getAllFairnessTrees();

  return (
    <QueryProvider>
      <FairnessTreeProvider>
        <div className="p-6">
          <div className="mb-1 flex items-center justify-between">
            {/* Left section: Icon + Text */}
            <div className="flex items-center">
              <Icon
                name={IconName.File}
                size={40}
                color="#FFFFFF"
              />
              <div className="ml-3">
                <div className="flex">
                  <Link href="/inputs/">
                    <h1 className="text-2xl font-bold text-white hover:underline">
                      User Inputs
                    </h1>
                  </Link>
                  <ChevronLeftIcon
                    size={28}
                    color="#FFFFFF"
                  />
                  <h1 className="text-2xl font-bold text-white">
                    Fairness Trees
                  </h1>
                </div>
                <h3 className="text-white">
                  Manage and view Fairness Trees for Fairness Classification
                </h3>
              </div>
            </div>
            <ActionButtons />
          </div>
          <FairnessTreeHydration initialTrees={trees} />
        </div>
      </FairnessTreeProvider>
    </QueryProvider>
  );
}
