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

### 复制 upload 资源

#### 将 upload 资源复制到 server 中：

```json
cp -r /usr/local/server/src/upload /usr/local/   // 复制到local
```

#### 将 upload 资源从 server 复制到 src 中：

```json
cp -r /usr/local/upload /usr/local/server/src/  // 从local复制到src
```
