<!--
 * 收藏集弹窗
 * @author: dnhyxc
 * @since: 2023-03-08
 * index.vue
-->
<template>
  <div class="dialog-content">
    <el-dialog v-model="visible" width="500px" draggable>
      <template #header>
        <div class="header">
          <span class="title">选择收藏集</span>
          <span class="info">（创建或选择你想添加的收藏集）</span>
        </div>
      </template>
      <div class="content">
        <div v-for="i in dataList" :key="i.id" class="collect-list">
          <div class="left" @click.stop="onCheckedItem(i.id)">
            <div class="collect-name">{{ i.name }} <i v-if="i.status === 2" class="iconfont icon-lock" /></div>
            <div class="collect-info">{{ i.articleIds?.length }} 篇文章</div>
          </div>
          <div class="right">
            <el-checkbox-group v-model="checkedItem" size="large">
              <el-checkbox :label="i.id" />
            </el-checkbox-group>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="footer">
          <span class="build" @click="onBuildCollect">
            <i class="iconfont icon-add">&nbsp;新建收藏集</i>
          </span>
          <span class="actions">
            <el-button @click="onCancel">取消</el-button>
            <el-button type="primary" @click="onSubmit">确定</el-button>
          </span>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const dataList = [
  {
    name: 'test1',
    desc: 'test1test1test1test1',
    status: 2,
    createTime: 1678256151471,
    articleIds: ['63fdab2ae2d6bf53efaa6db7'],
    userId: '63e24c3be2d6bf53efaa69a9',
    id: '64082810e2d6bf53efaa7287',
  },
  {
    name: 'test2',
    desc: 'test2test2test2test2',
    status: 1,
    createTime: 1678256151471,
    articleIds: ['63fdab2ae2d6bf53efaa6db7'],
    userId: '63e24c3be2d6bf53efaa69a9',
    id: '64082810e2d6bf53efaa7288',
  },
  {
    name: 'test3',
    desc: 'test3test3test3test3test3',
    status: 2,
    createTime: 1678256151471,
    articleIds: ['63fdab2ae2d6bf53efaa6db7'],
    userId: '63e24c3be2d6bf53efaa69a9',
    id: '64082810e2d6bf53efaa7289',
  },
];

interface IProps {
  collectVisible: boolean;
  buildVisible?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  collectVisible: false,
  buildVisible: false,
});

const emit = defineEmits(['update:collectVisible', 'update:buildVisible']);

// 计算v-model传过来的参数，防止出现值是可读的，无法修改的警告
const visible = computed({
  get() {
    return props.collectVisible;
  },
  set(visible: boolean) {
    emit('update:collectVisible', visible);
  },
});

// 选中的收藏集
const checkedItem = ref<string[]>([]);

// 当窗口隐藏时，清除选中收藏集
watch(
  () => props.collectVisible,
  (newVal) => {
    if (!newVal) {
      checkedItem.value = [];
    }
  },
);

// 选择需要加入的收藏夹
const onCheckedItem = (id: string) => {
  const res = checkedItem.value.find((i) => i === id);
  if (res) {
    checkedItem.value = checkedItem.value.filter((i) => i !== id);
  } else {
    checkedItem.value = [...checkedItem.value, id];
  }
};

// 新建收藏集
const onBuildCollect = () => {
  emit('update:collectVisible', false);
  emit('update:buildVisible', true);
};

// 取消
const onCancel = () => {
  console.log(checkedItem.value, 'onCancel');
  emit('update:collectVisible', false);
};

// 确定
const onSubmit = () => {
  console.log(checkedItem.value, 'onSubmit');
  emit('update:collectVisible', false);
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.dialog-content {
  .header {
    display: flex;
    align-items: center;

    .title {
      font-size: 18px;
    }

    .info {
      font-size: 13px;
      color: @font-2;
    }
  }

  .content {
    .collect-list {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 5px;
      border-bottom: 1px solid @card-border;
      cursor: pointer;
      .clickNoSelectText();

      .left {
        flex: 1;

        .collect-name {
          display: flex;
          align-items: center;
          font-size: 16px;
          margin-bottom: 8px;

          .icon-lock {
            font-size: 13px;
            margin-left: 5px;
          }
        }

        .collect-info {
          font-size: 13px;
        }
      }
    }

    .active {
      background-color: @theme-blue;
    }

    :deep {
      .el-checkbox__label {
        display: none;
      }
    }
  }

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .build {
      color: @theme-blue;
      cursor: pointer;
      .clickNoSelectText();

      .icon-add {
        font-size: 14px;
      }
    }
  }
}
</style>
