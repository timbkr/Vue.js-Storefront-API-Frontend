<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router'
import { getAllProducts } from '../utils/graphQLClient';
import { getValuesFromUrlQueryString, buildAndEncodeUrlQueryString, buildFilterGQLQueryFromValues, buildSortGQLQueryFromValues } from '../utils/urlQueryStringParser';
import { sortByValue, filterAvailability, filterPriceFrom, filterPriceTo, filterAndSortGQLQuery, setFilterAndSortValuesFromURLQueryString } from '../utils/state/productsState'

import ProductCard from '@/components/ProductCard.vue';
import FilterSidebar from '@/components/FilterSidebar.vue';


const router = useRouter()
const route = useRoute()

const products = ref([] as Array<any>);
const PRODUCTS_PER_PAGE = ref(20);
const PRODUCTS_PER_PAGINATION_FETCH = 250 //250 max
const pageCount = ref(1);
const showFilterSidebar = ref(false);
const showSortBy = ref(false);

let timeInMilliseconds = 0;

async function init() {
    setFilterAndSortValuesFromURLQueryString(route);
    await getProductsWithFilterAndSort(false, true);
    setPageCountFromURLQueryString();
}
init();

function setPageCountFromURLQueryString() {
    //set PageCount to url query (?page=X) or redirect to 404 (after Products are fetched)
    if (route.query.page) {
        if (parseInt(route.query.page as string) > Math.ceil(products.value.length / PRODUCTS_PER_PAGE.value)) {
            router.replace('/404')
        }
        pageCount.value = parseInt(route.query.page as string);
    }
}

/* Fetch all Products with GQL Cursorbased Pagination: max 250 Products per Fetch):
   - while (pageInfo.hasNextPage) fetch next X products, push to products Array */
async function getAllProductsWithCursorPagination(time: number, query?: string) {
    let cursor = "";
    try {
        let res = await getAllProducts(PRODUCTS_PER_PAGINATION_FETCH, cursor, query || '');
        products.value = res.products.nodes;
        cursor = res.products.pageInfo.endCursor;
        //track time stop concatenating (return) when method is called multiple times in a short timespan (eg. fast userInput triggering multiple fetches)
        while (res.products.pageInfo.hasNextPage === true) {
            try {
                if (time === timeInMilliseconds) {
                    res = await getAllProducts(PRODUCTS_PER_PAGINATION_FETCH, cursor, query || '');
                    if (time === timeInMilliseconds) {
                        products.value = products.value.concat(res.products.nodes);
                        cursor = res.products.pageInfo.endCursor;
                    } else return;
                } else return;
            } catch (e: any) {
                console.error(e);
            }
        }
    } catch (e: any) {
        console.error(e);
    }
}

const getProductsByPageCount = computed(() => {
    return products.value.slice((pageCount.value * PRODUCTS_PER_PAGE.value - PRODUCTS_PER_PAGE.value), PRODUCTS_PER_PAGE.value * pageCount.value)
})

const maxPages = computed(() => {
    return Math.ceil(products.value.length / PRODUCTS_PER_PAGE.value);
})
const getPageList = computed(() => { /* 1 .. 3 4 [5] 6 7 .. 13 */
    let ar = [];
    if (pageCount.value > 2) ar = Array.from({ length: 5 }, (v, i) => pageCount.value + i - 2);
    else if (pageCount.value > 1) ar = Array.from({ length: 5 }, (v, i) => pageCount.value + i - 1);
    else ar = Array.from({ length: 5 }, (v, i) => pageCount.value + i); // when pageCount.value <= 0
    ar = ar.filter((page) => page <= maxPages.value) // remove pages without products
    return ar
})

async function clickPageNumber(pageNumber: number) {
    pageCount.value = pageNumber
    // add page to urlqueryString
    router.push({ path: route.fullPath, query: { query: route.query.query, sort: route.query.sort, page: pageCount.value.toString() } })
    window.scrollTo(0, 0);
}

function toggleFilterBtn() {
    showFilterSidebar.value = !showFilterSidebar.value;
}

let sortClickCounter = 0
function toggleSortBy(input: "body" | "button" | "filter") {
    if (input === 'filter') {
        showFilterSidebar.value = !showFilterSidebar.value;
        showSortBy.value = false;
    }
    else if (input === "button") {
        showSortBy.value = !showSortBy.value;
        showFilterSidebar.value = false;
    }
    else if (input === "body" && sortClickCounter === 0) {
        showFilterSidebar.value = false;
        showSortBy.value = false;
        sortClickCounter = 0;
        return;
    }
    sortClickCounter++;
    if (sortClickCounter >= 2) sortClickCounter = 0;
}

async function clickSortBy(sortKey: string, reverse?: boolean) {
    sortByValue.value.sortKey = sortKey;
    if (reverse) sortByValue.value.reverse = reverse;
    else sortByValue.value.reverse = false;
    await getProductsWithFilterAndSort(true, false);
}


async function getProductsWithFilterAndSort(routerPush?: boolean, fetch?: boolean) {
    pageCount.value = 1;
    //build gql query parts for sort & filter 
    const filterGQLQueryPart = buildFilterGQLQueryFromValues(filterAvailability.value, filterPriceFrom.value, filterPriceTo.value);
    const sortByGQLQueryPart = buildSortGQLQueryFromValues(sortByValue.value.sortKey, sortByValue.value.reverse);
    filterAndSortGQLQuery.value = filterGQLQueryPart + ' ' + sortByGQLQueryPart;

    //generate URLQueryString from sort & filter gqlQueryParts (?query=query:%20"available_for_sale:true"&sort=sortKey:%20BEST_SELLING%20reverse:%20false%20)
    if (routerPush) {
        let urlQueryString = buildAndEncodeUrlQueryString(filterGQLQueryPart, sortByGQLQueryPart);
        await router.push('/products' + urlQueryString);
    }
    if (fetch) {
        timeInMilliseconds = Date.now();
        await getAllProductsWithCursorPagination(timeInMilliseconds, filterAndSortGQLQuery.value);
    }
}

watch([filterAvailability, filterPriceFrom, filterPriceTo], async () => {
    await getProductsWithFilterAndSort(true, false);
})

//used to implement backNavigation
watch(() => route.query, async (newValue: any, oldValue: any) => {
    if (route.name === 'products') {
        //if old and new Query is the same except page value
        if (queryIsEqualExceptPage(oldValue, newValue) && oldValue.page !== newValue.page) {
            //if just page is different, no refetch needed, just change pageCount
            if (newValue.page === undefined) {
                pageCount.value = 1;
            } else {
                pageCount.value = parseInt(newValue.page);
            }
            return
        } else {
            //refetch
            const { filterValues, sortByValues } = getValuesFromUrlQueryString(route);
            setFilterAndSortValuesFromURLQueryString(route, filterValues, sortByValues);
            await getProductsWithFilterAndSort(false, true);
        }
    }
})

function queryIsEqualExceptPage(oldValue: any, newValue: any) {
    //remove page attribute, then compare objects (convert into string first)
    let oldRestAsString, newRestAsString;
    if (oldValue.page) {
        const { page, ...rest } = oldValue;
        oldRestAsString = JSON.stringify(rest);
    } else oldRestAsString = JSON.stringify(oldValue);
    if (newValue.page) {
        const { page, ...rest } = newValue;
        newRestAsString = JSON.stringify(rest);
    } else newRestAsString = JSON.stringify(newValue);

    if (oldRestAsString === newRestAsString) {
        return true
    } else return false;
}
</script>

<template>
    <div class="productsView">
        <FilterSidebar :is-active="showFilterSidebar" @close="toggleFilterBtn"></FilterSidebar>
        <div class="myContainer" @click="toggleSortBy('body')">
            <h2 class="text-4xl text-center md:text-5xl pt-4 md:pt-8">PRODUCTS</h2>
            <div class="utilBar text-center py-4 md:py-6 flex justify-around items-center">
                <div>
                    <button class="border-0 py-2 px-4" @click="toggleSortBy('filter')">Filter</button>
                </div>
                <div>
                    <button class="border-0 py-2 px-4" @click="toggleSortBy('button')">Sort by</button>
                    <Transition>
                        <div v-if="showSortBy"
                            class="sortList px-4 py-2 bg-slate-700 absolute z-50 rounded-md border-2 border-[blueviolet]">
                            <ul class="flex flex-col text-start">
                                <li class="border-b  md:hover:text-red-500 cursor-pointer min-w-max p-2"
                                    @click="clickSortBy('BEST_SELLING')"
                                    :class="{ 'text-[var(--color-text-active)]': sortByValue.sortKey === 'BEST_SELLING' }">
                                    Recommended</li>
                                <li class="border-b md:hover:text-red-500 cursor-pointer min-w-max p-2"
                                    @click="clickSortBy('PRICE')"
                                    :class="{ 'text-[var(--color-text-active)]': sortByValue.sortKey === 'PRICE' && sortByValue.reverse === false }">
                                    Price - low to high</li>
                                <li class="border-b md:hover:text-red-500 cursor-pointer  min-w-max p-2"
                                    @click="clickSortBy('PRICE', true)"
                                    :class="{ 'text-[var(--color-text-active)]': sortByValue.sortKey === 'PRICE' && sortByValue.reverse === true }">
                                    Price - high to low</li>
                                <li class="md:hover:text-red-500 cursor-pointer min-w-max p-2"
                                    @click="clickSortBy('PRODUCT_TYPE')"
                                    :class="{ 'text-[var(--color-text-active)]': sortByValue.sortKey === 'PRODUCT_TYPE' }">
                                    Product
                                    Type</li>
                            </ul>
                        </div>
                    </Transition>
                </div>
                <div class="productAmount">
                    {{ products.length }} products
                </div>
            </div>

            <div v-if="products.length > 0">
                <div class="products-wrapper-grid">
                    <ProductCard v-for="(product, index) in getProductsByPageCount" :product="product"></ProductCard>
                </div>
                <div class="paginationBar flex justify-center items-center pt-6">
                    <div v-if="pageCount > 3" @click="clickPageNumber(1)" class="pageItem cursor-pointer">
                        <a :class="{ active: 1 === pageCount }" class="paginationLink p-2 px-4">1
                            ..</a>
                    </div>
                    <div v-for="(page, index) in getPageList" @click="clickPageNumber(page)"
                        class="pageItem cursor-pointer test">
                        <a :class="{ active: page === pageCount }" class="paginationLink p-2 px-4">{{
                            page }}</a>
                    </div>
                    <div v-if="pageCount < maxPages - 2" @click="clickPageNumber(maxPages)" class="pageItem cursor-pointer">
                        <a :class="{ active: maxPages === pageCount }" class=" paginationLink p-2 px-4"> ..
                            {{ maxPages }}</a>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<style scoped>
/* Vue / CSS Transition */
.v-enter-active,
.v-leave-active {
    opacity: 1;
    transition: opacity 0.15s ease-in-out, transform 0.15s ease-in-out;
    transform: translateY(0);
}

.v-enter-from,
.v-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

/* ----------------------------- */

.products-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
}

.pageItem {
    /* display: flex; */
    justify-content: center;
    align-items: center;
}

.paginationLink {
    text-align: center;
}

.products-wrapper-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
    gap: 0.75rem;
}

.paginationLink.active {
    background-color: red;
    border-radius: 8px;
}

.paginationLink:hover {
    color: var(--color-text);
}

.paginationLink.active:hover {
    color: var(--color-text);
}

.paginationLink:active {
    outline: 0px solid var(--color-outline);
}

/* Larger min-width of grid cell width larger screen */
@media (min-width: 426px) {
    .products-wrapper-grid {
        grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
        gap: 1.5rem;
    }
}

@media (min-width: 640px) {
    .paginationLink:hover {
        color: var(--color-text-hover);
        text-decoration: underline;
        text-underline-offset: 8px;
    }
}

@media (min-width: 1024px) {
    .products-wrapper-grid {
        grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
    }
}
</style>