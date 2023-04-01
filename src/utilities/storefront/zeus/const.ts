/* eslint-disable */

export const AllTypesProps: Record<string,any> = {
	Article:{
		comments:{

		},
		content:{

		},
		excerpt:{

		},
		metafield:{

		},
		metafields:{
			identifiers:"HasMetafieldsIdentifier"
		}
	},
	ArticleSortKeys: "enum" as const,
	AttributeInput:{

	},
	Blog:{
		articleByHandle:{

		},
		articles:{
			sortKey:"ArticleSortKeys"
		},
		metafield:{

		},
		metafields:{
			identifiers:"HasMetafieldsIdentifier"
		}
	},
	BlogSortKeys: "enum" as const,
	CardBrand: "enum" as const,
	Cart:{
		attribute:{

		},
		deliveryGroups:{

		},
		lines:{

		}
	},
	CartBuyerIdentityInput:{
		countryCode:"CountryCode",
		deliveryAddressPreferences:"DeliveryAddressInput"
	},
	CartDeliveryGroup:{
		cartLines:{

		}
	},
	CartErrorCode: "enum" as const,
	CartInput:{
		attributes:"AttributeInput",
		lines:"CartLineInput",
		buyerIdentity:"CartBuyerIdentityInput"
	},
	CartLine:{
		attribute:{

		}
	},
	CartLineInput:{
		attributes:"AttributeInput"
	},
	CartLineUpdateInput:{
		attributes:"AttributeInput"
	},
	CartSelectedDeliveryOptionInput:{

	},
	Checkout:{
		discountApplications:{

		},
		lineItems:{

		}
	},
	CheckoutAttributesUpdateV2Input:{
		customAttributes:"AttributeInput"
	},
	CheckoutBuyerIdentityInput:{
		countryCode:"CountryCode"
	},
	CheckoutCreateInput:{
		lineItems:"CheckoutLineItemInput",
		shippingAddress:"MailingAddressInput",
		customAttributes:"AttributeInput",
		buyerIdentity:"CheckoutBuyerIdentityInput"
	},
	CheckoutErrorCode: "enum" as const,
	CheckoutLineItemInput:{
		customAttributes:"AttributeInput"
	},
	CheckoutLineItemUpdateInput:{
		customAttributes:"AttributeInput"
	},
	Collection:{
		description:{

		},
		metafield:{

		},
		metafields:{
			identifiers:"HasMetafieldsIdentifier"
		},
		products:{
			sortKey:"ProductCollectionSortKeys",
			filters:"ProductFilter"
		}
	},
	CollectionSortKeys: "enum" as const,
	Color: `scalar.Color` as const,
	Comment:{
		content:{

		}
	},
	CountryCode: "enum" as const,
	CreditCardPaymentInputV2:{
		paymentAmount:"MoneyInput",
		billingAddress:"MailingAddressInput"
	},
	CropRegion: "enum" as const,
	CurrencyCode: "enum" as const,
	Customer:{
		addresses:{

		},
		metafield:{

		},
		metafields:{
			identifiers:"HasMetafieldsIdentifier"
		},
		orders:{
			sortKey:"OrderSortKeys"
		}
	},
	CustomerAccessTokenCreateInput:{

	},
	CustomerActivateInput:{

	},
	CustomerCreateInput:{

	},
	CustomerErrorCode: "enum" as const,
	CustomerResetInput:{

	},
	CustomerUpdateInput:{

	},
	DateTime: `scalar.DateTime` as const,
	Decimal: `scalar.Decimal` as const,
	DeliveryAddressInput:{
		deliveryAddress:"MailingAddressInput"
	},
	DeliveryMethodType: "enum" as const,
	DigitalWallet: "enum" as const,
	DiscountApplicationAllocationMethod: "enum" as const,
	DiscountApplicationTargetSelection: "enum" as const,
	DiscountApplicationTargetType: "enum" as const,
	FilterType: "enum" as const,
	Fulfillment:{
		fulfillmentLineItems:{

		},
		trackingInfo:{

		}
	},
	GeoCoordinateInput:{

	},
	HTML: `scalar.HTML` as const,
	HasMetafields:{
		metafield:{

		},
		metafields:{
			identifiers:"HasMetafieldsIdentifier"
		}
	},
	HasMetafieldsIdentifier:{

	},
	Image:{
		transformedSrc:{
			crop:"CropRegion",
			preferredContentType:"ImageContentType"
		},
		url:{
			transform:"ImageTransformInput"
		}
	},
	ImageContentType: "enum" as const,
	ImageTransformInput:{
		crop:"CropRegion",
		preferredContentType:"ImageContentType"
	},
	JSON: `scalar.JSON` as const,
	LanguageCode: "enum" as const,
	LocationSortKeys: "enum" as const,
	MailingAddress:{
		formatted:{

		}
	},
	MailingAddressInput:{

	},
	MediaContentType: "enum" as const,
	MediaHost: "enum" as const,
	MenuItemType: "enum" as const,
	Metafield:{
		references:{

		}
	},
	MetafieldFilter:{

	},
	Metaobject:{
		field:{

		}
	},
	MetaobjectField:{
		references:{

		}
	},
	MetaobjectHandleInput:{

	},
	MoneyInput:{
		amount:"Decimal",
		currencyCode:"CurrencyCode"
	},
	Mutation:{
		cartAttributesUpdate:{
			attributes:"AttributeInput"
		},
		cartBuyerIdentityUpdate:{
			buyerIdentity:"CartBuyerIdentityInput"
		},
		cartCreate:{
			input:"CartInput"
		},
		cartDiscountCodesUpdate:{

		},
		cartLinesAdd:{
			lines:"CartLineInput"
		},
		cartLinesRemove:{

		},
		cartLinesUpdate:{
			lines:"CartLineUpdateInput"
		},
		cartNoteUpdate:{

		},
		cartSelectedDeliveryOptionsUpdate:{
			selectedDeliveryOptions:"CartSelectedDeliveryOptionInput"
		},
		checkoutAttributesUpdateV2:{
			input:"CheckoutAttributesUpdateV2Input"
		},
		checkoutCompleteFree:{

		},
		checkoutCompleteWithCreditCardV2:{
			payment:"CreditCardPaymentInputV2"
		},
		checkoutCompleteWithTokenizedPaymentV3:{
			payment:"TokenizedPaymentInputV3"
		},
		checkoutCreate:{
			input:"CheckoutCreateInput"
		},
		checkoutCustomerAssociateV2:{

		},
		checkoutCustomerDisassociateV2:{

		},
		checkoutDiscountCodeApplyV2:{

		},
		checkoutDiscountCodeRemove:{

		},
		checkoutEmailUpdateV2:{

		},
		checkoutGiftCardRemoveV2:{

		},
		checkoutGiftCardsAppend:{

		},
		checkoutLineItemsAdd:{
			lineItems:"CheckoutLineItemInput"
		},
		checkoutLineItemsRemove:{

		},
		checkoutLineItemsReplace:{
			lineItems:"CheckoutLineItemInput"
		},
		checkoutLineItemsUpdate:{
			lineItems:"CheckoutLineItemUpdateInput"
		},
		checkoutShippingAddressUpdateV2:{
			shippingAddress:"MailingAddressInput"
		},
		checkoutShippingLineUpdate:{

		},
		customerAccessTokenCreate:{
			input:"CustomerAccessTokenCreateInput"
		},
		customerAccessTokenCreateWithMultipass:{

		},
		customerAccessTokenDelete:{

		},
		customerAccessTokenRenew:{

		},
		customerActivate:{
			input:"CustomerActivateInput"
		},
		customerActivateByUrl:{
			activationUrl:"URL"
		},
		customerAddressCreate:{
			address:"MailingAddressInput"
		},
		customerAddressDelete:{

		},
		customerAddressUpdate:{
			address:"MailingAddressInput"
		},
		customerCreate:{
			input:"CustomerCreateInput"
		},
		customerDefaultAddressUpdate:{

		},
		customerRecover:{

		},
		customerReset:{
			input:"CustomerResetInput"
		},
		customerResetByUrl:{
			resetUrl:"URL"
		},
		customerUpdate:{
			customer:"CustomerUpdateInput"
		}
	},
	Order:{
		discountApplications:{

		},
		lineItems:{

		},
		metafield:{

		},
		metafields:{
			identifiers:"HasMetafieldsIdentifier"
		},
		successfulFulfillments:{

		}
	},
	OrderCancelReason: "enum" as const,
	OrderFinancialStatus: "enum" as const,
	OrderFulfillmentStatus: "enum" as const,
	OrderSortKeys: "enum" as const,
	Page:{
		metafield:{

		},
		metafields:{
			identifiers:"HasMetafieldsIdentifier"
		}
	},
	PageSortKeys: "enum" as const,
	PaymentTokenType: "enum" as const,
	PriceRangeFilter:{

	},
	Product:{
		collections:{

		},
		description:{

		},
		images:{
			sortKey:"ProductImageSortKeys"
		},
		media:{
			sortKey:"ProductMediaSortKeys"
		},
		metafield:{

		},
		metafields:{
			identifiers:"HasMetafieldsIdentifier"
		},
		options:{

		},
		sellingPlanGroups:{

		},
		variantBySelectedOptions:{
			selectedOptions:"SelectedOptionInput"
		},
		variants:{
			sortKey:"ProductVariantSortKeys"
		}
	},
	ProductCollectionSortKeys: "enum" as const,
	ProductFilter:{
		variantOption:"VariantOptionFilter",
		price:"PriceRangeFilter",
		productMetafield:"MetafieldFilter",
		variantMetafield:"MetafieldFilter"
	},
	ProductImageSortKeys: "enum" as const,
	ProductMediaSortKeys: "enum" as const,
	ProductSortKeys: "enum" as const,
	ProductVariant:{
		metafield:{

		},
		metafields:{
			identifiers:"HasMetafieldsIdentifier"
		},
		sellingPlanAllocations:{

		},
		storeAvailability:{
			near:"GeoCoordinateInput"
		}
	},
	ProductVariantSortKeys: "enum" as const,
	QueryRoot:{
		articles:{
			sortKey:"ArticleSortKeys"
		},
		blog:{

		},
		blogByHandle:{

		},
		blogs:{
			sortKey:"BlogSortKeys"
		},
		cart:{

		},
		collection:{

		},
		collectionByHandle:{

		},
		collections:{
			sortKey:"CollectionSortKeys"
		},
		customer:{

		},
		locations:{
			sortKey:"LocationSortKeys",
			near:"GeoCoordinateInput"
		},
		menu:{

		},
		metaobject:{
			handle:"MetaobjectHandleInput"
		},
		metaobjects:{

		},
		node:{

		},
		nodes:{

		},
		page:{

		},
		pageByHandle:{

		},
		pages:{
			sortKey:"PageSortKeys"
		},
		product:{

		},
		productByHandle:{

		},
		productRecommendations:{

		},
		productTags:{

		},
		productTypes:{

		},
		products:{
			sortKey:"ProductSortKeys"
		},
		urlRedirects:{

		}
	},
	SelectedOptionInput:{

	},
	SellingPlanCheckoutChargeType: "enum" as const,
	SellingPlanGroup:{
		sellingPlans:{

		}
	},
	Shop:{
		metafield:{

		},
		metafields:{
			identifiers:"HasMetafieldsIdentifier"
		}
	},
	TokenizedPaymentInputV3:{
		paymentAmount:"MoneyInput",
		billingAddress:"MailingAddressInput",
		type:"PaymentTokenType"
	},
	TransactionKind: "enum" as const,
	TransactionStatus: "enum" as const,
	URL: `scalar.URL` as const,
	UnitPriceMeasurementMeasuredType: "enum" as const,
	UnitPriceMeasurementMeasuredUnit: "enum" as const,
	UnitSystem: "enum" as const,
	UnsignedInt64: `scalar.UnsignedInt64` as const,
	VariantOptionFilter:{

	},
	WeightUnit: "enum" as const
}

export const ReturnTypes: Record<string,any> = {
	oneOf:{

	},
	accessRestricted:{
		reason:"String"
	},
	inContext:{
		country:"CountryCode",
		language:"LanguageCode",
		preferredLocationId:"ID"
	},
	ApiVersion:{
		displayName:"String",
		handle:"String",
		supported:"Boolean"
	},
	AppliedGiftCard:{
		amountUsed:"MoneyV2",
		amountUsedV2:"MoneyV2",
		balance:"MoneyV2",
		balanceV2:"MoneyV2",
		id:"ID",
		lastCharacters:"String",
		presentmentAmountUsed:"MoneyV2"
	},
	Article:{
		author:"ArticleAuthor",
		authorV2:"ArticleAuthor",
		blog:"Blog",
		comments:"CommentConnection",
		content:"String",
		contentHtml:"HTML",
		excerpt:"String",
		excerptHtml:"HTML",
		handle:"String",
		id:"ID",
		image:"Image",
		metafield:"Metafield",
		metafields:"Metafield",
		onlineStoreUrl:"URL",
		publishedAt:"DateTime",
		seo:"SEO",
		tags:"String",
		title:"String"
	},
	ArticleAuthor:{
		bio:"String",
		email:"String",
		firstName:"String",
		lastName:"String",
		name:"String"
	},
	ArticleConnection:{
		edges:"ArticleEdge",
		nodes:"Article",
		pageInfo:"PageInfo"
	},
	ArticleEdge:{
		cursor:"String",
		node:"Article"
	},
	Attribute:{
		key:"String",
		value:"String"
	},
	AutomaticDiscountApplication:{
		allocationMethod:"DiscountApplicationAllocationMethod",
		targetSelection:"DiscountApplicationTargetSelection",
		targetType:"DiscountApplicationTargetType",
		title:"String",
		value:"PricingValue"
	},
	AvailableShippingRates:{
		ready:"Boolean",
		shippingRates:"ShippingRate"
	},
	Blog:{
		articleByHandle:"Article",
		articles:"ArticleConnection",
		authors:"ArticleAuthor",
		handle:"String",
		id:"ID",
		metafield:"Metafield",
		metafields:"Metafield",
		onlineStoreUrl:"URL",
		seo:"SEO",
		title:"String"
	},
	BlogConnection:{
		edges:"BlogEdge",
		nodes:"Blog",
		pageInfo:"PageInfo"
	},
	BlogEdge:{
		cursor:"String",
		node:"Blog"
	},
	Brand:{
		colors:"BrandColors",
		coverImage:"MediaImage",
		logo:"MediaImage",
		shortDescription:"String",
		slogan:"String",
		squareLogo:"MediaImage"
	},
	BrandColorGroup:{
		background:"Color",
		foreground:"Color"
	},
	BrandColors:{
		primary:"BrandColorGroup",
		secondary:"BrandColorGroup"
	},
	Cart:{
		attribute:"Attribute",
		attributes:"Attribute",
		buyerIdentity:"CartBuyerIdentity",
		checkoutUrl:"URL",
		cost:"CartCost",
		createdAt:"DateTime",
		deliveryGroups:"CartDeliveryGroupConnection",
		discountAllocations:"CartDiscountAllocation",
		discountCodes:"CartDiscountCode",
		estimatedCost:"CartEstimatedCost",
		id:"ID",
		lines:"CartLineConnection",
		note:"String",
		totalQuantity:"Int",
		updatedAt:"DateTime"
	},
	CartAttributesUpdatePayload:{
		cart:"Cart",
		userErrors:"CartUserError"
	},
	CartAutomaticDiscountAllocation:{
		discountedAmount:"MoneyV2",
		title:"String"
	},
	CartBuyerIdentity:{
		countryCode:"CountryCode",
		customer:"Customer",
		deliveryAddressPreferences:"DeliveryAddress",
		email:"String",
		phone:"String"
	},
	CartBuyerIdentityUpdatePayload:{
		cart:"Cart",
		userErrors:"CartUserError"
	},
	CartCodeDiscountAllocation:{
		code:"String",
		discountedAmount:"MoneyV2"
	},
	CartCost:{
		checkoutChargeAmount:"MoneyV2",
		subtotalAmount:"MoneyV2",
		subtotalAmountEstimated:"Boolean",
		totalAmount:"MoneyV2",
		totalAmountEstimated:"Boolean",
		totalDutyAmount:"MoneyV2",
		totalDutyAmountEstimated:"Boolean",
		totalTaxAmount:"MoneyV2",
		totalTaxAmountEstimated:"Boolean"
	},
	CartCreatePayload:{
		cart:"Cart",
		userErrors:"CartUserError"
	},
	CartCustomDiscountAllocation:{
		discountedAmount:"MoneyV2",
		title:"String"
	},
	CartDeliveryGroup:{
		cartLines:"CartLineConnection",
		deliveryAddress:"MailingAddress",
		deliveryOptions:"CartDeliveryOption",
		id:"ID",
		selectedDeliveryOption:"CartDeliveryOption"
	},
	CartDeliveryGroupConnection:{
		edges:"CartDeliveryGroupEdge",
		nodes:"CartDeliveryGroup",
		pageInfo:"PageInfo"
	},
	CartDeliveryGroupEdge:{
		cursor:"String",
		node:"CartDeliveryGroup"
	},
	CartDeliveryOption:{
		code:"String",
		deliveryMethodType:"DeliveryMethodType",
		description:"String",
		estimatedCost:"MoneyV2",
		handle:"String",
		title:"String"
	},
	CartDiscountAllocation:{
		"...on CartAutomaticDiscountAllocation": "CartAutomaticDiscountAllocation",
		"...on CartCodeDiscountAllocation": "CartCodeDiscountAllocation",
		"...on CartCustomDiscountAllocation": "CartCustomDiscountAllocation",
		discountedAmount:"MoneyV2"
	},
	CartDiscountCode:{
		applicable:"Boolean",
		code:"String"
	},
	CartDiscountCodesUpdatePayload:{
		cart:"Cart",
		userErrors:"CartUserError"
	},
	CartEstimatedCost:{
		checkoutChargeAmount:"MoneyV2",
		subtotalAmount:"MoneyV2",
		totalAmount:"MoneyV2",
		totalDutyAmount:"MoneyV2",
		totalTaxAmount:"MoneyV2"
	},
	CartLine:{
		attribute:"Attribute",
		attributes:"Attribute",
		cost:"CartLineCost",
		discountAllocations:"CartDiscountAllocation",
		estimatedCost:"CartLineEstimatedCost",
		id:"ID",
		merchandise:"Merchandise",
		quantity:"Int",
		sellingPlanAllocation:"SellingPlanAllocation"
	},
	CartLineConnection:{
		edges:"CartLineEdge",
		nodes:"CartLine",
		pageInfo:"PageInfo"
	},
	CartLineCost:{
		amountPerQuantity:"MoneyV2",
		compareAtAmountPerQuantity:"MoneyV2",
		subtotalAmount:"MoneyV2",
		totalAmount:"MoneyV2"
	},
	CartLineEdge:{
		cursor:"String",
		node:"CartLine"
	},
	CartLineEstimatedCost:{
		amount:"MoneyV2",
		compareAtAmount:"MoneyV2",
		subtotalAmount:"MoneyV2",
		totalAmount:"MoneyV2"
	},
	CartLinesAddPayload:{
		cart:"Cart",
		userErrors:"CartUserError"
	},
	CartLinesRemovePayload:{
		cart:"Cart",
		userErrors:"CartUserError"
	},
	CartLinesUpdatePayload:{
		cart:"Cart",
		userErrors:"CartUserError"
	},
	CartNoteUpdatePayload:{
		cart:"Cart",
		userErrors:"CartUserError"
	},
	CartSelectedDeliveryOptionsUpdatePayload:{
		cart:"Cart",
		userErrors:"CartUserError"
	},
	CartUserError:{
		code:"CartErrorCode",
		field:"String",
		message:"String"
	},
	Checkout:{
		appliedGiftCards:"AppliedGiftCard",
		availableShippingRates:"AvailableShippingRates",
		buyerIdentity:"CheckoutBuyerIdentity",
		completedAt:"DateTime",
		createdAt:"DateTime",
		currencyCode:"CurrencyCode",
		customAttributes:"Attribute",
		discountApplications:"DiscountApplicationConnection",
		email:"String",
		id:"ID",
		lineItems:"CheckoutLineItemConnection",
		lineItemsSubtotalPrice:"MoneyV2",
		note:"String",
		order:"Order",
		orderStatusUrl:"URL",
		paymentDue:"MoneyV2",
		paymentDueV2:"MoneyV2",
		ready:"Boolean",
		requiresShipping:"Boolean",
		shippingAddress:"MailingAddress",
		shippingDiscountAllocations:"DiscountAllocation",
		shippingLine:"ShippingRate",
		subtotalPrice:"MoneyV2",
		subtotalPriceV2:"MoneyV2",
		taxExempt:"Boolean",
		taxesIncluded:"Boolean",
		totalDuties:"MoneyV2",
		totalPrice:"MoneyV2",
		totalPriceV2:"MoneyV2",
		totalTax:"MoneyV2",
		totalTaxV2:"MoneyV2",
		updatedAt:"DateTime",
		webUrl:"URL"
	},
	CheckoutAttributesUpdateV2Payload:{
		checkout:"Checkout",
		checkoutUserErrors:"CheckoutUserError",
		userErrors:"UserError"
	},
	CheckoutBuyerIdentity:{
		countryCode:"CountryCode"
	},
	CheckoutCompleteFreePayload:{
		checkout:"Checkout",
		checkoutUserErrors:"CheckoutUserError",
		userErrors:"UserError"
	},
	CheckoutCompleteWithCreditCardV2Payload:{
		checkout:"Checkout",
		checkoutUserErrors:"CheckoutUserError",
		payment:"Payment",
		userErrors:"UserError"
	},
	CheckoutCompleteWithTokenizedPaymentV3Payload:{
		checkout:"Checkout",
		checkoutUserErrors:"CheckoutUserError",
		payment:"Payment",
		userErrors:"UserError"
	},
	CheckoutCreatePayload:{
		checkout:"Checkout",
		checkoutUserErrors:"CheckoutUserError",
		queueToken:"String",
		userErrors:"UserError"
	},
	CheckoutCustomerAssociateV2Payload:{
		checkout:"Checkout",
		checkoutUserErrors:"CheckoutUserError",
		customer:"Customer",
		userErrors:"UserError"
	},
	CheckoutCustomerDisassociateV2Payload:{
		checkout:"Checkout",
		checkoutUserErrors:"CheckoutUserError",
		userErrors:"UserError"
	},
	CheckoutDiscountCodeApplyV2Payload:{
		checkout:"Checkout",
		checkoutUserErrors:"CheckoutUserError",
		userErrors:"UserError"
	},
	CheckoutDiscountCodeRemovePayload:{
		checkout:"Checkout",
		checkoutUserErrors:"CheckoutUserError",
		userErrors:"UserError"
	},
	CheckoutEmailUpdateV2Payload:{
		checkout:"Checkout",
		checkoutUserErrors:"CheckoutUserError",
		userErrors:"UserError"
	},
	CheckoutGiftCardRemoveV2Payload:{
		checkout:"Checkout",
		checkoutUserErrors:"CheckoutUserError",
		userErrors:"UserError"
	},
	CheckoutGiftCardsAppendPayload:{
		checkout:"Checkout",
		checkoutUserErrors:"CheckoutUserError",
		userErrors:"UserError"
	},
	CheckoutLineItem:{
		customAttributes:"Attribute",
		discountAllocations:"DiscountAllocation",
		id:"ID",
		quantity:"Int",
		title:"String",
		unitPrice:"MoneyV2",
		variant:"ProductVariant"
	},
	CheckoutLineItemConnection:{
		edges:"CheckoutLineItemEdge",
		nodes:"CheckoutLineItem",
		pageInfo:"PageInfo"
	},
	CheckoutLineItemEdge:{
		cursor:"String",
		node:"CheckoutLineItem"
	},
	CheckoutLineItemsAddPayload:{
		checkout:"Checkout",
		checkoutUserErrors:"CheckoutUserError",
		userErrors:"UserError"
	},
	CheckoutLineItemsRemovePayload:{
		checkout:"Checkout",
		checkoutUserErrors:"CheckoutUserError",
		userErrors:"UserError"
	},
	CheckoutLineItemsReplacePayload:{
		checkout:"Checkout",
		userErrors:"CheckoutUserError"
	},
	CheckoutLineItemsUpdatePayload:{
		checkout:"Checkout",
		checkoutUserErrors:"CheckoutUserError",
		userErrors:"UserError"
	},
	CheckoutShippingAddressUpdateV2Payload:{
		checkout:"Checkout",
		checkoutUserErrors:"CheckoutUserError",
		userErrors:"UserError"
	},
	CheckoutShippingLineUpdatePayload:{
		checkout:"Checkout",
		checkoutUserErrors:"CheckoutUserError",
		userErrors:"UserError"
	},
	CheckoutUserError:{
		code:"CheckoutErrorCode",
		field:"String",
		message:"String"
	},
	Collection:{
		description:"String",
		descriptionHtml:"HTML",
		handle:"String",
		id:"ID",
		image:"Image",
		metafield:"Metafield",
		metafields:"Metafield",
		onlineStoreUrl:"URL",
		products:"ProductConnection",
		seo:"SEO",
		title:"String",
		updatedAt:"DateTime"
	},
	CollectionConnection:{
		edges:"CollectionEdge",
		nodes:"Collection",
		pageInfo:"PageInfo"
	},
	CollectionEdge:{
		cursor:"String",
		node:"Collection"
	},
	Color: `scalar.Color` as const,
	Comment:{
		author:"CommentAuthor",
		content:"String",
		contentHtml:"HTML",
		id:"ID"
	},
	CommentAuthor:{
		email:"String",
		name:"String"
	},
	CommentConnection:{
		edges:"CommentEdge",
		nodes:"Comment",
		pageInfo:"PageInfo"
	},
	CommentEdge:{
		cursor:"String",
		node:"Comment"
	},
	Country:{
		availableLanguages:"Language",
		currency:"Currency",
		isoCode:"CountryCode",
		name:"String",
		unitSystem:"UnitSystem"
	},
	CreditCard:{
		brand:"String",
		expiryMonth:"Int",
		expiryYear:"Int",
		firstDigits:"String",
		firstName:"String",
		lastDigits:"String",
		lastName:"String",
		maskedNumber:"String"
	},
	Currency:{
		isoCode:"CurrencyCode",
		name:"String",
		symbol:"String"
	},
	Customer:{
		acceptsMarketing:"Boolean",
		addresses:"MailingAddressConnection",
		createdAt:"DateTime",
		defaultAddress:"MailingAddress",
		displayName:"String",
		email:"String",
		firstName:"String",
		id:"ID",
		lastIncompleteCheckout:"Checkout",
		lastName:"String",
		metafield:"Metafield",
		metafields:"Metafield",
		numberOfOrders:"UnsignedInt64",
		orders:"OrderConnection",
		phone:"String",
		tags:"String",
		updatedAt:"DateTime"
	},
	CustomerAccessToken:{
		accessToken:"String",
		expiresAt:"DateTime"
	},
	CustomerAccessTokenCreatePayload:{
		customerAccessToken:"CustomerAccessToken",
		customerUserErrors:"CustomerUserError",
		userErrors:"UserError"
	},
	CustomerAccessTokenCreateWithMultipassPayload:{
		customerAccessToken:"CustomerAccessToken",
		customerUserErrors:"CustomerUserError"
	},
	CustomerAccessTokenDeletePayload:{
		deletedAccessToken:"String",
		deletedCustomerAccessTokenId:"String",
		userErrors:"UserError"
	},
	CustomerAccessTokenRenewPayload:{
		customerAccessToken:"CustomerAccessToken",
		userErrors:"UserError"
	},
	CustomerActivateByUrlPayload:{
		customer:"Customer",
		customerAccessToken:"CustomerAccessToken",
		customerUserErrors:"CustomerUserError"
	},
	CustomerActivatePayload:{
		customer:"Customer",
		customerAccessToken:"CustomerAccessToken",
		customerUserErrors:"CustomerUserError",
		userErrors:"UserError"
	},
	CustomerAddressCreatePayload:{
		customerAddress:"MailingAddress",
		customerUserErrors:"CustomerUserError",
		userErrors:"UserError"
	},
	CustomerAddressDeletePayload:{
		customerUserErrors:"CustomerUserError",
		deletedCustomerAddressId:"String",
		userErrors:"UserError"
	},
	CustomerAddressUpdatePayload:{
		customerAddress:"MailingAddress",
		customerUserErrors:"CustomerUserError",
		userErrors:"UserError"
	},
	CustomerCreatePayload:{
		customer:"Customer",
		customerUserErrors:"CustomerUserError",
		userErrors:"UserError"
	},
	CustomerDefaultAddressUpdatePayload:{
		customer:"Customer",
		customerUserErrors:"CustomerUserError",
		userErrors:"UserError"
	},
	CustomerRecoverPayload:{
		customerUserErrors:"CustomerUserError",
		userErrors:"UserError"
	},
	CustomerResetByUrlPayload:{
		customer:"Customer",
		customerAccessToken:"CustomerAccessToken",
		customerUserErrors:"CustomerUserError",
		userErrors:"UserError"
	},
	CustomerResetPayload:{
		customer:"Customer",
		customerAccessToken:"CustomerAccessToken",
		customerUserErrors:"CustomerUserError",
		userErrors:"UserError"
	},
	CustomerUpdatePayload:{
		customer:"Customer",
		customerAccessToken:"CustomerAccessToken",
		customerUserErrors:"CustomerUserError",
		userErrors:"UserError"
	},
	CustomerUserError:{
		code:"CustomerErrorCode",
		field:"String",
		message:"String"
	},
	DateTime: `scalar.DateTime` as const,
	Decimal: `scalar.Decimal` as const,
	DeliveryAddress:{
		"...on MailingAddress":"MailingAddress"
	},
	DiscountAllocation:{
		allocatedAmount:"MoneyV2",
		discountApplication:"DiscountApplication"
	},
	DiscountApplication:{
		"...on AutomaticDiscountApplication": "AutomaticDiscountApplication",
		"...on DiscountCodeApplication": "DiscountCodeApplication",
		"...on ManualDiscountApplication": "ManualDiscountApplication",
		"...on ScriptDiscountApplication": "ScriptDiscountApplication",
		allocationMethod:"DiscountApplicationAllocationMethod",
		targetSelection:"DiscountApplicationTargetSelection",
		targetType:"DiscountApplicationTargetType",
		value:"PricingValue"
	},
	DiscountApplicationConnection:{
		edges:"DiscountApplicationEdge",
		nodes:"DiscountApplication",
		pageInfo:"PageInfo"
	},
	DiscountApplicationEdge:{
		cursor:"String",
		node:"DiscountApplication"
	},
	DiscountCodeApplication:{
		allocationMethod:"DiscountApplicationAllocationMethod",
		applicable:"Boolean",
		code:"String",
		targetSelection:"DiscountApplicationTargetSelection",
		targetType:"DiscountApplicationTargetType",
		value:"PricingValue"
	},
	DisplayableError:{
		"...on CartUserError": "CartUserError",
		"...on CheckoutUserError": "CheckoutUserError",
		"...on CustomerUserError": "CustomerUserError",
		"...on UserError": "UserError",
		field:"String",
		message:"String"
	},
	Domain:{
		host:"String",
		sslEnabled:"Boolean",
		url:"URL"
	},
	ExternalVideo:{
		alt:"String",
		embedUrl:"URL",
		embeddedUrl:"URL",
		host:"MediaHost",
		id:"ID",
		mediaContentType:"MediaContentType",
		originUrl:"URL",
		previewImage:"Image"
	},
	Filter:{
		id:"String",
		label:"String",
		type:"FilterType",
		values:"FilterValue"
	},
	FilterValue:{
		count:"Int",
		id:"String",
		input:"JSON",
		label:"String"
	},
	Fulfillment:{
		fulfillmentLineItems:"FulfillmentLineItemConnection",
		trackingCompany:"String",
		trackingInfo:"FulfillmentTrackingInfo"
	},
	FulfillmentLineItem:{
		lineItem:"OrderLineItem",
		quantity:"Int"
	},
	FulfillmentLineItemConnection:{
		edges:"FulfillmentLineItemEdge",
		nodes:"FulfillmentLineItem",
		pageInfo:"PageInfo"
	},
	FulfillmentLineItemEdge:{
		cursor:"String",
		node:"FulfillmentLineItem"
	},
	FulfillmentTrackingInfo:{
		number:"String",
		url:"URL"
	},
	GenericFile:{
		alt:"String",
		id:"ID",
		mimeType:"String",
		originalFileSize:"Int",
		previewImage:"Image",
		url:"URL"
	},
	HTML: `scalar.HTML` as const,
	HasMetafields:{
		"...on Article": "Article",
		"...on Blog": "Blog",
		"...on Collection": "Collection",
		"...on Customer": "Customer",
		"...on Order": "Order",
		"...on Page": "Page",
		"...on Product": "Product",
		"...on ProductVariant": "ProductVariant",
		"...on Shop": "Shop",
		metafield:"Metafield",
		metafields:"Metafield"
	},
	Image:{
		altText:"String",
		height:"Int",
		id:"ID",
		originalSrc:"URL",
		src:"URL",
		transformedSrc:"URL",
		url:"URL",
		width:"Int"
	},
	ImageConnection:{
		edges:"ImageEdge",
		nodes:"Image",
		pageInfo:"PageInfo"
	},
	ImageEdge:{
		cursor:"String",
		node:"Image"
	},
	JSON: `scalar.JSON` as const,
	Language:{
		endonymName:"String",
		isoCode:"LanguageCode",
		name:"String"
	},
	Localization:{
		availableCountries:"Country",
		availableLanguages:"Language",
		country:"Country",
		language:"Language"
	},
	Location:{
		address:"LocationAddress",
		id:"ID",
		name:"String"
	},
	LocationAddress:{
		address1:"String",
		address2:"String",
		city:"String",
		country:"String",
		countryCode:"String",
		formatted:"String",
		latitude:"Float",
		longitude:"Float",
		phone:"String",
		province:"String",
		provinceCode:"String",
		zip:"String"
	},
	LocationConnection:{
		edges:"LocationEdge",
		nodes:"Location",
		pageInfo:"PageInfo"
	},
	LocationEdge:{
		cursor:"String",
		node:"Location"
	},
	MailingAddress:{
		address1:"String",
		address2:"String",
		city:"String",
		company:"String",
		country:"String",
		countryCode:"String",
		countryCodeV2:"CountryCode",
		firstName:"String",
		formatted:"String",
		formattedArea:"String",
		id:"ID",
		lastName:"String",
		latitude:"Float",
		longitude:"Float",
		name:"String",
		phone:"String",
		province:"String",
		provinceCode:"String",
		zip:"String"
	},
	MailingAddressConnection:{
		edges:"MailingAddressEdge",
		nodes:"MailingAddress",
		pageInfo:"PageInfo"
	},
	MailingAddressEdge:{
		cursor:"String",
		node:"MailingAddress"
	},
	ManualDiscountApplication:{
		allocationMethod:"DiscountApplicationAllocationMethod",
		description:"String",
		targetSelection:"DiscountApplicationTargetSelection",
		targetType:"DiscountApplicationTargetType",
		title:"String",
		value:"PricingValue"
	},
	Media:{
		"...on ExternalVideo": "ExternalVideo",
		"...on MediaImage": "MediaImage",
		"...on Model3d": "Model3d",
		"...on Video": "Video",
		alt:"String",
		mediaContentType:"MediaContentType",
		previewImage:"Image"
	},
	MediaConnection:{
		edges:"MediaEdge",
		nodes:"Media",
		pageInfo:"PageInfo"
	},
	MediaEdge:{
		cursor:"String",
		node:"Media"
	},
	MediaImage:{
		alt:"String",
		id:"ID",
		image:"Image",
		mediaContentType:"MediaContentType",
		previewImage:"Image"
	},
	Menu:{
		handle:"String",
		id:"ID",
		items:"MenuItem",
		itemsCount:"Int",
		title:"String"
	},
	MenuItem:{
		id:"ID",
		items:"MenuItem",
		resourceId:"ID",
		tags:"String",
		title:"String",
		type:"MenuItemType",
		url:"URL"
	},
	Merchandise:{
		"...on ProductVariant":"ProductVariant"
	},
	Metafield:{
		createdAt:"DateTime",
		description:"String",
		id:"ID",
		key:"String",
		namespace:"String",
		parentResource:"MetafieldParentResource",
		reference:"MetafieldReference",
		references:"MetafieldReferenceConnection",
		type:"String",
		updatedAt:"DateTime",
		value:"String"
	},
	MetafieldParentResource:{
		"...on Article":"Article",
		"...on Blog":"Blog",
		"...on Collection":"Collection",
		"...on Customer":"Customer",
		"...on Order":"Order",
		"...on Page":"Page",
		"...on Product":"Product",
		"...on ProductVariant":"ProductVariant",
		"...on Shop":"Shop"
	},
	MetafieldReference:{
		"...on Collection":"Collection",
		"...on GenericFile":"GenericFile",
		"...on MediaImage":"MediaImage",
		"...on Metaobject":"Metaobject",
		"...on Page":"Page",
		"...on Product":"Product",
		"...on ProductVariant":"ProductVariant",
		"...on Video":"Video"
	},
	MetafieldReferenceConnection:{
		edges:"MetafieldReferenceEdge",
		nodes:"MetafieldReference",
		pageInfo:"PageInfo"
	},
	MetafieldReferenceEdge:{
		cursor:"String",
		node:"MetafieldReference"
	},
	Metaobject:{
		field:"MetaobjectField",
		fields:"MetaobjectField",
		handle:"String",
		id:"ID",
		type:"String",
		updatedAt:"DateTime"
	},
	MetaobjectConnection:{
		edges:"MetaobjectEdge",
		nodes:"Metaobject",
		pageInfo:"PageInfo"
	},
	MetaobjectEdge:{
		cursor:"String",
		node:"Metaobject"
	},
	MetaobjectField:{
		key:"String",
		reference:"MetafieldReference",
		references:"MetafieldReferenceConnection",
		type:"String",
		value:"String"
	},
	Model3d:{
		alt:"String",
		id:"ID",
		mediaContentType:"MediaContentType",
		previewImage:"Image",
		sources:"Model3dSource"
	},
	Model3dSource:{
		filesize:"Int",
		format:"String",
		mimeType:"String",
		url:"String"
	},
	MoneyV2:{
		amount:"Decimal",
		currencyCode:"CurrencyCode"
	},
	Mutation:{
		cartAttributesUpdate:"CartAttributesUpdatePayload",
		cartBuyerIdentityUpdate:"CartBuyerIdentityUpdatePayload",
		cartCreate:"CartCreatePayload",
		cartDiscountCodesUpdate:"CartDiscountCodesUpdatePayload",
		cartLinesAdd:"CartLinesAddPayload",
		cartLinesRemove:"CartLinesRemovePayload",
		cartLinesUpdate:"CartLinesUpdatePayload",
		cartNoteUpdate:"CartNoteUpdatePayload",
		cartSelectedDeliveryOptionsUpdate:"CartSelectedDeliveryOptionsUpdatePayload",
		checkoutAttributesUpdateV2:"CheckoutAttributesUpdateV2Payload",
		checkoutCompleteFree:"CheckoutCompleteFreePayload",
		checkoutCompleteWithCreditCardV2:"CheckoutCompleteWithCreditCardV2Payload",
		checkoutCompleteWithTokenizedPaymentV3:"CheckoutCompleteWithTokenizedPaymentV3Payload",
		checkoutCreate:"CheckoutCreatePayload",
		checkoutCustomerAssociateV2:"CheckoutCustomerAssociateV2Payload",
		checkoutCustomerDisassociateV2:"CheckoutCustomerDisassociateV2Payload",
		checkoutDiscountCodeApplyV2:"CheckoutDiscountCodeApplyV2Payload",
		checkoutDiscountCodeRemove:"CheckoutDiscountCodeRemovePayload",
		checkoutEmailUpdateV2:"CheckoutEmailUpdateV2Payload",
		checkoutGiftCardRemoveV2:"CheckoutGiftCardRemoveV2Payload",
		checkoutGiftCardsAppend:"CheckoutGiftCardsAppendPayload",
		checkoutLineItemsAdd:"CheckoutLineItemsAddPayload",
		checkoutLineItemsRemove:"CheckoutLineItemsRemovePayload",
		checkoutLineItemsReplace:"CheckoutLineItemsReplacePayload",
		checkoutLineItemsUpdate:"CheckoutLineItemsUpdatePayload",
		checkoutShippingAddressUpdateV2:"CheckoutShippingAddressUpdateV2Payload",
		checkoutShippingLineUpdate:"CheckoutShippingLineUpdatePayload",
		customerAccessTokenCreate:"CustomerAccessTokenCreatePayload",
		customerAccessTokenCreateWithMultipass:"CustomerAccessTokenCreateWithMultipassPayload",
		customerAccessTokenDelete:"CustomerAccessTokenDeletePayload",
		customerAccessTokenRenew:"CustomerAccessTokenRenewPayload",
		customerActivate:"CustomerActivatePayload",
		customerActivateByUrl:"CustomerActivateByUrlPayload",
		customerAddressCreate:"CustomerAddressCreatePayload",
		customerAddressDelete:"CustomerAddressDeletePayload",
		customerAddressUpdate:"CustomerAddressUpdatePayload",
		customerCreate:"CustomerCreatePayload",
		customerDefaultAddressUpdate:"CustomerDefaultAddressUpdatePayload",
		customerRecover:"CustomerRecoverPayload",
		customerReset:"CustomerResetPayload",
		customerResetByUrl:"CustomerResetByUrlPayload",
		customerUpdate:"CustomerUpdatePayload"
	},
	Node:{
		"...on AppliedGiftCard": "AppliedGiftCard",
		"...on Article": "Article",
		"...on Blog": "Blog",
		"...on Cart": "Cart",
		"...on CartLine": "CartLine",
		"...on Checkout": "Checkout",
		"...on CheckoutLineItem": "CheckoutLineItem",
		"...on Collection": "Collection",
		"...on Comment": "Comment",
		"...on ExternalVideo": "ExternalVideo",
		"...on GenericFile": "GenericFile",
		"...on Location": "Location",
		"...on MailingAddress": "MailingAddress",
		"...on MediaImage": "MediaImage",
		"...on Menu": "Menu",
		"...on MenuItem": "MenuItem",
		"...on Metafield": "Metafield",
		"...on Metaobject": "Metaobject",
		"...on Model3d": "Model3d",
		"...on Order": "Order",
		"...on Page": "Page",
		"...on Payment": "Payment",
		"...on Product": "Product",
		"...on ProductOption": "ProductOption",
		"...on ProductVariant": "ProductVariant",
		"...on Shop": "Shop",
		"...on ShopPolicy": "ShopPolicy",
		"...on UrlRedirect": "UrlRedirect",
		"...on Video": "Video",
		id:"ID"
	},
	OnlineStorePublishable:{
		"...on Article": "Article",
		"...on Blog": "Blog",
		"...on Collection": "Collection",
		"...on Page": "Page",
		"...on Product": "Product",
		onlineStoreUrl:"URL"
	},
	Order:{
		cancelReason:"OrderCancelReason",
		canceledAt:"DateTime",
		currencyCode:"CurrencyCode",
		currentSubtotalPrice:"MoneyV2",
		currentTotalDuties:"MoneyV2",
		currentTotalPrice:"MoneyV2",
		currentTotalTax:"MoneyV2",
		customAttributes:"Attribute",
		customerLocale:"String",
		customerUrl:"URL",
		discountApplications:"DiscountApplicationConnection",
		edited:"Boolean",
		email:"String",
		financialStatus:"OrderFinancialStatus",
		fulfillmentStatus:"OrderFulfillmentStatus",
		id:"ID",
		lineItems:"OrderLineItemConnection",
		metafield:"Metafield",
		metafields:"Metafield",
		name:"String",
		orderNumber:"Int",
		originalTotalDuties:"MoneyV2",
		originalTotalPrice:"MoneyV2",
		phone:"String",
		processedAt:"DateTime",
		shippingAddress:"MailingAddress",
		shippingDiscountAllocations:"DiscountAllocation",
		statusUrl:"URL",
		subtotalPrice:"MoneyV2",
		subtotalPriceV2:"MoneyV2",
		successfulFulfillments:"Fulfillment",
		totalPrice:"MoneyV2",
		totalPriceV2:"MoneyV2",
		totalRefunded:"MoneyV2",
		totalRefundedV2:"MoneyV2",
		totalShippingPrice:"MoneyV2",
		totalShippingPriceV2:"MoneyV2",
		totalTax:"MoneyV2",
		totalTaxV2:"MoneyV2"
	},
	OrderConnection:{
		edges:"OrderEdge",
		nodes:"Order",
		pageInfo:"PageInfo",
		totalCount:"UnsignedInt64"
	},
	OrderEdge:{
		cursor:"String",
		node:"Order"
	},
	OrderLineItem:{
		currentQuantity:"Int",
		customAttributes:"Attribute",
		discountAllocations:"DiscountAllocation",
		discountedTotalPrice:"MoneyV2",
		originalTotalPrice:"MoneyV2",
		quantity:"Int",
		title:"String",
		variant:"ProductVariant"
	},
	OrderLineItemConnection:{
		edges:"OrderLineItemEdge",
		nodes:"OrderLineItem",
		pageInfo:"PageInfo"
	},
	OrderLineItemEdge:{
		cursor:"String",
		node:"OrderLineItem"
	},
	Page:{
		body:"HTML",
		bodySummary:"String",
		createdAt:"DateTime",
		handle:"String",
		id:"ID",
		metafield:"Metafield",
		metafields:"Metafield",
		onlineStoreUrl:"URL",
		seo:"SEO",
		title:"String",
		updatedAt:"DateTime"
	},
	PageConnection:{
		edges:"PageEdge",
		nodes:"Page",
		pageInfo:"PageInfo"
	},
	PageEdge:{
		cursor:"String",
		node:"Page"
	},
	PageInfo:{
		endCursor:"String",
		hasNextPage:"Boolean",
		hasPreviousPage:"Boolean",
		startCursor:"String"
	},
	Payment:{
		amount:"MoneyV2",
		amountV2:"MoneyV2",
		billingAddress:"MailingAddress",
		checkout:"Checkout",
		creditCard:"CreditCard",
		errorMessage:"String",
		id:"ID",
		idempotencyKey:"String",
		nextActionUrl:"URL",
		ready:"Boolean",
		test:"Boolean",
		transaction:"Transaction"
	},
	PaymentSettings:{
		acceptedCardBrands:"CardBrand",
		cardVaultUrl:"URL",
		countryCode:"CountryCode",
		currencyCode:"CurrencyCode",
		enabledPresentmentCurrencies:"CurrencyCode",
		shopifyPaymentsAccountId:"String",
		supportedDigitalWallets:"DigitalWallet"
	},
	PricingPercentageValue:{
		percentage:"Float"
	},
	PricingValue:{
		"...on MoneyV2":"MoneyV2",
		"...on PricingPercentageValue":"PricingPercentageValue"
	},
	Product:{
		availableForSale:"Boolean",
		collections:"CollectionConnection",
		compareAtPriceRange:"ProductPriceRange",
		createdAt:"DateTime",
		description:"String",
		descriptionHtml:"HTML",
		featuredImage:"Image",
		handle:"String",
		id:"ID",
		images:"ImageConnection",
		isGiftCard:"Boolean",
		media:"MediaConnection",
		metafield:"Metafield",
		metafields:"Metafield",
		onlineStoreUrl:"URL",
		options:"ProductOption",
		priceRange:"ProductPriceRange",
		productType:"String",
		publishedAt:"DateTime",
		requiresSellingPlan:"Boolean",
		sellingPlanGroups:"SellingPlanGroupConnection",
		seo:"SEO",
		tags:"String",
		title:"String",
		totalInventory:"Int",
		updatedAt:"DateTime",
		variantBySelectedOptions:"ProductVariant",
		variants:"ProductVariantConnection",
		vendor:"String"
	},
	ProductConnection:{
		edges:"ProductEdge",
		filters:"Filter",
		nodes:"Product",
		pageInfo:"PageInfo"
	},
	ProductEdge:{
		cursor:"String",
		node:"Product"
	},
	ProductOption:{
		id:"ID",
		name:"String",
		values:"String"
	},
	ProductPriceRange:{
		maxVariantPrice:"MoneyV2",
		minVariantPrice:"MoneyV2"
	},
	ProductVariant:{
		availableForSale:"Boolean",
		barcode:"String",
		compareAtPrice:"MoneyV2",
		compareAtPriceV2:"MoneyV2",
		currentlyNotInStock:"Boolean",
		id:"ID",
		image:"Image",
		metafield:"Metafield",
		metafields:"Metafield",
		price:"MoneyV2",
		priceV2:"MoneyV2",
		product:"Product",
		quantityAvailable:"Int",
		requiresShipping:"Boolean",
		selectedOptions:"SelectedOption",
		sellingPlanAllocations:"SellingPlanAllocationConnection",
		sku:"String",
		storeAvailability:"StoreAvailabilityConnection",
		title:"String",
		unitPrice:"MoneyV2",
		unitPriceMeasurement:"UnitPriceMeasurement",
		weight:"Float",
		weightUnit:"WeightUnit"
	},
	ProductVariantConnection:{
		edges:"ProductVariantEdge",
		nodes:"ProductVariant",
		pageInfo:"PageInfo"
	},
	ProductVariantEdge:{
		cursor:"String",
		node:"ProductVariant"
	},
	QueryRoot:{
		articles:"ArticleConnection",
		blog:"Blog",
		blogByHandle:"Blog",
		blogs:"BlogConnection",
		cart:"Cart",
		collection:"Collection",
		collectionByHandle:"Collection",
		collections:"CollectionConnection",
		customer:"Customer",
		localization:"Localization",
		locations:"LocationConnection",
		menu:"Menu",
		metaobject:"Metaobject",
		metaobjects:"MetaobjectConnection",
		node:"Node",
		nodes:"Node",
		page:"Page",
		pageByHandle:"Page",
		pages:"PageConnection",
		product:"Product",
		productByHandle:"Product",
		productRecommendations:"Product",
		productTags:"StringConnection",
		productTypes:"StringConnection",
		products:"ProductConnection",
		publicApiVersions:"ApiVersion",
		shop:"Shop",
		urlRedirects:"UrlRedirectConnection"
	},
	SEO:{
		description:"String",
		title:"String"
	},
	ScriptDiscountApplication:{
		allocationMethod:"DiscountApplicationAllocationMethod",
		targetSelection:"DiscountApplicationTargetSelection",
		targetType:"DiscountApplicationTargetType",
		title:"String",
		value:"PricingValue"
	},
	SelectedOption:{
		name:"String",
		value:"String"
	},
	SellingPlan:{
		checkoutCharge:"SellingPlanCheckoutCharge",
		description:"String",
		id:"ID",
		name:"String",
		options:"SellingPlanOption",
		priceAdjustments:"SellingPlanPriceAdjustment",
		recurringDeliveries:"Boolean"
	},
	SellingPlanAllocation:{
		checkoutChargeAmount:"MoneyV2",
		priceAdjustments:"SellingPlanAllocationPriceAdjustment",
		remainingBalanceChargeAmount:"MoneyV2",
		sellingPlan:"SellingPlan"
	},
	SellingPlanAllocationConnection:{
		edges:"SellingPlanAllocationEdge",
		nodes:"SellingPlanAllocation",
		pageInfo:"PageInfo"
	},
	SellingPlanAllocationEdge:{
		cursor:"String",
		node:"SellingPlanAllocation"
	},
	SellingPlanAllocationPriceAdjustment:{
		compareAtPrice:"MoneyV2",
		perDeliveryPrice:"MoneyV2",
		price:"MoneyV2",
		unitPrice:"MoneyV2"
	},
	SellingPlanCheckoutCharge:{
		type:"SellingPlanCheckoutChargeType",
		value:"SellingPlanCheckoutChargeValue"
	},
	SellingPlanCheckoutChargePercentageValue:{
		percentage:"Float"
	},
	SellingPlanCheckoutChargeValue:{
		"...on MoneyV2":"MoneyV2",
		"...on SellingPlanCheckoutChargePercentageValue":"SellingPlanCheckoutChargePercentageValue"
	},
	SellingPlanConnection:{
		edges:"SellingPlanEdge",
		nodes:"SellingPlan",
		pageInfo:"PageInfo"
	},
	SellingPlanEdge:{
		cursor:"String",
		node:"SellingPlan"
	},
	SellingPlanFixedAmountPriceAdjustment:{
		adjustmentAmount:"MoneyV2"
	},
	SellingPlanFixedPriceAdjustment:{
		price:"MoneyV2"
	},
	SellingPlanGroup:{
		appName:"String",
		name:"String",
		options:"SellingPlanGroupOption",
		sellingPlans:"SellingPlanConnection"
	},
	SellingPlanGroupConnection:{
		edges:"SellingPlanGroupEdge",
		nodes:"SellingPlanGroup",
		pageInfo:"PageInfo"
	},
	SellingPlanGroupEdge:{
		cursor:"String",
		node:"SellingPlanGroup"
	},
	SellingPlanGroupOption:{
		name:"String",
		values:"String"
	},
	SellingPlanOption:{
		name:"String",
		value:"String"
	},
	SellingPlanPercentagePriceAdjustment:{
		adjustmentPercentage:"Int"
	},
	SellingPlanPriceAdjustment:{
		adjustmentValue:"SellingPlanPriceAdjustmentValue",
		orderCount:"Int"
	},
	SellingPlanPriceAdjustmentValue:{
		"...on SellingPlanFixedAmountPriceAdjustment":"SellingPlanFixedAmountPriceAdjustment",
		"...on SellingPlanFixedPriceAdjustment":"SellingPlanFixedPriceAdjustment",
		"...on SellingPlanPercentagePriceAdjustment":"SellingPlanPercentagePriceAdjustment"
	},
	ShippingRate:{
		handle:"String",
		price:"MoneyV2",
		priceV2:"MoneyV2",
		title:"String"
	},
	Shop:{
		brand:"Brand",
		description:"String",
		id:"ID",
		metafield:"Metafield",
		metafields:"Metafield",
		moneyFormat:"String",
		name:"String",
		paymentSettings:"PaymentSettings",
		primaryDomain:"Domain",
		privacyPolicy:"ShopPolicy",
		refundPolicy:"ShopPolicy",
		shippingPolicy:"ShopPolicy",
		shipsToCountries:"CountryCode",
		subscriptionPolicy:"ShopPolicyWithDefault",
		termsOfService:"ShopPolicy"
	},
	ShopPolicy:{
		body:"String",
		handle:"String",
		id:"ID",
		title:"String",
		url:"URL"
	},
	ShopPolicyWithDefault:{
		body:"String",
		handle:"String",
		id:"ID",
		title:"String",
		url:"URL"
	},
	StoreAvailability:{
		available:"Boolean",
		location:"Location",
		pickUpTime:"String"
	},
	StoreAvailabilityConnection:{
		edges:"StoreAvailabilityEdge",
		nodes:"StoreAvailability",
		pageInfo:"PageInfo"
	},
	StoreAvailabilityEdge:{
		cursor:"String",
		node:"StoreAvailability"
	},
	StringConnection:{
		edges:"StringEdge",
		pageInfo:"PageInfo"
	},
	StringEdge:{
		cursor:"String",
		node:"String"
	},
	Transaction:{
		amount:"MoneyV2",
		amountV2:"MoneyV2",
		kind:"TransactionKind",
		status:"TransactionStatus",
		statusV2:"TransactionStatus",
		test:"Boolean"
	},
	URL: `scalar.URL` as const,
	UnitPriceMeasurement:{
		measuredType:"UnitPriceMeasurementMeasuredType",
		quantityUnit:"UnitPriceMeasurementMeasuredUnit",
		quantityValue:"Float",
		referenceUnit:"UnitPriceMeasurementMeasuredUnit",
		referenceValue:"Int"
	},
	UnsignedInt64: `scalar.UnsignedInt64` as const,
	UrlRedirect:{
		id:"ID",
		path:"String",
		target:"String"
	},
	UrlRedirectConnection:{
		edges:"UrlRedirectEdge",
		nodes:"UrlRedirect",
		pageInfo:"PageInfo"
	},
	UrlRedirectEdge:{
		cursor:"String",
		node:"UrlRedirect"
	},
	UserError:{
		field:"String",
		message:"String"
	},
	Video:{
		alt:"String",
		id:"ID",
		mediaContentType:"MediaContentType",
		previewImage:"Image",
		sources:"VideoSource"
	},
	VideoSource:{
		format:"String",
		height:"Int",
		mimeType:"String",
		url:"String",
		width:"Int"
	}
}

export const Ops = {
mutation: "Mutation" as const,
	query: "QueryRoot" as const
}