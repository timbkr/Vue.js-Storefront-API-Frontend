import { ref } from "vue";
import { getValuesFromUrlQueryString } from "../urlQueryStringParser";
import type { RouteLocationNormalizedLoaded } from "vue-router";

/** ----------------------------------------------------------------------
 *      Global Filter and Sort State for easier state management
 * ---------------------------------------------------------------------- */

export const sortByValue = ref({ sortKey: "BEST_SELLING", reverse: false }); //used to toggle css class for selected sort method
export const filterAvailability = ref("all");
export const filterPriceFrom = ref<number>();
export const filterPriceTo = ref<number>();

export const filterAndSortGQLQuery = ref("");

export function setFilterAndSortValuesFromURLQueryString(
    route: RouteLocationNormalizedLoaded,
    filterValues?: any,
    sortByValues?: any
) {
    let tmpFilter, tmpSortBy;
    if (filterValues !== undefined && sortByValues !== undefined) {
        tmpFilter = filterValues;
        tmpSortBy = sortByValues;
    } else {
        const { filterValues, sortByValues } =
            getValuesFromUrlQueryString(route);
        tmpFilter = filterValues;
        tmpSortBy = sortByValues;
    }
    filterAvailability.value = tmpFilter.availability;
    filterPriceFrom.value = tmpFilter.priceFrom;
    filterPriceTo.value = tmpFilter.priceTo;
    sortByValue.value = tmpSortBy;
}
