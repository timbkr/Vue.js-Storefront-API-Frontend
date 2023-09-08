<script setup lang="ts">
import { useRouter } from 'vue-router';
import { removeCartLines, updateCartLines } from '../utils/graphQLClient';
import { amountParser, currencyCodeParser } from '../utils/helper';
import CartLineItem from '../components/CartLineItem.vue';
import NotificationBar from '@/components/NotificationBar.vue';
import type { NotificationBarStatus } from '@/App.vue';

const router = useRouter()

const props = defineProps<{ cart: any, notificationBarStatus: NotificationBarStatus, }>();
const emit = defineEmits<{ (e: 'updateCart', cart: any): void, (e: 'showNotificationBar', type: 'success' | 'error', message: string): void, (e: 'closeNotificationBar'): void, }>();
// Vue 3.3+ Syntax: const emit = defineEmits<{ updateCart: [cart: any] }>();

async function changeQuantity(lineItem: any, newQuantity: number) {
    const cartLineUpdateInput = {
        id: lineItem.node.id,
        quantity: newQuantity
    }
    try {
        const cartRes = await updateCartLines(props.cart.id, [cartLineUpdateInput]);
        if (cartRes.userErrors.length > 0) {
            console.error(cartRes.userErrors[0].message);
            emit("showNotificationBar", 'error', cartRes.userErrors[0].message)
        }
        emit('updateCart', cartRes.cart)
    }
    catch (e: any) {
        console.error(e);
    }
}

async function removeItem(lineItem: any) {
    try {
        const cartRes = await removeCartLines(props.cart.id, [lineItem.node.id]);
        if (cartRes.userErrors.length > 0) {
            console.error(cartRes.userErrors[0].message);
            emit("showNotificationBar", 'error', cartRes.userErrors[0].message)
        } else {
            emit("showNotificationBar", 'success', 'Item successfully removed from Cart')

        }
        emit('updateCart', cartRes.cart)
    } catch (e: any) {
        console.error(e);
    }
}
</script>

<template>
    <div>
        <NotificationBar :status="notificationBarStatus" @closeNotificationBar="emit('closeNotificationBar')">
        </NotificationBar>
        <div class="myContainer">
            <h2 class="text-4xl md:text-5xl text-center py-4 md:py-8">CART</h2>
            <div>
                <!-- If Cart is initialized AND has lineItems  -->
                <div v-if="cart && JSON.stringify(cart) !== '{}' && cart.lines !== undefined && cart.lines.edges.length > 0"
                    class="wrapper md:flex md:gap-8 ">
                    <div class="lineItems md:w-[67%]">
                        <CartLineItem v-for="lineItem in cart.lines.edges" :lineItem="lineItem"
                            @changeQuantity="changeQuantity" @removeItem="removeItem">
                        </CartLineItem>
                    </div>
                    <div class="checkoutWrapper md:w-[33%]">
                        <div class="checkout  flex flex-col gap-4 bg-slate-600 p-6 my-4  rounded-md md:mt-0">
                            <div class="bold flex text-xl">
                                <div class="w-1/2">TOTAL</div>
                                <div v-if="!cart.lines" class="w-1/2 text-right">0.00€</div>
                                <div v-else class="w-1/2 text-right">{{ amountParser(cart.cost.totalAmount.amount) +
                                    currencyCodeParser(cart.cost.totalAmount.currencyCode) }}</div>
                            </div>
                            <p class="text-center">Shipping & and Taxes are calculated in Checkout</p>
                            <button class="w-full bg-lime-700 "><a class="w-full inline-block py-4"
                                    :href="cart.checkoutUrl">Checkout</a></button>
                        </div>
                        <div class="paymentOptionsBanner text-center">
                            <p>We Accept:</p>
                            <p>AmexIcon, ApplePayIcon, GpayIcon,...</p>
                        </div>
                    </div>
                </div>
                <div v-else class="noItemsInCart text-center">
                    <h3>Your Cart has no items</h3>
                    <button class="bg-green-700 py-2 px-4 my-6" @click="router.push('/products')">Continue Shopping</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>