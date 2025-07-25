// pages/_error.tsx
import { NextPageContext } from "next";
import Link from "next/link";

function Error({ statusCode }: { statusCode?: number }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-red-800 text-center px-4">
      <h1 className="text-4xl font-bold mb-4">
        {statusCode
          ? `An error ${statusCode} occurred on server`
          : "An error occurred on client"}
      </h1>
      <p className="mb-6">Sorry for the inconvenience.</p>
      <Link href="/">
        <button className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition">
          Return Home
        </button>
      </Link>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res?.statusCode || err?.statusCode || 404;
  return { statusCode };
};

export default Error;
