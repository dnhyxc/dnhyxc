import * as path from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import electron from 'vite-plugin-electron';
import electronRender from 'vite-plugin-electron-renderer';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import ElementPlus from 'unplugin-element-plus/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
// import visualizer from 'rollup-plugin-visualizer';
// import externalGlobals from 'rollup-plugin-external-globals';

export default defineConfig({
  // Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of "text/html". Strict MIME type checking is enforced for module scripts per HTML spec.
  base: '/', // 线上打包路径改为绝对路径，防止打包后，资源文件路径出现上述错误
  plugins: [
    vue(),
    electron({
      entry: 'app/index.ts',
    }),
    electronRender(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    ElementPlus(),
    // visualizer({
    //   filename: 'buildInfo.html',
    //   open: true,
    //   gzipSize: true,
    //   brotliSize: true,
    // }),
  ],
  resolve: {
    // 设置别名
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    // 忽略后缀名的配置选项, 添加 .vue 选项时要记得原本默认忽略的选项也要手动写入
    extensions: ['.js', '.ts', '.json', '.vue'],
  },
  server: {
    headers: {
      // 如果需要用到 ffmpeg 合并视频，需要将 COEP 和 COOP 打开，来确保 ShareArrayBuffer 能够正常使用
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
    port: 9216, // 启动端口
    hmr: {
      host: 'localhost',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:9112',
        changeOrigin: true, // 允许跨域
      },
      '/admin': {
        target: 'http://localhost:9112',
        changeOrigin: true, // 允许跨域
      },
    },
  },
  optimizeDeps: {
    include: [
      'monaco-editor/esm/vs/language/json/json.worker',
      'monaco-editor/esm/vs/language/css/css.worker',
      'monaco-editor/esm/vs/language/html/html.worker',
      'monaco-editor/esm/vs/language/typescript/ts.worker',
      'monaco-editor/esm/vs/editor/editor.worker',
    ],
  },
  build: {
    // 设置最终构建的浏览器兼容目标
    target: 'es2015',
    // 构建后是否生成 source map 文件
    sourcemap: false,
    // chunk 大小警告的限制（以 kbs 为单位）
    chunkSizeWarningLimit: 2000,
    // 启用/禁用 gzip 压缩大小报告
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
  },
});
