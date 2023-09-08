<script setup lang="ts">
import { filterAvailability, filterPriceFrom, filterPriceTo } from '../utils/state/productsState'

const props = defineProps(['isActive']);
const emit = defineEmits(['close',])

</script>

<template>
    <aside class="sticky top-0 z-50">
        <div class="sidebar bg-slate-700 border-t" :class="{ active: isActive }">
            <div class="sidebarContent px-6 md:px-8">
                <section class="heading flex items-center border-b">
                    <h2 class="flex-1 text-3xl">Filter:</h2>
                    <button @click="emit('close')" class="p-2 px-4 my-4">✖</button>
                </section>

                <section class="availability border-b">
                    <h3>Availability</h3>
                    <div class="flex flex-col gap-1">
                        <div class="inStockRadioGroup flex">
                            <input type="radio" name="inStock" id="allStockRadio" value="all" v-model="filterAvailability"
                                checked>
                            <label for="allStockRadio">All</label>
                        </div>
                        <div class="inStockRadioGroup flex">
                            <input type="radio" name="inStock" id="inStockRadio" value="available_for_sale:true"
                                v-model="filterAvailability">
                            <label for="inStockRadio">In Stock</label>
                        </div>
                        <div class="inStockRadioGroup flex">
                            <input type="radio" name="inStock" id="outOfStockRadio" value="NOT available_for_sale:true"
                                v-model="filterAvailability">
                            <label for="outOfStockRadio">Out of Stock</label>
                        </div>
                    </div>
                </section>

                <section class="priceFromTo border-b">
                    <h3>Price from .. to ..</h3>
                    <div class="flex flex-col gap-2">
                        <div class="fromInput flex">
                            <label class="w-12" for="from">From: </label>
                            <input type="number" name="from" id="" class="w-16 text-center" v-model="filterPriceFrom"
                                 placeholder="0">
                        </div>
                        <div class="toInput flex">
                            <label class="w-12 " for="from">To: </label>
                            <input type="number" name="from" id="" class="w-16 text-center" v-model="filterPriceTo"
                                >
                        </div>
                    </div>
                </section>
            </div>
        </div>
    </aside>
</template>


<style>
.sidebar {
    overflow-x: hidden;
    position: absolute;
    top: 0;
    right: 0;
    z-index: 10;
    height: 100vh;
    border-top-left-radius: 16px;
    border-bottom-left-radius: 16px;
    width: 0;
    transition: width 0.3s ease;
}

.active {
    width: 70vw;
}

section {
    padding: 1rem 0;
}

h3 {
    padding: 0.25rem 0;
}

.inStockRadioGroup label {
    cursor: pointer;
    padding-left: 0.5rem;
}

@media(min-width: 768px) {
    .active {
        width: 25rem;
    }
}
</style>