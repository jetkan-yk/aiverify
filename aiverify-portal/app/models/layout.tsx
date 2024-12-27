'use client';

import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '../globals.css';
import LayoutHeader from './components/LayoutHeader';

type LayoutProps = {
  children: ReactNode;
};

const queryClient = new QueryClient();

const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <div>
        <LayoutHeader />
        <main className="mx-auto px-4 pt-[64px] sm:px-6 lg:max-w-[1520px] lg:px-8 xl:max-w-[1720px] xl:px-12">
          {children}
        </main>
      </div>
    </QueryClientProvider>
  );
};

export default Layout;