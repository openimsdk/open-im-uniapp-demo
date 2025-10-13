<template>
  <view class="voice-bar">
    <view class="voice-button-container">
      <view class="voice-button" @touchstart="handleTouchStart" @touchend="handleTouchEnd" @touchcancel="handleTouchEnd"
        >
        <view v-if="isRecording" class="recording-status">
          <text class="status-text">{{ recordingStatus }}</text>
          <view class="voice-level">
            <view v-for="level in voiceLevels" :key="level"
              :class="['voice-bar-item', { active: level <= currentLevel }]"></view>
          </view>
        </view>
        <text v-else class="button-text">按住 说话</text>
      </view>
      <view class="cancel-tip" v-if="isRecording && isSlidingCancel">
        <text>松开发送，上滑取消</text>
      </view>
    </view>
  </view>
</template>

<script>
import IMSDK, { IMMethods } from 'openim-uniapp-polyfill';
import {
  getPurePath,
} from "@/util/common";
export default {
  name: 'ChatingVoiceBar',
  data() {
    return {
      isRecording: false,
      startTime: 0,
      recorderManager: null,
      isSlidingCancel: false,
      touchStartY: 0,
      voiceLevels: [1, 2, 3, 4, 5],
      currentLevel: 0,
      recordingStatus: '正在录音...',
      audioTimer: null
    };
  },
  methods: {
    // 处理触摸开始事件
    handleTouchStart(e) {
      console.log("触摸开始");
      this.touchStartY = e.touches[0].clientY;
      this.touchStartY = e.touches[0].clientY;
      this.isSlidingCancel = false;
      this.startRecording();
    },

    // 处理触摸移动事件
    handleTouchMove(e) {
      if (!this.isRecording) return;

      const currentY = e.touches[0].clientY;
      const diff = this.touchStartY - currentY;

      // 上滑超过一定距离视为取消
      if (diff > 50) {
        this.isSlidingCancel = true;
        this.recordingStatus = '松开发送，上滑取消';
      } else {
        this.isSlidingCancel = false;
        this.recordingStatus = '正在录音...';
      }
    },

    // 处理触摸结束事件
    async handleTouchEnd() {
      console.log('触摸结束');
      if (!this.isRecording) return;

      if (this.audioTimer) {
        clearInterval(this.audioTimer);
        this.audioTimer = null;
      }

      // 停止录音
      this.recorderManager.stop();
    },

    // 开始录音
    async startRecording() {
      try {
        // 检查权限
        const authResult = await this.checkPermission('scope.record');
        if (!authResult) {
          uni.showToast({ title: '需要录音权限', icon: 'none' });
          return;
        }

        this.isRecording = true;
        this.startTime = Date.now();
        this.currentLevel = 0;

        // 获取录音管理器
        this.recorderManager = uni.getRecorderManager();

        // 录音配置
        const options = {
          duration: 60000, // 最长60秒
          sampleRate: 44100,
          numberOfChannels: 1,
          encodeBitRate: 96000,
          format: 'mp3',
          frameSize: 50
        };

        // 监听录音停止事件
        this.recorderManager.onStop(async (res) => {
          const duration = Math.floor((Date.now() - this.startTime) / 1000);

          // 语音太短不发送
          if (duration < 1) {
            uni.showToast({ title: '语音太短', icon: 'none' });
            this.isRecording = false;
            return;
          }

          // 如果上滑取消，则不发送语音
          if (!this.isSlidingCancel) {
            await this.createAndSendVoiceMessage(res.tempFilePath, duration);
          }

          this.isRecording = false;
          this.isSlidingCancel = false;
          this.recordingStatus = '正在录音...';
        });

        // 监听录音开始事件
        this.recorderManager.onStart(() => {
          console.log('开始录音');
          // 模拟音量变化
          this.simulateVoiceLevel();
        });

        // 监听录音错误事件
        this.recorderManager.onError((err) => {
          console.error('录音错误', err);
          uni.showToast({ title: '录音失败', icon: 'none' });
          this.isRecording = false;

          if (this.audioTimer) {
            clearInterval(this.audioTimer);
            this.audioTimer = null;
          }
        });

        // 开始录音
        this.recorderManager.start(options);
      } catch (error) {
        console.error('开始录音失败', error);
        uni.showToast({ title: '录音失败', icon: 'none' });
        this.isRecording = false;
      }
    },

    // 模拟语音音量变化
    simulateVoiceLevel() {
      this.audioTimer = setInterval(() => {
        // 随机生成音量级别，模拟真实录音效果
        this.currentLevel = Math.floor(Math.random() * 5) + 1;
      }, 300);
    },

    // 检查权限
    checkPermission(scope) {
      return new Promise((resolve) => {
        // 在App环境中简化权限检查
        // 如果需要更严格的权限检查，可以使用plus API
        resolve(true);

        /* 可选的更严格权限检查代码
        if (uni.getSystemInfoSync().platform === 'android') {
          const permission = plus.android.requestPermissions(['android.permission.RECORD_AUDIO']);
          resolve(permission?.[0]?.granted || false);
        } else {
          resolve(true);
        }
        */
      });
    },

    // 创建并发送语音消息
    async createAndSendVoiceMessage(filePath, duration) {
      try {

        const message = await IMSDK.asyncApi(
          IMSDK.IMMethods.CreateSoundMessageFromFullPath,
          IMSDK.uuid(),
          {
            soundPath: getPurePath(filePath),
            duration
          }
        );

        console.log('创建语音消息', message, filePath, duration);
        this.$emit('sendMessage', message);
      } catch (error) {
        console.error('创建语音消息失败', error);
        uni.showToast({ title: '发送失败', icon: 'none' });
      }
    }
  },

  // 组件卸载时清理资源
  beforeUnmount() {
    if (this.audioTimer) {
      clearInterval(this.audioTimer);
    }

    if (this.isRecording && this.recorderManager) {
      this.recorderManager.stop();
    }
  }
};
</script>

<style lang="scss" scoped>
.voice-bar {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
}

.voice-button-container {
  width: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.voice-button {
  width: 100%;
  height: 80rpx;
  border-radius: 10px;
  background-color: #e6e6e6;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: background-color 0.2s;
}

.voice-button:active {
  background-color: #d4d4d4;
}

.button-text {
  font-size: 28rpx;
  color: #666;
}

.recording-status {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.status-text {
  font-size: 24rpx;
  color: #333;
  margin-bottom: 10rpx;
}

.voice-level {
  display: flex;
  gap: 4rpx;
  height: 40rpx;
  align-items: flex-end;
}

.voice-bar-item {
  width: 8rpx;
  background-color: #ccc;
  transition: height 0.1s;
  border-radius: 2rpx;
}

.voice-bar-item:nth-child(1) {
  height: 10rpx;
}

.voice-bar-item:nth-child(2) {
  height: 20rpx;
}

.voice-bar-item:nth-child(3) {
  height: 30rpx;
}

.voice-bar-item:nth-child(4) {
  height: 40rpx;
}

.voice-bar-item:nth-child(5) {
  height: 50rpx;
}

.voice-bar-item.active {
  background-color: #4a9cfc;
}

.cancel-tip {
  position: absolute;
  top: -60rpx;
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 10rpx 20rpx;
  border-radius: 4rpx;
  font-size: 24rpx;
}
</style>