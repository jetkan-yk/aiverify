import {
  RiDeleteBin5Line,
  RiFileEditLine,
  RiFlaskLine,
} from '@remixicon/react';
import { getMDXComponent, MDXContentProps } from 'mdx-bundler/client';
import { useEffect, useMemo, useRef, useState } from 'react';
import React from 'react';
import { createPortal } from 'react-dom';
import { WidgetOnGridLayout } from '@/app/canvas/types';
import { Algorithm } from '@/app/types';

type GridItemComponentProps = {
  widget: WidgetOnGridLayout;
  inputBlockData?: unknown;
  testData?: unknown;
  onDeleteClick: () => void;
  onEditClick: (
    gridItemId: string,
    gridItemHtmlElement: HTMLDivElement | null,
    widget: WidgetOnGridLayout
  ) => void;
  isDragging?: boolean;
  algosMap: Record<string, Algorithm[]>;
};

/**
 * This is a higher-order component that allows developers to add modifications like styling to the MDX component.
 * It is currently not doing anything, but it is a placeholder for future use.
 * Currently it has placeholders for h2, h1, but no modifications are added.
 * @param WrappedComponent - The MDX component to wrap.
 * @returns A new component that adds text behavior to the MDX component.
 */
const withTextBehavior = <P extends MDXContentProps>(
  WrappedComponent: React.FunctionComponent<P>
) => {
  return function EnhancedComponent(props: P) {
    return (
      <WrappedComponent
        {...props}
        components={{
          ...props.components,
          // h1: (h1Props: { children: React.ReactNode }) => (
          //   <h1>{h1Props.children}</h1>
          // ),
          // h2: (h2Props: { children: React.ReactNode }) => (
          //   <h2>{h2Props.children}</h2>
          // ),
          // p: ({ children }) => <div>{children}!!</div>,
        }}
      />
    );
  };
};

function GridItemComponent(props: GridItemComponentProps) {
  const { widget, onDeleteClick, onEditClick, isDragging, algosMap } = props;
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const gridItemRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout>(null);
  const isHoveringRef = useRef<boolean>(false);

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isDragging) {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      setShowContextMenu(false);
      isHoveringRef.current = false;
    }
  }, [isDragging]);

  useEffect(() => {
    if (!showContextMenu) return;

    const updatePosition = () => {
      if (gridItemRef.current) {
        const rect = gridItemRef.current.getBoundingClientRect();
        setMenuPosition({
          top: rect.top,
          left: rect.right + 8,
        });
      }
    };

    // Initial position
    updatePosition();

    // Update position on scroll and resize
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [showContextMenu]);

  function handleMouseEnter() {
    isHoveringRef.current = true;
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    setShowContextMenu(true);
  }

  function handleMouseLeave() {
    isHoveringRef.current = false;
    hideTimeoutRef.current = setTimeout(() => {
      if (!isHoveringRef.current) {
        setShowContextMenu(false);
      }
    }, 500); //delay before hiding
  }

  function handleEditClick() {
    onEditClick(widget.gridItemId, gridItemRef.current, widget);
  }

  const Component = useMemo(() => {
    if (!widget.mdx) {
      const MissingMdxMessage = () => (
        <div>{`${widget.name} - ${widget.cid} : Missing mdx`}</div>
      );
      MissingMdxMessage.displayName = 'MissingMdxMessage';
      return MissingMdxMessage;
    }
    const MDXComponent = getMDXComponent(widget.mdx.code);
    // return withTextBehavior(MDXComponent);
    return MDXComponent;
  }, [widget, widget.mdx]);

  const properties = useMemo(() => {
    if (!widget.properties) return {};
    return widget.properties.reduce((props, property) => {
      return {
        ...props,
        [property.key]: property.value || property.default || property.helper,
      };
    }, {});
  }, [widget.properties]);

  return (
    <React.Fragment>
      {showContextMenu && !isDragging
        ? createPortal(
            <div
              className="fixed flex flex-col gap-1"
              style={{
                top: `${menuPosition.top}px`,
                left: `${menuPosition.left}px`,
              }}>
              <div className="max-w-[200px] break-words rounded bg-secondary-600 px-2 py-1 text-xs shadow-lg">
                {widget.name}
              </div>
              <div className="flex gap-1">
                <div
                  className="cursor-pointer rounded bg-secondary-400 shadow-lg"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onMouseDown={(e) => {
                    // Prevent grid drag from starting
                    e.stopPropagation();
                  }}
                  onClick={handleEditClick}>
                  <RiFileEditLine className="m-1 h-5 w-5 text-white hover:text-blue-800" />
                </div>
                <div
                  className="cursor-pointer rounded bg-secondary-400 shadow-lg"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onMouseDown={(e) => {
                    // Prevent grid drag from starting
                    e.stopPropagation();
                  }}
                  onClick={onDeleteClick}>
                  <RiDeleteBin5Line className="m-1 h-5 w-5 text-white hover:text-red-500" />
                </div>
              </div>
              {Object.keys(algosMap).length > 0 && (
                <section className="flex flex-col gap-1">
                  {algosMap[widget.gridItemId] &&
                    algosMap[widget.gridItemId].map((algo) => (
                      <div
                        key={algo.cid}
                        className="mt-1 flex w-[250px] flex-col items-start gap-2 rounded bg-secondary-200 p-4 text-gray-500 shadow-md">
                        <div className="flex items-center gap-2">
                          <RiFlaskLine className="h-5 w-5 text-gray-500 hover:text-gray-900" />
                          <h2 className="text-[0.9rem] font-semibold">Tests</h2>
                        </div>
                        <div className="mb-2 h-[1px] w-full bg-gray-500" />
                        <h3 className="text-[0.9rem] font-semibold">
                          {algo.name}
                        </h3>
                        <p className="text-[0.8rem]">{algo.description}</p>
                      </div>
                    ))}
                </section>
              )}
            </div>,
            document.body
          )
        : null}
      <div
        ref={gridItemRef}
        className="relative h-full w-full"
        onMouseOver={handleMouseEnter}
        onMouseLeave={handleMouseLeave}>
        <Component
          properties={properties}
          result={widget.result}
          getIBData={() => null} // TODO: add IB data
          getResults={() => null} // TODO: add results
          metrics={{}} // TODO: add metrics
          frontmatter={widget.mdx ? widget.mdx.frontmatter : undefined}
        />
      </div>
    </React.Fragment>
  );
}

export { GridItemComponent };
