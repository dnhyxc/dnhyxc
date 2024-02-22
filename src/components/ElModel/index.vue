<!--
 * 弹窗
 * @author: dnhyxc
 * @since: 2023-11-14
 * index.vue
-->
<template>
  <div class="model-wrap">
    <el-dialog
      v-model="visible"
      destroy-on-close
      center
      align-center
      :title="title"
      :width="width"
      :draggable="draggable"
    >
      <slot name="content"></slot>
      <template v-if="footer" #footer>
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
  width?: string;
  footer?: boolean;
  draggable?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  visible: false,
  title: '',
  width: '400px',
  footer: true,
  draggable: true,
});

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
