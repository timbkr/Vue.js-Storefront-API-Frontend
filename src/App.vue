<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getCartByID, createCart, addCartLines, updateCartLines } from '@/utils/graphQLClient';

export type NotificationBarStatus = {
  visible: Boolean,
  type: "success" | "error" //success | error
  msg: String
}

const router = useRouter()
const route = useRoute()

/**
    ------------- NOTIFICATION BAR STATUS: ------------- 
*/
const notificationBarStatus = ref<NotificationBarStatus>({ visible: false, type: 'success', msg: '' })

let notificationBarTimeOut = setTimeout(() => { });

function showNotificationBar(type: NotificationBarStatus["type"], msg: String) {
  notificationBarStatus.value.visible = true;
  notificationBarStatus.value.type = type;
  notificationBarStatus.value.msg = msg;

  clearTimeout(notificationBarTimeOut);
  notificationBarTimeOut = setTimeout(() => {
    notificationBarStatus.value.visible = false;
  }, 3000);
}

function closeNotificationBar() {
  notificationBarStatus.value.visible = false;
  clearTimeout(notificationBarTimeOut)
}

/**
 ------------- CART MANAGEMENT: ------------- 
 */
const cartLocal = ref({} as any);

async function initializeCart() {
  //get cartID + cart from Localstorage 
  const localStorage_cartID = localStorage.getItem('cartID')
  const localStorage_cart = localStorage.getItem('cart');

  if (localStorage_cart !== null) { //initialize Local Cart with data from Localstorage
    try {
      cartLocal.value = JSON.parse(localStorage_cart);
    } catch (e) {
      console.error(e)
    }
  }
  if (localStorage_cartID !== null) {// request Cart from Shopify 
    try {
      const cartRes = await getCartByID(localStorage_cartID);
      //compare Local and Fetched Cart and only update LocalCart if it differs from fetched Cart
      if (JSON.stringify(cartLocal.value) !== JSON.stringify(cartRes.cart)) {
        cartLocal.value = cartRes.cart;
        localStorage.setItem('cart', JSON.stringify(cartLocal.value));
      }
    } catch (e: any) {
      console.error(e);
    }
  } 
}
initializeCart();

// Child State:
const isAddToCartBtnLoading = ref(false);

// used when no CartLineItem of ProductVariant exists
async function cartLineAdd(cartInput: object) {
  closeNotificationBar();
  isAddToCartBtnLoading.value = true;
  try {
    let res: any;
    if (cartLocal.value === null || !cartLocal.value.hasOwnProperty('id')) { //if no cart exists: create new Cart with lineItem when no carts exists for user
      res = await createCart(cartInput)
      handleCartMutation(res, true);
    }
    else { // else addCartLine to existing cart
      res = await addCartLines(cartLocal.value.id, cartInput);
      handleCartMutation(res);
    }
  } catch (e: any) {
    showNotificationBar('error', e.message)
    isAddToCartBtnLoading.value = false;
  }
}

// used when CartLineItem of ProductVariant exists
async function cartLineUpdate(input: any) {
  closeNotificationBar();
  isAddToCartBtnLoading.value = true;
  try {
    const res = await updateCartLines(input.cartId, input.lines)
    handleCartMutation(res);
  } catch (e: any) {
    showNotificationBar('error', e.message)
    isAddToCartBtnLoading.value = false;
  }
}

/*  - update cartLocal & localStorage Cart (for session restore), 
    - Errorhandling (on UserError: throw Error to show notificationBar with errorMessage ),
    - showNotificationBar on success + set addToCartBtnLoadingState to false (completed) */
function handleCartMutation(res: any, setLocalStorageCartID?: boolean) {
  cartLocal.value = res.cart;
  localStorage.setItem('cart', JSON.stringify(cartLocal.value));
  if (setLocalStorageCartID) {
    localStorage.setItem('cartID', cartLocal.value.id);
  }
  if (res.userErrors.length > 0) { //Errorhandling
    throw new Error(res.userErrors[0].message);
  }
  showNotificationBar('success', 'PRODUCT ADDED TO SHOPPING CART!');
  isAddToCartBtnLoading.value = false;
}

function updateLocalCart(newCart: object) {
  cartLocal.value = newCart;
  localStorage.setItem('cart', JSON.stringify(cartLocal.value));
}


</script>

<template>
  <header class="bg-slate-700 z-50 ">
    <nav class="header-grid ">
      <div class="nav-left flex justify-end items-center gap-8">
        <RouterLink to="/products" class="navLink "
          :class="{ 'router-link-active': route.path.startsWith('/products') || route.path === '/' }">Products
        </RouterLink>
      </div>
      <div class="nav-mid navbarHeight">
        <img alt="Vue logo" class="logo" src="@/assets/vueLogo.svg" width="45" height="45" />
      </div>
      <div class="nav-right flex items-center justify-between gap-8">
        <div class="wrapper">
          <RouterLink class="navLink" to="/about">About</RouterLink>
        </div>
        <div class="wrapper">
          <RouterLink class="navLink cartAnchor" to="/cart">
            <span class="cartLink">Cart</span>
            <span class="cartQuantity">{{ cartLocal.hasOwnProperty('id') ? cartLocal.totalQuantity : 0 }}</span>
          </RouterLink>
        </div>
      </div>
    </nav>
  </header>

  <div class="content-main text-sm sm:text-base">
    <RouterView @cartLineAdd="cartLineAdd" @cartLineUpdate="cartLineUpdate" @updateCart="updateLocalCart"
      :cart="cartLocal" :notificationBarStatus="notificationBarStatus" @closeNotificationBar="closeNotificationBar"
      :isAddToCartBtnLoading="isAddToCartBtnLoading" @showNotificationBar="showNotificationBar" />
  </div>
  <footer class="text-center">Made with ❤️ by Tim Becker | {{ new Date().getFullYear() }}</footer>
</template>

<style scoped>
.cartQuantity {
  display: inline-block;
  text-align: center;
  background-color: black;
  border-radius: 48px;
  padding: 0.1rem 0.5rem;

  position: relative;
  bottom: 10px;
  right: 1px;
  min-width: 32px;
}

.navLink {
  border-radius: 0.5rem;
  padding: 1rem 0.625rem;
}

.navLink:hover {
  background-color: #461e25;
}

.navLink:active {
  outline: none;
}

/* prevent sticky hover on mobile (not needed, just remove bg color on .router-link-active:hover) */
@media (hover: none) {
  .navLink:hover {
    background-color: transparent;
  }
}

.router-link-active {
  color: var(--color-text-active);
}

.header-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 0rem;
  justify-content: stretch;
  padding: 0 5%;
}

.navbarHeight {
  height: 4rem;
}

.nav-mid {
  display: flex;
  align-items: center;
  padding: 0 1.25rem;
}

.nav-left,
.nav-right {
  gap: 0;
}

@media (min-width: 768px) {

  .logo {
    width: 75px;
  }

  .header-grid {
    gap: 2rem;
    padding: 1rem 5%;
  }
}

@media (min-width: 1024px) {}

/* css for responsive Cart Quantity Batch */
@media (max-width: 456px) {
  .header-grid {
    padding: 0 0;
  }

  .nav-mid {
    padding: 0;
  }

  .nav-left {
    justify-content: center;
  }

  .nav-right {
    justify-content: space-around;
  }

  .cartLink {
    padding-right: 22px;
  }

  .cartQuantity {
    position: absolute;
  }

  .cartAnchor {
    padding: 0;
  }
}

@media (max-width: 340px) {
  .header-grid {
    padding: 0 5%;
  }

  .cartLink {
    display: none;
  }

  .cartQuantity {
    position: initial;
  }

  .navLink {
    padding: 0;
  }
}
</style>