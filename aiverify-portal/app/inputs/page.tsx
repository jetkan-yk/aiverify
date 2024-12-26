import { Icon, IconName } from '@/lib/components/IconSVG';
import { Card } from '@/lib/components/card/card';
import Link from 'next/link';
import { ScaleIcon } from '@/app/inputs/utils/icons';

export default async function InputsPage() {
  return (
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
            <h1 className="text-2xl font-bold text-white">User Inputs</h1>
            <h3 className="text-white">View and manage user inputs</h3>
          </div>
        </div>
      </div>
      <div className='flex mt-10 space-x-4'>
        <Link href="/inputs/checklists">
          <Card
            size="md"
            enableTiltEffect={true}
            tiltSpeed={200}
            tiltRotation={5}
            enableTiltGlare={true}
            tiltMaxGlare={0.3}
            className="bg-secondary-500 !bg-none"
          >
            <div className="flex flex-col justify-between p-6">
            <Icon
              name={IconName.Pencil}
              size={50}
              color="white"
            />
            <div>
              <p className="text-shadow-sm tracking-wide">Manage process checklists</p>
              <h2 className="text-shadow-sm text-2xl font-bold tracking-wide">
                AI Verify Process Checklists
              </h2>
            </div>
            </div>
          </Card>
        </Link>
        <Link href="/inputs/fairnesstree">
          <Card
            size="md"
            enableTiltEffect={true}
            tiltSpeed={200}
            tiltRotation={5}
            enableTiltGlare={true}
            tiltMaxGlare={0.3}
            className="bg-secondary-500 !bg-none"
          >
            <div className="flex flex-col justify-between p-6">
            <ScaleIcon color='white'/>
            <div>
              <p className="text-shadow-sm tracking-wide">Manage and view fairness trees</p>
              <h2 className="text-shadow-sm text-2xl font-bold tracking-wide">
                Fairness Tree
              </h2>
            </div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
