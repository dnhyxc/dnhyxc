<!--
 * 在线链接图片操作组件
 * @author: dnhyxc
 * @since: 2023-10-17
 * index.vue
-->
<template>
  <div class="online-wrap">
    <el-input
      v-model="onlineUrl"
      :autosize="{ minRows: 5, maxRows: 8 }"
      type="textarea"
      size="large"
      resize="none"
      class="href-inp"
      placeholder="请输入在线链接"
    />
    <el-button size="large" type="primary" class="href-btn" @click="onUseOnlineUrl">使用链接</el-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { checkImage } from '@/utils';

const onlineUrl = ref<string>('');

interface IProps {
  onUseOnlineUrl: (url: string) => void;
}

const props = defineProps<IProps>();

const onUseOnlineUrl = async () => {
  const status = await checkImage(onlineUrl.value);
  // 使用在线链接
  if (status) {
    props?.onUseOnlineUrl?.(onlineUrl.value);
  } else {
    ElMessage({
      message: '链接无效，请重新输入',
      type: 'error',
      offset: 80,
    });
  }
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.online-wrap {
  display: flex;
  align-items: center;
  flex-direction: column;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  border-bottom-left-radius: 5px;
  padding: 10px;
  flex: 1;
  .href-inp {
    flex: 1;

    :deep {
      .el-textarea__inner {
        height: 100% !important;
        background-color: var(--input-bg-color);
      }
    }
  }

  .href-btn {
    margin-top: 10px;
    width: 100%;
  }
}
</style>
