import { useRouter } from 'next/router';
import React, { ReactNode, useState, useCallback } from 'react';
import { Frame, TopBar, Navigation } from '@shopify/polaris';
import {
  HomeMajor,
  CollectionsMajor,
  ProductsMajor,
  SearchMajor,
  BlogMajor,
  CircleInformationMajor,
  EmailMajor,
} from '@shopify/polaris-icons';

type Props = {
  children: ReactNode;
};

const DefaultLayout: React.FC<Props> = () => {
  const router = useRouter();

  const [mobileNavigationActive, setMobileNavigationActive] = useState(false);

  const toggleMobileNavigationActive = useCallback(
    () => setMobileNavigationActive((mobileNavigationActive) => !mobileNavigationActive),
    []
  );

  const topBarMarkup = (
    <TopBar
      showNavigationToggle
      // userMenu={<TopBar.UserMenu name="Dharma" initials="D" />}
      // secondaryMenu={}
      // searchResultsVisible={isSearchActive}
      // searchField={searchFieldMarkup}
      // searchResults={searchResultsMarkup}
      // onSearchResultsDismiss={handleSearchResultsDismiss}
      onNavigationToggle={toggleMobileNavigationActive}
      // searchResultsOverlayVisible={false}
    />
  );

  const navigationMarkup = (
    <Navigation location="/">
      <Navigation.Section
        items={[
          {
            label: 'Home',
            icon: HomeMajor,
            onClick: () => router.push('/'),
          },
          {
            label: 'Collections',
            icon: CollectionsMajor,
            onClick: () => router.push('/collections'),
          },
          {
            label: 'Catalog',
            icon: ProductsMajor,
            onClick: () => router.push('/products'),
          },
          {
            label: 'Search',
            icon: SearchMajor,
            onClick: () => router.push('/search'),
          },
          {
            label: 'News',
            icon: BlogMajor,
            onClick: () => router.push('/news'),
          },
          {
            label: 'About',
            icon: CircleInformationMajor,
            onClick: () => router.push('/about'),
          },
          {
            label: 'Contact',
            icon: EmailMajor,
            onClick: () => router.push('/contact'),
          },
        ]}
      />
    </Navigation>
  );

  return (
    <Frame
      topBar={topBarMarkup}
      navigation={navigationMarkup}
      showMobileNavigation={mobileNavigationActive}
      onNavigationDismiss={toggleMobileNavigationActive}
    >
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestiae voluptates et reprehenderit aut est sequi
      minima, consequatur, nisi sed error neque impedit explicabo. Sequi, vitae et cumque aspernatur sit atque!
    </Frame>
  );
};

export { DefaultLayout };
