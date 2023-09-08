<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import ProductCard from './ProductCard.vue';
import { getProductRecommendations } from '../utils/graphQLClient';

const props = defineProps<{ id: string }>();

const products = ref({} as any);

async function init() {
    const res = await getProductRecommendations(props.id);
    products.value = res.productRecommendations;

}
init();

watch(() => props.id, (newValue, oldValue) => {
    init()
})

const recommendedProducts = computed(() => {
    const shuffledArray = products.value.sort((a: any, b: any) => 0.5 - Math.random());
    return shuffledArray
})
</script>

<template>
    <h2 class="py-4">More Products:</h2>
    <div v-if="products.length > 0" class="moreProductsGrid gap-4 sm:gap-8  ">
        <ProductCard v-for="product in recommendedProducts.slice(0, 4)" :product="product" class="flex-1">
        </ProductCard>
    </div>
</template>

<style scoped>
.moreProductsGrid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
    /* hide subsequent rows (show only first grid row, which wraps on smaller screens) */
    grid-template-rows: 1fr;
    grid-auto-rows: 0;
    row-gap: 0;
    overflow: hidden;
}

@media (max-width: 640px) {
    .moreProductsGrid {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>