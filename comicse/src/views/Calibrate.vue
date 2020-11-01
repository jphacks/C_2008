<template>
  <div class="about">
    <FaceMesh :active="true" @getEyes="getEyes"/>
  </div>
</template>

<script>
  import FaceMesh from "../components/FaceMesh";
  export default {
    components: {
      FaceMesh
    },
    methods: {
      getEyes: function (eyes) {
        console.log(eyes)
      }
    }
  }
</script>
