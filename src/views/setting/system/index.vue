<!--
 * 系统设置
 * @author: dnhyxc
 * @since: 2023-02-22
 * index.vue
-->
<template>
  <div class="system-wrap">
    <div class="shortcuts">
      <div class="label">快捷键</div>
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
        <span class="name">{{ item.label }}</span>
        <div class="key-info">
          <span class="key">
            {{ item.path }}
          </span>
          <i class="btn font iconfont icon-12bianji3x" @click="onChangePath(item)">&nbsp;更改目录</i>
        </div>
      </div>
    </div>
    <el-dialog v-model="visible" title="设置快捷键" width="380" center :show-close="false">
      <div class="inp-wrap">
        <el-input
          v-model="shortcut"
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
import { ref, Directive, DirectiveBinding, nextTick } from 'vue';
import { STSTEM_CONFIG } from '@/constant';
import { setShortcutKey } from '@/utils';

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

// 设置快捷键弹窗状态
const visible = ref<boolean>(false);
// 快捷键
const shortcutList = ref<typeof STSTEM_CONFIG.shortcut>(STSTEM_CONFIG.shortcut);
// 文件存储路径
const fileConfig = ref<typeof STSTEM_CONFIG.fileConfig>(STSTEM_CONFIG.fileConfig);
// 当前需要修改的快捷键
const currentEditShortcut = ref<string>('');
// 选择的需要修改的存储位置
const currentEditFileConfig = ref<string>('');
// 显示弹窗时的回填的快捷键
const shortcut = ref<string>('');

// 点击编辑显示弹窗
const showDialog = (item: (typeof STSTEM_CONFIG.shortcut)[0]) => {
  visible.value = true;
  shortcut.value = item.shortcut;
  currentEditShortcut.value = item.label;
};

// 监听主进程发送过来的选择的文件夹信息
ipcRenderer.on('selectedItem', (e, filePath) => {
  fileConfig.value = STSTEM_CONFIG.fileConfig.map((i) => {
    if (i.label === currentEditFileConfig.value) {
      i.path = filePath[0];
    }
    return i;
  });
});

// 更换我呢见存储路径事件
const onChangePath = async (item: (typeof STSTEM_CONFIG.fileConfig)[0]) => {
  currentEditFileConfig.value = item.label;
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
    if (i.label === currentEditShortcut.value) {
      i.shortcut = data.text;
    }
    return i;
  });
};

// 监听键盘按下事件
const handleKeydown = (e: KeyboardEvent) => {
  e.preventDefault();
  console.log(e, 'e');

  setShortcutKey(e, addHotkey);
  if (e.key === 'Enter' && shortcut.value) {
    console.log(shortcut.value, 'ososososo');
    visible.value = false;
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
  .file-config {
    border-bottom: 1px solid @card-border;
    padding: 20px 0;
    width: 80%;

    .label {
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 15px;
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

    .key-info {
      display: flex;
      align-items: center;

      .key {
        box-sizing: border-box;
        background-color: @tab-color;
        padding: 3px 15px 2px;
        border-radius: 5px;
        margin-right: 10px;
        border: 1px solid @card-border;
      }

      .font {
        color: @theme-blue;
        cursor: pointer;

        &:hover {
          color: @active;
        }
      }

      .btn {
        color: @theme-blue;
        cursor: pointer;
        .clickNoSelectText();

        &:hover {
          color: @active;
        }
      }
    }

    .file-item {
      display: flex;
      align-items: center;
      padding: 10px 0 10px 50px;
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
  }
}
</style>
