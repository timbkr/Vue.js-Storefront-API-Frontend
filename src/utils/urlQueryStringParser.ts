import type { RouteLocationNormalizedLoaded } from "vue-router";

//util to encode page,filter,sort (& search) values into urlQueryString and reverse (decode values from urlQueryString)

/** -------------------------------------------------------------
 *   read Route.query and RETURN VALUES FROM URLQueryString
 * ------------------------------------------------------------- */

// takes route instance returns values for filter and sort (from URLQueryString)
export function getValuesFromUrlQueryString(
    route: RouteLocationNormalizedLoaded,
) {
    //decode FilterValues
    let filterQuery = "";
    if (route.query.hasOwnProperty("query")) {
        filterQuery = String(route.query.query);
    }
    //decode SortByValues
    let sortByQuery = "";
    if (route.query.hasOwnProperty("sort")) {
        sortByQuery = String(route.query.sort);
    }
    const filterValues = getFilterValuesFromGQLQueryPart(filterQuery);
    const sortByValues = getSortByValuesFromGQLQueryPart(sortByQuery);

    return { filterValues, sortByValues };
}

function getFilterValuesFromGQLQueryPart(filterGQLQueryPart: string) {
    let filterValues = {
        availability: "all",
        priceFrom: undefined as unknown as number,
        priceTo: undefined as unknown as number,
    };

    //extraxt everything in between "" from filterquery
    let extractedQuery = filterGQLQueryPart.substring(
        filterGQLQueryPart.indexOf('"') + 1,
        filterGQLQueryPart.lastIndexOf('"')
    );
    /* split extractedQuery into its filters + values (availability, priceFrom, priceTo)  (just break at space) */
    //AVAILABILITY
    if (extractedQuery.includes("available_for_sale:")) {
        // get index of last char from available_for_sale;
        const availabilityIndex =
            extractedQuery.indexOf("available_for_sale:") +
            "available_for_sale:".length;
        //get everything from start to first space after 'available_for_sale'
        if (extractedQuery.includes(" ", availabilityIndex)) {
            filterValues.availability = extractedQuery.substring(
                0,
                extractedQuery.indexOf(" ", availabilityIndex)
            );
        } else filterValues.availability = extractedQuery;
    } else filterValues.availability = "all";

    //PRICES (remove availability part from query)
    if (extractedQuery.includes("available_for_sale:")) {
        //remove availability part from extractedQuery if given
        extractedQuery = extractedQuery
            .split(filterValues.availability + " ")
            .pop()!; //'variants.price:>=1 variants.price:<=2'
    }
    //break at spaces into array
    let priceQueryAr = extractedQuery.split(" ");

    //extract priceTo + priceFrom Values from Query
    priceQueryAr.forEach((elem) => {
        if (elem.includes("variants.price:>=")) {
            filterValues.priceFrom = parseFloat(elem.split(">=").pop()!);
        } else if (elem.includes("variants.price:<=")) {
            filterValues.priceTo = parseFloat(elem.split("<=").pop()!);
        }
    });
    return filterValues;
}
function getSortByValuesFromGQLQueryPart(decodedTMP: string) {
    let sortByValues = { sortKey: "BEST_SELLING", reverse: false };
    if (decodedTMP.includes("reverse: ")) {
        let reverseStartIndex = decodedTMP.indexOf("reverse: ");
        const reverse = decodedTMP
            .substring(reverseStartIndex + "reverse: ".length)
            .trim();
        if (reverse == "true") {
            sortByValues.reverse = true;
        }
        sortByValues.sortKey = decodedTMP
            .substring("sortKey: ".length, reverseStartIndex)
            .trim();
    } else {
        sortByValues.sortKey = decodedTMP.substring("sortKey: ".length).trim();
    }
    if (sortByValues.sortKey === "") sortByValues.sortKey = "BEST_SELLING";
    return sortByValues;
}
/** -------------------------------------------------------------
 *    GENERATE URLQueryString FROM VALUES (and GQLQueryParts)
 * ------------------------------------------------------------- */

export function buildAndEncodeUrlQueryString(
    filterQuery: string,
    sortKeyQuery: string,
    pageCount?: number
) {
    let urlQueryString = "";
    if (filterQuery !== "") {
        urlQueryString += "query=" + encodeURI(filterQuery);
    }
    if (sortKeyQuery !== "") {
        if (urlQueryString !== "") urlQueryString += "&";
        urlQueryString += "sort=" + encodeURI(sortKeyQuery);
    }
    if (pageCount) {
        if (urlQueryString !== "") urlQueryString += "&";
        urlQueryString += "page=" + pageCount;
    }
    if (urlQueryString !== "") {
        urlQueryString = `?${urlQueryString}`;
    }
    return urlQueryString.replace(/%20/g, "+");;
}

export function buildSortGQLQueryFromValues(sortKey: string, reverse: boolean) {
    let gqlQuery = "";
    if (sortKey !== "") {
        gqlQuery += `sortKey: ${sortKey} `;
        gqlQuery += `reverse: ${reverse} `;
    }
    return gqlQuery;
}

export function buildFilterGQLQueryFromValues(
    availability: string,
    priceFrom?: number,
    priceTo?: number
) {
    let gqlQuery = "";
    if (availability !== "all") {
        gqlQuery += availability;
    }
    if (priceFrom) {
        gqlQuery += ` variants.price:>=${priceFrom}`;
    }
    if (priceTo) {
        gqlQuery += ` variants.price:<=${priceTo}`;
    }
    if (gqlQuery !== "") gqlQuery = `query: "${gqlQuery}"`;
    return gqlQuery;
}
