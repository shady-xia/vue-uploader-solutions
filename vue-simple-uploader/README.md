# 基于`vue-simple-uploader`封装插件

`GlobalUploader.vue` 为基于 `vue-simple-uploader` 二次封装的上传插件

它有两种使用方式：

## 通过bus作为全局组件使用

作为全局上传组件使用时，将组件注册在`App.vue`中，通过 `Event Bus` 的方式调用插件。

使用场景为：上传器为整个网站级别的，切换路由时不打断上传流程，上传窗口始终存在于网站右下角。

**打开上传器**

调用`Bus.$emit('openUploader')`，打开上传器，弹出选择文件窗口，该函数有两个参数：

* params：传给服务端的额外参数
* options：上传选项，目前支持 target、testChunks、mergeFn、accept

```js
Bus.$emit('openUploader', {
  params: {
    page: 'home'
  },
  options: {
    target: 'http://10.0.0.10'
  }
})
```

**Bus Events**

* fileAdded：文件选择后的回调
* fileSuccess：文件上传成功的回调

```js
// 文件选择后的回调
Bus.$on('fileAdded', () => {
  console.log('文件已选择')
})

// 文件上传成功的回调
Bus.$on('fileSuccess', () => {
  console.log('文件上传成功')
})
```

## 作为普通组件在单个页面中使用

使用场景为：在单个页面中使用上传器

props：
* global：请务必设置为 `false`，代表非全局
* params：（同用法一）传给服务端的额外参数
* options：（同用法一）上传选项，目前支持 target、testChunks、mergeFn、accept

events:
* fileAdded：文件选择后的回调
* fileSuccess：文件上传成功的回调

```html
 <global-uploader
    :global="false"
    :params="{page: 'home'}"
    :options="{target: 'http://10.0.0.10'}"
    @fileAdded="fileAdded"
 />
```
