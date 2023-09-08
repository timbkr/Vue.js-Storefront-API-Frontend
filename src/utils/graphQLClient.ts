import { gql, GraphQLClient } from "graphql-request";

// Making use of Vites built in environment variable suppport:
const url = import.meta.env.VITE_STORE_URL || "https://YOUR-STORE-ADRESS.myshopify.com/api/";
const storefrontAccessToken = import.meta.env.VITE_STOREFRONT_ACCESS_TOKEN || "YOUR-STOREFRONT-ACCESS-TOKEN";

const API_VERISON = "2023-07";
const endpoint = url + API_VERISON + "/graphql.json";

export const graphQLClient = new GraphQLClient(endpoint, {
    headers: {
        "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
    },
});

export async function getFirstXProducts(numberOfProducts: number) {
    const query = gql`
        {
            products(sortKey: PRODUCT_TYPE, first: ${numberOfProducts}) {
                edges {
                    node {
                        id
                        title
                        description
                        handle
                        featuredImage{
                            url,
                            altText,
                        },
                        priceRange{
                            minVariantPrice{
                                amount,
                                currencyCode,
                            }
                        },
                        variants(first: 10){
                            edges{
                                node{
                                    title
                                    image{
                                        url,
                                        altText
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    `;
    try {
        return (await graphQLClient.request(query)) as any;
    } catch (error: any) {
        throw new Error(error);
    }
}

export async function getAllProducts(
    first: number,
    after: string,
    customFilterANDSortQuery?: string,
) {
    let params = "";
    if (after === "") params += `first: ${first} after: null `;
    else params += `first: ${first}, after: "${after}" `;
    params += customFilterANDSortQuery;

    const query = gql`
        {
            products(${params}) {
                    nodes {
                        id
                        title
                        description
                        handle
                        featuredImage{
                            url,
                            altText,
                        },
                        priceRange{
                            minVariantPrice{
                                amount,
                                currencyCode,
                            }
                        },
                        variants(first: 10){
                            edges{
                                node{
                                    title
                                    image{
                                        url,
                                        altText
                                    }
                                }
                            }
                        }
                    }
                    pageInfo {
                        hasPreviousPage
                        hasNextPage
                        startCursor
                        endCursor
                    }
            }
        }
    `;
    try {
        return (await graphQLClient.request(query)) as any;
    } catch (error: any) {
        throw new Error(error);
    }
}

// if variant: availableForSale = true && quantity available = 0 ---> infinite amount / inventory not tracked
// if variant: availableForSale = false && quantity available = 0 ---> variant not in stock / sold out
export async function getProductByHandle(handle: string) {
    const query = gql`
        query getProductFromHandle($handle: String!) {
            productByHandle(handle: $handle) {
                id
                title
                description
                vendor
                priceRange {
                    minVariantPrice {
                        amount
                        currencyCode
                    }
                    maxVariantPrice {
                        amount
                        currencyCode
                    }
                }
                images(first: 10) {
                    edges {
                        node {
                            altText
                            url
                        }
                    }
                }
                tags
                options(first: 10) {
                    id
                    name
                    values
                }
                variantBySelectedOptions(selectedOptions: []) {
                    id
                    title
                    quantityAvailable
                    price {
                        amount
                        currencyCode
                    }
                }
                variants(first: 10) {
                    edges {
                        node {
                            title
                            id
                            availableForSale
                            quantityAvailable
                        }
                    }
                }
            }
        }
    `;
    try {
        const variable = { handle: handle };
        return (await graphQLClient.request(query, variable)) as any;
    } catch (error: any) {
        throw new Error(error);
    }
}
export async function getVariantBySelectedOptions(
    handle: String,
    selectedOptionsInput: Array<any>
) {
    /*
        selectedOptions: [
            { name: "Size", value: "S" }
            { name: "Color", value: "Black" }
        ]
    */

    const query = gql`
        query getVariantBySelectedOptions(
            $handle: String!
            $selectedOptions: [SelectedOptionInput!]!
        ) {
            product(handle: $handle) {
                variantBySelectedOptions(selectedOptions: $selectedOptions) {
                    id
                    title
                    quantityAvailable
                    availableForSale
                    price {
                        amount
                        currencyCode
                    }
                    compareAtPrice {
                        amount
                        currencyCode
                    }
                    image {
                        id
                        url
                        altText
                    }
                }
            }
        }
    `;
    try {
        const variable = {
            handle: handle,
            selectedOptions: selectedOptionsInput,
        };
        return (await graphQLClient.request(query, variable)) as any;
    } catch (error: any) {
        throw new Error(error);
    }
}

const cartBody = gql`
    {
        id
        createdAt
        updatedAt
        checkoutUrl
        totalQuantity
        cost {
            totalAmount {
                currencyCode
                amount
            }
        }
        lines(first: 250) {
            edges {
                node {
                    id
                    quantity
                    cost {
                        amountPerQuantity {
                            currencyCode
                            amount
                        }
                        totalAmount {
                            currencyCode
                            amount
                        }
                    }
                    merchandise {
                        ... on ProductVariant {
                            id
                            title
                            image {
                                altText
                                url
                            }
                            selectedOptions {
                                name
                                value
                            }
                            product {
                                title
                                handle
                                variants(first: 10) {
                                    edges {
                                        node {
                                            title
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        attributes {
            key
            value
        }
        cost {
            totalAmount {
                amount
                currencyCode
            }
            subtotalAmount {
                amount
                currencyCode
            }
            totalTaxAmount {
                amount
                currencyCode
            }
            totalDutyAmount {
                amount
                currencyCode
            }
        }
    }
`;
export async function createCart(cartInput: object) {
    const query = gql`
        mutation createCart($cartInput: CartInput) {
            cartCreate(input: $cartInput) {
                cart ${cartBody}
                userErrors {
                    field
                    message
                }
            }
        }
    `;
    try {
        const variable = { cartInput: cartInput };
        const res = (await graphQLClient.request(query, variable)) as any;
        if (res.cartCreate.userErrors.length > 0)
            console.error(res.cartCreate.userErrors[0].message);
        return res.cartCreate;
    } catch (error: any) {
        throw new Error(error);
    }
}

export async function getCartByID(cartID: string) {
    const query = gql`
        query cartQuery($cartId: ID!) {
            cart(id: $cartId) ${cartBody}
        }
    `;
    try {
        const variable = { cartId: cartID };
        return (await graphQLClient.request(query, variable)) as any;
    } catch (error: any) {
        throw new Error(error);
    }
}

export async function addCartLines(cartID: string, cartInput: any) {
    const query = gql`
        mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
            cartLinesAdd(cartId: $cartId, lines: $lines) {
                cart ${cartBody}
                userErrors {
                    field
                    message
                }
            }
        }
    `;
    try {
        const variable = { cartId: cartID, lines: cartInput.lines };
        const res = (await graphQLClient.request(query, variable)) as any;
        if (res.cartLinesAdd.userErrors.length > 0)
            console.error(res.cartLinesAdd.userErrors[0].message);
        return res.cartLinesAdd;
    } catch (error: any) {
        throw new Error(error);
    }
}

export async function removeCartLines(cartID: string, lineIDs: Array<string>) {
    const query = gql`
        mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
            cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
                cart ${cartBody}
                userErrors {
                    field
                    message
                }
            }
        }
    `;
    try {
        const variable = { cartId: cartID, lineIds: lineIDs };
        const res = (await graphQLClient.request(query, variable)) as any;
        if (res.cartLinesRemove.userErrors.length > 0)
            console.error(res.cartLinesRemove.userErrors[0].message);
        return res.cartLinesRemove;
    } catch (error: any) {
        throw new Error(error);
    }
}

export async function updateCartLines(cartID: string, lines: Array<object>) {
    const query = gql`
        mutation cartLinesUpdate(
            $cartId: ID!
            $lines: [CartLineUpdateInput!]!
        ) {
            cartLinesUpdate(cartId: $cartId, lines: $lines) {
                cart ${cartBody}
                userErrors {
                    field
                    message
                }
            }
        }
    `;
    try {
        const variable = { cartId: cartID, lines: lines };
        const res = (await graphQLClient.request(query, variable)) as any;
        if (res.cartLinesUpdate.userErrors.length > 0)
            console.error(res.cartLinesUpdate.userErrors[0].message);
        return res.cartLinesUpdate;
    } catch (error: any) {
        throw new Error(error);
    }
}

export async function getProductByID(id: string) {
    const query = gql`
        query getProduct($id: ID!) {
            product(id: $id) {
                id
                handle
                title
                description
                priceRange {
                    minVariantPrice {
                        amount
                        currencyCode
                    }
                }
                featuredImage {
                    url
                    altText
                }
                variants(first: 10) {
                    edges {
                        node {
                            id
                        }
                    }
                }
            }
        }
    `;
    const variable = { id: id };
    try {
        return (await graphQLClient.request(query, variable)) as any;
    } catch (error: any) {
        throw new Error(error);
    }
}

// "The following query retrieves up to 10 recommendations for a product by its product ID." <- from https://shopify.dev/docs/api/storefront/2023-07/queries/productRecommendations#examples-Retrieve_recommendations_for_a_product
export async function getProductRecommendations(id: string) {
    const param = 'productId: "' + id + '"';
    const query = gql`
        query getProductRecommendations {
            productRecommendations(
                ${param}
            ) {
                id
                title
                description
                handle
                featuredImage {
                    url
                    altText
                }
                priceRange {
                    minVariantPrice {
                        amount
                        currencyCode
                    }
                }
                variants(first: 10) {
                    edges {
                        node {
                            title
                            image {
                                url
                                altText
                            }
                        }
                    }
                }
            }
        }
    `;
    try {
        return (await graphQLClient.request(query)) as any;
    } catch (error: any) {
        throw new Error(error);
    }
}
