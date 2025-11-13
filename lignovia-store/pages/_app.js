import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { ConfirmDialogProvider } from "@/contexts/ConfirmDialogContext";
import { GlobalSearchProvider } from "@/contexts/GlobalSearchContext";
import { CalendarProvider } from "@/contexts/CalendarContext";
import { SkeletonStyles } from "@/components/Skeleton";
import Head from "next/head";

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      </Head>
      <SkeletonStyles />
      <ThemeProvider>
        <SessionProvider session={session}>
          <ToastProvider>
            <ConfirmDialogProvider>
              <GlobalSearchProvider>
                <CalendarProvider>
                  <Component {...pageProps} />
                </CalendarProvider>
              </GlobalSearchProvider>
            </ConfirmDialogProvider>
          </ToastProvider>
        </SessionProvider>
      </ThemeProvider>
    </>
  );
}
