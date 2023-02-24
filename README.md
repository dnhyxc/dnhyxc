### 解决 Electron 安装很慢的办法

#### window 系统

**window 系统**：使用 `npm config edit` 命令打开 npm 的配置文件，**mac 系统**：使用 `open .npmrc` 命令打开 npm 的配置文件，打开之后在 `registry=https://registry.npm.taobao.org/` 下一行添加：

```
electron_mirror=https://cdn.npm.taobao.org/dist/electron/
```

### 快捷键

页面刷新：Ctrl + r。

开启 DevTools：Shift + Ctrl + D + N + H。

### dialog.showOpenDialog

- openDirectory：允许选择文件夹。

- res.filePaths[0]：选择的文件夹路径。

### 关闭二次确认

https://blog.csdn.net/qq_43140890/article/details/111035794
