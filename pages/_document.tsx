import React from "react";
import {
  Html,
  Head,
  Main,
  NextScript,
  type DocumentProps,
} from "next/document";
import { type DocumentContext } from "next/document";
import Document from "next/document";

class MyDocument extends Document<DocumentProps> {
  render() {
    return (
      <Html lang="pt-BR">
        <Head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
