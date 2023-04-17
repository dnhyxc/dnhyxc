<!--
 * 系统设置
 * @author: dnhyxc
 * @since: 2023-02-22
 * index.vue
-->
<template>
  <div class="system-wrap">
    <div class="shortcuts">
      <div class="label label-shortcut">
        快捷键
        <span class="restore-btn" @click="onRestoreShortcutKeys">恢复默认设置</span>
      </div>
      <div class="list">
        <div v-for="item in shortcutList" :key="item.value" class="item">
          <span class="name">{{ item.label }}</span>
          <div class="key-info">
            <span class="key">
              {{ item.shortcut }}
            </span>
            <i class="font iconfont icon-yongyan" @click="showDialog(item)" />
          </div>
        </div>
      </div>
    </div>
    <div class="file-config">
      <div class="label">文件存储</div>
      <div v-for="item in fileConfig" :key="item.label" class="file-item">
        <span class="name config-name">{{ item.label }}</span>
        <div class="key-info">
          <span class="key">
            {{ item.path }}
          </span>
          <i class="btn font iconfont icon-12bianji3x" @click="onChangePath(item)">&nbsp;更改目录</i>
        </div>
      </div>
    </div>
    <div class="close-config">
      <div class="label">应用关闭</div>
      <div class="file-item">
        <span class="name config-name">关闭主面板</span>
        <div class="key-info">
          <el-radio-group v-model="closeStatus">
            <el-radio :label="1" class="radio-close">最小化到托盘，不退出程序</el-radio>
            <el-radio :label="2" class="radio-close">退出程序</el-radio>
          </el-radio-group>
        </div>
      </div>
    </div>
    <el-dialog v-model="visible" title="设置快捷键" width="380" center :show-close="false">
      <div class="inp-wrap">
        <el-input
          v-model.trim="shortcut"
          v-focus
          size="large"
          placeholder="请输入快捷键"
          class="shortcut-inp"
          @keyup="handleKeydown"
        />
        <div class="info">输入组合键后输入回车（Enter）保存</div>
        <div class="info">已有（1）条命令的绑定与此一致</div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ipcRenderer } from 'electron';
import Store from 'electron-store';
import { ref, Directive, DirectiveBinding, nextTick, onMounted, watch } from 'vue';
import { STSTEM_CONFIG, SHORTCUT_KEYS, CLOSE_CONFIG, INIT_SHOTCUT_KEYS } from '@/constant';
import { setShortcutKey } from '@/utils';
import { ElMessage } from 'element-plus';

const store = new Store();

// 设置快捷键弹窗状态
const visible = ref<boolean>(false);
// 快捷键
const shortcutList = ref<typeof STSTEM_CONFIG.shortcut>(STSTEM_CONFIG.shortcut);
// 文件存储路径
const fileConfig = ref<typeof STSTEM_CONFIG.fileConfig>(STSTEM_CONFIG.fileConfig);
// 当前需要修改的快捷键
const currentEditShortcut = ref<number>(0);
// 选择的需要修改的存储位置
const currentEditFileConfig = ref<number>(5);
// 显示弹窗时的回填的快捷键
const shortcut = ref<string>('');
// 面板关闭设置
const closeStatus = ref<number>(1);

// 局部自动获取焦点指令
const vFocus: Directive = (el, binding: DirectiveBinding) => {
  nextTick(() => {
    if (el.tagName.toLocaleLowerCase() === 'input') {
      el.focus();
    } else if (el.getElementsByTagName('input')) {
      el.getElementsByTagName('input')[0].focus();
    }
  });
};

// 处理默认文件存储路径的方法
const setFileConfig = (filePath: string) => {
  fileConfig.value = STSTEM_CONFIG.fileConfig.map((i) => {
    if (i.value === currentEditFileConfig.value) {
      i.path = filePath;
    }
    return i;
  });
};

onMounted(() => {
  // 监听主进程发送过来的选择的文件夹信息
  ipcRenderer.on('selectedItem', (e, filePath) => {
    // 将新更改的文件存储路径存到本地磁盘中
    store.set('FILE_STORE_PATH', filePath[0]);
    // 通知主进程重新注册快捷键
    ipcRenderer.send('restore-register-shortcut');
    setFileConfig(filePath[0]);
  });

  const FILE_STORE_PATH = store.get('FILE_STORE_PATH');
  if (FILE_STORE_PATH) {
    setFileConfig(FILE_STORE_PATH as string);
  } else {
    // 获取electron应用的用户目录
    ipcRenderer.send('get-app-path');
    // 接受主进程中传递过来的当前应用的存储路径
    ipcRenderer.on('got-app-path', (e, path) => {
      setFileConfig(path);
    });
  }

  // 初始化快捷键
  shortcutList.value = STSTEM_CONFIG.shortcut.map((i: (typeof STSTEM_CONFIG.shortcut)[0]) => {
    const shortcutKey = store.get(i.key);
    if (shortcutKey) {
      i.shortcut = shortcutKey as string;
    }
    return i;
  });

  // 初始化应用关闭默认值
  closeStatus.value = (store.get(CLOSE_CONFIG) as number) || 1;
});

// 监听关闭面板状态
watch(closeStatus, (newVal) => {
  store.set(CLOSE_CONFIG, newVal);
});

// 点击编辑显示弹窗
const showDialog = (item: (typeof STSTEM_CONFIG.shortcut)[0]) => {
  visible.value = true;
  shortcut.value = item.shortcut;
  currentEditShortcut.value = item.value;
};

// 更换文件存储路径事件
const onChangePath = async (item: (typeof STSTEM_CONFIG.fileConfig)[0]) => {
  currentEditFileConfig.value = item.value;
  // 与主进程通信，唤起文件夹选择弹窗
  ipcRenderer.send('openDialog');
};

// 增加快捷键
const addHotkey = (data: {
  text: string;
  controlKey: { altKey: boolean; ctrlKey: boolean; shiftKey: boolean; key: string; code: string };
}) => {
  // 更改input显示的值
  shortcut.value = data.text;
  // 更改回显示的值
  shortcutList.value = STSTEM_CONFIG.shortcut.map((i) => {
    if (i.value === currentEditShortcut.value) {
      i.shortcut = data.text;
    }
    return i;
  });
};

// 重置快捷键设置
const onRestoreShortcutKeys = () => {
  INIT_SHOTCUT_KEYS.forEach((i) => {
    store.set(i.key, i.shortcut);
  });
  // 通知主进程重新注册快捷键
  ipcRenderer.send('restore-register-shortcut');
  shortcutList.value = INIT_SHOTCUT_KEYS;
};

// 监听键盘按下事件
const handleKeydown = (e: KeyboardEvent) => {
  e.preventDefault();
  setShortcutKey(e, addHotkey);
  if (e.key === 'Enter' && shortcut.value) {
    // 获取当前正在设置的快捷键的key
    const key = SHORTCUT_KEYS[currentEditShortcut.value];
    store.set(key, shortcut.value);
    // 通知主进程重新注册快捷键
    ipcRenderer.send('restore-register-shortcut');
    visible.value = false;
    ElMessage.success('快捷键设置成功');
  }
  if (e.key === 'Backspace' && shortcut.value) {
    shortcut.value = '';
  }
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.system-wrap {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 10px;
  border-radius: 5px;

  .shortcuts,
  .file-config,
  .close-config {
    border-bottom: 1px solid var(--card-border);
    padding: 20px 0;
    width: 80%;

    .label {
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 15px;
    }

    .label-shortcut {
      display: flex;
      align-items: center;
      .restore-btn {
        margin-left: 10px;
        font-size: 14px;
        font-weight: 400;
        color: var(--theme-blue);
        cursor: pointer;
        .clickNoSelectText();

        &:hover {
          color: var(--active-color);
        }
      }
    }

    .list {
      display: flex;
      flex-wrap: wrap;

      .item {
        box-sizing: border-box;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        width: 50%;
        padding: 10px 0 10px 66px;
      }
    }

    .name {
      min-width: 80px;
      text-align: justify;
      text-align-last: justify;
      margin-right: 20px;
    }

    .config-name {
      min-width: 100px;
    }

    .key-info {
      display: flex;
      align-items: center;

      .key {
        box-sizing: border-box;
        background-color: var(--tab-color);
        padding: 3px 15px 2px;
        border-radius: 5px;
        margin-right: 10px;
        border: 1px solid var(--card-border);
      }

      .font {
        color: var(--theme-blue);
        cursor: pointer;

        &:hover {
          color: var(--active-color);
        }
      }

      .btn {
        color: var(--theme-blue);
        cursor: pointer;
        .clickNoSelectText();

        &:hover {
          color: var(--active-color);
        }
      }
    }

    .file-item {
      display: flex;
      align-items: center;
      padding: 10px 0 10px 45px;
    }
  }

  .inp-wrap {
    .info {
      margin-top: 20px;
      text-align: center;
    }
  }

  :deep {
    .shortcut-inp {
      .el-input__inner {
        text-align: center;
      }
    }

    .el-dialog__header {
      margin-right: 0;
    }

    .el-dialog__body {
      padding: 10px 20px 20px;
    }

    .radio-close {
      background-color: var(--tab-color);
      border-radius: 5px;
      border: 1px solid var(--card-border);
      height: 30px;
      line-height: 30px;
      padding: 0 15px;
    }
  }
}
</style>
