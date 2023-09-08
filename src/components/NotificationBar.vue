<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router';
import type { NotificationBarStatus } from '@/App.vue';

const router = useRouter()
const props = defineProps<{ status: NotificationBarStatus, isOnCartPage?: Boolean }>();
const emit = defineEmits<{ closeNotificationBar: any }>() //-> vue 3.3+

const isMouseOver = ref(false);

let mouseOverTimeout = setTimeout(() => { });
function mouseLeave() {
    mouseOverTimeout = setTimeout(() => {
        isMouseOver.value = false;
    }, 3000)
}

function mouseEnter() {
    clearTimeout(mouseOverTimeout)
    isMouseOver.value = true;
}

</script>

<template>
    <Transition>
        <div v-if="status.visible || isMouseOver" @mouseenter="mouseEnter" @mouseleave="mouseLeave"
            class="z-10 sticky top-0">
            <div v-if="status.type === 'success'" class="notificationBar success">
                <div class="left md:px-[5%] lg:px-[10%] xl:px-[13%] ">
                </div>
                <div class="mid flex-1 py-3">
                    <div class="sm:inline-block sm:pr-4">
                        {{ status.msg }}
                    </div>
                    <a v-if="isOnCartPage !== undefined" href="#" @click="router.push('/cart')"
                        class="text-gray-700 underline sm:pl-4">&gtGo To
                        Shopping Cart&lt</a>
                </div>
                <div class="right flex justify-center items-center md:px-[5%] lg:px-[10%] xl:px-[13%]">
                    <div class="cursor-pointer hidden md:block p-2.5"
                        @click="emit('closeNotificationBar'); isMouseOver = false;">✖</div>
                </div>
            </div>
            <div v-else-if="status.type === 'error'" class="notificationBar error">
                <div class="left md:px-[5%] lg:px-[10%] xl:px-[13%] ">
                </div>
                <div class="mid flex-1 py-3">
                    <div class="sm:inline-block sm:pr-4">
                        {{ status.msg }}
                    </div>
                </div>
                <div class="right flex justify-center items-center md:px-[5%] lg:px-[10%] xl:px-[13%]">
                    <div class="cursor-pointer hidden md:block p-2.5"
                        @click="emit('closeNotificationBar'); isMouseOver = false;">✖</div>
                </div>
            </div>
        </div>
    </Transition>
</template>

<style scoped>
/* ----------------------------- */
/* Vue / CSS Transition */
.v-enter-active,
.v-leave-active {
    opacity: 1;
    transition: opacity 0.25s ease-in-out, transform 0.25s ease-in-out;
    transform: translateY(0);
}

.v-enter-from,
.v-leave-to {
    opacity: 0;
    transform: translateY(-50px);
}

/* ----------------------------- */
.notificationBar {
    position: absolute;
    /* padding: 0.75rem 0; */
    width: 100%;
    text-align: center;
    display: flex;
    justify-content: center;
    gap: 1rem;
}

.success {
    background-color: rgb(21 128 61);
}

.error {
    background-color: rgb(185 28 28);
}

/* ----------------------------- */

</style>