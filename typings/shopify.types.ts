export type Maybe<T> = T | null;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** An RFC 3986 and RFC 3987 compliant URI string. */
  URL: any;
  /** A string containing HTML code. */
  HTML: any;
  /** An ISO-8601 encoded UTC date time string. */
  DateTime: any;
  /** A monetary value string. */
  Money: any;
  /** A signed decimal number, which supports arbitrary precision and is serialized as a string. */
  Decimal: any;
};

/** Details about the gift card used on the checkout. */
export type AppliedGiftCard = Node & {
  __typename?: 'AppliedGiftCard';
  /** The amount that was used taken from the Gift Card by applying it. */
  amountUsed: Scalars['Money'];
  /** The amount that was used taken from the Gift Card by applying it. */
  amountUsedV2: MoneyV2;
  /** The amount left on the Gift Card. */
  balance: Scalars['Money'];
  /** The amount left on the Gift Card. */
  balanceV2: MoneyV2;
  /** Globally unique identifier. */
  id: Scalars['ID'];
  /** The last characters of the Gift Card code */
  lastCharacters: Scalars['String'];
};

export type Article = Node & {
  __typename?: 'Article';
  /** The article's author. */
  author: ArticleAuthor;
  /** The article's author. */
  authorV2?: Maybe<ArticleAuthor>;
  /** The blog that the article belongs to. */
  blog: Blog;
  /** List of comments posted on the article. */
  comments: CommentConnection;
  /** Stripped content of the article, single line with HTML tags removed. */
  content: Scalars['String'];
  /** The content of the article, complete with HTML formatting. */
  contentHtml: Scalars['HTML'];
  /** Stripped excerpt of the article, single line with HTML tags removed. */
  excerpt?: Maybe<Scalars['String']>;
  /** The excerpt of the article, complete with HTML formatting. */
  excerptHtml?: Maybe<Scalars['HTML']>;
  /** A human-friendly unique string for the Article automatically generated from its title. */
  handle: Scalars['String'];
  /** Globally unique identifier. */
  id: Scalars['ID'];
  /** The image associated with the article. */
  image?: Maybe<Image>;
  /** The date and time when the article was published. */
  publishedAt: Scalars['DateTime'];
  /** The article’s SEO information. */
  seo?: Maybe<Seo>;
  /** A categorization that a article can be tagged with. */
  tags: Array<Scalars['String']>;
  /** The article’s name. */
  title: Scalars['String'];
  /** The url pointing to the article accessible from the web. */
  url: Scalars['URL'];
};

export type ArticleCommentsArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  reverse: Scalars['Boolean'];
};

export type ArticleContentArgs = {
  truncateAt?: Maybe<Scalars['Int']>;
};

export type ArticleExcerptArgs = {
  truncateAt?: Maybe<Scalars['Int']>;
};

export type ArticleImageArgs = {
  maxWidth?: Maybe<Scalars['Int']>;
  maxHeight?: Maybe<Scalars['Int']>;
  crop?: Maybe<CropRegion>;
  scale: Scalars['Int'];
};

export type ArticleAuthor = {
  __typename?: 'ArticleAuthor';
  /** The author's bio. */
  bio?: Maybe<Scalars['String']>;
  /** The author’s email. */
  email: Scalars['String'];
  /** The author's first name. */
  firstName: Scalars['String'];
  /** The author's last name. */
  lastName: Scalars['String'];
  /** The author's full name. */
  name: Scalars['String'];
};

export type ArticleConnection = {
  __typename?: 'ArticleConnection';
  /** A list of edges. */
  edges: Array<ArticleEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

export type ArticleEdge = {
  __typename?: 'ArticleEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of ArticleEdge. */
  node: Article;
};

/** The set of valid sort keys for the articles query. */
export enum ArticleSortKeys {
  /** Sort by the `title` value. */
  Title = 'TITLE',
  /** Sort by the `blog_title` value. */
  BlogTitle = 'BLOG_TITLE',
  /** Sort by the `author` value. */
  Author = 'AUTHOR',
  /** Sort by the `updated_at` value. */
  UpdatedAt = 'UPDATED_AT',
  /** Sort by the `published_at` value. */
  PublishedAt = 'PUBLISHED_AT',
  /** Sort by the `id` value. */
  Id = 'ID',
  /** During a search (i.e. when the `query` parameter has been specified on the connection) this sorts the
   * results by relevance to the search term(s). When no search query is specified, this sort key is not
   * deterministic and should not be used.
   */
  Relevance = 'RELEVANCE'
}

/** Represents a generic custom attribute. */
export type Attribute = {
  __typename?: 'Attribute';
  /** Key or name of the attribute. */
  key: Scalars['String'];
  /** Value of the attribute. */
  value?: Maybe<Scalars['String']>;
};

/** Specifies the input fields required for an attribute. */
export type AttributeInput = {
  /** Key or name of the attribute. */
  key: Scalars['String'];
  /** Value of the attribute. */
  value: Scalars['String'];
};

/** Automatic discount applications capture the intentions of a discount that was automatically applied. */
export type AutomaticDiscountApplication = DiscountApplication & {
  __typename?: 'AutomaticDiscountApplication';
  /** The method by which the discount's value is allocated to its entitled items. */
  allocationMethod: DiscountApplicationAllocationMethod;
  /** Which lines of targetType that the discount is allocated over. */
  targetSelection: DiscountApplicationTargetSelection;
  /** The type of line that the discount is applicable towards. */
  targetType: DiscountApplicationTargetType;
  /** The title of the application. */
  title: Scalars['String'];
  /** The value of the discount application. */
  value: PricingValue;
};

/** A collection of available shipping rates for a checkout. */
export type AvailableShippingRates = {
  __typename?: 'AvailableShippingRates';
  /** Whether or not the shipping rates are ready.
   * The `shippingRates` field is `null` when this value is `false`.
   * This field should be polled until its value becomes `true`.
   */
  ready: Scalars['Boolean'];
  /** The fetched shipping rates. `null` until the `ready` field is `true`. */
  shippingRates?: Maybe<Array<ShippingRate>>;
};

export type Blog = Node & {
  __typename?: 'Blog';
  /** Find an article by its handle. */
  articleByHandle?: Maybe<Article>;
  /** List of the blog's articles. */
  articles: ArticleConnection;
  /** The authors who have contributed to the blog. */
  authors: Array<ArticleAuthor>;
  /** A human-friendly unique string for the Blog automatically generated from its title. */
  handle: Scalars['String'];
  /** Globally unique identifier. */
  id: Scalars['ID'];
  /** The blogs’s title. */
  title: Scalars['String'];
  /** The url pointing to the blog accessible from the web. */
  url: Scalars['URL'];
};

export type BlogArticleByHandleArgs = {
  handle: Scalars['String'];
};

export type BlogArticlesArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  reverse: Scalars['Boolean'];
  sortKey: ArticleSortKeys;
  query?: Maybe<Scalars['String']>;
};

export type BlogConnection = {
  __typename?: 'BlogConnection';
  /** A list of edges. */
  edges: Array<BlogEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

export type BlogEdge = {
  __typename?: 'BlogEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of BlogEdge. */
  node: Blog;
};

/** The set of valid sort keys for the blogs query. */
export enum BlogSortKeys {
  /** Sort by the `handle` value. */
  Handle = 'HANDLE',
  /** Sort by the `title` value. */
  Title = 'TITLE',
  /** Sort by the `id` value. */
  Id = 'ID',
  /** During a search (i.e. when the `query` parameter has been specified on the connection) this sorts the
   * results by relevance to the search term(s). When no search query is specified, this sort key is not
   * deterministic and should not be used.
   */
  Relevance = 'RELEVANCE'
}

/** Card brand, such as Visa or Mastercard, which can be used for payments. */
export enum CardBrand {
  /** Visa */
  Visa = 'VISA',
  /** Mastercard */
  Mastercard = 'MASTERCARD',
  /** Discover */
  Discover = 'DISCOVER',
  /** American Express */
  AmericanExpress = 'AMERICAN_EXPRESS',
  /** Diners Club */
  DinersClub = 'DINERS_CLUB',
  /** JCB */
  Jcb = 'JCB'
}

/** A container for all the information required to checkout items and pay. */
export type Checkout = Node & {
  __typename?: 'Checkout';
  appliedGiftCards: Array<AppliedGiftCard>;
  /** The available shipping rates for this Checkout.
   * Should only be used when checkout `requiresShipping` is `true` and
   * the shipping address is valid.
   */
  availableShippingRates?: Maybe<AvailableShippingRates>;
  /** The date and time when the checkout was completed. */
  completedAt?: Maybe<Scalars['DateTime']>;
  /** The date and time when the checkout was created. */
  createdAt: Scalars['DateTime'];
  /** The currency code for the Checkout. */
  currencyCode: CurrencyCode;
  /** A list of extra information that is added to the checkout. */
  customAttributes: Array<Attribute>;
  /** The customer associated with the checkout. */
  customer?: Maybe<Customer>;
  /** Discounts that have been applied on the checkout. */
  discountApplications: DiscountApplicationConnection;
  /** The email attached to this checkout. */
  email?: Maybe<Scalars['String']>;
  /** Globally unique identifier. */
  id: Scalars['ID'];
  /** A list of line item objects, each one containing information about an item in the checkout. */
  lineItems: CheckoutLineItemConnection;
  /** The sum of all the prices of all the items in the checkout. Taxes, shipping and discounts excluded. */
  lineItemsSubtotalPrice: MoneyV2;
  note?: Maybe<Scalars['String']>;
  /** The resulting order from a paid checkout. */
  order?: Maybe<Order>;
  /** The Order Status Page for this Checkout, null when checkout is not completed. */
  orderStatusUrl?: Maybe<Scalars['URL']>;
  /** The amount left to be paid. This is equal to the cost of the line items, taxes
   * and shipping minus discounts and gift cards.
   */
  paymentDue: Scalars['Money'];
  /** The amount left to be paid. This is equal to the cost of the line items, taxes
   * and shipping minus discounts and gift cards.
   */
  paymentDueV2: MoneyV2;
  /** Whether or not the Checkout is ready and can be completed. Checkouts may have
   * asynchronous operations that can take time to finish. If you want to complete
   * a checkout or ensure all the fields are populated and up to date, polling is
   * required until the value is true.
   */
  ready: Scalars['Boolean'];
  /** States whether or not the fulfillment requires shipping. */
  requiresShipping: Scalars['Boolean'];
  /** The shipping address to where the line items will be shipped. */
  shippingAddress?: Maybe<MailingAddress>;
  /** The discounts that have been allocated onto the shipping line by discount applications. */
  shippingDiscountAllocations: Array<DiscountAllocation>;
  /** Once a shipping rate is selected by the customer it is transitioned to a `shipping_line` object. */
  shippingLine?: Maybe<ShippingRate>;
  /** Price of the checkout before shipping and taxes. */
  subtotalPrice: Scalars['Money'];
  /** Price of the checkout before shipping and taxes. */
  subtotalPriceV2: MoneyV2;
  /** Specifies if the Checkout is tax exempt. */
  taxExempt: Scalars['Boolean'];
  /** Specifies if taxes are included in the line item and shipping line prices. */
  taxesIncluded: Scalars['Boolean'];
  /** The sum of all the prices of all the items in the checkout, taxes and discounts included. */
  totalPrice: Scalars['Money'];
  /** The sum of all the prices of all the items in the checkout, taxes and discounts included. */
  totalPriceV2: MoneyV2;
  /** The sum of all the taxes applied to the line items and shipping lines in the checkout. */
  totalTax: Scalars['Money'];
  /** The sum of all the taxes applied to the line items and shipping lines in the checkout. */
  totalTaxV2: MoneyV2;
  /** The date and time when the checkout was last updated. */
  updatedAt: Scalars['DateTime'];
  /** The url pointing to the checkout accessible from the web. */
  webUrl: Scalars['URL'];
};

/** A container for all the information required to checkout items and pay. */
export type CheckoutDiscountApplicationsArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  reverse: Scalars['Boolean'];
};

/** A container for all the information required to checkout items and pay. */
export type CheckoutLineItemsArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  reverse: Scalars['Boolean'];
};

/** Specifies the fields required to update a checkout's attributes. */
export type CheckoutAttributesUpdateInput = {
  /** The text of an optional note that a shop owner can attach to the checkout. */
  note?: Maybe<Scalars['String']>;
  /** A list of extra information that is added to the checkout. */
  customAttributes?: Maybe<Array<AttributeInput>>;
  /** Allows setting partial addresses on a Checkout, skipping the full validation of attributes.
   * The required attributes are city, province, and country.
   * Full validation of the addresses is still done at complete time.
   */
  allowPartialAddresses?: Maybe<Scalars['Boolean']>;
};

/** Return type for `checkoutAttributesUpdate` mutation. */
export type CheckoutAttributesUpdatePayload = {
  __typename?: 'CheckoutAttributesUpdatePayload';
  /** The updated checkout object. */
  checkout: Checkout;
  /** List of errors that occurred executing the mutation. */
  checkoutUserErrors: Array<CheckoutUserError>;
  /** List of errors that occurred executing the mutation. */
  userErrors: Array<UserError>;
};

/** Specifies the fields required to update a checkout's attributes. */
export type CheckoutAttributesUpdateV2Input = {
  /** The text of an optional note that a shop owner can attach to the checkout. */
  note?: Maybe<Scalars['String']>;
  /** A list of extra information that is added to the checkout. */
  customAttributes?: Maybe<Array<AttributeInput>>;
  /** Allows setting partial addresses on a Checkout, skipping the full validation of attributes.
   * The required attributes are city, province, and country.
   * Full validation of the addresses is still done at complete time.
   */
  allowPartialAddresses?: Maybe<Scalars['Boolean']>;
};

/** Return type for `checkoutAttributesUpdateV2` mutation. */
export type CheckoutAttributesUpdateV2Payload = {
  __typename?: 'CheckoutAttributesUpdateV2Payload';
  /** The updated checkout object. */
  checkout?: Maybe<Checkout>;
  /** List of errors that occurred executing the mutation. */
  checkoutUserErrors: Array<CheckoutUserError>;
  /** List of errors that occurred executing the mutation. */
  userErrors: Array<UserError>;
};

/** Return type for `checkoutCompleteFree` mutation. */
export type CheckoutCompleteFreePayload = {
  __typename?: 'CheckoutCompleteFreePayload';
  /** The updated checkout object. */
  checkout?: Maybe<Checkout>;
  /** List of errors that occurred executing the mutation. */
  checkoutUserErrors: Array<CheckoutUserError>;
  /** List of errors that occurred executing the mutation. */
  userErrors: Array<UserError>;
};

/** Return type for `checkoutCompleteWithCreditCard` mutation. */
export type CheckoutCompleteWithCreditCardPayload = {
  __typename?: 'CheckoutCompleteWithCreditCardPayload';
  /** The checkout on which the payment was applied. */
  checkout: Checkout;
  /** List of errors that occurred executing the mutation. */
  checkoutUserErrors: Array<CheckoutUserError>;
  /** A representation of the attempted payment. */
  payment?: Maybe<Payment>;
  /** List of errors that occurred executing the mutation. */
  userErrors: Array<UserError>;
};

/** Return type for `checkoutCompleteWithCreditCardV2` mutation. */
export type CheckoutCompleteWithCreditCardV2Payload = {
  __typename?: 'CheckoutCompleteWithCreditCardV2Payload';
  /** The checkout on which the payment was applied. */
  checkout?: Maybe<Checkout>;
  /** List of errors that occurred executing the mutation. */
  checkoutUserErrors: Array<CheckoutUserError>;
  /** A representation of the attempted payment. */
  payment?: Maybe<Payment>;
  /** List of errors that occurred executing the mutation. */
  userErrors: Array<UserError>;
};

/** Return type for `checkoutCompleteWithTokenizedPayment` mutation. */
export type CheckoutCompleteWithTokenizedPaymentPayload = {
  __typename?: 'CheckoutCompleteWithTokenizedPaymentPayload';
  /** The checkout on which the payment was applied. */
  checkout: Checkout;
  /** List of errors that occurred executing the mutation. */
  checkoutUserErrors: Array<CheckoutUserError>;
  /** A representation of the attempted payment. */
  payment?: Maybe<Payment>;
  /** List of errors that occurred executing the mutation. */
  userErrors: Array<UserError>;
};

/** Return type for `checkoutCompleteWithTokenizedPaymentV2` mutation. */
export type CheckoutCompleteWithTokenizedPaymentV2Payload = {
  __typename?: 'CheckoutCompleteWithTokenizedPaymentV2Payload';
  /** The checkout on which the payment was applied. */
  checkout?: Maybe<Checkout>;
  /** List of errors that occurred executing the mutation. */
  checkoutUserErrors: Array<CheckoutUserError>;
  /** A representation of the attempted payment. */
  payment?: Maybe<Payment>;
  /** List of errors that occurred executing the mutation. */
  userErrors: Array<UserError>;
};

/** Specifies the fields required to create a checkout. */
export type CheckoutCreateInput = {
  /** The email with which the customer wants to checkout. */
  email?: Maybe<Scalars['String']>;
  /** A list of line item objects, each one containing information about an item in the checkout. */
  lineItems?: Maybe<Array<CheckoutLineItemInput>>;
  /** The shipping address to where the line items will be shipped. */
  shippingAddress?: Maybe<MailingAddressInput>;
  /** The text of an optional note that a shop owner can attach to the checkout. */
  note?: Maybe<Scalars['String']>;
  /** A list of extra information that is added to the checkout. */
  customAttributes?: Maybe<Array<AttributeInput>>;
  /** Allows setting partial addresses on a Checkout, skipping the full validation of attributes.
   * The required attributes are city, province, and country.
   * Full validation of addresses is still done at complete time.
   */
  allowPartialAddresses?: Maybe<Scalars['Boolean']>;
  /** The three-letter currency code of one of the shop's enabled presentment currencies.
   * Including this field creates a checkout in the specified currency. By default, new
   * checkouts are created in the shop's primary currency.
   */
  presentmentCurrencyCode?: Maybe<CurrencyCode>;
};

/** Return type for `checkoutCreate` mutation. */
export type CheckoutCreatePayload = {
  __typename?: 'CheckoutCreatePayload';
  /** The new checkout object. */
  checkout?: Maybe<Checkout>;
  /** List of errors that occurred executing the mutation. */
  checkoutUserErrors: Array<CheckoutUserError>;
  /** List of errors that occurred executing the mutation. */
  userErrors: Array<UserError>;
};

/** Return type for `checkoutCustomerAssociate` mutation. */
export type CheckoutCustomerAssociatePayload = {
  __typename?: 'CheckoutCustomerAssociatePayload';
  /** The updated checkout object. */
  checkout: Checkout;
  /** The associated customer object. */
  customer?: Maybe<Customer>;
  /** List of errors that occurred executing the mutation. */
  userErrors: Array<UserError>;
};

/** Return type for `checkoutCustomerAssociateV2` mutation. */
export type CheckoutCustomerAssociateV2Payload = {
  __typename?: 'CheckoutCustomerAssociateV2Payload';
  /** The updated checkout object. */
  checkout?: Maybe<Checkout>;
  /** List of errors that occurred executing the mutation. */
  checkoutUserErrors: Array<CheckoutUserError>;
  /** The associated customer object. */
  customer?: Maybe<Customer>;
  /** List of errors that occurred executing the mutation. */
  userErrors: Array<UserError>;
};

/** Return type for `checkoutCustomerDisassociate` mutation. */
export type CheckoutCustomerDisassociatePayload = {
  __typename?: 'CheckoutCustomerDisassociatePayload';
  /** The updated checkout object. */
  checkout: Checkout;
  /** List of errors that occurred executing the mutation. */
  checkoutUserErrors: Array<CheckoutUserError>;
  /** List of errors that occurred executing the mutation. */
  userErrors: Array<UserError>;
};

/** Return type for `checkoutCustomerDisassociateV2` mutation. */
export type CheckoutCustomerDisassociateV2Payload = {
  __typename?: 'CheckoutCustomerDisassociateV2Payload';
  /** The updated checkout object. */
  checkout?: Maybe<Checkout>;
  /** List of errors that occurred executing the mutation. */
  checkoutUserErrors: Array<CheckoutUserError>;
  /** List of errors that occurred executing the mutation. */
  userErrors: Array<UserError>;
};

/** Return type for `checkoutDiscountCodeApply` mutation. */
export type CheckoutDiscountCodeApplyPayload = {
  __typename?: 'CheckoutDiscountCodeApplyPayload';
  /** The updated checkout object. */
  checkout: Checkout;
  /** List of errors that occurred executing the mutation. */
  checkoutUserErrors: Array<CheckoutUserError>;
  /** List of errors that occurred executing the mutation. */
  userErrors: Array<UserError>;
};

/** Return type for `checkoutDiscountCodeApplyV2` mutation. */
export type CheckoutDiscountCodeApplyV2Payload = {
  __typename?: 'CheckoutDiscountCodeApplyV2Payload';
  /** The updated checkout object. */
  checkout?: Maybe<Checkout>;
  /** List of errors that occurred executing the mutation. */
  checkoutUserErrors: Array<CheckoutUserError>;
  /** List of errors that occurred executing the mutation. */
  userErrors: Array<UserError>;
};

/** Return type for `checkoutDiscountCodeRemove` mutation. */
export type CheckoutDiscountCodeRemovePayload = {
  __typename?: 'CheckoutDiscountCodeRemovePayload';
  /** The updated checkout object. */
  checkout?: Maybe<Checkout>;
  /** List of errors that occurred executing the mutation. */
  checkoutUserErrors: Array<CheckoutUserError>;
  /** List of errors that occurred executing the mutation. */
  userErrors: Array<UserError>;
};

/** Return type for `checkoutEmailUpdate` mutation. */
export type CheckoutEmailUpdatePayload = {
  __typename?: 'CheckoutEmailUpdatePayload';
  /** The checkout object with the updated email. */
  checkout: Checkout;
  /** List of errors that occurred executing the mutation. */
  checkoutUserErrors: Array<CheckoutUserError>;
  /** List of errors that occurred executing the mutation. */
  userErrors: Array<UserError>;
};

/** Return type for `checkoutEmailUpdateV2` mutation. */
export type CheckoutEmailUpdateV2Payload = {
  __typename?: 'CheckoutEmailUpdateV2Payload';
  /** The checkout object with the updated email. */
  checkout?: Maybe<Checkout>;
  /** List of errors that occurred executing the mutation. */
  checkoutUserErrors: Array<CheckoutUserError>;
  /** List of errors that occurred executing the mutation. */
  userErrors: Array<UserError>;
};

/** Possible error codes that could be returned by a checkout mutation. */
export enum CheckoutErrorCode {
  /** Input value is blank. */
  Blank = 'BLANK',
  /** Input value is invalid. */
  Invalid = 'INVALID',
  /** Input value is too long. */
  TooLong = 'TOO_LONG',
  /** Input value is not present. */
  Present = 'PRESENT',
  /** Input value should be less than maximum allowed value. */
  LessThan = 'LESS_THAN',
  /** Input value should be greater than or equal to minimum allowed value. */
  GreaterThanOrEqualTo = 'GREATER_THAN_OR_EQUAL_TO',
  /** Input value should be less or equal to maximum allowed value. */
  LessThanOrEqualTo = 'LESS_THAN_OR_EQUAL_TO',
  /** Checkout is already completed. */
  AlreadyCompleted = 'ALREADY_COMPLETED',
  /** Checkout is locked. */
  Locked = 'LOCKED',
  /** Input value is not supported. */
  NotSupported = 'NOT_SUPPORTED',
  /** Input Zip is invalid for country and province provided. */
  InvalidForCountryAndProvince = 'INVALID_FOR_COUNTRY_AND_PROVINCE',
  /** Invalid state in country. */
  InvalidStateInCountry = 'INVALID_STATE_IN_COUNTRY',
  /** Invalid province in country. */
  InvalidProvinceInCountry = 'INVALID_PROVINCE_IN_COUNTRY',
  /** Invalid region in country. */
  InvalidRegionInCountry = 'INVALID_REGION_IN_COUNTRY',
  /** Shipping rate expired. */
  ShippingRateExpired = 'SHIPPING_RATE_EXPIRED',
  /** Gift card cannot be applied to a checkout that contains a gift card. */
  GiftCardUnusable = 'GIFT_CARD_UNUSABLE',
  /** Gift card is disabled. */
  GiftCardDisabled = 'GIFT_CARD_DISABLED',
  /** Gift card code is invalid. */
  GiftCardCodeInvalid = 'GIFT_CARD_CODE_INVALID',
  /** Gift card has already been applied. */
  GiftCardAlreadyApplied = 'GIFT_CARD_ALREADY_APPLIED',
  /** Gift card currency does not match checkout currency. */
  GiftCardCurrencyMismatch = 'GIFT_CARD_CURRENCY_MISMATCH',
  /** Gift card is expired. */
  GiftCardExpired = 'GIFT_CARD_EXPIRED',
  /** Gift card was not found. */
  GiftCardNotFound = 'GIFT_CARD_NOT_FOUND',
  /** Cart does not meet discount requirements notice. */
  CartDoesNotMeetDiscountRequirementsNotice = 'CART_DOES_NOT_MEET_DISCOUNT_REQUIREMENTS_NOTICE',
  /** Discount expired. */
  DiscountExpired = 'DISCOUNT_EXPIRED',
  /** Discount disabled. */
  DiscountDisabled = 'DISCOUNT_DISABLED',
  /** Discount limit reached. */
  DiscountLimitReached = 'DISCOUNT_LIMIT_REACHED',
  /** Discount not found. */
  DiscountNotFound = 'DISCOUNT_NOT_FOUND',
  /** Customer already used once per customer discount notice. */
  CustomerAlreadyUsedOncePerCustomerDiscountNotice = 'CUSTOMER_ALREADY_USED_ONCE_PER_CUSTOMER_DISCOUNT_NOTICE',
  /** Checkout is already completed. */
  Empty = 'EMPTY',
  /** Not enough in stock. */
  NotEnoughInStock = 'NOT_ENOUGH_IN_STOCK',
  /** Missing payment input. */
  MissingPaymentInput = 'MISSING_PAYMENT_INPUT',
  /** Line item was not found in checkout. */
  LineItemNotFound = 'LINE_ITEM_NOT_FOUND'
}

/** Return type for `checkoutGiftCardApply` mutation. */
export type CheckoutGiftCardApplyPayload = {
  __typename?: 'CheckoutGiftCardApplyPayload';
  /** The updated checkout object. */
  checkout: Checkout;
  /** List of errors that occurred executing the mutation. */
  checkoutUserErrors: Array<CheckoutUserError>;
  /** List of errors that occurred executing the mutation. */
  userErrors: Array<UserError>;
};

/** Return type for `checkoutGiftCardRemove` mutation. */
export type CheckoutGiftCardRemovePayload = {
  __typename?: 'CheckoutGiftCardRemovePayload';
  /** The updated checkout object. */
  checkout: Checkout;
  /** List of errors that occurred executing the mutation. */
  checkoutUserErrors: Array<CheckoutUserError>;
  /** List of errors that occurred executing the mutation. */
  userErrors: Array<UserError>;
};

/** Return type for `checkoutGiftCardRemoveV2` mutation. */
export type CheckoutGiftCardRemoveV2Payload = {
  __typename?: 'CheckoutGiftCardRemoveV2Payload';
  /** The updated checkout object. */
  checkout?: Maybe<Checkout>;
  /** List of errors that occurred executing the mutation. */
  checkoutUserErrors: Array<CheckoutUserError>;
  /** List of errors that occurred executing the mutation. */
  userErrors: Array<UserError>;
};

/** Return type for `checkoutGiftCardsAppend` mutation. */
export type CheckoutGiftCardsAppendPayload = {
  __typename?: 'CheckoutGiftCardsAppendPayload';
  /** The updated checkout object. */
  checkout?: Maybe<Checkout>;
  /** List of errors that occurred executing the mutation. */
  checkoutUserErrors: Array<CheckoutUserError>;
  /** List of errors that occurred executing the mutation. */
  userErrors: Array<UserError>;
};

/** A single line item in the checkout, grouped by variant and attributes. */
export type CheckoutLineItem = Node & {
  __typename?: 'CheckoutLineItem';
  /** Extra information in the form of an array of Key-Value pairs about the line item. */
  customAttributes: Array<Attribute>;
  /** The discounts that have been allocated onto the checkout line item by discount applications. */
  discountAllocations: Array<DiscountAllocation>;
  /** Globally unique identifier. */
  id: Scalars['ID'];
  /** The quantity of the line item. */
  quantity: Scalars['Int'];
  /** Title of the line item. Defaults to the product's title. */
  title: Scalars['String'];
  /** Product variant of the line item. */
  variant?: Maybe<ProductVariant>;
};

export type CheckoutLineItemConnection = {
  __typename?: 'CheckoutLineItemConnection';
  /** A list of edges. */
  edges: Array<CheckoutLineItemEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

export type CheckoutLineItemEdge = {
  __typename?: 'CheckoutLineItemEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of CheckoutLineItemEdge. */
  node: CheckoutLineItem;
};

/** Specifies the input fields to create a line item on a checkout. */
export type CheckoutLineItemInput = {
  /** Extra information in the form of an array of Key-Value pairs about the line item. */
  customAttributes?: Maybe<Array<AttributeInput>>;
  /** The quantity of the line item. */
  quantity: Scalars['Int'];
  /** The identifier of the product variant for the line item. */
  variantId: Scalars['ID'];
};

/** Return type for `checkoutLineItemsAdd` mutation. */
export type CheckoutLineItemsAddPayload = {
  __typename?: 'CheckoutLineItemsAddPayload';
  /** The updated checkout object. */
  checkout?: Maybe<Checkout>;
  /** List of errors that occurred executing the mutation. */
  checkoutUserErrors: Array<CheckoutUserError>;
  /** List of errors that occurred executing the mutation. */
  userErrors: Array<UserError>;
};

/** Return type for `checkoutLineItemsRemove` mutation. */
export type CheckoutLineItemsRemovePayload = {
  __typename?: 'CheckoutLineItemsRemovePayload';
  checkout?: Maybe<Checkout>;
  /** List of errors that occurred executing the mutation. */
  checkoutUserErrors: Array<CheckoutUserError>;
  /** List of errors that occurred executing the mutation. */
  userErrors: Array<UserError>;
};

/** Return type for `checkoutLineItemsReplace` mutation. */
export type CheckoutLineItemsReplacePayload = {
  __typename?: 'CheckoutLineItemsReplacePayload';
  /** The updated checkout object. */
  checkout?: Maybe<Checkout>;
  /** List of errors that occurred executing the mutation. */
  userErrors: Array<CheckoutUserError>;
};

/** Return type for `checkoutLineItemsUpdate` mutation. */
export type CheckoutLineItemsUpdatePayload = {
  __typename?: 'CheckoutLineItemsUpdatePayload';
  /** The updated checkout object. */
  checkout?: Maybe<Checkout>;
  /** List of errors that occurred executing the mutation. */
  checkoutUserErrors: Array<CheckoutUserError>;
  /** List of errors that occurred executing the mutation. */
  userErrors: Array<UserError>;
};

/** Specifies the input fields to update a line item on the checkout. */
export type CheckoutLineItemUpdateInput = {
  id?: Maybe<Scalars['ID']>;
  /** The variant identifier of the line item. */
  variantId?: Maybe<Scalars['ID']>;
  /** The quantity of the line item. */
  quantity?: Maybe<Scalars['Int']>;
  /** Extra information in the form of an array of Key-Value pairs about the line item. */
  customAttributes?: Maybe<Array<AttributeInput>>;
};

/** Return type for `checkoutShippingAddressUpdate` mutation. */
export type CheckoutShippingAddressUpdatePayload = {
  __typename?: 'CheckoutShippingAddressUpdatePayload';
  /** The updated checkout object. */
  checkout: Checkout;
  /** List of errors that occurred executing the mutation. */
  checkoutUserErrors: Array<CheckoutUserError>;
  /** List of errors that occurred executing the mutation. */
  userErrors: Array<UserError>;
};

/** Return type for `checkoutShippingAddressUpdateV2` mutation. */
export type CheckoutShippingAddressUpdateV2Payload = {
  __typename?: 'CheckoutShippingAddressUpdateV2Payload';
  /** The updated checkout object. */
  checkout?: Maybe<Checkout>;
  /** List of errors that occurred executing the mutation. */
  checkoutUserErrors: Array<CheckoutUserError>;
  /** List of errors that occurred executing the mutation. */
  userErrors: Array<UserError>;
};

/** Return type for `checkoutShippingLineUpdate` mutation. */
export type CheckoutShippingLineUpdatePayload = {
  __typename?: 'CheckoutShippingLineUpdatePayload';
  /** The updated checkout object. */
  checkout?: Maybe<Checkout>;
  /** List of errors that occurred executing the mutation. */
  checkoutUserErrors: Array<CheckoutUserError>;
  /** List of errors that occurred executing the mutation. */
  userErrors: Array<UserError>;
};

/** Represents an error that happens during execution of a checkout mutation. */
export type CheckoutUserError = DisplayableError & {
  __typename?: 'CheckoutUserError';
  /** Error code to uniquely identify the error. */
  code?: Maybe<CheckoutErrorCode>;
  /** Path to the input field which caused the error. */
  field?: Maybe<Array<Scalars['String']>>;
  /** The error message. */
  message: Scalars['String'];
};

/** A collection represents a grouping of products that a shop owner can create to
 * organize them or make their shops easier to browse.
 */
export type Collection = Node & {
  __typename?: 'Collection';
  /** Stripped description of the collection, single line with HTML tags removed. */
  description: Scalars['String'];
  /** The description of the collection, complete with HTML formatting. */
  descriptionHtml: Scalars['HTML'];
  /** A human-friendly unique string for the collection automatically generated from its title.
   * Limit of 255 characters.
   */
  handle: Scalars['String'];
  /** Globally unique identifier. */
  id: Scalars['ID'];
  /** Image associated with the collection. */
  image?: Maybe<Image>;
  /** List of products in the collection. */
  products: ProductConnection;
  /** The collection’s name. Limit of 255 characters. */
  title: Scalars['String'];
  /** The date and time when the collection was last modified. */
  updatedAt: Scalars['DateTime'];
};

/** A collection represents a grouping of products that a shop owner can create to
 * organize them or make their shops easier to browse.
 */
export type CollectionDescriptionArgs = {
  truncateAt?: Maybe<Scalars['Int']>;
};

/** A collection represents a grouping of products that a shop owner can create to
 * organize them or make their shops easier to browse.
 */
export type CollectionImageArgs = {
  maxWidth?: Maybe<Scalars['Int']>;
  maxHeight?: Maybe<Scalars['Int']>;
  crop?: Maybe<CropRegion>;
  scale: Scalars['Int'];
};

/** A collection represents a grouping of products that a shop owner can create to
 * organize them or make their shops easier to browse.
 */
export type CollectionProductsArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  reverse: Scalars['Boolean'];
  sortKey: ProductCollectionSortKeys;
};

export type CollectionConnection = {
  __typename?: 'CollectionConnection';
  /** A list of edges. */
  edges: Array<CollectionEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

export type CollectionEdge = {
  __typename?: 'CollectionEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of CollectionEdge. */
  node: Collection;
};

/** The set of valid sort keys for the collections query. */
export enum CollectionSortKeys {
  /** Sort by the `title` value. */
  Title = 'TITLE',
  /** Sort by the `updated_at` value. */
  UpdatedAt = 'UPDATED_AT',
  /** Sort by the `id` value. */
  Id = 'ID',
  /** During a search (i.e. when the `query` parameter has been specified on the connection) this sorts the
   * results by relevance to the search term(s). When no search query is specified, this sort key is not
   * deterministic and should not be used.
   */
  Relevance = 'RELEVANCE'
}

export type Comment = Node & {
  __typename?: 'Comment';
  /** The comment’s author. */
  author: CommentAuthor;
  /** Stripped content of the comment, single line with HTML tags removed. */
  content: Scalars['String'];
  /** The content of the comment, complete with HTML formatting. */
  contentHtml: Scalars['HTML'];
  /** Globally unique identifier. */
  id: Scalars['ID'];
};

export type CommentContentArgs = {
  truncateAt?: Maybe<Scalars['Int']>;
};

export type CommentAuthor = {
  __typename?: 'CommentAuthor';
  /** The author's email. */
  email: Scalars['String'];
  /** The author’s name. */
  name: Scalars['String'];
};

export type CommentConnection = {
  __typename?: 'CommentConnection';
  /** A list of edges. */
  edges: Array<CommentEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

export type CommentEdge = {
  __typename?: 'CommentEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of CommentEdge. */
  node: Comment;
};

/** ISO 3166-1 alpha-2 country codes with some differences. */
export enum CountryCode {
  /** Afghanistan. */
  Af = 'AF',
  /** Aland Islands. */
  Ax = 'AX',
  /** Albania. */
  Al = 'AL',
  /** Algeria. */
  Dz = 'DZ',
  /** Andorra. */
  Ad = 'AD',
  /** Angola. */
  Ao = 'AO',
  /** Anguilla. */
  Ai = 'AI',
  /** Antigua And Barbuda. */
  Ag = 'AG',
  /** Argentina. */
  Ar = 'AR',
  /** Armenia. */
  Am = 'AM',
  /** Aruba. */
  Aw = 'AW',
  /** Australia. */
  Au = 'AU',
  /** Austria. */
  At = 'AT',
  /** Azerbaijan. */
  Az = 'AZ',
  /** Bahamas. */
  Bs = 'BS',
  /** Bahrain. */
  Bh = 'BH',
  /** Bangladesh. */
  Bd = 'BD',
  /** Barbados. */
  Bb = 'BB',
  /** Belarus. */
  By = 'BY',
  /** Belgium. */
  Be = 'BE',
  /** Belize. */
  Bz = 'BZ',
  /** Benin. */
  Bj = 'BJ',
  /** Bermuda. */
  Bm = 'BM',
  /** Bhutan. */
  Bt = 'BT',
  /** Bolivia. */
  Bo = 'BO',
  /** Bonaire, Sint Eustatius and Saba. */
  Bq = 'BQ',
  /** Bosnia And Herzegovina. */
  Ba = 'BA',
  /** Botswana. */
  Bw = 'BW',
  /** Bouvet Island. */
  Bv = 'BV',
  /** Brazil. */
  Br = 'BR',
  /** British Indian Ocean Territory. */
  Io = 'IO',
  /** Brunei. */
  Bn = 'BN',
  /** Bulgaria. */
  Bg = 'BG',
  /** Burkina Faso. */
  Bf = 'BF',
  /** Burundi. */
  Bi = 'BI',
  /** Cambodia. */
  Kh = 'KH',
  /** Canada. */
  Ca = 'CA',
  /** Cape Verde. */
  Cv = 'CV',
  /** Cayman Islands. */
  Ky = 'KY',
  /** Central African Republic. */
  Cf = 'CF',
  /** Chad. */
  Td = 'TD',
  /** Chile. */
  Cl = 'CL',
  /** China. */
  Cn = 'CN',
  /** Christmas Island. */
  Cx = 'CX',
  /** Cocos (Keeling) Islands. */
  Cc = 'CC',
  /** Colombia. */
  Co = 'CO',
  /** Comoros. */
  Km = 'KM',
  /** Congo. */
  Cg = 'CG',
  /** Congo, The Democratic Republic Of The. */
  Cd = 'CD',
  /** Cook Islands. */
  Ck = 'CK',
  /** Costa Rica. */
  Cr = 'CR',
  /** Croatia. */
  Hr = 'HR',
  /** Cuba. */
  Cu = 'CU',
  /** Curaçao. */
  Cw = 'CW',
  /** Cyprus. */
  Cy = 'CY',
  /** Czech Republic. */
  Cz = 'CZ',
  /** Côte d'Ivoire. */
  Ci = 'CI',
  /** Denmark. */
  Dk = 'DK',
  /** Djibouti. */
  Dj = 'DJ',
  /** Dominica. */
  Dm = 'DM',
  /** Dominican Republic. */
  Do = 'DO',
  /** Ecuador. */
  Ec = 'EC',
  /** Egypt. */
  Eg = 'EG',
  /** El Salvador. */
  Sv = 'SV',
  /** Equatorial Guinea. */
  Gq = 'GQ',
  /** Eritrea. */
  Er = 'ER',
  /** Estonia. */
  Ee = 'EE',
  /** Ethiopia. */
  Et = 'ET',
  /** Falkland Islands (Malvinas). */
  Fk = 'FK',
  /** Faroe Islands. */
  Fo = 'FO',
  /** Fiji. */
  Fj = 'FJ',
  /** Finland. */
  Fi = 'FI',
  /** France. */
  Fr = 'FR',
  /** French Guiana. */
  Gf = 'GF',
  /** French Polynesia. */
  Pf = 'PF',
  /** French Southern Territories. */
  Tf = 'TF',
  /** Gabon. */
  Ga = 'GA',
  /** Gambia. */
  Gm = 'GM',
  /** Georgia. */
  Ge = 'GE',
  /** Germany. */
  De = 'DE',
  /** Ghana. */
  Gh = 'GH',
  /** Gibraltar. */
  Gi = 'GI',
  /** Greece. */
  Gr = 'GR',
  /** Greenland. */
  Gl = 'GL',
  /** Grenada. */
  Gd = 'GD',
  /** Guadeloupe. */
  Gp = 'GP',
  /** Guatemala. */
  Gt = 'GT',
  /** Guernsey. */
  Gg = 'GG',
  /** Guinea. */
  Gn = 'GN',
  /** Guinea Bissau. */
  Gw = 'GW',
  /** Guyana. */
  Gy = 'GY',
  /** Haiti. */
  Ht = 'HT',
  /** Heard Island And Mcdonald Islands. */
  Hm = 'HM',
  /** Holy See (Vatican City State). */
  Va = 'VA',
  /** Honduras. */
  Hn = 'HN',
  /** Hong Kong. */
  Hk = 'HK',
  /** Hungary. */
  Hu = 'HU',
  /** Iceland. */
  Is = 'IS',
  /** India. */
  In = 'IN',
  /** Indonesia. */
  Id = 'ID',
  /** Iran, Islamic Republic Of. */
  Ir = 'IR',
  /** Iraq. */
  Iq = 'IQ',
  /** Ireland. */
  Ie = 'IE',
  /** Isle Of Man. */
  Im = 'IM',
  /** Israel. */
  Il = 'IL',
  /** Italy. */
  It = 'IT',
  /** Jamaica. */
  Jm = 'JM',
  /** Japan. */
  Jp = 'JP',
  /** Jersey. */
  Je = 'JE',
  /** Jordan. */
  Jo = 'JO',
  /** Kazakhstan. */
  Kz = 'KZ',
  /** Kenya. */
  Ke = 'KE',
  /** Kiribati. */
  Ki = 'KI',
  /** Korea, Democratic People's Republic Of. */
  Kp = 'KP',
  /** Kosovo. */
  Xk = 'XK',
  /** Kuwait. */
  Kw = 'KW',
  /** Kyrgyzstan. */
  Kg = 'KG',
  /** Lao People's Democratic Republic. */
  La = 'LA',
  /** Latvia. */
  Lv = 'LV',
  /** Lebanon. */
  Lb = 'LB',
  /** Lesotho. */
  Ls = 'LS',
  /** Liberia. */
  Lr = 'LR',
  /** Libyan Arab Jamahiriya. */
  Ly = 'LY',
  /** Liechtenstein. */
  Li = 'LI',
  /** Lithuania. */
  Lt = 'LT',
  /** Luxembourg. */
  Lu = 'LU',
  /** Macao. */
  Mo = 'MO',
  /** Macedonia, Republic Of. */
  Mk = 'MK',
  /** Madagascar. */
  Mg = 'MG',
  /** Malawi. */
  Mw = 'MW',
  /** Malaysia. */
  My = 'MY',
  /** Maldives. */
  Mv = 'MV',
  /** Mali. */
  Ml = 'ML',
  /** Malta. */
  Mt = 'MT',
  /** Martinique. */
  Mq = 'MQ',
  /** Mauritania. */
  Mr = 'MR',
  /** Mauritius. */
  Mu = 'MU',
  /** Mayotte. */
  Yt = 'YT',
  /** Mexico. */
  Mx = 'MX',
  /** Moldova, Republic of. */
  Md = 'MD',
  /** Monaco. */
  Mc = 'MC',
  /** Mongolia. */
  Mn = 'MN',
  /** Montenegro. */
  Me = 'ME',
  /** Montserrat. */
  Ms = 'MS',
  /** Morocco. */
  Ma = 'MA',
  /** Mozambique. */
  Mz = 'MZ',
  /** Myanmar. */
  Mm = 'MM',
  /** Namibia. */
  Na = 'NA',
  /** Nauru. */
  Nr = 'NR',
  /** Nepal. */
  Np = 'NP',
  /** Netherlands. */
  Nl = 'NL',
  /** Netherlands Antilles. */
  An = 'AN',
  /** New Caledonia. */
  Nc = 'NC',
  /** New Zealand. */
  Nz = 'NZ',
  /** Nicaragua. */
  Ni = 'NI',
  /** Niger. */
  Ne = 'NE',
  /** Nigeria. */
  Ng = 'NG',
  /** Niue. */
  Nu = 'NU',
  /** Norfolk Island. */
  Nf = 'NF',
  /** Norway. */
  No = 'NO',
  /** Oman. */
  Om = 'OM',
  /** Pakistan. */
  Pk = 'PK',
  /** Palestinian Territory, Occupied. */
  Ps = 'PS',
  /** Panama. */
  Pa = 'PA',
  /** Papua New Guinea. */
  Pg = 'PG',
  /** Paraguay. */
  Py = 'PY',
  /** Peru. */
  Pe = 'PE',
  /** Philippines. */
  Ph = 'PH',
  /** Pitcairn. */
  Pn = 'PN',
  /** Poland. */
  Pl = 'PL',
  /** Portugal. */
  Pt = 'PT',
  /** Qatar. */
  Qa = 'QA',
  /** Republic of Cameroon. */
  Cm = 'CM',
  /** Reunion. */
  Re = 'RE',
  /** Romania. */
  Ro = 'RO',
  /** Russia. */
  Ru = 'RU',
  /** Rwanda. */
  Rw = 'RW',
  /** Saint Barthélemy. */
  Bl = 'BL',
  /** Saint Helena. */
  Sh = 'SH',
  /** Saint Kitts And Nevis. */
  Kn = 'KN',
  /** Saint Lucia. */
  Lc = 'LC',
  /** Saint Martin. */
  Mf = 'MF',
  /** Saint Pierre And Miquelon. */
  Pm = 'PM',
  /** Samoa. */
  Ws = 'WS',
  /** San Marino. */
  Sm = 'SM',
  /** Sao Tome And Principe. */
  St = 'ST',
  /** Saudi Arabia. */
  Sa = 'SA',
  /** Senegal. */
  Sn = 'SN',
  /** Serbia. */
  Rs = 'RS',
  /** Seychelles. */
  Sc = 'SC',
  /** Sierra Leone. */
  Sl = 'SL',
  /** Singapore. */
  Sg = 'SG',
  /** Sint Maarten. */
  Sx = 'SX',
  /** Slovakia. */
  Sk = 'SK',
  /** Slovenia. */
  Si = 'SI',
  /** Solomon Islands. */
  Sb = 'SB',
  /** Somalia. */
  So = 'SO',
  /** South Africa. */
  Za = 'ZA',
  /** South Georgia And The South Sandwich Islands. */
  Gs = 'GS',
  /** South Korea. */
  Kr = 'KR',
  /** South Sudan. */
  Ss = 'SS',
  /** Spain. */
  Es = 'ES',
  /** Sri Lanka. */
  Lk = 'LK',
  /** St. Vincent. */
  Vc = 'VC',
  /** Sudan. */
  Sd = 'SD',
  /** Suriname. */
  Sr = 'SR',
  /** Svalbard And Jan Mayen. */
  Sj = 'SJ',
  /** Swaziland. */
  Sz = 'SZ',
  /** Sweden. */
  Se = 'SE',
  /** Switzerland. */
  Ch = 'CH',
  /** Syria. */
  Sy = 'SY',
  /** Taiwan. */
  Tw = 'TW',
  /** Tajikistan. */
  Tj = 'TJ',
  /** Tanzania, United Republic Of. */
  Tz = 'TZ',
  /** Thailand. */
  Th = 'TH',
  /** Timor Leste. */
  Tl = 'TL',
  /** Togo. */
  Tg = 'TG',
  /** Tokelau. */
  Tk = 'TK',
  /** Tonga. */
  To = 'TO',
  /** Trinidad and Tobago. */
  Tt = 'TT',
  /** Tunisia. */
  Tn = 'TN',
  /** Turkey. */
  Tr = 'TR',
  /** Turkmenistan. */
  Tm = 'TM',
  /** Turks and Caicos Islands. */
  Tc = 'TC',
  /** Tuvalu. */
  Tv = 'TV',
  /** Uganda. */
  Ug = 'UG',
  /** Ukraine. */
  Ua = 'UA',
  /** United Arab Emirates. */
  Ae = 'AE',
  /** United Kingdom. */
  Gb = 'GB',
  /** United States. */
  Us = 'US',
  /** United States Minor Outlying Islands. */
  Um = 'UM',
  /** Uruguay. */
  Uy = 'UY',
  /** Uzbekistan. */
  Uz = 'UZ',
  /** Vanuatu. */
  Vu = 'VU',
  /** Venezuela. */
  Ve = 'VE',
  /** Vietnam. */
  Vn = 'VN',
  /** Virgin Islands, British. */
  Vg = 'VG',
  /** Wallis And Futuna. */
  Wf = 'WF',
  /** Western Sahara. */
  Eh = 'EH',
  /** Yemen. */
  Ye = 'YE',
  /** Zambia. */
  Zm = 'ZM',
  /** Zimbabwe. */
  Zw = 'ZW'
}

/** Credit card information used for a payment. */
export type CreditCard = {
  __typename?: 'CreditCard';
  brand?: Maybe<Scalars['String']>;
  expiryMonth?: Maybe<Scalars['Int']>;
  expiryYear?: Maybe<Scalars['Int']>;
  firstDigits?: Maybe<Scalars['String']>;
  firstName?: Maybe<Scalars['String']>;
  lastDigits?: Maybe<Scalars['String']>;
  lastName?: Maybe<Scalars['String']>;
  /** Masked credit card number with only the last 4 digits displayed */
  maskedNumber?: Maybe<Scalars['String']>;
};

/** Specifies the fields required to complete a checkout with
 * a Shopify vaulted credit card payment.
 */
export type CreditCardPaymentInput = {
  /** The amount of the payment. */
  amount: Scalars['Money'];
  /** A unique client generated key used to avoid duplicate charges. When a
   * duplicate payment is found, the original is returned instead of creating a new one.
   */
  idempotencyKey: Scalars['String'];
  /** The billing address for the payment. */
  billingAddress: MailingAddressInput;
  /** The ID returned by Shopify's Card Vault. */
  vaultId: Scalars['String'];
  /** Executes the payment in test mode if possible. Defaults to `false`. */
  test?: Maybe<Scalars['Boolean']>;
};

/** Specifies the fields required to complete a checkout with
 * a Shopify vaulted credit card payment.
 */
export type CreditCardPaymentInputV2 = {
  /** The amount and currency of the payment. */
  paymentAmount: MoneyInput;
  /** A unique client generated key used to avoid duplicate charges. When a
   * duplicate payment is found, the original is returned instead of creating a new one.
   */
  idempotencyKey: Scalars['String'];
  /** The billing address for the payment. */
  billingAddress: MailingAddressInput;
  /** The ID returned by Shopify's Card Vault. */
  vaultId: Scalars['String'];
  /** Executes the payment in test mode if possible. Defaults to `false`. */
  test?: Maybe<Scalars['Boolean']>;
};

/** The part of the image that should remain after cropping. */
export enum CropRegion {
  /** Keep the center of the image */
  Center = 'CENTER',
  /** Keep the top of the image */
  Top = 'TOP',
  /** Keep the bottom of the image */
  Bottom = 'BOTTOM',
  /** Keep the left of the image */
  Left = 'LEFT',
  /** Keep the right of the image */
  Right = 'RIGHT'
}

/** Currency codes */
export enum CurrencyCode {
  /** United States Dollars (USD). */
  Usd = 'USD',
  /** Euro (EUR). */
  Eur = 'EUR',
  /** United Kingdom Pounds (GBP). */
  Gbp = 'GBP',
  /** Canadian Dollars (CAD). */
  Cad = 'CAD',
  /** Afghan Afghani (AFN). */
  Afn = 'AFN',
  /** Albanian Lek (ALL). */
  All = 'ALL',
  /** Algerian Dinar (DZD). */
  Dzd = 'DZD',
  /** Angolan Kwanza (AOA). */
  Aoa = 'AOA',
  /** Argentine Pesos (ARS). */
  Ars = 'ARS',
  /** Armenian Dram (AMD). */
  Amd = 'AMD',
  /** Aruban Florin (AWG). */
  Awg = 'AWG',
  /** Australian Dollars (AUD). */
  Aud = 'AUD',
  /** Barbadian Dollar (BBD). */
  Bbd = 'BBD',
  /** Azerbaijani Manat (AZN). */
  Azn = 'AZN',
  /** Bangladesh Taka (BDT). */
  Bdt = 'BDT',
  /** Bahamian Dollar (BSD). */
  Bsd = 'BSD',
  /** Bahraini Dinar (BHD). */
  Bhd = 'BHD',
  /** Burundian Franc (BIF). */
  Bif = 'BIF',
  /** Belarusian Ruble (BYR). */
  Byr = 'BYR',
  /** Belize Dollar (BZD). */
  Bzd = 'BZD',
  /** Bermudian Dollar (BMD). */
  Bmd = 'BMD',
  /** Bhutanese Ngultrum (BTN). */
  Btn = 'BTN',
  /** Bosnia and Herzegovina Convertible Mark (BAM). */
  Bam = 'BAM',
  /** Brazilian Real (BRL). */
  Brl = 'BRL',
  /** Bolivian Boliviano (BOB). */
  Bob = 'BOB',
  /** Botswana Pula (BWP). */
  Bwp = 'BWP',
  /** Brunei Dollar (BND). */
  Bnd = 'BND',
  /** Bulgarian Lev (BGN). */
  Bgn = 'BGN',
  /** Burmese Kyat (MMK). */
  Mmk = 'MMK',
  /** Cambodian Riel. */
  Khr = 'KHR',
  /** Cape Verdean escudo (CVE). */
  Cve = 'CVE',
  /** Cayman Dollars (KYD). */
  Kyd = 'KYD',
  /** Central African CFA Franc (XAF). */
  Xaf = 'XAF',
  /** Chilean Peso (CLP). */
  Clp = 'CLP',
  /** Chinese Yuan Renminbi (CNY). */
  Cny = 'CNY',
  /** Colombian Peso (COP). */
  Cop = 'COP',
  /** Comorian Franc (KMF). */
  Kmf = 'KMF',
  /** Congolese franc (CDF). */
  Cdf = 'CDF',
  /** Costa Rican Colones (CRC). */
  Crc = 'CRC',
  /** Croatian Kuna (HRK). */
  Hrk = 'HRK',
  /** Czech Koruny (CZK). */
  Czk = 'CZK',
  /** Danish Kroner (DKK). */
  Dkk = 'DKK',
  /** Dominican Peso (DOP). */
  Dop = 'DOP',
  /** East Caribbean Dollar (XCD). */
  Xcd = 'XCD',
  /** Egyptian Pound (EGP). */
  Egp = 'EGP',
  /** Ethiopian Birr (ETB). */
  Etb = 'ETB',
  /** CFP Franc (XPF). */
  Xpf = 'XPF',
  /** Fijian Dollars (FJD). */
  Fjd = 'FJD',
  /** Gambian Dalasi (GMD). */
  Gmd = 'GMD',
  /** Ghanaian Cedi (GHS). */
  Ghs = 'GHS',
  /** Guatemalan Quetzal (GTQ). */
  Gtq = 'GTQ',
  /** Guyanese Dollar (GYD). */
  Gyd = 'GYD',
  /** Georgian Lari (GEL). */
  Gel = 'GEL',
  /** Haitian Gourde (HTG). */
  Htg = 'HTG',
  /** Honduran Lempira (HNL). */
  Hnl = 'HNL',
  /** Hong Kong Dollars (HKD). */
  Hkd = 'HKD',
  /** Hungarian Forint (HUF). */
  Huf = 'HUF',
  /** Icelandic Kronur (ISK). */
  Isk = 'ISK',
  /** Indian Rupees (INR). */
  Inr = 'INR',
  /** Indonesian Rupiah (IDR). */
  Idr = 'IDR',
  /** Israeli New Shekel (NIS). */
  Ils = 'ILS',
  /** Iraqi Dinar (IQD). */
  Iqd = 'IQD',
  /** Jamaican Dollars (JMD). */
  Jmd = 'JMD',
  /** Japanese Yen (JPY). */
  Jpy = 'JPY',
  /** Jersey Pound. */
  Jep = 'JEP',
  /** Jordanian Dinar (JOD). */
  Jod = 'JOD',
  /** Kazakhstani Tenge (KZT). */
  Kzt = 'KZT',
  /** Kenyan Shilling (KES). */
  Kes = 'KES',
  /** Kuwaiti Dinar (KWD). */
  Kwd = 'KWD',
  /** Kyrgyzstani Som (KGS). */
  Kgs = 'KGS',
  /** Laotian Kip (LAK). */
  Lak = 'LAK',
  /** Latvian Lati (LVL). */
  Lvl = 'LVL',
  /** Lebanese Pounds (LBP). */
  Lbp = 'LBP',
  /** Lesotho Loti (LSL). */
  Lsl = 'LSL',
  /** Liberian Dollar (LRD). */
  Lrd = 'LRD',
  /** Lithuanian Litai (LTL). */
  Ltl = 'LTL',
  /** Malagasy Ariary (MGA). */
  Mga = 'MGA',
  /** Macedonia Denar (MKD). */
  Mkd = 'MKD',
  /** Macanese Pataca (MOP). */
  Mop = 'MOP',
  /** Malawian Kwacha (MWK). */
  Mwk = 'MWK',
  /** Maldivian Rufiyaa (MVR). */
  Mvr = 'MVR',
  /** Mexican Pesos (MXN). */
  Mxn = 'MXN',
  /** Malaysian Ringgits (MYR). */
  Myr = 'MYR',
  /** Mauritian Rupee (MUR). */
  Mur = 'MUR',
  /** Moldovan Leu (MDL). */
  Mdl = 'MDL',
  /** Moroccan Dirham. */
  Mad = 'MAD',
  /** Mongolian Tugrik. */
  Mnt = 'MNT',
  /** Mozambican Metical. */
  Mzn = 'MZN',
  /** Namibian Dollar. */
  Nad = 'NAD',
  /** Nepalese Rupee (NPR). */
  Npr = 'NPR',
  /** Netherlands Antillean Guilder. */
  Ang = 'ANG',
  /** New Zealand Dollars (NZD). */
  Nzd = 'NZD',
  /** Nicaraguan Córdoba (NIO). */
  Nio = 'NIO',
  /** Nigerian Naira (NGN). */
  Ngn = 'NGN',
  /** Norwegian Kroner (NOK). */
  Nok = 'NOK',
  /** Omani Rial (OMR). */
  Omr = 'OMR',
  /** Panamian Balboa (PAB). */
  Pab = 'PAB',
  /** Pakistani Rupee (PKR). */
  Pkr = 'PKR',
  /** Papua New Guinean Kina (PGK). */
  Pgk = 'PGK',
  /** Paraguayan Guarani (PYG). */
  Pyg = 'PYG',
  /** Peruvian Nuevo Sol (PEN). */
  Pen = 'PEN',
  /** Philippine Peso (PHP). */
  Php = 'PHP',
  /** Polish Zlotych (PLN). */
  Pln = 'PLN',
  /** Qatari Rial (QAR). */
  Qar = 'QAR',
  /** Romanian Lei (RON). */
  Ron = 'RON',
  /** Russian Rubles (RUB). */
  Rub = 'RUB',
  /** Rwandan Franc (RWF). */
  Rwf = 'RWF',
  /** Samoan Tala (WST). */
  Wst = 'WST',
  /** Saudi Riyal (SAR). */
  Sar = 'SAR',
  /** Sao Tome And Principe Dobra (STD). */
  Std = 'STD',
  /** Serbian dinar (RSD). */
  Rsd = 'RSD',
  /** Seychellois Rupee (SCR). */
  Scr = 'SCR',
  /** Singapore Dollars (SGD). */
  Sgd = 'SGD',
  /** Sudanese Pound (SDG). */
  Sdg = 'SDG',
  /** Syrian Pound (SYP). */
  Syp = 'SYP',
  /** South African Rand (ZAR). */
  Zar = 'ZAR',
  /** South Korean Won (KRW). */
  Krw = 'KRW',
  /** South Sudanese Pound (SSP). */
  Ssp = 'SSP',
  /** Solomon Islands Dollar (SBD). */
  Sbd = 'SBD',
  /** Sri Lankan Rupees (LKR). */
  Lkr = 'LKR',
  /** Surinamese Dollar (SRD). */
  Srd = 'SRD',
  /** Swazi Lilangeni (SZL). */
  Szl = 'SZL',
  /** Swedish Kronor (SEK). */
  Sek = 'SEK',
  /** Swiss Francs (CHF). */
  Chf = 'CHF',
  /** Taiwan Dollars (TWD). */
  Twd = 'TWD',
  /** Thai baht (THB). */
  Thb = 'THB',
  /** Tanzanian Shilling (TZS). */
  Tzs = 'TZS',
  /** Trinidad and Tobago Dollars (TTD). */
  Ttd = 'TTD',
  /** Tunisian Dinar (TND). */
  Tnd = 'TND',
  /** Turkish Lira (TRY). */
  Try = 'TRY',
  /** Turkmenistani Manat (TMT). */
  Tmt = 'TMT',
  /** Ugandan Shilling (UGX). */
  Ugx = 'UGX',
  /** Ukrainian Hryvnia (UAH). */
  Uah = 'UAH',
  /** United Arab Emirates Dirham (AED). */
  Aed = 'AED',
  /** Uruguayan Pesos (UYU). */
  Uyu = 'UYU',
  /** Uzbekistan som (UZS). */
  Uzs = 'UZS',
  /** Vanuatu Vatu (VUV). */
  Vuv = 'VUV',
  /** Venezuelan Bolivares (VEF). */
  Vef = 'VEF',
  /** Vietnamese đồng (VND). */
  Vnd = 'VND',
  /** West African CFA franc (XOF). */
  Xof = 'XOF',
  /** Yemeni Rial (YER). */
  Yer = 'YER',
  /** Zambian Kwacha (ZMW). */
  Zmw = 'ZMW'
}

/** A customer represents a customer account with the shop. Customer accounts store
 * contact information for the customer, saving logged-in customers the trouble of
 * having to provide it at every checkout.
 */
export type Customer = {
  __typename?: 'Customer';
  /** Indicates whether the customer has consented to be sent marketing material via email. */
  acceptsMarketing: Scalars['Boolean'];
  /** A list of addresses for the customer. */
  addresses: MailingAddressConnection;
  /** The date and time when the customer was created. */
  createdAt: Scalars['DateTime'];
  /** The customer’s default address. */
  defaultAddress?: Maybe<MailingAddress>;
  /** The customer’s name, email or phone number. */
  displayName: Scalars['String'];
  /** The customer’s email address. */
  email?: Maybe<Scalars['String']>;
  /** The customer’s first name. */
  firstName?: Maybe<Scalars['String']>;
  /** A unique identifier for the customer. */
  id: Scalars['ID'];
  /** The customer's most recently updated, incomplete checkout. */
  lastIncompleteCheckout?: Maybe<Checkout>;
  /** The customer’s last name. */
  lastName?: Maybe<Scalars['String']>;
  /** The orders associated with the customer. */
  orders: OrderConnection;
  /** The customer’s phone number. */
  phone?: Maybe<Scalars['String']>;
  /** A list of tags assigned to the customer.
   * Additional access scope required: unauthenticated_read_customer_tags.
   */
  tags: Array<Scalars['String']>;
  /** The date and time when the customer information was updated. */
  updatedAt: Scalars['DateTime'];
};

/** A customer represents a customer account with the shop. Customer accounts store
 * contact information for the customer, saving logged-in customers the trouble of
 * having to provide it at every checkout.
 */
export type CustomerAddressesArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  reverse: Scalars['Boolean'];
};

/** A customer represents a customer account with the shop. Customer accounts store
 * contact information for the customer, saving logged-in customers the trouble of
 * having to provide it at every checkout.
 */
export type CustomerOrdersArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  reverse: Scalars['Boolean'];
  sortKey: OrderSortKeys;
  query?: Maybe<Scalars['String']>;
};

/** A CustomerAccessToken represents the unique token required to make modifications to the customer object. */
export type CustomerAccessToken = {
  __typename?: 'CustomerAccessToken';
  /** The customer’s access token. */
  accessToken: Scalars['String'];
  /** The date and time when the customer access token expires. */
  expiresAt: Scalars['DateTime'];
};

/** Specifies the input fields required to create a customer access token. */
export type CustomerAccessTokenCreateInput = {
  /** The email associated to the customer. */
  email: Scalars['String'];
  /** The login password to be used by the customer. */
  password: Scalars['String'];
};

/** Return type for `customerAccessTokenCreate` mutation. */
export type CustomerAccessTokenCreatePayload = {
  __typename?: 'CustomerAccessTokenCreatePayload';
  /** The newly created customer access token object. */
  customerAccessToken?: Maybe<CustomerAccessToken>;
  /** List of errors that occurred executing the mutation. */
  customerUserErrors: Array<CustomerUserError>;
  /** List of errors that occurred executing the mutation. */
  userErrors: Array<UserError>;
};

/** Return type for `customerAccessTokenDelete` mutation. */
export type CustomerAccessTokenDeletePayload = {
  __typename?: 'CustomerAccessTokenDeletePayload';
  /** The destroyed access token. */
  deletedAccessToken?: Maybe<Scalars['String']>;
  /** ID of the destroyed customer access token. */
  deletedCustomerAccessTokenId?: Maybe<Scalars['String']>;
  /** List of errors that occurred executing the mutation. */
  userErrors: Array<UserError>;
};

/** Return type for `customerAccessTokenRenew` mutation. */
export type CustomerAccessTokenRenewPayload = {
  __typename?: 'CustomerAccessTokenRenewPayload';
  /** The renewed customer access token object. */
  customerAccessToken?: Maybe<CustomerAccessToken>;
  /** List of errors that occurred executing the mutation. */
  userErrors: Array<UserError>;
};

/** Specifies the input fields required to activate a customer. */
export type CustomerActivateInput = {
  /** The activation token required to activate the customer. */
  activationToken: Scalars['String'];
  /** New password that will be set during activation. */
  password: Scalars['String'];
};

/** Return type for `customerActivate` mutation. */
export type CustomerActivatePayload = {
  __typename?: 'CustomerActivatePayload';
  /** The customer object. */
  customer?: Maybe<Customer>;
  /** A newly created customer access token object for the customer. */
  customerAccessToken?: Maybe<CustomerAccessToken>;
  /** List of errors that occurred executing the mutation. */
  customerUserErrors: Array<CustomerUserError>;
  /** List of errors that occurred executing the mutation. */
  userErrors: Array<UserError>;
};

/** Return type for `customerAddressCreate` mutation. */
export type CustomerAddressCreatePayload = {
  __typename?: 'CustomerAddressCreatePayload';
  /** The new customer address object. */
  customerAddress?: Maybe<MailingAddress>;
  /** List of errors that occurred executing the mutation. */
  customerUserErrors: Array<CustomerUserError>;
  /** List of errors that occurred executing the mutation. */
  userErrors: Array<UserError>;
};

/** Return type for `customerAddressDelete` mutation. */
export type CustomerAddressDeletePayload = {
  __typename?: 'CustomerAddressDeletePayload';
  /** List of errors that occurred executing the mutation. */
  customerUserErrors: Array<CustomerUserError>;
  /** ID of the deleted customer address. */
  deletedCustomerAddressId?: Maybe<Scalars['String']>;
  /** List of errors that occurred executing the mutation. */
  userErrors: Array<UserError>;
};

/** Return type for `customerAddressUpdate` mutation. */
export type CustomerAddressUpdatePayload = {
  __typename?: 'CustomerAddressUpdatePayload';
  /** The customer’s updated mailing address. */
  customerAddress?: Maybe<MailingAddress>;
  /** List of errors that occurred executing the mutation. */
  customerUserErrors: Array<CustomerUserError>;
  /** List of errors that occurred executing the mutation. */
  userErrors: Array<UserError>;
};

/** Specifies the fields required to create a new Customer. */
export type CustomerCreateInput = {
  /** The customer’s first name. */
  firstName?: Maybe<Scalars['String']>;
  /** The customer’s last name. */
  lastName?: Maybe<Scalars['String']>;
  /** The customer’s email. */
  email: Scalars['String'];
  /** The customer’s phone number. */
  phone?: Maybe<Scalars['String']>;
  /** The login password used by the customer. */
  password: Scalars['String'];
  /** Indicates whether the customer has consented to be sent marketing material via email. */
  acceptsMarketing?: Maybe<Scalars['Boolean']>;
};

/** Return type for `customerCreate` mutation. */
export type CustomerCreatePayload = {
  __typename?: 'CustomerCreatePayload';
  /** The created customer object. */
  customer?: Maybe<Customer>;
  /** List of errors that occurred executing the mutation. */
  customerUserErrors: Array<CustomerUserError>;
  /** List of errors that occurred executing the mutation. */
  userErrors: Array<UserError>;
};

/** Return type for `customerDefaultAddressUpdate` mutation. */
export type CustomerDefaultAddressUpdatePayload = {
  __typename?: 'CustomerDefaultAddressUpdatePayload';
  /** The updated customer object. */
  customer?: Maybe<Customer>;
  /** List of errors that occurred executing the mutation. */
  customerUserErrors: Array<CustomerUserError>;
  /** List of errors that occurred executing the mutation. */
  userErrors: Array<UserError>;
};

/** Possible error codes that could be returned by a customer mutation. */
export enum CustomerErrorCode {
  /** Input value is blank. */
  Blank = 'BLANK',
  /** Input value is invalid. */
  Invalid = 'INVALID',
  /** Input value is already taken. */
  Taken = 'TAKEN',
  /** Input value is too long. */
  TooLong = 'TOO_LONG',
  /** Input value is too short. */
  TooShort = 'TOO_SHORT',
  /** Unidentified customer. */
  UnidentifiedCustomer = 'UNIDENTIFIED_CUSTOMER',
  /** Customer is disabled. */
  CustomerDisabled = 'CUSTOMER_DISABLED',
  /** Input password starts or ends with whitespace. */
  PasswordStartsOrEndsWithWhitespace = 'PASSWORD_STARTS_OR_ENDS_WITH_WHITESPACE',
  /** Input contains HTML tags. */
  ContainsHtmlTags = 'CONTAINS_HTML_TAGS',
  /** Input contains URL. */
  ContainsUrl = 'CONTAINS_URL',
  /** Invalid activation token. */
  TokenInvalid = 'TOKEN_INVALID',
  /** Customer already enabled. */
  AlreadyEnabled = 'ALREADY_ENABLED',
  /** Address does not exist. */
  NotFound = 'NOT_FOUND'
}

/** Return type for `customerRecover` mutation. */
export type CustomerRecoverPayload = {
  __typename?: 'CustomerRecoverPayload';
  /** List of errors that occurred executing the mutation. */
  customerUserErrors: Array<CustomerUserError>;
  /** List of errors that occurred executing the mutation. */
  userErrors: Array<UserError>;
};

/** Return type for `customerResetByUrl` mutation. */
export type CustomerResetByUrlPayload = {
  __typename?: 'CustomerResetByUrlPayload';
  /** The customer object which was reset. */
  customer?: Maybe<Customer>;
  /** A newly created customer access token object for the customer. */
  customerAccessToken?: Maybe<CustomerAccessToken>;
  /** List of errors that occurred executing the mutation. */
  customerUserErrors: Array<CustomerUserError>;
  /** List of errors that occurred executing the mutation. */
  userErrors: Array<UserError>;
};

/** Specifies the fields required to reset a Customer’s password. */
export type CustomerResetInput = {
  /** The reset token required to reset the customer’s password. */
  resetToken: Scalars['String'];
  /** New password that will be set as part of the reset password process. */
  password: Scalars['String'];
};

/** Return type for `customerReset` mutation. */
export type CustomerResetPayload = {
  __typename?: 'CustomerResetPayload';
  /** The customer object which was reset. */
  customer?: Maybe<Customer>;
  /** A newly created customer access token object for the customer. */
  customerAccessToken?: Maybe<CustomerAccessToken>;
  /** List of errors that occurred executing the mutation. */
  customerUserErrors: Array<CustomerUserError>;
  /** List of errors that occurred executing the mutation. */
  userErrors: Array<UserError>;
};

/** Specifies the fields required to update the Customer information. */
export type CustomerUpdateInput = {
  /** The customer’s first name. */
  firstName?: Maybe<Scalars['String']>;
  /** The customer’s last name. */
  lastName?: Maybe<Scalars['String']>;
  /** The customer’s email. */
  email?: Maybe<Scalars['String']>;
  /** The customer’s phone number. */
  phone?: Maybe<Scalars['String']>;
  /** The login password used by the customer. */
  password?: Maybe<Scalars['String']>;
  /** Indicates whether the customer has consented to be sent marketing material via email. */
  acceptsMarketing?: Maybe<Scalars['Boolean']>;
};

/** Return type for `customerUpdate` mutation. */
export type CustomerUpdatePayload = {
  __typename?: 'CustomerUpdatePayload';
  /** The updated customer object. */
  customer?: Maybe<Customer>;
  /** The newly created customer access token. If the customer's password is updated, all previous access tokens
   * (including the one used to perform this mutation) become invalid, and a new token is generated.
   */
  customerAccessToken?: Maybe<CustomerAccessToken>;
  /** List of errors that occurred executing the mutation. */
  customerUserErrors: Array<CustomerUserError>;
  /** List of errors that occurred executing the mutation. */
  userErrors: Array<UserError>;
};

/** Represents an error that happens during execution of a customer mutation. */
export type CustomerUserError = DisplayableError & {
  __typename?: 'CustomerUserError';
  /** Error code to uniquely identify the error. */
  code?: Maybe<CustomerErrorCode>;
  /** Path to the input field which caused the error. */
  field?: Maybe<Array<Scalars['String']>>;
  /** The error message. */
  message: Scalars['String'];
};

/** Digital wallet, such as Apple Pay, which can be used for accelerated checkouts. */
export enum DigitalWallet {
  /** Apple Pay. */
  ApplePay = 'APPLE_PAY',
  /** Android Pay. */
  AndroidPay = 'ANDROID_PAY',
  /** Google Pay. */
  GooglePay = 'GOOGLE_PAY',
  /** Shopify Pay. */
  ShopifyPay = 'SHOPIFY_PAY'
}

/** An amount discounting the line that has been allocated by a discount. */
export type DiscountAllocation = {
  __typename?: 'DiscountAllocation';
  /** Amount of discount allocated. */
  allocatedAmount: MoneyV2;
  /** The discount this allocated amount originated from. */
  discountApplication: DiscountApplication;
};

/** Discount applications capture the intentions of a discount source at
 * the time of application.
 */
export type DiscountApplication = {
  __typename?: 'DiscountApplication';
  /** The method by which the discount's value is allocated to its entitled items. */
  allocationMethod: DiscountApplicationAllocationMethod;
  /** Which lines of targetType that the discount is allocated over. */
  targetSelection: DiscountApplicationTargetSelection;
  /** The type of line that the discount is applicable towards. */
  targetType: DiscountApplicationTargetType;
  /** The value of the discount application. */
  value: PricingValue;
};

/** The method by which the discount's value is allocated onto its entitled lines. */
export enum DiscountApplicationAllocationMethod {
  /** The value is spread across all entitled lines. */
  Across = 'ACROSS',
  /** The value is applied onto every entitled line. */
  Each = 'EACH',
  /** The value is specifically applied onto a particular line. */
  One = 'ONE'
}

export type DiscountApplicationConnection = {
  __typename?: 'DiscountApplicationConnection';
  /** A list of edges. */
  edges: Array<DiscountApplicationEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

export type DiscountApplicationEdge = {
  __typename?: 'DiscountApplicationEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of DiscountApplicationEdge. */
  node: DiscountApplication;
};

/** Which lines on the order that the discount is allocated over, of the type
 * defined by the Discount Application's target_type.
 */
export enum DiscountApplicationTargetSelection {
  /** The discount is allocated onto all the lines. */
  All = 'ALL',
  /** The discount is allocated onto only the lines it is entitled for. */
  Entitled = 'ENTITLED',
  /** The discount is allocated onto explicitly chosen lines. */
  Explicit = 'EXPLICIT'
}

/** The type of line (i.e. line item or shipping line) on an order that the discount is applicable towards. */
export enum DiscountApplicationTargetType {
  /** The discount applies onto line items. */
  LineItem = 'LINE_ITEM',
  /** The discount applies onto shipping lines. */
  ShippingLine = 'SHIPPING_LINE'
}

/** Discount code applications capture the intentions of a discount code at
 * the time that it is applied.
 */
export type DiscountCodeApplication = DiscountApplication & {
  __typename?: 'DiscountCodeApplication';
  /** The method by which the discount's value is allocated to its entitled items. */
  allocationMethod: DiscountApplicationAllocationMethod;
  /** Specifies whether the discount code was applied successfully. */
  applicable: Scalars['Boolean'];
  /** The string identifying the discount code that was used at the time of application. */
  code: Scalars['String'];
  /** Which lines of targetType that the discount is allocated over. */
  targetSelection: DiscountApplicationTargetSelection;
  /** The type of line that the discount is applicable towards. */
  targetType: DiscountApplicationTargetType;
  /** The value of the discount application. */
  value: PricingValue;
};

/** Represents an error in the input of a mutation. */
export type DisplayableError = {
  __typename?: 'DisplayableError';
  /** Path to the input field which caused the error. */
  field?: Maybe<Array<Scalars['String']>>;
  /** The error message. */
  message: Scalars['String'];
};

/** Represents a web address. */
export type Domain = {
  __typename?: 'Domain';
  /** The host name of the domain (eg: `example.com`). */
  host: Scalars['String'];
  /** Whether SSL is enabled or not. */
  sslEnabled: Scalars['Boolean'];
  /** The URL of the domain (eg: `https://example.com`). */
  url: Scalars['URL'];
};

/** Represents a single fulfillment in an order. */
export type Fulfillment = {
  __typename?: 'Fulfillment';
  /** List of the fulfillment's line items. */
  fulfillmentLineItems: FulfillmentLineItemConnection;
  /** The name of the tracking company. */
  trackingCompany?: Maybe<Scalars['String']>;
  /** Tracking information associated with the fulfillment,
   * such as the tracking number and tracking URL.
   */
  trackingInfo: Array<FulfillmentTrackingInfo>;
};

/** Represents a single fulfillment in an order. */
export type FulfillmentFulfillmentLineItemsArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  reverse: Scalars['Boolean'];
};

/** Represents a single fulfillment in an order. */
export type FulfillmentTrackingInfoArgs = {
  first?: Maybe<Scalars['Int']>;
};

/** Represents a single line item in a fulfillment. There is at most one fulfillment line item for each order line item. */
export type FulfillmentLineItem = {
  __typename?: 'FulfillmentLineItem';
  /** The associated order's line item. */
  lineItem: OrderLineItem;
  /** The amount fulfilled in this fulfillment. */
  quantity: Scalars['Int'];
};

export type FulfillmentLineItemConnection = {
  __typename?: 'FulfillmentLineItemConnection';
  /** A list of edges. */
  edges: Array<FulfillmentLineItemEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

export type FulfillmentLineItemEdge = {
  __typename?: 'FulfillmentLineItemEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of FulfillmentLineItemEdge. */
  node: FulfillmentLineItem;
};

/** Tracking information associated with the fulfillment. */
export type FulfillmentTrackingInfo = {
  __typename?: 'FulfillmentTrackingInfo';
  /** The tracking number of the fulfillment. */
  number?: Maybe<Scalars['String']>;
  /** The URL to track the fulfillment. */
  url?: Maybe<Scalars['URL']>;
};

/** Represents information about the metafields associated to the specified resource. */
export type HasMetafields = {
  __typename?: 'HasMetafields';
  /** The metafield associated with the resource. */
  metafield?: Maybe<Metafield>;
  /** A paginated list of metafields associated with the resource. */
  metafields: MetafieldConnection;
};

/** Represents information about the metafields associated to the specified resource. */
export type HasMetafieldsMetafieldArgs = {
  namespace: Scalars['String'];
  key: Scalars['String'];
};

/** Represents information about the metafields associated to the specified resource. */
export type HasMetafieldsMetafieldsArgs = {
  namespace?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  reverse: Scalars['Boolean'];
};

/** Represents an image resource. */
export type Image = {
  __typename?: 'Image';
  /** A word or phrase to share the nature or contents of an image. */
  altText?: Maybe<Scalars['String']>;
  /** A unique identifier for the image. */
  id?: Maybe<Scalars['ID']>;
  /** The location of the original image as a URL.
   *
   * If there are any existing transformations in the original source URL, they will remain and not be stripped.
   */
  originalSrc: Scalars['URL'];
  /** The location of the image as a URL. */
  src: Scalars['URL'];
  /** The location of the transformed image as a URL.
   *
   * All transformation arguments are considered "best-effort". If they can be applied to an image, they will be.
   * Otherwise any transformations which an image type does not support will be ignored.
   */
  transformedSrc: Scalars['URL'];
};

/** Represents an image resource. */
export type ImageTransformedSrcArgs = {
  maxWidth?: Maybe<Scalars['Int']>;
  maxHeight?: Maybe<Scalars['Int']>;
  crop?: Maybe<CropRegion>;
  scale: Scalars['Int'];
  preferredContentType?: Maybe<ImageContentType>;
};

export type ImageConnection = {
  __typename?: 'ImageConnection';
  /** A list of edges. */
  edges: Array<ImageEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** List of supported image content types. */
export enum ImageContentType {
  Png = 'PNG',
  Jpg = 'JPG',
  Webp = 'WEBP'
}

export type ImageEdge = {
  __typename?: 'ImageEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of ImageEdge. */
  node: Image;
};

/** Represents a mailing address for customers and shipping. */
export type MailingAddress = Node & {
  __typename?: 'MailingAddress';
  /** The first line of the address. Typically the street address or PO Box number. */
  address1?: Maybe<Scalars['String']>;
  /** The second line of the address. Typically the number of the apartment, suite, or unit. */
  address2?: Maybe<Scalars['String']>;
  /** The name of the city, district, village, or town. */
  city?: Maybe<Scalars['String']>;
  /** The name of the customer's company or organization. */
  company?: Maybe<Scalars['String']>;
  /** The name of the country. */
  country?: Maybe<Scalars['String']>;
  /** The two-letter code for the country of the address.
   *
   * For example, US.
   */
  countryCode?: Maybe<Scalars['String']>;
  /** The two-letter code for the country of the address.
   *
   * For example, US.
   */
  countryCodeV2?: Maybe<CountryCode>;
  /** The first name of the customer. */
  firstName?: Maybe<Scalars['String']>;
  /** A formatted version of the address, customized by the provided arguments. */
  formatted: Array<Scalars['String']>;
  /** A comma-separated list of the values for city, province, and country. */
  formattedArea?: Maybe<Scalars['String']>;
  /** Globally unique identifier. */
  id: Scalars['ID'];
  /** The last name of the customer. */
  lastName?: Maybe<Scalars['String']>;
  /** The latitude coordinate of the customer address. */
  latitude?: Maybe<Scalars['Float']>;
  /** The longitude coordinate of the customer address. */
  longitude?: Maybe<Scalars['Float']>;
  /** The full name of the customer, based on firstName and lastName. */
  name?: Maybe<Scalars['String']>;
  /** A unique phone number for the customer.
   *
   * Formatted using E.164 standard. For example, _+16135551111_.
   */
  phone?: Maybe<Scalars['String']>;
  /** The region of the address, such as the province, state, or district. */
  province?: Maybe<Scalars['String']>;
  /** The two-letter code for the region.
   *
   * For example, ON.
   */
  provinceCode?: Maybe<Scalars['String']>;
  /** The zip or postal code of the address. */
  zip?: Maybe<Scalars['String']>;
};

/** Represents a mailing address for customers and shipping. */
export type MailingAddressFormattedArgs = {
  withName: Scalars['Boolean'];
  withCompany: Scalars['Boolean'];
};

export type MailingAddressConnection = {
  __typename?: 'MailingAddressConnection';
  /** A list of edges. */
  edges: Array<MailingAddressEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

export type MailingAddressEdge = {
  __typename?: 'MailingAddressEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of MailingAddressEdge. */
  node: MailingAddress;
};

/** Specifies the fields accepted to create or update a mailing address. */
export type MailingAddressInput = {
  address1?: Maybe<Scalars['String']>;
  address2?: Maybe<Scalars['String']>;
  city?: Maybe<Scalars['String']>;
  company?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
  firstName?: Maybe<Scalars['String']>;
  lastName?: Maybe<Scalars['String']>;
  phone?: Maybe<Scalars['String']>;
  province?: Maybe<Scalars['String']>;
  zip?: Maybe<Scalars['String']>;
};

/** Manual discount applications capture the intentions of a discount that was manually created. */
export type ManualDiscountApplication = DiscountApplication & {
  __typename?: 'ManualDiscountApplication';
  /** The method by which the discount's value is allocated to its entitled items. */
  allocationMethod: DiscountApplicationAllocationMethod;
  /** The description of the application. */
  description?: Maybe<Scalars['String']>;
  /** Which lines of targetType that the discount is allocated over. */
  targetSelection: DiscountApplicationTargetSelection;
  /** The type of line that the discount is applicable towards. */
  targetType: DiscountApplicationTargetType;
  /** The title of the application. */
  title: Scalars['String'];
  /** The value of the discount application. */
  value: PricingValue;
};

/** Metafields represent custom metadata attached to a resource. Metafields can be sorted into namespaces and are
 * comprised of keys, values, and value types.
 */
export type Metafield = Node & {
  __typename?: 'Metafield';
  /** The description of a metafield. */
  description?: Maybe<Scalars['String']>;
  /** Globally unique identifier. */
  id: Scalars['ID'];
  /** The key name for a metafield. */
  key: Scalars['String'];
  /** The namespace for a metafield. */
  namespace: Scalars['String'];
  /** The parent object that the metafield belongs to. */
  parentResource: MetafieldParentResource;
  /** The value of a metafield. */
  value: Scalars['String'];
  /** Represents the metafield value type. */
  valueType: MetafieldValueType;
};

export type MetafieldConnection = {
  __typename?: 'MetafieldConnection';
  /** A list of edges. */
  edges: Array<MetafieldEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

export type MetafieldEdge = {
  __typename?: 'MetafieldEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of MetafieldEdge. */
  node: Metafield;
};

/** A resource that the metafield belongs to. */
export type MetafieldParentResource = Product | ProductVariant;

/** Metafield value types. */
export enum MetafieldValueType {
  /** A string metafield. */
  String = 'STRING',
  /** An integer metafield. */
  Integer = 'INTEGER',
  /** A json string metafield. */
  JsonString = 'JSON_STRING'
}

/** Specifies the fields for a monetary value with currency. */
export type MoneyInput = {
  /** Decimal money amount. */
  amount: Scalars['Decimal'];
  /** Currency of the money. */
  currencyCode: CurrencyCode;
};

/** A monetary value with currency.
 *
 * To format currencies, combine this type's amount and currencyCode fields with your client's locale.
 *
 * For example, in JavaScript you could use Intl.NumberFormat:
 *
 * ```js
 * new Intl.NumberFormat(locale, {
 *   style: 'currency',
 *   currency: currencyCode
 * }).format(amount);
 * ```
 *
 * Other formatting libraries include:
 *
 * * iOS - [NumberFormatter](https://developer.apple.com/documentation/foundation/numberformatter)
 * * Android - [NumberFormat](https://developer.android.com/reference/java/text/NumberFormat.html)
 * * PHP - [NumberFormatter](http://php.net/manual/en/class.numberformatter.php)
 *
 * For a more general solution, the [Unicode CLDR number formatting database] is available with many implementations
 * (such as [TwitterCldr](https://github.com/twitter/twitter-cldr-rb)).
 */
export type MoneyV2 = {
  __typename?: 'MoneyV2';
  /** Decimal money amount. */
  amount: Scalars['Decimal'];
  /** Currency of the money. */
  currencyCode: CurrencyCode;
};

/** The schema’s entry-point for mutations. This acts as the public, top-level API from which all mutation queries must start. */
export type Mutation = {
  __typename?: 'Mutation';
  /** Updates the attributes of a checkout. */
  checkoutAttributesUpdate?: Maybe<CheckoutAttributesUpdatePayload>;
  /** Updates the attributes of a checkout. */
  checkoutAttributesUpdateV2?: Maybe<CheckoutAttributesUpdateV2Payload>;
  checkoutCompleteFree?: Maybe<CheckoutCompleteFreePayload>;
  /** Completes a checkout using a credit card token from Shopify's Vault. */
  checkoutCompleteWithCreditCard?: Maybe<CheckoutCompleteWithCreditCardPayload>;
  /** Completes a checkout using a credit card token from Shopify's Vault. */
  checkoutCompleteWithCreditCardV2?: Maybe<CheckoutCompleteWithCreditCardV2Payload>;
  /** Completes a checkout with a tokenized payment. */
  checkoutCompleteWithTokenizedPayment?: Maybe<CheckoutCompleteWithTokenizedPaymentPayload>;
  /** Completes a checkout with a tokenized payment. */
  checkoutCompleteWithTokenizedPaymentV2?: Maybe<CheckoutCompleteWithTokenizedPaymentV2Payload>;
  /** Creates a new checkout. */
  checkoutCreate?: Maybe<CheckoutCreatePayload>;
  /** Associates a customer to the checkout. */
  checkoutCustomerAssociate?: Maybe<CheckoutCustomerAssociatePayload>;
  /** Associates a customer to the checkout. */
  checkoutCustomerAssociateV2?: Maybe<CheckoutCustomerAssociateV2Payload>;
  /** Disassociates the current checkout customer from the checkout. */
  checkoutCustomerDisassociate?: Maybe<CheckoutCustomerDisassociatePayload>;
  /** Disassociates the current checkout customer from the checkout. */
  checkoutCustomerDisassociateV2?: Maybe<CheckoutCustomerDisassociateV2Payload>;
  /** Applies a discount to an existing checkout using a discount code. */
  checkoutDiscountCodeApply?: Maybe<CheckoutDiscountCodeApplyPayload>;
  /** Applies a discount to an existing checkout using a discount code. */
  checkoutDiscountCodeApplyV2?: Maybe<CheckoutDiscountCodeApplyV2Payload>;
  /** Removes the applied discount from an existing checkout. */
  checkoutDiscountCodeRemove?: Maybe<CheckoutDiscountCodeRemovePayload>;
  /** Updates the email on an existing checkout. */
  checkoutEmailUpdate?: Maybe<CheckoutEmailUpdatePayload>;
  /** Updates the email on an existing checkout. */
  checkoutEmailUpdateV2?: Maybe<CheckoutEmailUpdateV2Payload>;
  /** Applies a gift card to an existing checkout using a gift card code. This will replace all currently applied gift cards. */
  checkoutGiftCardApply?: Maybe<CheckoutGiftCardApplyPayload>;
  /** Removes an applied gift card from the checkout. */
  checkoutGiftCardRemove?: Maybe<CheckoutGiftCardRemovePayload>;
  /** Removes an applied gift card from the checkout. */
  checkoutGiftCardRemoveV2?: Maybe<CheckoutGiftCardRemoveV2Payload>;
  /** Appends gift cards to an existing checkout. */
  checkoutGiftCardsAppend?: Maybe<CheckoutGiftCardsAppendPayload>;
  /** Adds a list of line items to a checkout. */
  checkoutLineItemsAdd?: Maybe<CheckoutLineItemsAddPayload>;
  /** Removes line items from an existing checkout */
  checkoutLineItemsRemove?: Maybe<CheckoutLineItemsRemovePayload>;
  /** Sets a list of line items to a checkout. */
  checkoutLineItemsReplace?: Maybe<CheckoutLineItemsReplacePayload>;
  /** Updates line items on a checkout. */
  checkoutLineItemsUpdate?: Maybe<CheckoutLineItemsUpdatePayload>;
  /** Updates the shipping address of an existing checkout. */
  checkoutShippingAddressUpdate?: Maybe<CheckoutShippingAddressUpdatePayload>;
  /** Updates the shipping address of an existing checkout. */
  checkoutShippingAddressUpdateV2?: Maybe<CheckoutShippingAddressUpdateV2Payload>;
  /** Updates the shipping lines on an existing checkout. */
  checkoutShippingLineUpdate?: Maybe<CheckoutShippingLineUpdatePayload>;
  /** Creates a customer access token.
   * The customer access token is required to modify the customer object in any way.
   */
  customerAccessTokenCreate?: Maybe<CustomerAccessTokenCreatePayload>;
  /** Permanently destroys a customer access token. */
  customerAccessTokenDelete?: Maybe<CustomerAccessTokenDeletePayload>;
  /** Renews a customer access token.
   *
   * Access token renewal must happen *before* a token expires.
   * If a token has already expired, a new one should be created instead via `customerAccessTokenCreate`.
   */
  customerAccessTokenRenew?: Maybe<CustomerAccessTokenRenewPayload>;
  /** Activates a customer. */
  customerActivate?: Maybe<CustomerActivatePayload>;
  /** Creates a new address for a customer. */
  customerAddressCreate?: Maybe<CustomerAddressCreatePayload>;
  /** Permanently deletes the address of an existing customer. */
  customerAddressDelete?: Maybe<CustomerAddressDeletePayload>;
  /** Updates the address of an existing customer. */
  customerAddressUpdate?: Maybe<CustomerAddressUpdatePayload>;
  /** Creates a new customer. */
  customerCreate?: Maybe<CustomerCreatePayload>;
  /** Updates the default address of an existing customer. */
  customerDefaultAddressUpdate?: Maybe<CustomerDefaultAddressUpdatePayload>;
  /** Sends a reset password email to the customer, as the first step in the reset password process. */
  customerRecover?: Maybe<CustomerRecoverPayload>;
  /** Resets a customer’s password with a token received from `CustomerRecover`. */
  customerReset?: Maybe<CustomerResetPayload>;
  /** Resets a customer’s password with the reset password url received from `CustomerRecover`. */
  customerResetByUrl?: Maybe<CustomerResetByUrlPayload>;
  /** Updates an existing customer. */
  customerUpdate?: Maybe<CustomerUpdatePayload>;
};

/** The schema’s entry-point for mutations. This acts as the public, top-level API from which all mutation queries must start. */
export type MutationCheckoutAttributesUpdateArgs = {
  checkoutId: Scalars['ID'];
  input: CheckoutAttributesUpdateInput;
};

/** The schema’s entry-point for mutations. This acts as the public, top-level API from which all mutation queries must start. */
export type MutationCheckoutAttributesUpdateV2Args = {
  checkoutId: Scalars['ID'];
  input: CheckoutAttributesUpdateV2Input;
};

/** The schema’s entry-point for mutations. This acts as the public, top-level API from which all mutation queries must start. */
export type MutationCheckoutCompleteFreeArgs = {
  checkoutId: Scalars['ID'];
};

/** The schema’s entry-point for mutations. This acts as the public, top-level API from which all mutation queries must start. */
export type MutationCheckoutCompleteWithCreditCardArgs = {
  checkoutId: Scalars['ID'];
  payment: CreditCardPaymentInput;
};

/** The schema’s entry-point for mutations. This acts as the public, top-level API from which all mutation queries must start. */
export type MutationCheckoutCompleteWithCreditCardV2Args = {
  checkoutId: Scalars['ID'];
  payment: CreditCardPaymentInputV2;
};

/** The schema’s entry-point for mutations. This acts as the public, top-level API from which all mutation queries must start. */
export type MutationCheckoutCompleteWithTokenizedPaymentArgs = {
  checkoutId: Scalars['ID'];
  payment: TokenizedPaymentInput;
};

/** The schema’s entry-point for mutations. This acts as the public, top-level API from which all mutation queries must start. */
export type MutationCheckoutCompleteWithTokenizedPaymentV2Args = {
  checkoutId: Scalars['ID'];
  payment: TokenizedPaymentInputV2;
};

/** The schema’s entry-point for mutations. This acts as the public, top-level API from which all mutation queries must start. */
export type MutationCheckoutCreateArgs = {
  input: CheckoutCreateInput;
};

/** The schema’s entry-point for mutations. This acts as the public, top-level API from which all mutation queries must start. */
export type MutationCheckoutCustomerAssociateArgs = {
  checkoutId: Scalars['ID'];
  customerAccessToken: Scalars['String'];
};

/** The schema’s entry-point for mutations. This acts as the public, top-level API from which all mutation queries must start. */
export type MutationCheckoutCustomerAssociateV2Args = {
  checkoutId: Scalars['ID'];
  customerAccessToken: Scalars['String'];
};

/** The schema’s entry-point for mutations. This acts as the public, top-level API from which all mutation queries must start. */
export type MutationCheckoutCustomerDisassociateArgs = {
  checkoutId: Scalars['ID'];
};

/** The schema’s entry-point for mutations. This acts as the public, top-level API from which all mutation queries must start. */
export type MutationCheckoutCustomerDisassociateV2Args = {
  checkoutId: Scalars['ID'];
};

/** The schema’s entry-point for mutations. This acts as the public, top-level API from which all mutation queries must start. */
export type MutationCheckoutDiscountCodeApplyArgs = {
  discountCode: Scalars['String'];
  checkoutId: Scalars['ID'];
};

/** The schema’s entry-point for mutations. This acts as the public, top-level API from which all mutation queries must start. */
export type MutationCheckoutDiscountCodeApplyV2Args = {
  discountCode: Scalars['String'];
  checkoutId: Scalars['ID'];
};

/** The schema’s entry-point for mutations. This acts as the public, top-level API from which all mutation queries must start. */
export type MutationCheckoutDiscountCodeRemoveArgs = {
  checkoutId: Scalars['ID'];
};

/** The schema’s entry-point for mutations. This acts as the public, top-level API from which all mutation queries must start. */
export type MutationCheckoutEmailUpdateArgs = {
  checkoutId: Scalars['ID'];
  email: Scalars['String'];
};

/** The schema’s entry-point for mutations. This acts as the public, top-level API from which all mutation queries must start. */
export type MutationCheckoutEmailUpdateV2Args = {
  checkoutId: Scalars['ID'];
  email: Scalars['String'];
};

/** The schema’s entry-point for mutations. This acts as the public, top-level API from which all mutation queries must start. */
export type MutationCheckoutGiftCardApplyArgs = {
  giftCardCode: Scalars['String'];
  checkoutId: Scalars['ID'];
};

/** The schema’s entry-point for mutations. This acts as the public, top-level API from which all mutation queries must start. */
export type MutationCheckoutGiftCardRemoveArgs = {
  appliedGiftCardId: Scalars['ID'];
  checkoutId: Scalars['ID'];
};

/** The schema’s entry-point for mutations. This acts as the public, top-level API from which all mutation queries must start. */
export type MutationCheckoutGiftCardRemoveV2Args = {
  appliedGiftCardId: Scalars['ID'];
  checkoutId: Scalars['ID'];
};

/** The schema’s entry-point for mutations. This acts as the public, top-level API from which all mutation queries must start. */
export type MutationCheckoutGiftCardsAppendArgs = {
  giftCardCodes: Array<Scalars['String']>;
  checkoutId: Scalars['ID'];
};

/** The schema’s entry-point for mutations. This acts as the public, top-level API from which all mutation queries must start. */
export type MutationCheckoutLineItemsAddArgs = {
  lineItems: Array<CheckoutLineItemInput>;
  checkoutId: Scalars['ID'];
};

/** The schema’s entry-point for mutations. This acts as the public, top-level API from which all mutation queries must start. */
export type MutationCheckoutLineItemsRemoveArgs = {
  checkoutId: Scalars['ID'];
  lineItemIds: Array<Scalars['ID']>;
};

/** The schema’s entry-point for mutations. This acts as the public, top-level API from which all mutation queries must start. */
export type MutationCheckoutLineItemsReplaceArgs = {
  lineItems: Array<CheckoutLineItemInput>;
  checkoutId: Scalars['ID'];
};

/** The schema’s entry-point for mutations. This acts as the public, top-level API from which all mutation queries must start. */
export type MutationCheckoutLineItemsUpdateArgs = {
  checkoutId: Scalars['ID'];
  lineItems: Array<CheckoutLineItemUpdateInput>;
};

/** The schema’s entry-point for mutations. This acts as the public, top-level API from which all mutation queries must start. */
export type MutationCheckoutShippingAddressUpdateArgs = {
  shippingAddress: MailingAddressInput;
  checkoutId: Scalars['ID'];
};

/** The schema’s entry-point for mutations. This acts as the public, top-level API from which all mutation queries must start. */
export type MutationCheckoutShippingAddressUpdateV2Args = {
  shippingAddress: MailingAddressInput;
  checkoutId: Scalars['ID'];
};

/** The schema’s entry-point for mutations. This acts as the public, top-level API from which all mutation queries must start. */
export type MutationCheckoutShippingLineUpdateArgs = {
  checkoutId: Scalars['ID'];
  shippingRateHandle: Scalars['String'];
};

/** The schema’s entry-point for mutations. This acts as the public, top-level API from which all mutation queries must start. */
export type MutationCustomerAccessTokenCreateArgs = {
  input: CustomerAccessTokenCreateInput;
};

/** The schema’s entry-point for mutations. This acts as the public, top-level API from which all mutation queries must start. */
export type MutationCustomerAccessTokenDeleteArgs = {
  customerAccessToken: Scalars['String'];
};

/** The schema’s entry-point for mutations. This acts as the public, top-level API from which all mutation queries must start. */
export type MutationCustomerAccessTokenRenewArgs = {
  customerAccessToken: Scalars['String'];
};

/** The schema’s entry-point for mutations. This acts as the public, top-level API from which all mutation queries must start. */
export type MutationCustomerActivateArgs = {
  id: Scalars['ID'];
  input: CustomerActivateInput;
};

/** The schema’s entry-point for mutations. This acts as the public, top-level API from which all mutation queries must start. */
export type MutationCustomerAddressCreateArgs = {
  customerAccessToken: Scalars['String'];
  address: MailingAddressInput;
};

/** The schema’s entry-point for mutations. This acts as the public, top-level API from which all mutation queries must start. */
export type MutationCustomerAddressDeleteArgs = {
  id: Scalars['ID'];
  customerAccessToken: Scalars['String'];
};

/** The schema’s entry-point for mutations. This acts as the public, top-level API from which all mutation queries must start. */
export type MutationCustomerAddressUpdateArgs = {
  customerAccessToken: Scalars['String'];
  id: Scalars['ID'];
  address: MailingAddressInput;
};

/** The schema’s entry-point for mutations. This acts as the public, top-level API from which all mutation queries must start. */
export type MutationCustomerCreateArgs = {
  input: CustomerCreateInput;
};

/** The schema’s entry-point for mutations. This acts as the public, top-level API from which all mutation queries must start. */
export type MutationCustomerDefaultAddressUpdateArgs = {
  customerAccessToken: Scalars['String'];
  addressId: Scalars['ID'];
};

/** The schema’s entry-point for mutations. This acts as the public, top-level API from which all mutation queries must start. */
export type MutationCustomerRecoverArgs = {
  email: Scalars['String'];
};

/** The schema’s entry-point for mutations. This acts as the public, top-level API from which all mutation queries must start. */
export type MutationCustomerResetArgs = {
  id: Scalars['ID'];
  input: CustomerResetInput;
};

/** The schema’s entry-point for mutations. This acts as the public, top-level API from which all mutation queries must start. */
export type MutationCustomerResetByUrlArgs = {
  resetUrl: Scalars['URL'];
  password: Scalars['String'];
};

/** The schema’s entry-point for mutations. This acts as the public, top-level API from which all mutation queries must start. */
export type MutationCustomerUpdateArgs = {
  customerAccessToken: Scalars['String'];
  customer: CustomerUpdateInput;
};

/** An object with an ID to support global identification. */
export type Node = {
  __typename?: 'Node';
  /** Globally unique identifier. */
  id: Scalars['ID'];
};

/** An order is a customer’s completed request to purchase one or more products from
 * a shop. An order is created when a customer completes the checkout process,
 * during which time they provides an email address, billing address and payment information.
 */
export type Order = Node & {
  __typename?: 'Order';
  /** The code of the currency used for the payment. */
  currencyCode: CurrencyCode;
  /** The locale code in which this specific order happened. */
  customerLocale?: Maybe<Scalars['String']>;
  /** The unique URL that the customer can use to access the order. */
  customerUrl?: Maybe<Scalars['URL']>;
  /** Discounts that have been applied on the order. */
  discountApplications: DiscountApplicationConnection;
  /** The customer's email address. */
  email?: Maybe<Scalars['String']>;
  /** Globally unique identifier. */
  id: Scalars['ID'];
  /** List of the order’s line items. */
  lineItems: OrderLineItemConnection;
  /** Unique identifier for the order that appears on the order.
   * For example, _#1000_ or _Store1001.
   */
  name: Scalars['String'];
  /** A unique numeric identifier for the order for use by shop owner and customer. */
  orderNumber: Scalars['Int'];
  /** The customer's phone number for receiving SMS notifications. */
  phone?: Maybe<Scalars['String']>;
  /** The date and time when the order was imported.
   * This value can be set to dates in the past when importing from other systems.
   * If no value is provided, it will be auto-generated based on current date and time.
   */
  processedAt: Scalars['DateTime'];
  /** The address to where the order will be shipped. */
  shippingAddress?: Maybe<MailingAddress>;
  /** The discounts that have been allocated onto the shipping line by discount applications. */
  shippingDiscountAllocations: Array<DiscountAllocation>;
  /** The unique URL for the order's status page. */
  statusUrl: Scalars['URL'];
  /** Price of the order before shipping and taxes. */
  subtotalPrice?: Maybe<Scalars['Money']>;
  /** Price of the order before shipping and taxes. */
  subtotalPriceV2?: Maybe<MoneyV2>;
  /** List of the order’s successful fulfillments. */
  successfulFulfillments?: Maybe<Array<Fulfillment>>;
  /** The sum of all the prices of all the items in the order, taxes and discounts included (must be positive). */
  totalPrice: Scalars['Money'];
  /** The sum of all the prices of all the items in the order, taxes and discounts included (must be positive). */
  totalPriceV2: MoneyV2;
  /** The total amount that has been refunded. */
  totalRefunded: Scalars['Money'];
  /** The total amount that has been refunded. */
  totalRefundedV2: MoneyV2;
  /** The total cost of shipping. */
  totalShippingPrice: Scalars['Money'];
  /** The total cost of shipping. */
  totalShippingPriceV2: MoneyV2;
  /** The total cost of taxes. */
  totalTax?: Maybe<Scalars['Money']>;
  /** The total cost of taxes. */
  totalTaxV2?: Maybe<MoneyV2>;
};

/** An order is a customer’s completed request to purchase one or more products from
 * a shop. An order is created when a customer completes the checkout process,
 * during which time they provides an email address, billing address and payment information.
 */
export type OrderDiscountApplicationsArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  reverse: Scalars['Boolean'];
};

/** An order is a customer’s completed request to purchase one or more products from
 * a shop. An order is created when a customer completes the checkout process,
 * during which time they provides an email address, billing address and payment information.
 */
export type OrderLineItemsArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  reverse: Scalars['Boolean'];
};

/** An order is a customer’s completed request to purchase one or more products from
 * a shop. An order is created when a customer completes the checkout process,
 * during which time they provides an email address, billing address and payment information.
 */
export type OrderSuccessfulFulfillmentsArgs = {
  first?: Maybe<Scalars['Int']>;
};

export type OrderConnection = {
  __typename?: 'OrderConnection';
  /** A list of edges. */
  edges: Array<OrderEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

export type OrderEdge = {
  __typename?: 'OrderEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of OrderEdge. */
  node: Order;
};

/** Represents a single line in an order. There is one line item for each distinct product variant. */
export type OrderLineItem = {
  __typename?: 'OrderLineItem';
  /** List of custom attributes associated to the line item. */
  customAttributes: Array<Attribute>;
  /** The discounts that have been allocated onto the order line item by discount applications. */
  discountAllocations: Array<DiscountAllocation>;
  /** The number of products variants associated to the line item. */
  quantity: Scalars['Int'];
  /** The title of the product combined with title of the variant. */
  title: Scalars['String'];
  /** The product variant object associated to the line item. */
  variant?: Maybe<ProductVariant>;
};

export type OrderLineItemConnection = {
  __typename?: 'OrderLineItemConnection';
  /** A list of edges. */
  edges: Array<OrderLineItemEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

export type OrderLineItemEdge = {
  __typename?: 'OrderLineItemEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of OrderLineItemEdge. */
  node: OrderLineItem;
};

/** The set of valid sort keys for the orders query. */
export enum OrderSortKeys {
  /** Sort by the `processed_at` value. */
  ProcessedAt = 'PROCESSED_AT',
  /** Sort by the `total_price` value. */
  TotalPrice = 'TOTAL_PRICE',
  /** Sort by the `id` value. */
  Id = 'ID',
  /** During a search (i.e. when the `query` parameter has been specified on the connection) this sorts the
   * results by relevance to the search term(s). When no search query is specified, this sort key is not
   * deterministic and should not be used.
   */
  Relevance = 'RELEVANCE'
}

/** Shopify merchants can create pages to hold static HTML content. Each Page object
 * represents a custom page on the online store.
 */
export type Page = Node & {
  __typename?: 'Page';
  /** The description of the page, complete with HTML formatting. */
  body: Scalars['HTML'];
  /** Summary of the page body. */
  bodySummary: Scalars['String'];
  /** The timestamp of the page creation. */
  createdAt: Scalars['DateTime'];
  /** A human-friendly unique string for the page automatically generated from its title. */
  handle: Scalars['String'];
  /** Globally unique identifier. */
  id: Scalars['ID'];
  /** The title of the page. */
  title: Scalars['String'];
  /** The timestamp of the latest page update. */
  updatedAt: Scalars['DateTime'];
  /** The url pointing to the page accessible from the web. */
  url: Scalars['URL'];
};

export type PageConnection = {
  __typename?: 'PageConnection';
  /** A list of edges. */
  edges: Array<PageEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

export type PageEdge = {
  __typename?: 'PageEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of PageEdge. */
  node: Page;
};

/** Information about pagination in a connection. */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** Indicates if there are more pages to fetch. */
  hasNextPage: Scalars['Boolean'];
  /** Indicates if there are any pages prior to the current page. */
  hasPreviousPage: Scalars['Boolean'];
};

/** The set of valid sort keys for the pages query. */
export enum PageSortKeys {
  /** Sort by the `title` value. */
  Title = 'TITLE',
  /** Sort by the `updated_at` value. */
  UpdatedAt = 'UPDATED_AT',
  /** Sort by the `id` value. */
  Id = 'ID',
  /** During a search (i.e. when the `query` parameter has been specified on the connection) this sorts the
   * results by relevance to the search term(s). When no search query is specified, this sort key is not
   * deterministic and should not be used.
   */
  Relevance = 'RELEVANCE'
}

/** A payment applied to a checkout. */
export type Payment = Node & {
  __typename?: 'Payment';
  /** The amount of the payment. */
  amount: Scalars['Money'];
  /** The billing address for the payment. */
  billingAddress?: Maybe<MailingAddress>;
  /** The checkout to which the payment belongs. */
  checkout: Checkout;
  /** The credit card used for the payment in the case of direct payments. */
  creditCard?: Maybe<CreditCard>;
  /** An message describing a processing error during asynchronous processing. */
  errorMessage?: Maybe<Scalars['String']>;
  /** Globally unique identifier. */
  id: Scalars['ID'];
  /** A client-side generated token to identify a payment and perform idempotent operations. */
  idempotencyKey?: Maybe<Scalars['String']>;
  /** Whether or not the payment is still processing asynchronously. */
  ready: Scalars['Boolean'];
  /** A flag to indicate if the payment is to be done in test mode for gateways that support it. */
  test: Scalars['Boolean'];
  /** The actual transaction recorded by Shopify after having processed the payment with the gateway. */
  transaction?: Maybe<Transaction>;
};

/** Settings related to payments. */
export type PaymentSettings = {
  __typename?: 'PaymentSettings';
  /** List of the card brands which the shop accepts. */
  acceptedCardBrands: Array<CardBrand>;
  /** The url pointing to the endpoint to vault credit cards. */
  cardVaultUrl: Scalars['URL'];
  /** The country where the shop is located. */
  countryCode: CountryCode;
  /** The three-letter code for the shop's primary currency. */
  currencyCode: CurrencyCode;
  /** A list of enabled currencies (ISO 4217 format) that the shop accepts.
   * Merchants can enable currencies from their Shopify Payments settings in the Shopify admin.
   */
  enabledPresentmentCurrencies: Array<CurrencyCode>;
  /** The shop’s Shopify Payments account id. */
  shopifyPaymentsAccountId?: Maybe<Scalars['String']>;
  /** List of the digital wallets which the shop supports. */
  supportedDigitalWallets: Array<DigitalWallet>;
};

/** The value of the percentage pricing object. */
export type PricingPercentageValue = {
  __typename?: 'PricingPercentageValue';
  /** The percentage value of the object. */
  percentage: Scalars['Float'];
};

/** The price value (fixed or percentage) for a discount application. */
export type PricingValue = PricingPercentageValue | MoneyV2;

/** A product represents an individual item for sale in a Shopify store. Products are often physical, but they don't have to be.
 * For example, a digital download (such as a movie, music or ebook file) also
 * qualifies as a product, as do services (such as equipment rental, work for hire,
 * customization of another product or an extended warranty).
 */
export type Product = Node &
  HasMetafields & {
    __typename?: 'Product';
    /** Indicates if at least one product variant is available for sale. */
    availableForSale: Scalars['Boolean'];
    /** List of collections a product belongs to. */
    collections: CollectionConnection;
    /** The date and time when the product was created. */
    createdAt: Scalars['DateTime'];
    /** Stripped description of the product, single line with HTML tags removed. */
    description: Scalars['String'];
    /** The description of the product, complete with HTML formatting. */
    descriptionHtml: Scalars['HTML'];
    /** A human-friendly unique string for the Product automatically generated from its title.
     * They are used by the Liquid templating language to refer to objects.
     */
    handle: Scalars['String'];
    /** Globally unique identifier. */
    id: Scalars['ID'];
    /** List of images associated with the product. */
    images: ImageConnection;
    /** The metafield associated with the resource. */
    metafield?: Maybe<Metafield>;
    /** A paginated list of metafields associated with the resource. */
    metafields: MetafieldConnection;
    /** The online store URL for the product.
     * A value of `null` indicates that the product is not published to the Online Store sales channel.
     */
    onlineStoreUrl?: Maybe<Scalars['URL']>;
    /** List of custom product options (maximum of 3 per product). */
    options: Array<ProductOption>;
    /** The price range. */
    priceRange: ProductPriceRange;
    /** A categorization that a product can be tagged with, commonly used for filtering and searching. */
    productType: Scalars['String'];
    /** The date and time when the product was published to the channel. */
    publishedAt: Scalars['DateTime'];
    /** A categorization that a product can be tagged with, commonly used for filtering and searching.
     * Additional access scope required for private apps: unauthenticated_read_product_tags.
     */
    tags: Array<Scalars['String']>;
    /** The product’s title. */
    title: Scalars['String'];
    /** The date and time when the product was last modified. */
    updatedAt: Scalars['DateTime'];
    /** Find a product’s variant based on its selected options.
     * This is useful for converting a user’s selection of product options into a single matching variant.
     * If there is not a variant for the selected options, `null` will be returned.
     */
    variantBySelectedOptions?: Maybe<ProductVariant>;
    /** List of the product’s variants. */
    variants: ProductVariantConnection;
    /** The product’s vendor name. */
    vendor: Scalars['String'];
  };

/** A product represents an individual item for sale in a Shopify store. Products are often physical, but they don't have to be.
 * For example, a digital download (such as a movie, music or ebook file) also
 * qualifies as a product, as do services (such as equipment rental, work for hire,
 * customization of another product or an extended warranty).
 */
export type ProductCollectionsArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  reverse: Scalars['Boolean'];
};

/** A product represents an individual item for sale in a Shopify store. Products are often physical, but they don't have to be.
 * For example, a digital download (such as a movie, music or ebook file) also
 * qualifies as a product, as do services (such as equipment rental, work for hire,
 * customization of another product or an extended warranty).
 */
export type ProductDescriptionArgs = {
  truncateAt?: Maybe<Scalars['Int']>;
};

/** A product represents an individual item for sale in a Shopify store. Products are often physical, but they don't have to be.
 * For example, a digital download (such as a movie, music or ebook file) also
 * qualifies as a product, as do services (such as equipment rental, work for hire,
 * customization of another product or an extended warranty).
 */
export type ProductImagesArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  reverse: Scalars['Boolean'];
  sortKey: ProductImageSortKeys;
  maxWidth?: Maybe<Scalars['Int']>;
  maxHeight?: Maybe<Scalars['Int']>;
  crop?: Maybe<CropRegion>;
  scale: Scalars['Int'];
};

/** A product represents an individual item for sale in a Shopify store. Products are often physical, but they don't have to be.
 * For example, a digital download (such as a movie, music or ebook file) also
 * qualifies as a product, as do services (such as equipment rental, work for hire,
 * customization of another product or an extended warranty).
 */
export type ProductMetafieldArgs = {
  namespace: Scalars['String'];
  key: Scalars['String'];
};

/** A product represents an individual item for sale in a Shopify store. Products are often physical, but they don't have to be.
 * For example, a digital download (such as a movie, music or ebook file) also
 * qualifies as a product, as do services (such as equipment rental, work for hire,
 * customization of another product or an extended warranty).
 */
export type ProductMetafieldsArgs = {
  namespace?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  reverse: Scalars['Boolean'];
};

/** A product represents an individual item for sale in a Shopify store. Products are often physical, but they don't have to be.
 * For example, a digital download (such as a movie, music or ebook file) also
 * qualifies as a product, as do services (such as equipment rental, work for hire,
 * customization of another product or an extended warranty).
 */
export type ProductOptionsArgs = {
  first?: Maybe<Scalars['Int']>;
};

/** A product represents an individual item for sale in a Shopify store. Products are often physical, but they don't have to be.
 * For example, a digital download (such as a movie, music or ebook file) also
 * qualifies as a product, as do services (such as equipment rental, work for hire,
 * customization of another product or an extended warranty).
 */
export type ProductVariantBySelectedOptionsArgs = {
  selectedOptions: Array<SelectedOptionInput>;
};

/** A product represents an individual item for sale in a Shopify store. Products are often physical, but they don't have to be.
 * For example, a digital download (such as a movie, music or ebook file) also
 * qualifies as a product, as do services (such as equipment rental, work for hire,
 * customization of another product or an extended warranty).
 */
export type ProductVariantsArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  reverse: Scalars['Boolean'];
  sortKey: ProductVariantSortKeys;
};

/** The set of valid sort keys for the products query. */
export enum ProductCollectionSortKeys {
  /** Sort by the `title` value. */
  Title = 'TITLE',
  /** Sort by the `price` value. */
  Price = 'PRICE',
  /** Sort by the `best-selling` value. */
  BestSelling = 'BEST_SELLING',
  /** Sort by the `created` value. */
  Created = 'CREATED',
  /** Sort by the `id` value. */
  Id = 'ID',
  /** Sort by the `manual` value. */
  Manual = 'MANUAL',
  /** Sort by the `collection-default` value. */
  CollectionDefault = 'COLLECTION_DEFAULT',
  /** During a search (i.e. when the `query` parameter has been specified on the connection) this sorts the
   * results by relevance to the search term(s). When no search query is specified, this sort key is not
   * deterministic and should not be used.
   */
  Relevance = 'RELEVANCE'
}

export type ProductConnection = {
  __typename?: 'ProductConnection';
  /** A list of edges. */
  edges: Array<ProductEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

export type ProductEdge = {
  __typename?: 'ProductEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of ProductEdge. */
  node: Product;
};

/** The set of valid sort keys for the images query. */
export enum ProductImageSortKeys {
  /** Sort by the `created_at` value. */
  CreatedAt = 'CREATED_AT',
  /** Sort by the `position` value. */
  Position = 'POSITION',
  /** Sort by the `id` value. */
  Id = 'ID',
  /** During a search (i.e. when the `query` parameter has been specified on the connection) this sorts the
   * results by relevance to the search term(s). When no search query is specified, this sort key is not
   * deterministic and should not be used.
   */
  Relevance = 'RELEVANCE'
}

/** Custom product property names like "Size", "Color", and "Material".
 * Products are based on permutations of these options.
 * A product may have a maximum of 3 options.
 * 255 characters limit each.
 */
export type ProductOption = Node & {
  __typename?: 'ProductOption';
  /** Globally unique identifier. */
  id: Scalars['ID'];
  /** The product option’s name. */
  name: Scalars['String'];
  /** The corresponding value to the product option name. */
  values: Array<Scalars['String']>;
};

/** The price range of the product. */
export type ProductPriceRange = {
  __typename?: 'ProductPriceRange';
  /** The highest variant's price. */
  maxVariantPrice: MoneyV2;
  /** The lowest variant's price. */
  minVariantPrice: MoneyV2;
};

/** The set of valid sort keys for the products query. */
export enum ProductSortKeys {
  /** Sort by the `title` value. */
  Title = 'TITLE',
  /** Sort by the `product_type` value. */
  ProductType = 'PRODUCT_TYPE',
  /** Sort by the `vendor` value. */
  Vendor = 'VENDOR',
  /** Sort by the `updated_at` value. */
  UpdatedAt = 'UPDATED_AT',
  /** Sort by the `created_at` value. */
  CreatedAt = 'CREATED_AT',
  /** Sort by the `best_selling` value. */
  BestSelling = 'BEST_SELLING',
  /** Sort by the `price` value. */
  Price = 'PRICE',
  /** Sort by the `id` value. */
  Id = 'ID',
  /** During a search (i.e. when the `query` parameter has been specified on the connection) this sorts the
   * results by relevance to the search term(s). When no search query is specified, this sort key is not
   * deterministic and should not be used.
   */
  Relevance = 'RELEVANCE'
}

/** A product variant represents a different version of a product, such as differing sizes or differing colors. */
export type ProductVariant = Node &
  HasMetafields & {
    __typename?: 'ProductVariant';
    /** Indicates if the product variant is in stock. */
    available?: Maybe<Scalars['Boolean']>;
    /** Indicates if the product variant is available for sale. */
    availableForSale: Scalars['Boolean'];
    /** The compare at price of the variant. This can be used to mark a variant as on
     * sale, when `compareAtPrice` is higher than `price`.
     */
    compareAtPrice?: Maybe<Scalars['Money']>;
    /** The compare at price of the variant. This can be used to mark a variant as on
     * sale, when `compareAtPriceV2` is higher than `priceV2`.
     */
    compareAtPriceV2?: Maybe<MoneyV2>;
    /** Globally unique identifier. */
    id: Scalars['ID'];
    /** Image associated with the product variant. This field falls back to the product image if no image is available. */
    image?: Maybe<Image>;
    /** The metafield associated with the resource. */
    metafield?: Maybe<Metafield>;
    /** A paginated list of metafields associated with the resource. */
    metafields: MetafieldConnection;
    /** List of prices and compare-at prices in the presentment currencies for this shop. */
    presentmentPrices: ProductVariantPricePairConnection;
    /** The product variant’s price. */
    price: Scalars['Money'];
    /** The product variant’s price. */
    priceV2: MoneyV2;
    /** The product object that the product variant belongs to. */
    product: Product;
    /** List of product options applied to the variant. */
    selectedOptions: Array<SelectedOption>;
    /** The SKU (stock keeping unit) associated with the variant. */
    sku?: Maybe<Scalars['String']>;
    /** The product variant’s title. */
    title: Scalars['String'];
    /** The weight of the product variant in the unit system specified with `weight_unit`. */
    weight?: Maybe<Scalars['Float']>;
    /** Unit of measurement for weight. */
    weightUnit: WeightUnit;
  };

/** A product variant represents a different version of a product, such as differing sizes or differing colors. */
export type ProductVariantImageArgs = {
  maxWidth?: Maybe<Scalars['Int']>;
  maxHeight?: Maybe<Scalars['Int']>;
  crop?: Maybe<CropRegion>;
  scale: Scalars['Int'];
};

/** A product variant represents a different version of a product, such as differing sizes or differing colors. */
export type ProductVariantMetafieldArgs = {
  namespace: Scalars['String'];
  key: Scalars['String'];
};

/** A product variant represents a different version of a product, such as differing sizes or differing colors. */
export type ProductVariantMetafieldsArgs = {
  namespace?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  reverse: Scalars['Boolean'];
};

/** A product variant represents a different version of a product, such as differing sizes or differing colors. */
export type ProductVariantPresentmentPricesArgs = {
  presentmentCurrencies?: Maybe<Array<CurrencyCode>>;
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  reverse: Scalars['Boolean'];
};

export type ProductVariantConnection = {
  __typename?: 'ProductVariantConnection';
  /** A list of edges. */
  edges: Array<ProductVariantEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

export type ProductVariantEdge = {
  __typename?: 'ProductVariantEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of ProductVariantEdge. */
  node: ProductVariant;
};

/** The compare-at price and price of a variant sharing a currency. */
export type ProductVariantPricePair = {
  __typename?: 'ProductVariantPricePair';
  /** The compare-at price of the variant with associated currency. */
  compareAtPrice?: Maybe<MoneyV2>;
  /** The price of the variant with associated currency. */
  price: MoneyV2;
};

export type ProductVariantPricePairConnection = {
  __typename?: 'ProductVariantPricePairConnection';
  /** A list of edges. */
  edges: Array<ProductVariantPricePairEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

export type ProductVariantPricePairEdge = {
  __typename?: 'ProductVariantPricePairEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of ProductVariantPricePairEdge. */
  node: ProductVariantPricePair;
};

/** The set of valid sort keys for the variants query. */
export enum ProductVariantSortKeys {
  /** Sort by the `title` value. */
  Title = 'TITLE',
  /** Sort by the `sku` value. */
  Sku = 'SKU',
  /** Sort by the `position` value. */
  Position = 'POSITION',
  /** Sort by the `id` value. */
  Id = 'ID',
  /** During a search (i.e. when the `query` parameter has been specified on the connection) this sorts the
   * results by relevance to the search term(s). When no search query is specified, this sort key is not
   * deterministic and should not be used.
   */
  Relevance = 'RELEVANCE'
}

/** The schema’s entry-point for queries. This acts as the public, top-level API from which all queries must start. */
export type QueryRoot = {
  __typename?: 'QueryRoot';
  /** List of the shop's articles. */
  articles: ArticleConnection;
  /** Find a blog by its handle. */
  blogByHandle?: Maybe<Blog>;
  /** List of the shop's blogs. */
  blogs: BlogConnection;
  /** Find a collection by its handle. */
  collectionByHandle?: Maybe<Collection>;
  /** List of the shop’s collections. */
  collections: CollectionConnection;
  customer?: Maybe<Customer>;
  node?: Maybe<Node>;
  nodes: Array<Maybe<Node>>;
  /** Find a page by its handle. */
  pageByHandle?: Maybe<Page>;
  /** List of the shop's pages. */
  pages: PageConnection;
  /** Find a product by its handle. */
  productByHandle?: Maybe<Product>;
  /** Find recommended products related to a given `product_id`.
   * To learn more about how recommendations are generated, see
   * [*Showing product recommendations on product pages*](https://help.shopify.com/themes/development/recommended-products).
   */
  productRecommendations?: Maybe<Array<Product>>;
  /** Tags added to products.
   * Additional access scope required: unauthenticated_read_product_tags.
   */
  productTags: StringConnection;
  /** List of the shop’s product types. */
  productTypes: StringConnection;
  /** List of the shop’s products. */
  products: ProductConnection;
  shop: Shop;
};

/** The schema’s entry-point for queries. This acts as the public, top-level API from which all queries must start. */
export type QueryRootArticlesArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  reverse: Scalars['Boolean'];
  sortKey: ArticleSortKeys;
  query?: Maybe<Scalars['String']>;
};

/** The schema’s entry-point for queries. This acts as the public, top-level API from which all queries must start. */
export type QueryRootBlogByHandleArgs = {
  handle: Scalars['String'];
};

/** The schema’s entry-point for queries. This acts as the public, top-level API from which all queries must start. */
export type QueryRootBlogsArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  reverse: Scalars['Boolean'];
  sortKey: BlogSortKeys;
  query?: Maybe<Scalars['String']>;
};

/** The schema’s entry-point for queries. This acts as the public, top-level API from which all queries must start. */
export type QueryRootCollectionByHandleArgs = {
  handle: Scalars['String'];
};

/** The schema’s entry-point for queries. This acts as the public, top-level API from which all queries must start. */
export type QueryRootCollectionsArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  reverse: Scalars['Boolean'];
  sortKey: CollectionSortKeys;
  query?: Maybe<Scalars['String']>;
};

/** The schema’s entry-point for queries. This acts as the public, top-level API from which all queries must start. */
export type QueryRootCustomerArgs = {
  customerAccessToken: Scalars['String'];
};

/** The schema’s entry-point for queries. This acts as the public, top-level API from which all queries must start. */
export type QueryRootNodeArgs = {
  id: Scalars['ID'];
};

/** The schema’s entry-point for queries. This acts as the public, top-level API from which all queries must start. */
export type QueryRootNodesArgs = {
  ids: Array<Scalars['ID']>;
};

/** The schema’s entry-point for queries. This acts as the public, top-level API from which all queries must start. */
export type QueryRootPageByHandleArgs = {
  handle: Scalars['String'];
};

/** The schema’s entry-point for queries. This acts as the public, top-level API from which all queries must start. */
export type QueryRootPagesArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  reverse: Scalars['Boolean'];
  sortKey: PageSortKeys;
  query?: Maybe<Scalars['String']>;
};

/** The schema’s entry-point for queries. This acts as the public, top-level API from which all queries must start. */
export type QueryRootProductByHandleArgs = {
  handle: Scalars['String'];
};

/** The schema’s entry-point for queries. This acts as the public, top-level API from which all queries must start. */
export type QueryRootProductRecommendationsArgs = {
  productId: Scalars['ID'];
};

/** The schema’s entry-point for queries. This acts as the public, top-level API from which all queries must start. */
export type QueryRootProductTagsArgs = {
  first: Scalars['Int'];
};

/** The schema’s entry-point for queries. This acts as the public, top-level API from which all queries must start. */
export type QueryRootProductTypesArgs = {
  first: Scalars['Int'];
};

/** The schema’s entry-point for queries. This acts as the public, top-level API from which all queries must start. */
export type QueryRootProductsArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  reverse: Scalars['Boolean'];
  sortKey: ProductSortKeys;
  query?: Maybe<Scalars['String']>;
};

/** Script discount applications capture the intentions of a discount that
 * was created by a Shopify Script.
 */
export type ScriptDiscountApplication = DiscountApplication & {
  __typename?: 'ScriptDiscountApplication';
  /** The method by which the discount's value is allocated to its entitled items. */
  allocationMethod: DiscountApplicationAllocationMethod;
  /** The description of the application as defined by the Script. */
  description: Scalars['String'];
  /** Which lines of targetType that the discount is allocated over. */
  targetSelection: DiscountApplicationTargetSelection;
  /** The type of line that the discount is applicable towards. */
  targetType: DiscountApplicationTargetType;
  /** The title of the application as defined by the Script. */
  title: Scalars['String'];
  /** The value of the discount application. */
  value: PricingValue;
};

/** Custom properties that a shop owner can use to define product variants.
 * Multiple options can exist. Options are represented as: option1, option2, option3, etc.
 */
export type SelectedOption = {
  __typename?: 'SelectedOption';
  /** The product option’s name. */
  name: Scalars['String'];
  /** The product option’s value. */
  value: Scalars['String'];
};

/** Specifies the input fields required for a selected option. */
export type SelectedOptionInput = {
  /** The product option’s name. */
  name: Scalars['String'];
  /** The product option’s value. */
  value: Scalars['String'];
};

/** SEO information. */
export type Seo = {
  __typename?: 'SEO';
  /** The meta description. */
  description?: Maybe<Scalars['String']>;
  /** The SEO title. */
  title?: Maybe<Scalars['String']>;
};

/** A shipping rate to be applied to a checkout. */
export type ShippingRate = {
  __typename?: 'ShippingRate';
  /** Human-readable unique identifier for this shipping rate. */
  handle: Scalars['String'];
  /** Price of this shipping rate. */
  price: Scalars['Money'];
  /** Price of this shipping rate. */
  priceV2: MoneyV2;
  /** Title of this shipping rate. */
  title: Scalars['String'];
};

/** Shop represents a collection of the general settings and information about the shop. */
export type Shop = {
  __typename?: 'Shop';
  /** List of the shop' articles. */
  articles: ArticleConnection;
  /** List of the shop' blogs. */
  blogs: BlogConnection;
  /** Find a collection by its handle. */
  collectionByHandle?: Maybe<Collection>;
  /** List of the shop’s collections. */
  collections: CollectionConnection;
  /** The three-letter code for the currency that the shop accepts. */
  currencyCode: CurrencyCode;
  /** A description of the shop. */
  description?: Maybe<Scalars['String']>;
  /** A string representing the way currency is formatted when the currency isn’t specified. */
  moneyFormat: Scalars['String'];
  /** The shop’s name. */
  name: Scalars['String'];
  /** Settings related to payments. */
  paymentSettings: PaymentSettings;
  /** The shop’s primary domain. */
  primaryDomain: Domain;
  /** The shop’s privacy policy. */
  privacyPolicy?: Maybe<ShopPolicy>;
  /** Find a product by its handle. */
  productByHandle?: Maybe<Product>;
  /** Tags added to products.
   * Additional access scope required: unauthenticated_read_product_tags.
   */
  productTags: StringConnection;
  /** List of the shop’s product types. */
  productTypes: StringConnection;
  /** List of the shop’s products. */
  products: ProductConnection;
  /** The shop’s refund policy. */
  refundPolicy?: Maybe<ShopPolicy>;
  /** Countries that the shop ships to. */
  shipsToCountries: Array<CountryCode>;
  /** The shop’s Shopify Payments account id. */
  shopifyPaymentsAccountId?: Maybe<Scalars['String']>;
  /** The shop’s terms of service. */
  termsOfService?: Maybe<ShopPolicy>;
};

/** Shop represents a collection of the general settings and information about the shop. */
export type ShopArticlesArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  reverse: Scalars['Boolean'];
  sortKey: ArticleSortKeys;
  query?: Maybe<Scalars['String']>;
};

/** Shop represents a collection of the general settings and information about the shop. */
export type ShopBlogsArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  reverse: Scalars['Boolean'];
  sortKey: BlogSortKeys;
  query?: Maybe<Scalars['String']>;
};

/** Shop represents a collection of the general settings and information about the shop. */
export type ShopCollectionByHandleArgs = {
  handle: Scalars['String'];
};

/** Shop represents a collection of the general settings and information about the shop. */
export type ShopCollectionsArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  reverse: Scalars['Boolean'];
  sortKey: CollectionSortKeys;
  query?: Maybe<Scalars['String']>;
};

/** Shop represents a collection of the general settings and information about the shop. */
export type ShopProductByHandleArgs = {
  handle: Scalars['String'];
};

/** Shop represents a collection of the general settings and information about the shop. */
export type ShopProductTagsArgs = {
  first: Scalars['Int'];
};

/** Shop represents a collection of the general settings and information about the shop. */
export type ShopProductTypesArgs = {
  first: Scalars['Int'];
};

/** Shop represents a collection of the general settings and information about the shop. */
export type ShopProductsArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['String']>;
  last?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['String']>;
  reverse: Scalars['Boolean'];
  sortKey: ProductSortKeys;
  query?: Maybe<Scalars['String']>;
};

/** Policy that a merchant has configured for their store, such as their refund or privacy policy. */
export type ShopPolicy = Node & {
  __typename?: 'ShopPolicy';
  /** Policy text, maximum size of 64kb. */
  body: Scalars['String'];
  /** Policy’s handle. */
  handle: Scalars['String'];
  /** Globally unique identifier. */
  id: Scalars['ID'];
  /** Policy’s title. */
  title: Scalars['String'];
  /** Public URL to the policy. */
  url: Scalars['URL'];
};

export type StringConnection = {
  __typename?: 'StringConnection';
  /** A list of edges. */
  edges: Array<StringEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

export type StringEdge = {
  __typename?: 'StringEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of StringEdge. */
  node: Scalars['String'];
};

/** Specifies the fields required to complete a checkout with
 * a tokenized payment.
 */
export type TokenizedPaymentInput = {
  /** The amount of the payment. */
  amount: Scalars['Money'];
  /** A unique client generated key used to avoid duplicate charges. When a
   * duplicate payment is found, the original is returned instead of creating a new one.
   */
  idempotencyKey: Scalars['String'];
  /** The billing address for the payment. */
  billingAddress: MailingAddressInput;
  /** The type of payment token. */
  type: Scalars['String'];
  /** A simple string or JSON containing the required payment data for the tokenized payment. */
  paymentData: Scalars['String'];
  /** Executes the payment in test mode if possible. Defaults to `false`. */
  test?: Maybe<Scalars['Boolean']>;
  /** Public Hash Key used for AndroidPay payments only. */
  identifier?: Maybe<Scalars['String']>;
};

/** Specifies the fields required to complete a checkout with
 * a tokenized payment.
 */
export type TokenizedPaymentInputV2 = {
  /** The amount and currency of the payment. */
  paymentAmount: MoneyInput;
  /** A unique client generated key used to avoid duplicate charges. When a
   * duplicate payment is found, the original is returned instead of creating a new one.
   */
  idempotencyKey: Scalars['String'];
  /** The billing address for the payment. */
  billingAddress: MailingAddressInput;
  /** The type of payment token. */
  type: Scalars['String'];
  /** A simple string or JSON containing the required payment data for the tokenized payment. */
  paymentData: Scalars['String'];
  /** Executes the payment in test mode if possible. Defaults to `false`. */
  test?: Maybe<Scalars['Boolean']>;
  /** Public Hash Key used for AndroidPay payments only. */
  identifier?: Maybe<Scalars['String']>;
};

/** An object representing exchange of money for a product or service. */
export type Transaction = {
  __typename?: 'Transaction';
  /** The amount of money that the transaction was for. */
  amount: Scalars['Money'];
  /** The kind of the transaction. */
  kind: TransactionKind;
  /** The status of the transaction. */
  status: TransactionStatus;
  /** The status of the transaction. */
  statusV2?: Maybe<TransactionStatus>;
  /** Whether the transaction was done in test mode or not. */
  test: Scalars['Boolean'];
};

export enum TransactionKind {
  Sale = 'SALE',
  Capture = 'CAPTURE',
  Authorization = 'AUTHORIZATION',
  EmvAuthorization = 'EMV_AUTHORIZATION',
  Change = 'CHANGE'
}

export enum TransactionStatus {
  Pending = 'PENDING',
  Success = 'SUCCESS',
  Failure = 'FAILURE',
  Error = 'ERROR'
}

/** Represents an error in the input of a mutation. */
export type UserError = DisplayableError & {
  __typename?: 'UserError';
  /** Path to the input field which caused the error. */
  field?: Maybe<Array<Scalars['String']>>;
  /** The error message. */
  message: Scalars['String'];
};

/** Units of measurement for weight. */
export enum WeightUnit {
  /** 1 kilogram equals 1000 grams. */
  Kilograms = 'KILOGRAMS',
  /** Metric system unit of mass. */
  Grams = 'GRAMS',
  /** 1 pound equals 16 ounces. */
  Pounds = 'POUNDS',
  /** Imperial system unit of mass. */
  Ounces = 'OUNCES'
}
export type CheckoutFragment = { __typename?: 'Checkout' } & Pick<Checkout, 'id' | 'webUrl'> & {
    subtotalPriceV2: { __typename?: 'MoneyV2' } & Pick<MoneyV2, 'amount' | 'currencyCode'>;
    totalTaxV2: { __typename?: 'MoneyV2' } & Pick<MoneyV2, 'amount' | 'currencyCode'>;
    totalPriceV2: { __typename?: 'MoneyV2' } & Pick<MoneyV2, 'amount' | 'currencyCode'>;
    lineItems: { __typename?: 'CheckoutLineItemConnection' } & {
      pageInfo: { __typename?: 'PageInfo' } & Pick<PageInfo, 'hasNextPage' | 'hasPreviousPage'>;
      edges: Array<
        { __typename?: 'CheckoutLineItemEdge' } & {
          node: { __typename?: 'CheckoutLineItem' } & Pick<CheckoutLineItem, 'id' | 'title' | 'quantity'> & {
              variant: Maybe<
                { __typename?: 'ProductVariant' } & Pick<ProductVariant, 'id' | 'title'> & {
                    image: Maybe<{ __typename?: 'Image' } & Pick<Image, 'transformedSrc'>>;
                    priceV2: { __typename?: 'MoneyV2' } & Pick<MoneyV2, 'amount' | 'currencyCode'>;
                  }
              >;
            };
        }
      >;
    };
  };

export type CheckoutQueryVariables = {
  checkoutId: Scalars['ID'];
};

export type CheckoutQuery = { __typename?: 'QueryRoot' } & {
  node: Maybe<
    {
      __typename?:
        | 'Article'
        | 'Blog'
        | 'Comment'
        | 'Collection'
        | 'Product'
        | 'Metafield'
        | 'ProductVariant'
        | 'ProductOption'
        | 'MailingAddress'
        | 'Checkout'
        | 'AppliedGiftCard'
        | 'CheckoutLineItem'
        | 'Order'
        | 'Page'
        | 'ShopPolicy'
        | 'Payment';
    } & ({ __typename?: 'Checkout' } & CheckoutFragment)
  >;
};

export type CheckoutCreateMutationVariables = {};

export type CheckoutCreateMutation = { __typename?: 'Mutation' } & {
  checkoutCreate: Maybe<
    { __typename?: 'CheckoutCreatePayload' } & { checkout: Maybe<{ __typename?: 'Checkout' } & Pick<Checkout, 'id'>> }
  >;
};

export type CheckoutLineItemsReplaceMutationVariables = {
  checkoutId: Scalars['ID'];
  lineItems: Array<CheckoutLineItemInput>;
};

export type CheckoutLineItemsReplaceMutation = { __typename?: 'Mutation' } & {
  checkoutLineItemsReplace: Maybe<
    { __typename?: 'CheckoutLineItemsReplacePayload' } & {
      checkout: Maybe<{ __typename?: 'Checkout' } & CheckoutFragment>;
    }
  >;
};

export type ProductFragment = { __typename?: 'Product' } & Pick<Product, 'title' | 'description'> & {
    images: { __typename?: 'ImageConnection' } & {
      edges: Array<
        { __typename?: 'ImageEdge' } & { node: { __typename?: 'Image' } & Pick<Image, 'altText' | 'originalSrc'> }
      >;
    };
    options: Array<{ __typename?: 'ProductOption' } & Pick<ProductOption, 'id' | 'name' | 'values'>>;
    variants: { __typename?: 'ProductVariantConnection' } & {
      edges: Array<
        { __typename?: 'ProductVariantEdge' } & {
          node: { __typename?: 'ProductVariant' } & Pick<ProductVariant, 'id' | 'title'> & {
              selectedOptions: Array<{ __typename?: 'SelectedOption' } & Pick<SelectedOption, 'name' | 'value'>>;
            };
        }
      >;
    };
  };

export type ProductQueryVariables = {
  handle: Scalars['String'];
};

export type ProductQuery = { __typename?: 'QueryRoot' } & {
  productByHandle: Maybe<{ __typename?: 'Product' } & ProductFragment>;
};

export type ProductsFragment = { __typename?: 'ProductConnection' } & {
  edges: Array<
    { __typename?: 'ProductEdge' } & Pick<ProductEdge, 'cursor'> & {
        node: { __typename?: 'Product' } & Pick<Product, 'title' | 'handle' | 'description' | 'createdAt'> & {
            images: { __typename?: 'ImageConnection' } & {
              edges: Array<
                { __typename?: 'ImageEdge' } & {
                  node: { __typename?: 'Image' } & Pick<Image, 'transformedSrc' | 'altText'>;
                }
              >;
            };
            priceRange: { __typename?: 'ProductPriceRange' } & {
              minVariantPrice: { __typename?: 'MoneyV2' } & Pick<MoneyV2, 'amount' | 'currencyCode'>;
              maxVariantPrice: { __typename?: 'MoneyV2' } & Pick<MoneyV2, 'amount' | 'currencyCode'>;
            };
          };
      }
  >;
  pageInfo: { __typename?: 'PageInfo' } & Pick<PageInfo, 'hasNextPage'>;
};

export type ProductsQueryVariables = {
  cursor?: Maybe<Scalars['String']>;
  query: Scalars['String'];
  sortKey: ProductSortKeys;
  reverse: Scalars['Boolean'];
};

export type ProductsQuery = { __typename?: 'QueryRoot' } & {
  products: { __typename?: 'ProductConnection' } & ProductsFragment;
};
