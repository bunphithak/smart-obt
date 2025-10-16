import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="th">
      <Head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="Smart OBT - ระบบจัดการทรัพย์สินและงานซ่อมบำรุง" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

