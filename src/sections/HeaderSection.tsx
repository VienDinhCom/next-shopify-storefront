import { useState, NextImage, NextLink, useRouter, clsx } from '@app/utilities/deps';
import { Dialog, Disclosure, Popover, Transition } from '@headlessui/react';
import { ChevronDownIcon, PhoneIcon, PlayCircleIcon } from '@heroicons/react/20/solid';
import { useCart } from '@shopify/hydrogen-react';

import {
  ArrowPathIcon,
  Bars3Icon,
  ChartPieIcon,
  CursorArrowRaysIcon,
  FingerPrintIcon,
  SquaresPlusIcon,
  XMarkIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline';

const mainMenuItems: { text: string; href: string; pathname: string }[] = [
  {
    text: 'Products',
    href: '/products',
  },
].map((item) => ({ ...item, pathname: new URL('https://x' + item.href).pathname }));

export function HeaderSection() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { totalQuantity } = useCart();

  return (
    <header className="shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <NextLink href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Next Shopify Storefront</span>
            <ShoppingBagIcon className="h-6 w-6"></ShoppingBagIcon>
          </NextLink>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <Popover.Group className="hidden lg:flex lg:gap-x-12">
          {mainMenuItems.map(({ text, href, pathname }) => (
            <NextLink
              className={clsx(
                'text-sm font-semibold leading-6 text-gray-900',
                router.pathname.startsWith(pathname) && 'text-primary-600'
              )}
              key={href}
              href={href}
            >
              {text}
            </NextLink>
          ))}
        </Popover.Group>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <NextLink href="/cart">
            <span className="sr-only">Cart</span>
            <span className="relative inline-block">
              <ShoppingCartIcon className="h-6 w-6"></ShoppingCartIcon>
              {!!totalQuantity && (
                <span className="absolute top-0 right-0 inline-flex translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-red-600 px-2 py-1 text-xs font-bold leading-none text-red-100">
                  {totalQuantity}
                </span>
              )}
            </span>
          </NextLink>
        </div>
      </nav>
      <Dialog as="div" className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
        <div className="fixed inset-0 z-10" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <NextLink href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">Next Shopify Storefront</span>
              <NextImage className="h-8 w-auto" src="/logo.svg" alt="" width={160} height={24} />
            </NextLink>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {/* <Disclosure as="div" className="-mx-3">
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base font-semibold leading-7 hover:bg-gray-50">
                        Product
                        <ChevronDownIcon
                          className={classNames(open ? 'rotate-180' : '', 'h-5 w-5 flex-none')}
                          aria-hidden="true"
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel className="mt-2 space-y-2">
                        {[...products, ...callsToAction].map((item) => (
                          <Disclosure.Button
                            key={item.name}
                            as="a"
                            href={item.href}
                            className="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                          >
                            {item.name}
                          </Disclosure.Button>
                        ))}
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure> */}

                {mainMenuItems.map(({ text, href, pathname }) => (
                  <NextLink
                    className={clsx(
                      '-mx-3 block rounded-lg py-2 px-3 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50',
                      router.pathname.startsWith(pathname) && 'text-primary-600'
                    )}
                    key={href}
                    href={href}
                  >
                    {text}
                  </NextLink>
                ))}
              </div>
              <div className="py-6">
                <a
                  href="#"
                  className="-mx-3 block rounded-lg py-2.5 px-3 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                >
                  Log in
                </a>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
}
