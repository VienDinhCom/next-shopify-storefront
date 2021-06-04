import Link from 'next/link';

export default function Page() {
  return (
    <div>
      <h1>About</h1>
      <Link href="/">
        <a>Home</a>
      </Link>
    </div>
  );
}
