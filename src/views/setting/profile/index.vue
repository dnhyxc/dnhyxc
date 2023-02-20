<!--
 * 个人资料
 * @author: dnhyxc
 * @since: 2023-01-29
 * index.vue
-->
<template>
  <div class="profile-wrap">
    <div class="user-info">
      <div class="cover">
        <div class="img-wrap">
          <img
            src="https://pic2.zhimg.com/80/v2-ff0d35d4dcad8e7e1623ef1c294651c1_1440w.webp"
            alt=""
            class="cover-img"
          />
        </div>
        <div class="author-info">
          <div class="head-img-wrap">
            <!-- <img :src="HEAD_IMG" alt="" class="head-img" /> -->
            <Upload :get-cover-image="getCoverImage" :default-url="profileForm.headUrl" />
          </div>
          <div class="username">dnhyxc</div>
        </div>
      </div>
    </div>
    <div class="content">
      <el-form ref="formRef" :model="profileForm" label-width="100px" class="form-wrap">
        <el-form-item
          label="用户名"
          prop="username"
          :rules="[
            {
              trigger: 'blur',
            },
          ]"
          class="form-item"
        >
          <el-input v-model="profileForm.username" size="large" placeholder="请输入用户名" @keyup.enter="onEnter" />
        </el-form-item>
        <el-form-item
          label="职位"
          prop="job"
          :rules="{
            trigger: 'blur',
          }"
          class="form-item"
        >
          <el-input v-model="profileForm.job" size="large" placeholder="请输入职位" @keyup.enter="onEnter" />
        </el-form-item>
        <el-form-item
          label="座右铭"
          prop="motto"
          :rules="{
            trigger: 'blur',
          }"
          class="form-item"
        >
          <el-input v-model="profileForm.motto" size="large" placeholder="请输入座右铭" @keyup.enter="onEnter" />
        </el-form-item>
        <el-form-item
          label="个人介绍"
          prop="introduce"
          :rules="{
            trigger: 'blur',
          }"
          class="form-item"
        >
          <el-input
            v-model="profileForm.introduce"
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 5 }"
            placeholder="请输入个人介绍"
            @keyup.enter="onEnter"
          />
        </el-form-item>
        <el-form-item class="form-item action-list">
          <el-button type="primary" class="action" @click="onUpdateInfo(formRef)">保存修改</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { FormInstance } from 'element-plus';
import { HEAD_IMG } from '@/constant';
import { loginStore } from '@/store';
import Upload from '@/components/Upload/index.vue';

const formRef = ref<FormInstance>();

// 从pania中获取头像url,如果没有,则设置默认值
const { headUrl } = loginStore.userInfo;

console.log(loginStore?.userInfo, headUrl, 'headUrl');

const profileForm = reactive<{
  username: string;
  job: string;
  motto: string;
  introduce: string;
  headUrl: string;
}>({
  username: '',
  job: '',
  motto: '',
  introduce: '',
  headUrl: headUrl || HEAD_IMG,
});

// 获取上传的头像图片
const getCoverImage = (url: string) => {
  console.log(url, 'url');
  profileForm.headUrl = url;
};

// 确定更新用户信息
const onUpdateInfo = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async (valid) => {
    if (valid) {
      console.log('重置密码并登录', profileForm);
    } else {
      console.log('error submit!');
      return false;
    }
  });
};

// 输入回车事件
const onEnter = () => {
  if (!formRef.value) return;
  formRef.value.validate(async (valid) => {
    if (valid) {
      console.log(profileForm, 'profileForm>>>onEnter');
    } else {
      console.log(profileForm, 'error submit!');
      return false;
    }
  });
};
</script>

<style scoped lang="less">
@import '@/styles/index.less';

.profile-wrap {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 10px 0 10px 10px;
  border-radius: 5px;

  .user-info {
    box-sizing: border-box;
    padding-right: 10px;

    .cover {
      box-sizing: border-box;
      width: 100%;
      height: auto;
      border-bottom-left-radius: 5px;
      border-bottom-right-radius: 5px;
      .img-wrap {
        box-sizing: border-box;
        width: 100%;
        height: 200px;
        .cover-img {
          width: 100%;
          height: 100%;
          border-top-left-radius: 5px;
          border-top-right-radius: 5px;
          .imgStyle();
        }
      }

      .author-info {
        box-sizing: border-box;
        position: relative;
        display: flex;
        justify-content: flex-start;
        width: 100%;
        .head-img-wrap {
          position: absolute;
          top: -90px;
          left: 15px;
          width: 130px;
          height: 130px;
          border-radius: 5px;
          padding: 5px;
          background-image: @card-lg;
          box-shadow: 0 0 10px @shadow-color;

          .head-img {
            display: block;
            width: 100%;
            height: 100%;
            border-radius: 5px;
            .imgStyle();
          }
        }

        .username {
          flex: 1;
          padding: 15px 15px 15px 180px;
          font-size: 20px;
          font-weight: 700;
        }
      }
    }
  }

  .content {
    margin-right: 10px;
    padding: 20px 25% 20px 20%;
    box-sizing: border-box;

    .action-list {
      :deep {
        .el-form-item__content {
          justify-content: flex-end;
        }
      }
    }
  }
}
</style>
