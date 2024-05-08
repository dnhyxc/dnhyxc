<!--
 * 搜素组件
 * @author: dnhyxc
 * @since: 2024-04-18
 * Search.vue
-->
<template>
  <div id="__SEARCH_CONTAINER__" class="container">
    <el-form :model="searchForm" @submit.native.prevent="onSubmit">
      <el-form-item label="" prop="keyword" class="form">
        <el-input ref="searchInp" v-model="searchForm.keyword" placeholder="搜索文章" />
      </el-form-item>
    </el-form>
    <Icon class-name="icon-shibai clear" background="" @click="onClear" />
    <el-button type="primary" class="search-btn" @click="toSearch">高级搜索</el-button>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, reactive, ref, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import { commonStore } from '@/store';
import { message } from '@/utils';
import Icon from './Icon.vue';

const router = useRouter();

const searchInp = ref<HTMLInputElement | null>(null);

interface IProps {
  showSearch: boolean;
  margin?: string;
}

const emit = defineEmits(['update:showSearch']);

const props = withDefaults(defineProps<IProps>(), {
  margin: '0'
});

const searchForm = reactive({
  keyword: ''
});

onMounted(() => {
  window.addEventListener('click', onClick, true);
});

onUnmounted(() => {
  window.removeEventListener('click', onClick, true);
});

watchEffect(() => {
  if (props.showSearch) {
    nextTick(() => {
      searchInp.value?.focus();
    });
  }
});

const onClick = (e: Event) => {
  const isClickSearchInp = (e.target as HTMLDivElement).closest('#__SEARCH_CONTAINER__');
  if (!isClickSearchInp) {
    emit('update:showSearch', false);
    commonStore.clearKeyword();
  }
};

const toSearch = () => {
  commonStore.setKeyword(searchForm.keyword);
  emit('update:showSearch', false);
  router.push('/search');
};

const onClear = () => {
  searchForm.keyword = '';
  commonStore.clearKeyword();
};

const onSubmit = () => {
  if (!searchForm.keyword) {
    message({
      title: '请输入关键词',
      message: '关键词为空，无法搜索',
      type: 'warning'
    });
  } else {
    commonStore.setKeyword(searchForm.keyword);
  }
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.container {
  display: flex;
  align-items: center;
  position: relative;
  margin: v-bind(margin);
  -webkit-app-region: no-drag;

  .clear {
    position: absolute;
    right: 70px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--search-border-color);
    display: v-bind('searchForm.keyword ? "inline" : "none"');

    &:hover {
      color: var(--hover-text-color);
    }
  }

  .form {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .search-btn {
    position: relative;
    margin-left: -1px;
    padding: 0 10px 0 8px;
    border-radius: 0 20px 20px 0;
    background-color: var(--content-border-bg);
    border: 1px solid var(--search-border-color);
    backdrop-filter: blur(3px);
    color: var(--search-border-color);

    z-index: 9;

    &:hover {
      color: var(--hover-text-color);
    }
  }

  :deep {
    .el-form-item {
      margin-bottom: 0;
    }

    .el-input__wrapper {
      height: 30px;
      border-radius: 20px 0 0 20px;
      background-color: var(--input-bg-color);
      box-shadow: 0 0 0 1px var(--search-border-color) inset;
    }

    .el-input__inner {
      color: var(--font-color);

      &::-webkit-input-placeholder {
        color: var(--placeholder-color);
      }
    }
  }
}
</style>
