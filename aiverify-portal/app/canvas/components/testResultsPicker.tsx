import { RiArticleFill, RiFlaskLine } from '@remixicon/react';
import { useState } from 'react';
import { ParsedTestResults } from '@/app/canvas/types';
import { Button } from '@/lib/components/Button/button';
import { DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerBody } from '@/lib/components/drawer';
import { Drawer } from '@/lib/components/drawer';
import { cn } from '@/lib/utils/twmerge';

type TestResultsPickerProps = {
  className?: string;
  testResults: ParsedTestResults[];
};

function TestResultsPicker(props: TestResultsPickerProps) {
  const { testResults, className } = props;
  const [selectedTestResults, setSelectedTestResults] = useState<ParsedTestResults[]>([]);

  console.log(selectedTestResults);

  return (
    <div className={cn("flex justify-center", className)}>
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="secondary">
        <RiArticleFill className="h-5 w-5 text-gray-500 hover:text-gray-900" />
          &nbsp;Use uploaded test results</Button>
      </DrawerTrigger>
      <DrawerContent className="sm:max-w-lg">
        <DrawerHeader>
          <DrawerTitle>Populate widgets with test results</DrawerTitle>
          <DrawerDescription className="mt-1 text-sm">
            Select the test results you want to use to populate the widgets.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <label key={index} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  checked={selectedTestResults.includes(result)}
                  disabled={!selectedTestResults.includes(result) && selectedTestResults.some(r => r.gid === result.gid)}
                  onChange={() => {
                    setSelectedTestResults(prev =>
                      prev.includes(result)
                        ? prev.filter(r => r !== result)
                        : [...prev, result]
                    );
                  }}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">
                    {result.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {result.created_at}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </DrawerBody>
        <DrawerFooter className="mt-6">
          <DrawerClose asChild>
            <Button
              className="mt-2 w-full sm:mt-0 sm:w-fit"
              variant="secondary"
            >
              Go back
            </Button>
          </DrawerClose>
          <DrawerClose asChild>
            <Button className="w-full sm:w-fit">Ok, use selected results</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  </div>
  );
}

export { TestResultsPicker };
