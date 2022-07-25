# Vue uploader solutions

Vue上传的解决方案

目前主要处理 `vue-simple-uploader` 的方案，基于 `vue-simple-uploader` 封装了可以分片、秒传及断点续传的上传插件

预览：[https://shady-xia.github.io/vue-uploader-solutions](https://shady-xia.github.io/vue-uploader-solutions)

## 文章

该仓库有对应的文章进行分析：

[基于vue-simple-uploader封装文件分片上传、秒传及断点续传的全局上传插件](https://www.cnblogs.com/xiahj/p/vue-simple-uploader.html)

[vue-simple-uploader 常见问题整理](https://www.cnblogs.com/xiahj/p/15950975.html)

## 本地调试

前端服务：
```bash
npm start
# or
npm run serve
```

## TODO

* [x] 重构项目
* [x] 优化GlobalUploader组件
* [x] 预览功能
* [ ] node.js服务端

## vue-webuploader（已不推荐）

见文章：
[Vue2.0结合webuploader实现文件分片上传](https://www.cnblogs.com/xiahj/p/8529545.html)
