import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import "bootstrap/dist/css/bootstrap.min.css"
import { MantineProvider, createTheme } from '@mantine/core';
import { ReactElement, ReactNode } from 'react';
import { NextPage } from 'next';
import MainLayout from '@/components/layout';

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
}
 
type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

const theme = createTheme({
  /** Put your mantine theme override here */
});

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page)
  return getLayout(
    <MantineProvider theme={theme}>
      <MainLayout>
        <Component {...pageProps} />
      </MainLayout>
    </MantineProvider>
  )
}




