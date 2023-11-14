<!--
 * 弹窗
 * @author: dnhyxc
 * @since: 2023-11-14
 * index.vue
-->
<template>
  <div class="model-wrap">
    <el-dialog v-model="visible" :title="title" width="400px" destroy-on-close center draggable align-center>
      <slot name="content"></slot>
      <template #footer>
        <slot name="footer">
          <span class="dialog-footer">
            <el-button class="btn" @click="visible = false">取消</el-button>
            <el-button class="btn" type="primary" @click="visible = false">确定</el-button>
          </span>
        </slot>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface IProps {
  visible: boolean;
  title?: string;
}

const props = defineProps<IProps>();

const emit = defineEmits(['update:visible']);

const visible = computed({
  get() {
    return props.visible;
  },
  set(value) {
    emit('update:visible', value);
  },
});
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.model-wrap {
  :deep {
    .el-dialog__body {
      padding: 10px 20px 20px;
    }
  }

  .dialog-footer {
    .btn {
      width: 120px;
      height: 38px;
    }
  }
}
</style>
