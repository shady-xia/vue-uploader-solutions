<template>
    <div class="upload">
    </div>
</template>

<script>

    export default {
        name: 'vue-upload',
        props: {
            accept: {
                type: Object,
                default: null,
            },
            // 上传地址
            url: {
                type: String,
                default: '',
            },
            // 上传最大数量 默认为100
            fileNumLimit: {
                type: Number,
                default: 100,
            },
            // 大小限制 默认2M
            fileSingleSizeLimit: {
                type: Number,
                default: 2048000,
            },
            // 上传时传给后端的参数，一般为token，key等
            formData: {
                type: Object,
                default: null
            },
            // 生成formData中文件的key，下面只是个例子，具体哪种形式和后端商议
            keyGenerator: {
                type: Function,
                default(file) {
                    const currentTime = new Date().getTime();
                    const key = `${currentTime}.${file.name}`;
                    return key;
                },
            },
            multiple: {
                type: Boolean,
                default: false,
            },
            // 上传按钮ID
            uploadButton: {
                type: String,
                default: '',
            },
        },
        data() {
            return {
                uploader: null
            };
        },
        mounted() {
            this.initWebUpload();
        },
        methods: {
            initWebUpload() {

                this.uploader = WebUploader.create({
                    auto: true, // 选完文件后，是否自动上传
                    swf: '/static/lib/webuploader/Uploader.swf',  // swf文件路径
                    server: this.url,  // 文件接收服务端
                    pick: {
                        id: this.uploadButton,     // 选择文件的按钮
                        multiple: this.multiple,   // 是否多文件上传 默认false
                        label: '',
                    },
                    accept: this.getAccept(this.accept),  // 允许选择文件格式。
                    threads: 3,
                    fileNumLimit: this.fileNumLimit, // 限制上传个数
                    //fileSingleSizeLimit: this.fileSingleSizeLimit, // 限制单个上传图片的大小
                    formData: this.formData,  // 上传所需参数
                    chunked: true,          //分片上传
                    chunkSize: 2048000,    //分片大小
                    duplicate: true,  // 重复上传
                });

                // 当有文件被添加进队列的时候，添加到页面预览
                this.uploader.on('fileQueued', (file) => {
                    this.$emit('fileChange', file);
                });

                this.uploader.on('uploadStart', (file) => {
                    // 在这里可以准备好formData的数据
                    //this.uploader.options.formData.key = this.keyGenerator(file);
                });

                // 文件上传过程中创建进度条实时显示。
                this.uploader.on('uploadProgress', (file, percentage) => {
                    this.$emit('progress', file, percentage);
                });

                this.uploader.on('uploadSuccess', (file, response) => {
                    this.$emit('success', file, response);
                });

                this.uploader.on('uploadError', (file, reason) => {
                    console.error(reason);
                    this.$emit('uploadError', file, reason);
                });

                this.uploader.on('error', (type) => {
                    let errorMessage = '';
                    if (type === 'F_EXCEED_SIZE') {
                        errorMessage = `文件大小不能超过${this.fileSingleSizeLimit / (1024 * 1000)}M`;
                    } else if (type === 'Q_EXCEED_NUM_LIMIT') {
                        errorMessage = '文件上传已达到最大上限数';
                    } else {
                        errorMessage = `上传出错！请检查后重新上传！错误代码${type}`;
                    }

                    console.error(errorMessage);
                    this.$emit('error', errorMessage);
                });

                this.uploader.on('uploadComplete', (file, response) => {

                    this.$emit('complete', file, response);
                });
            },

            upload(file) {
                this.uploader.upload(file);
            },
            stop(file) {
                this.uploader.stop(file);
            },
            // 取消并中断文件上传
            cancelFile(file) {
                this.uploader.cancelFile(file);
            },
            // 在队列中移除文件
            removeFile(file, bool) {
                this.uploader.removeFile(file, bool);
            },

            getAccept(accept) {
                switch (accept) {
                    case 'text':
                        return {
                            title: 'Texts',
                            exteensions: 'doc,docx,xls,xlsx,ppt,pptx,pdf,txt',
                            mimeTypes: '.doc,docx,.xls,.xlsx,.ppt,.pptx,.pdf,.txt'
                        };
                        break;
                    case 'video':
                        return {
                            title: 'Videos',
                            exteensions: 'mp4',
                            mimeTypes: '.mp4'
                        };
                        break;
                    case 'image':
                        return {
                            title: 'Images',
                            exteensions: 'gif,jpg,jpeg,bmp,png',
                            mimeTypes: '.gif,.jpg,.jpeg,.bmp,.png'
                        };
                        break;
                    default: return accept
                }
            },

        },
    };
</script>

<style lang="scss">
    .webuploader-container {
        position: relative;
    }
    .webuploader-element-invisible {
        position: absolute !important;
        clip: rect(1px 1px 1px 1px); /* IE6, IE7 */
        clip: rect(1px,1px,1px,1px);
    }
    .webuploader-pick {
        position: relative;
        display: inline-block;
        cursor: pointer;
        background: #00b7ee;
        padding: 10px 15px;
        color: #fff;
        text-align: center;
        border-radius: 3px;
        overflow: hidden;
    }
    .webuploader-pick-hover {
        background: #00a2d4;
    }

    .webuploader-pick-disable {
        opacity: 0.6;
        pointer-events:none;
    }

</style>
