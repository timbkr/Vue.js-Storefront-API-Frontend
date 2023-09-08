<script setup lang="ts">

</script>

<template>
  <div class="about">
    <h2 class="text-4xl text-center py-6 md:text-5xl md:py-12">ABOUT</h2>
    <div class="mainContainer myContainer flex flex-col gap-4">
      <p class="text-center">Fully functional E-Commerce Website with basic features:</p>
        <ul class="">
          <li class="">Cart</li>
          <li>Filter & Sort products</li>
          <li>Pagination for faster loading time with high number of products to be fetched.</li>
        </ul>
      <p class="text-center">SPA-Frontend built with VueJS, uses Shopify StorefrontAPI for all backend related operations.</p>
      <p class="text-center">Mobile First / Fully Responsive - works on mobile, tablet and desktop devices.</p>
    </div>
  </div>
</template>

<style scoped>
ul {
  list-style: circle !important;
  padding: revert !important;
}

li {
  list-style: inherit !important;
}

.mainContainer{
  max-width: 500px;
}
</style>
