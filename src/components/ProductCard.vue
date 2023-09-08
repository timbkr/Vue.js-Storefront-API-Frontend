<script setup lang="ts">
import { useRouter } from 'vue-router';
import { amountParser, currencyCodeParser } from '../utils/helper';
import { ref } from 'vue'

const props = defineProps<{ product: any }>();
const router = useRouter();

const isHovering = ref(false);

async function goToProductDetailsPage(product: any) {
    const handle = product.handle;
    const path = "/products/" + handle;
    await router.push(path);
    window.scrollTo(0,0);
}
</script>

<template>
    <div class="productCard flex flex-col gap-4 text-center py-0 sm:py-0 cursor-pointer rounded-md" tabindex="0"
        @click="goToProductDetailsPage(product)" @keypress.enter="goToProductDetailsPage(product)"
        @mouseover="isHovering = true" @mouseleave="isHovering = false">
        <div class="imgContainer flex-1 flex items-center ">
            <img class="w-full" width="200" height="200" :src="product.featuredImage ? product.featuredImage.url : '#'"
                :alt="product.featuredImage ? product.featuredImage.altText : 'Image of Product'">
        </div>
        <div class="flex-1 flex  justify-center items-center px-1 sm:px-2 lg:px-3">
            <a class="title titleWithoutOverflow text-sm sm:text-base" :class="{ hoverTitle: isHovering }">
                {{ product.title }}
            </a>
        </div>

        <div class="price pb-4">{{ amountParser(product.priceRange.minVariantPrice.amount) +
            currencyCodeParser(product.priceRange.minVariantPrice.currencyCode) }}</div>
    </div>
</template>

<style scoped>
a.title:hover {
    color: var(--color-text)
}

.productCard {
    background-color: #1f2731;
    background-color: #334155;
    justify-self: center;
    max-width: 29rem;
}

.productCard:active {
    outline: 2px solid var(--color-outline);
    border: 1px solid transparent;
}

.hoverTitle:active {
    outline: none;
}

.imgContainer img {
    border-top-left-radius: 0.375rem;
    border-top-right-radius: 0.375rem;
}

/* dont show hoverEffect on Mobile */
@media(min-width: 640px) {
    .productCard:hover {
        background-color: #334155;
        background-color: #3d3728;
    }

    a.hoverTitle {
        color: var(--color-text-hover);
    }
}
</style>