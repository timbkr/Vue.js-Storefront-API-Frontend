<script setup lang="ts">
import { useRouter } from 'vue-router';
import { amountParser, currencyCodeParser, filterNonNumeric } from '../utils/helper';

const router = useRouter()

const props = defineProps<{ lineItem: any }>()
const emit = defineEmits<{ (e: 'changeQuantity', lineItem: any, quantity: number): void, (e: 'removeItem', lineItem: any): void }>()

function clickLineItem() {
    let tmpQueryParamObj = {} as any
    let urlQuery = "?";
    props.lineItem.node.merchandise.selectedOptions.forEach((elem: any, index: number) => {
        tmpQueryParamObj[elem.name] = elem.value;
        urlQuery += elem.name + "=" + elem.value;
        if (index < props.lineItem.node.merchandise.selectedOptions.length - 1) urlQuery += "&"
    })
    router.push('products/' + props.lineItem.node.merchandise.product.handle + urlQuery)
}
</script>

<template>
    <div class="lineItem border-2 rounded-xl bg-slate-800 flex gap-6 p-3 mb-4 md:p-4">
        <div class="variantImage flex w-[100px] justify-center cursor-pointer" @click="clickLineItem">
            <img :src="lineItem.node.merchandise.image ? lineItem.node.merchandise.image.url : '#'"
                :alt="lineItem.node.merchandise.image ? lineItem.node.merchandise.image.altText : 'Image of ProductVariant'"
                class="self-center rounded-md" width="90" height="90">
        </div>
        <div class="lineItemDetails md:flex md:flex-1 ">
            <div class="md:flex-1">
                <h4 class="cursor-pointer hover:text-[var(--color-text-hover)] hover:underline"
                    @click="clickLineItem">{{
                        lineItem.node.merchandise.product.title }}
                </h4>
                <h5 v-if="lineItem.node.merchandise.product.variants.edges.length > 1" class="text-gray-400">{{
                    lineItem.node.merchandise.title }}</h5>
                <h5 class="hidden md:block">{{ lineItem.node.cost.amountPerQuantity.amount +
                    currencyCodeParser(lineItem.node.cost.amountPerQuantity.currencyCode) }}</h5>
            </div>
            <h5 class=" md:order-3 md:text-center md:flex-[0.75] lg:flex-[0.4] md:py-2.5">{{
                amountParser(lineItem.node.cost.totalAmount.amount) +
                currencyCodeParser(lineItem.node.cost.totalAmount.currencyCode) }}</h5>
            <div class="updateQuantity  py-2 md:py-0 flex gap-4 md:flex-col md:text-center ">
                <span class="amountInputfield border-2 flex ">
                    <button @click="emit('changeQuantity', lineItem, lineItem.node.quantity - 1)"
                        class="border-0 bg-transparent p-2 focus-visible:-outline-offset-2 active:-outline-offset-2">➖</button>
                    <input type="number" inputmode="numeric" :value="lineItem.node.quantity"
                        @change="emit('changeQuantity', lineItem, filterNonNumeric(lineItem.node.quantity, $event))"
                        class="bg-slate-800 quantityInput text-center w-12 border-0 bg-[var(--color-bg)] focus-visible:-outline-offset-2 active:-outline-offset-2"
                        name="amount">
                    <button @click="emit('changeQuantity', lineItem, lineItem.node.quantity + 1)"
                        class="border-0 bg-transparent p-2 focus-visible:-outline-offset-2 active:-outline-offset-2">➕</button>
                </span>
                <button class="border-0 underline text-gray-400 bg-transparent"
                    @click="emit('removeItem', lineItem)">Remove</button>
            </div>

        </div>
    </div>
</template>

<style scoped>
.lineItem h3,
h4,
h5,
h6 {
    font-family: var(--font-reg);
}

/* FOR VERY SMALL SCREENS */
@media (max-width: 359px) {
    .updateQuantity {
        flex-wrap: wrap;
    }
}
</style>