import { NextLink } from '@site/utilities/deps';

export function HeroSection() {
  return (
    <section className="mx-auto max-w-2xl py-10 sm:py-20 lg:py-32">
      <div className="hidden sm:mb-8 sm:flex sm:justify-center">
        <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
          If you want to contribute to the project.{' '}
          <a
            target="_blank"
            href="https://github.com/maxvien/next-shopify-storefront"
            className="font-semibold text-indigo-600"
          >
            <span className="absolute inset-0" aria-hidden="true" />
            Go here <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </div>
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">Next Shopify Storefront</h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          A <b>Shopping Cart</b> built with <b>TypeScript</b>, <b>Tailwind CSS</b>, <b>Headless UI</b>, <b>Next.js</b>,{' '}
          <b>React.js</b>, <b>Shopify Hydrogen React</b>,... and <b>Shopify Storefront GraphQL API</b>.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <NextLink
            href="/products"
            className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Browse Products
          </NextLink>
          <a
            href="https://github.com/maxvien/next-shopify-storefront"
            className="text-sm font-semibold leading-6 text-gray-900"
            target="_blank"
          >
            Get Source Code <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
