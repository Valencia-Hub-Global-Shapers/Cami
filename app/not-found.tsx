import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-8">
      <h1 className="font-serif text-3xl font-semibold">Page not found</h1>
      <p className="mt-4 text-muted">
        This page does not exist or has moved.
      </p>
      <Link href="/#directory" className="btn-primary mt-8">
        Browse the directory
      </Link>
    </div>
  );
}
