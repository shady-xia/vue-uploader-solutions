<!-- 一个上传事例文件 -->
<template>
    <div>
        <el-button @click="upload">上传</el-button>
    </div>
</template>

<script>
    import Bus from '@/assets/js/bus';

    export default {
        data() {
            return {}
        },
        mounted() {
            // 文化上传成功的回调
            Bus.$on('fileSuccess', data => {
                console.log(data)
            });
        },
        computed: {},
        methods: {
            upload() {
                // 打开文件选择框
                Bus.$emit('openUploader', {
                    id: '1111'  // 传入的参数
                })
            }
        },
        watch: {},
        components: {}
    }
</script>

<style scoped lang="scss">

</style>
