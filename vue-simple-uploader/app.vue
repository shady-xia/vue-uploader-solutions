<template>
    <div id="app">
        <div id="nav">
            <router-link to="/">Home</router-link>
            <router-link to="/about">About</router-link>
        </div>
        <router-view/>

        <!-- 将上传组件全局注册 -->
        <global-uploader></global-uploader>
    </div>
</template>

<script>
    import globalUploader from '@/components/GlobalUploader.vue'

    export default {
        name: 'app',
        data() {
            return {}
        },
        components: {
            globalUploader
        },
        computed: {},
        created() {
        },
        watch: {},
    }
</script>

<style lang="scss">
</style>
