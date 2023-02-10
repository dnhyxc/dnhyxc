### 解决 Electron 安装很慢的办法

#### window 系统

**window 系统**：使用 `npm config edit` 命令打开 npm 的配置文件，**mac 系统**：使用 `open .npmrc` 命令打开 npm 的配置文件，打开之后在 `registry=https://registry.npm.taobao.org/` 下一行添加：

```
electron_mirror=https://cdn.npm.taobao.org/dist/electron/
```

### 快捷键

页面刷新：Ctrl + r。

开启 DevTools：Shift + Ctrl + D + N + H。

### keep-alive

https://blog.csdn.net/m0_46309087/article/details/109403655 keep-alive

### vue-cropper

https://juejin.cn/post/7032295846658097159
https://juejin.cn/post/7189548709456773179
https://blog.csdn.net/qq_41107231/article/details/109725839
