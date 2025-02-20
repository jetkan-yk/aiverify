import { RiFlaskFill, RiFlaskLine, RiSurveyFill, RiSurveyLine } from '@remixicon/react';
import React from 'react';
import { ParsedTestResults, WidgetOnGridLayout } from '@/app/canvas/types';
import { findAlgoFromPluginsById } from '@/app/canvas/utils/findAlgoFromPluginsById';
import { findInputBlockFromPluginsById } from '@/app/canvas/utils/findInputBlockFromPluginsById';
import { findPluginByGid } from '@/app/canvas/utils/findPluginByGid';
import { InputBlockData, Plugin } from '@/app/types';
import { Button } from '@/lib/components/Button/button';
import { DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerBody } from '@/lib/components/drawer';
import { Drawer } from '@/lib/components/drawer';
import { cn } from '@/lib/utils/twmerge';

type WidgetPropertiesDrawerProps = {
  plugins: Plugin[];
  className?: string;
  testResultsMeta?: ParsedTestResults;
  inputBlocksDataUsed?: InputBlockData[];
  widget: WidgetOnGridLayout;
  onOkClick: () => void;
  onDeleteClick: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
};

function WidgetPropertiesDrawer(props: WidgetPropertiesDrawerProps) {
  const { plugins, widget, testResultsMeta, inputBlocksDataUsed, className, onOkClick, onDeleteClick, open, setOpen } = props;
  const parentPlugin = findPluginByGid(plugins, widget.gid);
  const algos = widget.dependencies.map((dep) => {
    if (!dep.cid) {
      return undefined;
    }
    const gid = dep.gid || widget.gid;
    return findAlgoFromPluginsById(plugins, gid, dep.cid);
  }).filter((algo) => algo !== undefined);

  const inputBlocks = widget.dependencies.map((ib) => {
    if (!ib.cid) {
      return undefined;
    }
    const gid = ib.gid || widget.gid;
    return findInputBlockFromPluginsById(plugins, gid, ib.cid);
  }).filter((ib) => ib !== undefined);

  return (
    <div className={cn("flex justify-center", className)}>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="sm:max-w-lg">
          <DrawerHeader>
            <DrawerTitle className="text-gray-500">Widget Properties</DrawerTitle>
            <DrawerDescription className="mt-1 text-sm py-2">
              <span className="text-[1.1rem] font-semibold text-primary-800">{parentPlugin?.name}</span><br />
              <span className="text-[0.9rem] font-semibold text-primary-900">{widget.name}</span>
            </DrawerDescription>
          </DrawerHeader>
          <DrawerBody>
            {algos && algos.length > 0 ? (
              <React.Fragment>
                <div className="flex flex-col items-start gap-1 text-gray-500 mt-4">
                  <div className="flex items-center gap-2">
                    <RiFlaskLine className="h-5 w-5 text-gray-500 hover:text-gray-900" />
                    <h2 className="text-[0.9rem] font-semibold">Widget runs the following test(s)</h2>
                  </div>
                  <ul>
                    {algos.map((algo) => (
                      <li
                        key={algo.cid}
                        className="flex flex-col items-start gap-1 text-gray-400 p-0 mt-1 ml-2">
                        {/* <div className="mb-2 h-[1px] w-full bg-gray-500" /> */}
                        <h3 className="text-[0.9rem] font-semibold">
                          {algo.name}
                        </h3>
                        <p className="text-[0.8rem]">{algo.description}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col items-start gap-1 ml-5">
                  <div className="flex items-center gap-2 mt-8 text-gray-500">
                    <RiFlaskFill className="h-4 w-4 text-gray-500 hover:text-gray-900" />
                    <h2 className="text-[0.8rem] font-semibold">Test(s) results</h2>
                  </div>
                  {!testResultsMeta ?
                    <div className=" text-[0.8rem] text-blue-600">Currently using mock data</div> :
                    <div className="flex flex-col items-start">
                      <div className=" text-[0.8rem] text-blue-600">{testResultsMeta.name}</div>
                      <div className=" text-[0.8rem] text-blue-600">Created at: {new Date(testResultsMeta.created_at).toLocaleString()}</div>
                      <div className=" text-[0.8rem] text-blue-600">Updated at: {new Date(testResultsMeta.updated_at).toLocaleString()}</div>
                      <div className=" text-[0.8rem] text-blue-600">Version: {testResultsMeta.version}</div>
                    </div>
                  }
                </div>
                <div className="mb-2 h-[1px] w-full bg-gray-200 my-8" />
              </React.Fragment>
            ) : null}

            {inputBlocks && inputBlocks.length > 0 ? (
              <React.Fragment>
                <div className="flex flex-col items-start gap-1 text-gray-500 mt-8">
                  <div className="flex items-center gap-2">
                    <RiSurveyLine className="h-5 w-5 text-gray-500 hover:text-gray-900" />
                    <h2 className="text-[0.9rem] font-semibold">Widget requires the following user input(s)</h2>
                  </div>
                  <ul>
                    {inputBlocks.map((ib) => (
                      <li
                        key={ib.cid}
                        className="flex flex-col items-start gap-1 text-gray-400 p-0 mt-1 ml-2">
                        {/* <div className="mb-2 h-[1px] w-full bg-gray-500" /> */}
                        <h3 className="text-[0.9rem] font-semibold">
                          {ib.name}
                        </h3>
                        <p className="text-[0.8rem]">{ib.description}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col items-start gap-1 ml-5">
                  <div className="flex items-center gap-2 mt-8 text-gray-500">
                    <RiSurveyFill className="h-4 w-4 text-gray-500 hover:text-gray-900" />
                    <h2 className="text-[0.8rem] font-semibold">User Input Data</h2>
                  </div>
                  {!inputBlocksDataUsed ? <div className=" text-[0.8rem] text-blue-600">Currently using mock data</div> : null}
                </div>
              </React.Fragment>
            ) : null}
          </DrawerBody>
          <DrawerFooter className="mt-6">
            <DrawerClose asChild>
              <Button
                className="mt-2 w-full sm:mt-0 sm:w-fit"
                variant="secondary"
                onClick={() => onDeleteClick()}
              >
                Delete widget
              </Button>
            </DrawerClose>
            <DrawerClose asChild>
              <Button className="w-full sm:w-fit" onClick={() => onOkClick()}>Ok</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

export { WidgetPropertiesDrawer };
